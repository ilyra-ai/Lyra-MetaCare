#!/usr/bin/env bash
# =============================================================================
#  Lyra MetaCare — Orquestrador local real (backend + frontend + banco)
# -----------------------------------------------------------------------------
#  - Sobe MySQL (Docker Compose), aplica migracoes/bootstrap e o servidor
#    Next.js (backend de API + frontend) em localhost, de forma real.
#  - Faz preflight completo de dependencias e CORRIGE pela causa raiz.
#  - Descobre portas livres automaticamente (app e MySQL) e sobe nelas.
#  - Menu dinamico com icones + barra de progresso fixa no rodape do terminal,
#    com a saida integral de todos os comandos rolando acima dela.
#
#  Uso interativo:   ./run.sh
#  Uso direto (CLI): ./run.sh [up|app|db|migrate|doctor|fix|status|stop|logs|help]
#
#  Compatibilidade: Linux, macOS e Windows (Git Bash). Requer Bash 4+.
# =============================================================================

set -uo pipefail

readonly SCRIPT_VERSION="2026.06.13"
readonly REQUIRED_BASH_MAJOR=4

if (( BASH_VERSINFO[0] < REQUIRED_BASH_MAJOR )); then
  printf 'ERRO: Bash %s+ e obrigatorio (versao atual: %s).\n' \
    "$REQUIRED_BASH_MAJOR" "${BASH_VERSINFO[0]}.${BASH_VERSINFO[1]}" >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# Caminhos e estado
# -----------------------------------------------------------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly ROOT_DIR
readonly STATE_DIR="$ROOT_DIR/.lyra-run"
readonly LOG_DIR="$ROOT_DIR/.logs"
readonly ENV_FILE="$ROOT_DIR/.env.local"
readonly COMPOSE_FILE="$ROOT_DIR/compose.yaml"
readonly PACKAGE_FILE="$ROOT_DIR/package.json"
readonly MIGRATE_SCRIPT="$ROOT_DIR/scripts/mysql-migrate.mjs"
readonly MIGRATIONS_DIR="$ROOT_DIR/mysql/migrations"
readonly APP_PID_FILE="$STATE_DIR/app.pid"
readonly APP_LOG_FILE="$LOG_DIR/app-dev.log"
readonly RUN_LOG_FILE="$LOG_DIR/run-sh.log"
readonly BAR_STATE_FILE="$STATE_DIR/bar.state"
readonly MYSQL_CONTAINER="lyra-metacare-mysql"
readonly MYSQL_SERVICE="mysql"

mkdir -p "$STATE_DIR" "$LOG_DIR"

# -----------------------------------------------------------------------------
# Portas padrao (as demais variaveis e todos os segredos vem do .env.local,
# gerado por scripts/env-init.mjs a partir do .env.example — fonte unica)
# -----------------------------------------------------------------------------
readonly DEFAULT_MYSQL_HOST_PORT="3307"
readonly DEFAULT_APP_PORT="3000"
readonly ENV_INIT_SCRIPT="$ROOT_DIR/scripts/env-init.mjs"

# Portas resolvidas em runtime (preenchidas por resolve_ports)
APP_PORT="$DEFAULT_APP_PORT"
MYSQL_HOST_PORT_RESOLVED="$DEFAULT_MYSQL_HOST_PORT"

# -----------------------------------------------------------------------------
# Paleta (TrueColor com fallback) e icones
# -----------------------------------------------------------------------------
if [[ -t 1 ]]; then
  C_RESET=$'\033[0m';  C_BOLD=$'\033[1m';   C_DIM=$'\033[2m'
  C_WHITE=$'\033[38;2;230;237;243m'
  C_GRAY=$'\033[38;2;130;138;149m'
  C_CYAN=$'\033[38;2;86;211;255m'
  C_GREEN=$'\033[38;2;63;185;80m'
  C_AMBER=$'\033[38;2;255;183;77m'
  C_RED=$'\033[38;2;248;81;73m'
  C_VIOLET=$'\033[38;2;187;128;255m'
  C_TEAL=$'\033[38;2;49;200;180m'
  C_BG_SEL=$'\033[48;2;30;41;59m'
else
  C_RESET=''; C_BOLD=''; C_DIM=''; C_WHITE=''; C_GRAY=''; C_CYAN=''
  C_GREEN=''; C_AMBER=''; C_RED=''; C_VIOLET=''; C_TEAL=''; C_BG_SEL=''
fi

readonly I_ROCKET='🚀'  I_DB='🛢️'  I_WEB='🌐'  I_DOCTOR='🩺'  I_FIX='🔧'
readonly I_MIG='🗃️'  I_STATUS='📊'  I_LOGS='📜'  I_STOP='⏹️'  I_EXIT='❌'
readonly I_OK='✔'  I_WARN='⚠'  I_ERR='✖'  I_DOT='•'  I_ARR='➜'  I_GEAR='⚙'

# -----------------------------------------------------------------------------
# Log estruturado (arquivo + terminal). Tudo e registrado, nada e silencioso.
# -----------------------------------------------------------------------------
_ts() { date '+%Y-%m-%d %H:%M:%S'; }

_log_file() { printf '[%s] %s\n' "$(_ts)" "$1" >>"$RUN_LOG_FILE" 2>/dev/null || true; }

log_info()  { printf '%s%s%s %s\n' "$C_CYAN"  "$I_DOT"  "$C_RESET" "$1"; _log_file "INFO  $1"; }
log_ok()    { printf '%s%s%s %s\n' "$C_GREEN" "$I_OK"   "$C_RESET" "$1"; _log_file "OK    $1"; }
log_warn()  { printf '%s%s%s %s\n' "$C_AMBER" "$I_WARN" "$C_RESET" "$1"; _log_file "WARN  $1"; }
log_error() { printf '%s%s%s %s\n' "$C_RED"   "$I_ERR"  "$C_RESET" "$1" >&2; _log_file "ERROR $1"; }
log_step()  { printf '\n%s%s %s%s\n'  "$C_VIOLET$C_BOLD" "$I_ARR" "$1" "$C_RESET"; _log_file "STEP  $1"; }

die() { log_error "$1"; teardown_ui; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }

# =============================================================================
# UI DE TERMINAL — barra de progresso fixa no rodape + saida completa acima
# -----------------------------------------------------------------------------
# Tecnica: define-se uma "scroll region" (DECSTBM) que exclui as 2 ultimas
# linhas. Toda saida de comando rola normalmente dentro da regiao (acima), e um
# pintor em segundo plano redesenha a barra nas linhas reservadas, com spinner
# animado e progresso que avanca de forma honesta ate a conclusao real.
# Em terminais nao interativos (CI/captura), degrada para logs simples.
# =============================================================================

UI_FANCY=0
[[ -t 1 && -t 2 ]] && have tput && UI_FANCY=1
# Permite desligar a UI rica explicitamente (LYRA_PLAIN=1)
[[ "${LYRA_PLAIN:-0}" == "1" ]] && UI_FANCY=0

BAR_PAINTER_PID=""
BAR_RESERVED=2

_term_rows() { tput lines 2>/dev/null || echo 24; }
_term_cols() { tput cols 2>/dev/null || echo 80; }

# Escreve o estado-alvo da barra (lido pelo pintor): alvo|fase|detalhe
bar_set() {
  local target="$1" phase="${2:-}" detail="${3:-}"
  printf '%s|%s|%s\n' "$target" "$phase" "$detail" >"$BAR_STATE_FILE" 2>/dev/null || true
  if (( UI_FANCY == 0 )); then
    # Status para stderr: visivel ao usuario, sem poluir command substitutions.
    printf '%s[%3s%%]%s %s %s\n' "$C_TEAL" "$target" "$C_RESET" "$phase" \
      "${detail:+— $detail}" >&2
  fi
}

# Renderiza a barra nas linhas reservadas, preservando o cursor do conteudo.
_bar_paint() {
  local cur="$1" phase="$2" detail="$3" frame="$4"
  local rows cols barw filled empty i bar=''
  rows="$(_term_rows)"; cols="$(_term_cols)"
  barw=$(( cols - 24 )); (( barw < 10 )) && barw=10
  filled=$(( cur * barw / 100 )); (( filled > barw )) && filled=barw
  empty=$(( barw - filled ))
  for ((i=0; i<filled; i++)); do bar+='█'; done
  for ((i=0; i<empty;  i++)); do bar+='░'; done
  local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local sp="${spin:frame:1}"; [[ -z "$sp" ]] && sp='⠿'
  local line1 line2
  printf -v line1 '%s %s%s%s %s%3d%%%s' \
    "$C_TEAL$C_BOLD$sp$C_RESET" "$C_TEAL" "$bar" "$C_RESET" \
    "$C_WHITE$C_BOLD" "$cur" "$C_RESET"
  printf -v line2 '%s%s %s%s' "$C_GRAY$C_DIM" "${phase:-Aguardando}" \
    "${detail:+$I_DOT $detail}" "$C_RESET"
  # \033[s salva cursor, posiciona nas linhas do rodape, \033[u restaura.
  printf '\033[s'
  printf '\033[%d;1H\033[2K%s' "$((rows-1))" "${line1:0:$((cols+40))}"
  printf '\033[%d;1H\033[2K%s' "$rows"        "${line2:0:$((cols+20))}"
  printf '\033[u'
}

# Loop do pintor: faz a barra "andar" suavemente ate o alvo real.
_bar_loop() {
  local cur=0 frame=0 target phase detail line
  while :; do
    if [[ -r "$BAR_STATE_FILE" ]]; then
      IFS='|' read -r target phase detail <"$BAR_STATE_FILE" 2>/dev/null || true
      [[ -z "${target:-}" ]] && target=0
    else
      target=0; phase=''; detail=''
    fi
    # Avanco honesto: aproxima do alvo; so chega a 100 quando o alvo e 100.
    if (( cur < target )); then
      (( cur += ( (target - cur) / 4 ) + 1 ))
      (( cur > target )) && cur=$target
    elif (( cur > target )); then
      cur=$target
    fi
    _bar_paint "$cur" "$phase" "$detail" "$frame"
    frame=$(( (frame + 1) % 10 ))
    sleep 0.12
  done
}

setup_ui() {
  (( UI_FANCY == 0 )) && return 0
  local rows; rows="$(_term_rows)"
  printf '0|Inicializando|preparando ambiente\n' >"$BAR_STATE_FILE"
  # Limpa as duas linhas de rodape e fixa a scroll region acima delas.
  printf '\033[%d;1H\033[2K\033[%d;1H\033[2K' "$((rows-1))" "$rows"
  printf '\033[1;%dr' "$((rows - BAR_RESERVED))"
  printf '\033[%d;1H' "$((rows - BAR_RESERVED))"
  _bar_loop &
  BAR_PAINTER_PID=$!
  # Recalcula a regiao em redimensionamentos do terminal.
  trap '_on_winch' WINCH
}

_on_winch() {
  (( UI_FANCY == 0 )) && return 0
  local rows; rows="$(_term_rows)"
  printf '\033[1;%dr' "$((rows - BAR_RESERVED))"
}

teardown_ui() {
  (( UI_FANCY == 0 )) && return 0
  if [[ -n "$BAR_PAINTER_PID" ]] && kill -0 "$BAR_PAINTER_PID" 2>/dev/null; then
    kill "$BAR_PAINTER_PID" 2>/dev/null || true
    wait "$BAR_PAINTER_PID" 2>/dev/null || true
  fi
  BAR_PAINTER_PID=""
  trap - WINCH
  local rows; rows="$(_term_rows)"
  printf '\033[r'                       # reseta a scroll region
  printf '\033[%d;1H\033[2K' "$((rows-1))"
  printf '\033[%d;1H\033[2K' "$rows"
  printf '\033[%d;1H' "$rows"
  UI_FANCY_TORNDOWN=1
}

# Garante restauracao do terminal em qualquer saida.
trap 'teardown_ui' EXIT
trap 'teardown_ui; exit 130' INT TERM

# =============================================================================
# Execucao de comandos com SAIDA INTEGRAL (nunca silenciosa) + log em arquivo
# -----------------------------------------------------------------------------
# run_cmd "rotulo" cmd args...  -> roda mostrando tudo na tela e gravando no log
# =============================================================================
run_cmd() {
  local label="$1"; shift
  log_step "$label"
  _log_file "EXEC  $*"
  printf '%s%s %s%s\n' "$C_GRAY$C_DIM" "$I_GEAR" "$*" "$C_RESET"
  # tee duplica a saida: terminal (acima da barra) + arquivo de log integral.
  set +e
  "$@" 2>&1 | tee -a "$RUN_LOG_FILE"
  local rc=${PIPESTATUS[0]}
  set -e 2>/dev/null || true
  set +e
  if (( rc == 0 )); then
    log_ok "$label — concluido"
  else
    log_error "$label — falhou (codigo $rc)"
  fi
  return "$rc"
}

# =============================================================================
# Deteccao de sistema, Docker Compose e gerenciador de pacotes
# =============================================================================
OS_FAMILY="desconhecido"
detect_os() {
  local u; u="$(uname -s 2>/dev/null || echo desconhecido)"
  case "$u" in
    Linux*)                 OS_FAMILY="linux" ;;
    Darwin*)                OS_FAMILY="macos" ;;
    MINGW*|MSYS*|CYGWIN*)   OS_FAMILY="windows" ;;
    *)                      OS_FAMILY="desconhecido" ;;
  esac
}

# Resolve "docker compose" (v2) ou "docker-compose" (v1) em um array. O
# compose.yaml le as credenciais do .env.local (fonte unica de configuracao).
declare -a COMPOSE_CMD=()
resolve_compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker compose --env-file "$ENV_FILE")
  elif have docker-compose; then
    COMPOSE_CMD=(docker-compose --env-file "$ENV_FILE")
  else
    COMPOSE_CMD=()
  fi
}

# Resolve o gerenciador de pacotes (pnpm direto ou via corepack).
declare -a PM_CMD=()
resolve_pm_cmd() {
  if have pnpm; then
    PM_CMD=(pnpm)
  elif have corepack; then
    PM_CMD=(corepack pnpm)
  else
    PM_CMD=()
  fi
}

# =============================================================================
# Gestao do .env.local (leitura e escrita idempotente; segredos: env-init)
# =============================================================================
declare -A ENV_MAP=()

_strip_quotes() {
  local v="$1"
  if [[ "$v" == \"*\" && "$v" == *\" ]]; then v="${v:1:${#v}-2}"
  elif [[ "$v" == \'*\' && "$v" == *\' ]]; then v="${v:1:${#v}-2}"; fi
  printf '%s' "$v"
}

load_env_map() {
  ENV_MAP=()
  [[ -f "$ENV_FILE" ]] || return 0
  local line key val
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "$line" || "${line:0:1}" == "#" ]] && continue
    [[ "$line" != *"="* ]] && continue
    key="${line%%=*}"; val="${line#*=}"
    key="${key// /}"
    ENV_MAP["$key"]="$(_strip_quotes "$val")"
  done <"$ENV_FILE"
}

env_value() { printf '%s' "${ENV_MAP[$1]:-${2:-}}"; }

# Insere/atualiza uma chave no .env.local sem destruir o restante do arquivo.
upsert_env() {
  local key="$1" value="$2" quoted="$3"  # quoted: single|double|none
  local encoded="$value"
  case "$quoted" in
    single) encoded="'${value}'" ;;
    double) encoded="\"${value}\"" ;;
  esac
  touch "$ENV_FILE"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    local tmp; tmp="$(mktemp)"
    local replaced=0 line
    while IFS= read -r line || [[ -n "$line" ]]; do
      line="${line%$'\r'}"
      if [[ "$line" == "${key}="* ]]; then
        printf '%s=%s\n' "$key" "$encoded" >>"$tmp"; replaced=1
      else
        printf '%s\n' "$line" >>"$tmp"
      fi
    done <"$ENV_FILE"
    (( replaced == 0 )) && printf '%s=%s\n' "$key" "$encoded" >>"$tmp"
    mv "$tmp" "$ENV_FILE"
  else
    printf '%s=%s\n' "$key" "$encoded" >>"$ENV_FILE"
  fi
  ENV_MAP["$key"]="$value"
}

# =============================================================================
# Utilidades de porta — deteccao real de ocupacao e descoberta de porta livre
# =============================================================================
# Retorna 0 se a porta estiver LIVRE, 1 se OCUPADA. Multiplas estrategias para
# cobrir Linux/macOS/Git-Bash sem depender de uma unica ferramenta.
is_port_free() {
  local port="$1" host="127.0.0.1"
  # Estrategia 1: bash /dev/tcp (disponivel ate no Git Bash) — connect rapido.
  if (exec 3<>"/dev/tcp/${host}/${port}") 2>/dev/null; then
    exec 3>&- 2>/dev/null || true
    return 1   # conectou => ocupada
  fi
  # Estrategia 2: ss (Linux)
  if have ss; then
    ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]${port}\$" && return 1
  fi
  # Estrategia 3: lsof (macOS/Linux)
  if have lsof; then
    lsof -iTCP:"$port" -sTCP:LISTEN -P -n >/dev/null 2>&1 && return 1
  fi
  # Estrategia 4: netstat (Windows/Git Bash, macOS)
  if have netstat; then
    netstat -an 2>/dev/null | grep -Eq "[:.]${port}[[:space:]].*(LISTEN|LISTENING)" && return 1
  fi
  return 0
}

# Encontra a proxima porta livre a partir de "start" (limite de tentativas).
find_free_port() {
  local start="$1" max="${2:-50}" p
  for (( p=start; p<start+max; p++ )); do
    if is_port_free "$p"; then printf '%s' "$p"; return 0; fi
  done
  return 1
}

# =============================================================================
# Garantia do .env.local — delega ao gerador unico do projeto
# (scripts/env-init.mjs): valores padrao do .env.example e segredos aleatorios
# criptograficos, sem nunca sobrescrever valores existentes.
# =============================================================================
ensure_env_file() {
  log_step "Verificando configuracao de ambiente (.env.local)"
  if ! have node; then
    log_error "Node.js e necessario para gerar o .env.local (scripts/env-init.mjs)."
    return 1
  fi
  if ! node "$ENV_INIT_SCRIPT"; then
    log_error "Falha ao preparar o .env.local (mensagem do env:init acima)."
    return 1
  fi
  load_env_map
  log_ok ".env.local completo (modelo: .env.example)."
}

# Valida que o JSON de admins adicionais e parseavel (causa raiz comum de
# falha). Um valor invalido e configuracao do usuario: nunca e substituido.
validate_admin_json() {
  local raw; raw="$(env_value ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS)"
  [[ -z "$raw" ]] && return 0
  if ! printf '%s' "$raw" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const v=JSON.parse(s);if(!Array.isArray(v))process.exit(2)}catch{process.exit(1)}})' 2>/dev/null; then
    log_error "ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS no .env.local nao e um array JSON valido."
    log_warn  "Corrija o valor (formato no .env.example) ou deixe-o vazio."
    return 1
  fi
}

# =============================================================================
# PREFLIGHT — verificacao + correcao por causa raiz de cada dependencia
# =============================================================================
PREFLIGHT_FAILED=0

# Node.js
check_node() {
  log_step "Checando Node.js"
  if ! have node; then
    log_error "Node.js nao encontrado no PATH."
    log_warn  "Causa raiz: runtime ausente. Instale o Node.js 20+ (https://nodejs.org) e reabra o terminal."
    PREFLIGHT_FAILED=1
    return 1
  fi
  local ver major
  ver="$(node -v 2>/dev/null | sed 's/^v//')"
  major="${ver%%.*}"
  if (( major < 18 )); then
    log_warn "Node.js $ver e antigo; recomenda-se 20+. Prosseguindo, mas pode haver incompatibilidades."
  else
    log_ok "Node.js $ver detectado."
  fi
  return 0
}

# Corepack + pnpm (auto-fix: habilita corepack e ativa o pnpm)
check_pnpm() {
  log_step "Checando gerenciador de pacotes (pnpm)"
  resolve_pm_cmd
  if (( ${#PM_CMD[@]} > 0 )); then
    log_ok "Gerenciador disponivel: ${PM_CMD[*]}"
    return 0
  fi
  log_warn "pnpm ausente. Tentando habilitar via corepack (causa raiz: pnpm nao ativado)."
  if have corepack; then
    run_cmd "Habilitando corepack" corepack enable || true
    # Ativa a versao declarada no projeto, se houver packageManager.
    local pm_field=""
    if have node && [[ -f "$PACKAGE_FILE" ]]; then
      pm_field="$(node -e 'try{const p=require(process.argv[1]);process.stdout.write(p.packageManager||"")}catch{process.stdout.write("")}' "$PACKAGE_FILE" 2>/dev/null || true)"
    fi
    if [[ -n "$pm_field" ]]; then
      run_cmd "Ativando $pm_field" corepack prepare "$pm_field" --activate || true
    else
      run_cmd "Ativando pnpm@latest" corepack prepare pnpm@latest --activate || true
    fi
    resolve_pm_cmd
  fi
  if (( ${#PM_CMD[@]} == 0 )); then
    log_error "Nao foi possivel disponibilizar o pnpm. Causa raiz: corepack indisponivel."
    log_warn  "Solucao: 'npm i -g pnpm' ou habilite o corepack (Node 16.13+)."
    PREFLIGHT_FAILED=1
    return 1
  fi
  log_ok "pnpm disponibilizado: ${PM_CMD[*]}"
  return 0
}

# Dependencias do projeto (auto-fix: instala se node_modules ausente/incompleto)
check_dependencies() {
  log_step "Checando dependencias do projeto (node_modules)"
  if [[ -d "$ROOT_DIR/node_modules" && -d "$ROOT_DIR/node_modules/next" && -d "$ROOT_DIR/node_modules/mysql2" ]]; then
    log_ok "node_modules presente e com pacotes-chave (next, mysql2)."
    return 0
  fi
  log_warn "Dependencias ausentes ou incompletas. Instalando agora (causa raiz: node_modules nao instalado)."
  resolve_pm_cmd
  (( ${#PM_CMD[@]} == 0 )) && { log_error "Sem gerenciador de pacotes para instalar."; PREFLIGHT_FAILED=1; return 1; }
  if ! run_cmd "Instalando dependencias (${PM_CMD[*]} install)" "${PM_CMD[@]}" install; then
    log_error "Falha ao instalar dependencias."
    PREFLIGHT_FAILED=1
    return 1
  fi
  log_ok "Dependencias instaladas."
  return 0
}

# Docker CLI + Compose + daemon (auto-fix: tenta subir o daemon por plataforma)
check_docker() {
  log_step "Checando Docker e Docker Compose"
  if ! have docker; then
    log_error "Docker nao encontrado. Causa raiz: Docker Engine/Desktop nao instalado."
    log_warn  "Instale o Docker (https://docs.docker.com/get-docker/) e reabra o terminal."
    PREFLIGHT_FAILED=1
    return 1
  fi
  resolve_compose_cmd
  if (( ${#COMPOSE_CMD[@]} == 0 )); then
    log_error "Docker Compose indisponivel (nem v2 'docker compose' nem v1 'docker-compose')."
    PREFLIGHT_FAILED=1
    return 1
  fi
  log_ok "Compose disponivel: ${COMPOSE_CMD[*]}"
  if docker info >/dev/null 2>&1; then
    log_ok "Daemon do Docker ativo."
    return 0
  fi
  log_warn "Daemon do Docker inativo. Tentando iniciar (causa raiz: engine parado)."
  case "$OS_FAMILY" in
    linux)
      if have systemctl; then run_cmd "Iniciando docker (systemd)" sudo systemctl start docker || true; fi
      ;;
    macos)
      if [[ -d "/Applications/Docker.app" ]]; then run_cmd "Abrindo Docker Desktop" open -a Docker || true; fi
      ;;
    windows)
      local dd="/c/Program Files/Docker/Docker/Docker Desktop.exe"
      if [[ -f "$dd" ]]; then
        log_info "Abrindo Docker Desktop..."
        ( "$dd" >/dev/null 2>&1 & ) || true
      fi
      ;;
  esac
  # Aguarda o daemon responder (ate 90s).
  local i
  for ((i=0; i<45; i++)); do
    if docker info >/dev/null 2>&1; then log_ok "Daemon do Docker ficou ativo."; return 0; fi
    bar_set 8 "Aguardando Docker" "inicializando o engine ($((i*2))s)"
    sleep 2
  done
  log_error "Docker nao respondeu a tempo. Inicie o Docker Desktop/Engine manualmente e tente de novo."
  PREFLIGHT_FAILED=1
  return 1
}

# =============================================================================
# Resolucao dinamica de portas (app + MySQL host) com descoberta de porta livre
# =============================================================================
resolve_ports() {
  log_step "Resolvendo portas (app + MySQL)"
  load_env_map

  # --- Porta do app (Next.js) ---
  local desired_app="${LYRA_APP_PORT:-$(env_value APP_PORT "$DEFAULT_APP_PORT")}"
  if is_port_free "$desired_app"; then
    APP_PORT="$desired_app"
    log_ok "Porta do app livre: $APP_PORT"
  else
    local free_app; free_app="$(find_free_port "$((desired_app + 1))" 60 || true)"
    [[ -z "$free_app" ]] && free_app="$(find_free_port 3001 200 || true)"
    [[ -z "$free_app" ]] && die "Nenhuma porta livre encontrada para o app a partir de $desired_app."
    APP_PORT="$free_app"
    log_warn "Porta $desired_app ocupada. App subira na porta livre $APP_PORT."
  fi

  # --- Porta host do MySQL ---
  local desired_db; desired_db="$(env_value MYSQL_HOST_PORT "$DEFAULT_MYSQL_HOST_PORT")"
  # Se o proprio container do projeto ja expoe essa porta, ela e "nossa": reusa.
  local container_owns_port=0
  if have docker && docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null \
       | grep -q "^${MYSQL_CONTAINER}.*:${desired_db}->"; then
    container_owns_port=1
  fi
  if (( container_owns_port == 1 )) || is_port_free "$desired_db"; then
    MYSQL_HOST_PORT_RESOLVED="$desired_db"
    log_ok "Porta do MySQL definida: $MYSQL_HOST_PORT_RESOLVED"
  else
    local free_db; free_db="$(find_free_port "$((desired_db + 1))" 60 || true)"
    [[ -z "$free_db" ]] && die "Nenhuma porta livre encontrada para o MySQL a partir de $desired_db."
    MYSQL_HOST_PORT_RESOLVED="$free_db"
    log_warn "Porta $desired_db ocupada. MySQL subira na porta livre $MYSQL_HOST_PORT_RESOLVED."
  fi

  # Persiste no .env.local para que migrate e app usem exatamente a mesma porta.
  upsert_env MYSQL_HOST_PORT "$MYSQL_HOST_PORT_RESOLVED" none
  upsert_env MYSQL_PORT      "$MYSQL_HOST_PORT_RESOLVED" none
  upsert_env APP_PORT        "$APP_PORT"                 none
  export MYSQL_HOST_PORT="$MYSQL_HOST_PORT_RESOLVED"
  export MYSQL_PORT="$MYSQL_HOST_PORT_RESOLVED"
}

# =============================================================================
# Banco de dados — subida real via Docker Compose + espera por "healthy"
# =============================================================================
db_container_state() {
  docker inspect --format '{{.State.Status}}' "$MYSQL_CONTAINER" 2>/dev/null || echo "absent"
}
db_health_state() {
  docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' \
    "$MYSQL_CONTAINER" 2>/dev/null || echo "absent"
}

db_up() {
  log_step "Subindo MySQL (Docker Compose)"
  resolve_compose_cmd
  (( ${#COMPOSE_CMD[@]} == 0 )) && { log_error "Compose indisponivel."; return 1; }

  local state; state="$(db_container_state)"
  if [[ "$state" == "running" ]]; then
    log_ok "Container $MYSQL_CONTAINER ja esta em execucao."
  elif [[ "$state" == "exited" || "$state" == "created" || "$state" == "paused" ]]; then
    # Causa raiz comum: container existente parado (evita conflito de nome).
    log_warn "Container existente no estado '$state'. Reiniciando para preservar os dados."
    run_cmd "Iniciando container existente" docker start "$MYSQL_CONTAINER" || {
      log_warn "Falha ao reiniciar; recriando via Compose."
      run_cmd "Compose up (recreate)" env MYSQL_HOST_PORT="$MYSQL_HOST_PORT_RESOLVED" \
        "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" up -d "$MYSQL_SERVICE" || return 1
    }
  else
    bar_set 18 "Banco de dados" "criando container MySQL"
    run_cmd "Compose up (mysql)" env MYSQL_HOST_PORT="$MYSQL_HOST_PORT_RESOLVED" \
      "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" up -d "$MYSQL_SERVICE" || return 1
  fi

  # Espera real pelo healthcheck do compose (mysqladmin ping interno).
  log_step "Aguardando MySQL ficar saudavel"
  local i health
  for ((i=0; i<60; i++)); do
    health="$(db_health_state)"
    case "$health" in
      healthy) log_ok "MySQL saudavel em 127.0.0.1:$MYSQL_HOST_PORT_RESOLVED."; return 0 ;;
      none)
        # Sem healthcheck declarado: valida via TCP na porta host.
        if ! is_port_free "$MYSQL_HOST_PORT_RESOLVED"; then
          log_ok "MySQL respondendo na porta $MYSQL_HOST_PORT_RESOLVED (TCP)."; return 0
        fi ;;
    esac
    bar_set 28 "Banco de dados" "healthcheck: ${health} ($((i*2))s)"
    sleep 2
  done
  log_error "MySQL nao ficou saudavel a tempo. Verifique os logs: ${COMPOSE_CMD[*]} logs $MYSQL_SERVICE"
  return 1
}

db_migrate() {
  log_step "Aplicando migracoes e bootstrap de administradores"
  [[ -f "$MIGRATE_SCRIPT" ]] || { log_error "Script de migracao ausente: $MIGRATE_SCRIPT"; return 1; }
  validate_admin_json || return 1
  # Exporta a porta resolvida para o node (tem precedencia sobre o .env.local).
  if ! run_cmd "Migracao MySQL (node)" env \
        MYSQL_PORT="$MYSQL_HOST_PORT_RESOLVED" \
        MYSQL_HOST_PORT="$MYSQL_HOST_PORT_RESOLVED" \
        node "$MIGRATE_SCRIPT"; then
    log_error "Falha na migracao. Causa raiz tipica: banco indisponivel ou variavel ausente."
    return 1
  fi
  log_ok "Migracoes e administradores assegurados."
  return 0
}

db_stop() {
  log_step "Parando o banco de dados"
  resolve_compose_cmd
  if (( ${#COMPOSE_CMD[@]} > 0 )); then
    run_cmd "Compose stop (mysql)" "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" stop "$MYSQL_SERVICE" || true
  fi
}

# =============================================================================
# Aplicacao Next.js (backend de API + frontend) — start real em segundo plano
# =============================================================================
app_running_pid() {
  [[ -f "$APP_PID_FILE" ]] || return 1
  local pid; pid="$(cat "$APP_PID_FILE" 2>/dev/null || true)"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null && { printf '%s' "$pid"; return 0; }
  return 1
}

wait_http() {
  local port="$1" max="${2:-60}" i
  for ((i=0; i<max; i++)); do
    if ! is_port_free "$port"; then
      # Porta aberta; confirma resposta HTTP se houver curl.
      if have curl; then
        local code; code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${port}" 2>/dev/null || echo 000)"
        [[ "$code" =~ ^(200|3..|4..)$ ]] && { printf '%s' "$code"; return 0; }
      else
        printf 'tcp'; return 0
      fi
    fi
    bar_set 88 "Servidor Next.js" "compilando e aguardando HTTP ($((i*2))s)"
    sleep 2
  done
  return 1
}

app_start() {
  log_step "Iniciando o servidor Next.js (backend + frontend)"
  if app_running_pid >/dev/null; then
    log_warn "App ja esta em execucao (PID $(app_running_pid)). Pare antes de reiniciar."
    return 0
  fi
  resolve_pm_cmd
  (( ${#PM_CMD[@]} == 0 )) && { log_error "Gerenciador de pacotes indisponivel."; return 1; }

  : >"$APP_LOG_FILE"
  log_info "Porta do app: $APP_PORT  |  Log: $APP_LOG_FILE"
  printf '%s%s next dev -p %s%s\n' "$C_GRAY$C_DIM" "$I_GEAR" "$APP_PORT" "$C_RESET"

  # Inicia DESACOPLADO (nohup + disown) para sobreviver ao termino do script,
  # com saida integral gravada no log (espelhada via tail logo abaixo).
  nohup "${PM_CMD[@]}" exec next dev -p "$APP_PORT" >>"$APP_LOG_FILE" 2>&1 &
  local pid=$!
  disown "$pid" 2>/dev/null || true
  echo "$pid" >"$APP_PID_FILE"
  export PORT="$APP_PORT"
  log_info "Processo do app iniciado (PID $pid). Acompanhando a saida real abaixo:"

  # Espelha o log do dev em tempo real (saida completa, acima da barra fixa).
  tail -n +1 -f "$APP_LOG_FILE" 2>/dev/null &
  local tail_pid=$!

  local code
  if code="$(wait_http "$APP_PORT" 90)"; then
    sleep 1
    kill "$tail_pid" 2>/dev/null || true
    bar_set 100 "Pronto" "app em http://localhost:$APP_PORT"
    log_ok "Aplicacao no ar: http://localhost:$APP_PORT (resposta: $code)"
    return 0
  fi
  kill "$tail_pid" 2>/dev/null || true
  log_error "O app nao respondeu na porta $APP_PORT a tempo. Veja $APP_LOG_FILE."
  return 1
}

# Encerra qualquer processo escutando na porta informada (rede de seguranca).
kill_port() {
  local port="$1" pids="" pid
  if have lsof; then
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  elif have ss; then
    pids="$(ss -ltnp 2>/dev/null | grep -oE "pid=[0-9]+" | grep -oE "[0-9]+" | sort -u || true)"
  elif have netstat; then
    # Windows/Git Bash: extrai o PID da coluna final do netstat.
    pids="$(netstat -ano 2>/dev/null | grep -E "[:.]${port}[[:space:]]" | grep -E "LISTEN" | awk '{print $NF}' | sort -u || true)"
  fi
  for pid in $pids; do
    [[ -z "$pid" || "$pid" == "0" ]] && continue
    if have taskkill && [[ "$OS_FAMILY" == "windows" ]]; then
      taskkill //PID "$pid" //F >/dev/null 2>&1 || true
    else
      kill "$pid" 2>/dev/null || true
    fi
  done
}

app_stop() {
  log_step "Parando o servidor Next.js"
  local pid
  if pid="$(app_running_pid)"; then
    run_cmd "Encerrando app (PID $pid)" kill "$pid" || true
    sleep 1
    kill -9 "$pid" 2>/dev/null || true
    rm -f "$APP_PID_FILE"
    log_ok "App encerrado."
  else
    log_warn "Nenhum app rastreado por PID. Verificando a porta como rede de seguranca."
  fi
  # Garante que nada ficou escutando a porta do app.
  local ap; ap="$(env_value APP_PORT "$DEFAULT_APP_PORT")"
  if ! is_port_free "$ap"; then
    log_warn "Porta $ap ainda ocupada; encerrando processo remanescente."
    kill_port "$ap"
  fi
}

# =============================================================================
# Orquestracao de alto nivel
# =============================================================================
readonly I_DNA='🧬'
banner() {
  printf '\n%s' "$C_TEAL$C_BOLD"
  printf '  ╭───────────────────────────────────────────────╮\n'
  printf '  │   %s  Lyra MetaCare — Orquestrador local        │\n' "$I_DNA"
  printf '  ╰───────────────────────────────────────────────╯%s\n' "$C_RESET"
  printf '  %sversao %s  %s  %s%s\n\n' "$C_GRAY$C_DIM" "$SCRIPT_VERSION" "$I_DOT" "$OS_FAMILY" "$C_RESET"
}

# Executa todo o preflight com auto-fix. Retorna 1 se algo for irrecuperavel.
preflight_all() {
  PREFLIGHT_FAILED=0
  bar_set 4 "Preflight" "verificando dependencias"
  check_node || true
  bar_set 10 "Preflight" "gerenciador de pacotes"
  check_pnpm || true
  bar_set 16 "Preflight" "dependencias do projeto"
  check_dependencies || true
  bar_set 20 "Preflight" "ambiente (.env.local)"
  ensure_env_file || PREFLIGHT_FAILED=1
  bar_set 24 "Preflight" "Docker e Compose"
  check_docker || true
  if (( PREFLIGHT_FAILED == 1 )); then
    log_error "Preflight encontrou pendencias que exigem acao manual (acima)."
    return 1
  fi
  log_ok "Preflight concluido: ambiente pronto."
  return 0
}

cmd_up() {
  banner
  bar_set 2 "Iniciando" "preparando orquestracao completa"
  preflight_all || return 1
  resolve_ports
  bar_set 32 "Banco de dados" "subindo MySQL"
  db_up || return 1
  bar_set 55 "Banco de dados" "migracoes e admins"
  db_migrate || return 1
  bar_set 70 "Aplicacao" "iniciando Next.js"
  app_start || return 1
  printf '\n'
  log_ok "Stack completo no ar:"
  printf '   %s%s Frontend + Backend:%s http://localhost:%s\n' "$C_TEAL" "$I_WEB" "$C_RESET" "$APP_PORT"
  printf '   %s%s MySQL:%s 127.0.0.1:%s (db: %s)\n' "$C_TEAL" "$I_DB" "$C_RESET" "$MYSQL_HOST_PORT_RESOLVED" "$(env_value MYSQL_DATABASE)"
  printf '   %s%s Admin:%s %s (senha em ADMIN_BOOTSTRAP_PASSWORD no .env.local)\n' "$C_GRAY$C_DIM" "$I_DOT" "$C_RESET" "$(env_value ADMIN_BOOTSTRAP_EMAIL)"
  return 0
}

cmd_app() {
  banner
  preflight_all || return 1
  resolve_ports
  app_start || return 1
}

cmd_db() {
  banner
  check_docker || return 1
  ensure_env_file || return 1
  resolve_ports
  db_up || return 1
  db_migrate || return 1
}

cmd_migrate() {
  banner
  check_docker || return 1
  ensure_env_file || return 1
  resolve_ports
  db_migrate
}

cmd_doctor() {
  banner
  log_step "Diagnostico do ambiente (somente leitura)"
  local issues=0
  have node    && log_ok "Node.js: $(node -v)"                 || { log_error "Node.js ausente"; issues=$((issues+1)); }
  resolve_pm_cmd;     (( ${#PM_CMD[@]} > 0 ))      && log_ok "pnpm: ${PM_CMD[*]}"        || { log_error "pnpm ausente"; issues=$((issues+1)); }
  have docker  && log_ok "Docker: $(docker --version 2>/dev/null)" || { log_error "Docker ausente"; issues=$((issues+1)); }
  resolve_compose_cmd; (( ${#COMPOSE_CMD[@]} > 0 )) && log_ok "Compose: ${COMPOSE_CMD[*]}" || { log_error "Compose ausente"; issues=$((issues+1)); }
  if have docker && docker info >/dev/null 2>&1; then log_ok "Daemon Docker ativo"; else log_warn "Daemon Docker inativo"; issues=$((issues+1)); fi
  [[ -d "$ROOT_DIR/node_modules/next" ]] && log_ok "node_modules instalado" || log_warn "node_modules ausente (rode 'fix')"
  [[ -f "$ENV_FILE" ]] && log_ok ".env.local presente" || log_warn ".env.local ausente (rode 'fix')"

  log_step "Portas"
  local ap; ap="$(env_value APP_PORT "$DEFAULT_APP_PORT")"
  local dp; dp="$(env_value MYSQL_HOST_PORT "$DEFAULT_MYSQL_HOST_PORT")"
  is_port_free "$ap" && log_ok "App $ap: livre" || log_warn "App $ap: ocupada (sera realocada no start)"
  is_port_free "$dp" && log_ok "MySQL $dp: livre" || log_warn "MySQL $dp: ocupada (sera realocada/reutilizada no start)"

  log_step "Banco de dados"
  local st; st="$(db_container_state)"
  log_info "Container $MYSQL_CONTAINER: $st (health: $(db_health_state))"

  printf '\n'
  if (( issues == 0 )); then
    log_ok "Diagnostico: ambiente saudavel."
  else
    log_warn "Diagnostico: $issues ponto(s) de atencao. Use a opcao 'Reparar' para corrigir."
  fi
}

cmd_fix() {
  banner
  log_step "Reparo do ambiente (auto-fix por causa raiz)"
  preflight_all
  ensure_env_file || return 1
  validate_admin_json || return 1
  log_ok "Reparo concluido. Rode o diagnostico para confirmar."
}

cmd_status() {
  banner
  load_env_map
  log_step "Status dos servicos"
  local st; st="$(db_container_state)"
  printf '   %s%s MySQL:%s %s (health: %s) porta %s\n' "$C_TEAL" "$I_DB" "$C_RESET" "$st" "$(db_health_state)" "$(env_value MYSQL_HOST_PORT)"
  if app_running_pid >/dev/null; then
    printf '   %s%s App:%s em execucao (PID %s) porta %s\n' "$C_TEAL" "$I_WEB" "$C_RESET" "$(app_running_pid)" "$(env_value APP_PORT)"
  else
    printf '   %s%s App:%s parado\n' "$C_GRAY$C_DIM" "$I_WEB" "$C_RESET"
  fi
}

cmd_logs() {
  banner
  log_step "Logs do app (Ctrl+C para sair)"
  [[ -f "$APP_LOG_FILE" ]] || { log_warn "Sem log de app ainda ($APP_LOG_FILE)."; return 0; }
  tail -n 200 -f "$APP_LOG_FILE"
}

cmd_stop() {
  banner
  app_stop
  db_stop
  log_ok "Servicos parados."
}

# =============================================================================
# Menu dinamico com icones (navegacao por setas + atalhos numericos)
# =============================================================================
declare -a MENU_LABELS=(
  "$I_ROCKET  Subir tudo (banco + migracoes + app)"
  "$I_DB  Subir somente o banco de dados"
  "$I_WEB  Subir somente o app (frontend + backend)"
  "$I_MIG  Migrar banco e assegurar admins"
  "$I_DOCTOR  Diagnostico do ambiente"
  "$I_FIX  Reparar ambiente (auto-fix)"
  "$I_STATUS  Status dos servicos"
  "$I_LOGS  Ver logs do app (tempo real)"
  "$I_STOP  Parar servicos"
  "$I_EXIT  Sair"
)
declare -a MENU_ACTIONS=(
  cmd_up cmd_db cmd_app cmd_migrate cmd_doctor cmd_fix cmd_status cmd_logs cmd_stop __exit
)

# Executa uma acao com a barra de progresso fixa ativa, depois restaura a tela.
run_action_with_ui() {
  local action="$1"
  setup_ui
  "$action"
  local rc=$?
  bar_set 100 "Finalizado" "pressione Enter para voltar ao menu"
  sleep 0.4
  teardown_ui
  printf '\n%s%s Pressione Enter para voltar ao menu...%s' "$C_GRAY$C_DIM" "$I_ARR" "$C_RESET"
  read -r _ || true
  return "$rc"
}

draw_menu() {
  local selected="$1" i prefix
  clear 2>/dev/null || printf '\033[2J\033[H'
  banner
  printf '  %sUse %s/%s para navegar, Enter para executar, ou tecle o numero.%s\n\n' \
    "$C_GRAY$C_DIM" '↑' '↓' "$C_RESET"
  for i in "${!MENU_LABELS[@]}"; do
    if (( i == selected )); then
      printf '  %s %s%2d. %s %s\n' "$C_TEAL$C_BOLD" "$C_BG_SEL" "$((i+1))" "${MENU_LABELS[$i]}" "$C_RESET"
    else
      printf '  %s  %2d. %s%s\n' "$C_GRAY" "$((i+1))" "${MENU_LABELS[$i]}" "$C_RESET"
    fi
  done
  printf '\n'
}

interactive_menu() {
  local selected=0 total="${#MENU_LABELS[@]}" key rest
  while :; do
    draw_menu "$selected"
    IFS= read -rsn1 key || { key=q; }
    if [[ "$key" == $'\033' ]]; then
      read -rsn2 -t 0.01 rest 2>/dev/null || rest=""
      case "$rest" in
        '[A') (( selected = (selected - 1 + total) % total )) ;;
        '[B') (( selected = (selected + 1) % total )) ;;
      esac
      continue
    fi
    case "$key" in
      ''|$'\n'|$'\r')  # Enter
        local action="${MENU_ACTIONS[$selected]}"
        [[ "$action" == "__exit" ]] && { clear 2>/dev/null || true; log_ok "Ate logo."; return 0; }
        run_action_with_ui "$action"
        ;;
      q|Q) clear 2>/dev/null || true; log_ok "Ate logo."; return 0 ;;
      [1-9])
        local idx=$((key-1))
        if (( idx >= 0 && idx < total )); then
          selected=$idx
          local action="${MENU_ACTIONS[$selected]}"
          [[ "$action" == "__exit" ]] && { clear 2>/dev/null || true; log_ok "Ate logo."; return 0; }
          run_action_with_ui "$action"
        fi
        ;;
      0)
        # "10" -> Sair (atalho)
        selected=$((total-1))
        ;;
    esac
  done
}

print_help() {
  banner
  cat <<EOF
  ${C_WHITE}${C_BOLD}Uso:${C_RESET} ./run.sh [comando]

  ${C_TEAL}Comandos:${C_RESET}
    ${I_ROCKET} up        Sobe banco + migracoes + app (stack completo)
    ${I_DB} db        Sobe somente o banco e aplica migracoes
    ${I_WEB} app       Sobe somente o app (frontend + backend)
    ${I_MIG} migrate   Aplica migracoes e assegura administradores
    ${I_DOCTOR} doctor    Diagnostico do ambiente (somente leitura)
    ${I_FIX} fix       Repara o ambiente (auto-fix por causa raiz)
    ${I_STATUS} status    Mostra o estado dos servicos
    ${I_LOGS} logs      Acompanha os logs do app em tempo real
    ${I_STOP} stop      Para app e banco
       help      Mostra esta ajuda

  ${C_GRAY}${C_DIM}Sem argumentos, abre o menu interativo.${C_RESET}
EOF
}

# =============================================================================
# Dispatch principal
# =============================================================================
main() {
  detect_os
  resolve_compose_cmd
  resolve_pm_cmd

  local cmd="${1:-}"
  case "$cmd" in
    up)              setup_ui; cmd_up;      local rc=$?; teardown_ui; exit "$rc" ;;
    app)             setup_ui; cmd_app;     local rc=$?; teardown_ui; exit "$rc" ;;
    db)              setup_ui; cmd_db;      local rc=$?; teardown_ui; exit "$rc" ;;
    migrate)         setup_ui; cmd_migrate; local rc=$?; teardown_ui; exit "$rc" ;;
    doctor)          cmd_doctor; exit $? ;;
    fix)             setup_ui; cmd_fix;     local rc=$?; teardown_ui; exit "$rc" ;;
    status)          cmd_status; exit $? ;;
    logs)            cmd_logs; exit $? ;;
    stop)            cmd_stop; exit $? ;;
    help|-h|--help)  print_help; exit 0 ;;
    "")
      if [[ -t 0 && -t 1 ]]; then
        interactive_menu
      else
        # Sem TTY e sem argumento: sobe o stack completo de forma nao interativa.
        setup_ui; cmd_up; local rc=$?; teardown_ui; exit "$rc"
      fi
      ;;
    *)
      log_error "Comando desconhecido: $cmd"
      print_help
      exit 2
      ;;
  esac
}

main "$@"
