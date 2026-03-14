#!/usr/bin/env bash

set -Eeuo pipefail

readonly SCRIPT_VERSION="2026.03.13"
readonly REQUIRED_BASH_VERSION=4

if (( BASH_VERSINFO[0] < REQUIRED_BASH_VERSION )); then
  printf 'ERRO: Bash %s+ e obrigatorio.\n' "$REQUIRED_BASH_VERSION" >&2
  exit 1
fi

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly STATE_DIR="$ROOT_DIR/.lyra-run"
readonly ENV_FILE="$ROOT_DIR/.env.local"
readonly COMPOSE_FILE="$ROOT_DIR/compose.yaml"
readonly PACKAGE_FILE="$ROOT_DIR/package.json"
readonly MIGRATE_SCRIPT="$ROOT_DIR/scripts/mysql-migrate.mjs"
readonly APP_PID_FILE="$STATE_DIR/app.pid"
readonly APP_META_FILE="$STATE_DIR/app.meta"
readonly INSTALL_HASH_FILE="$STATE_DIR/install.hash"

readonly DEFAULT_MYSQL_HOST="127.0.0.1"
readonly DEFAULT_MYSQL_HOST_PORT="3307"
readonly DEFAULT_MYSQL_DATABASE="lyra_metacare"
readonly DEFAULT_MYSQL_USER="lyra"
readonly DEFAULT_MYSQL_PASSWORD="lyra_mysql_local_2026"
readonly DEFAULT_MYSQL_ROOT_PASSWORD="lyra_mysql_root_2026"
readonly DEFAULT_ADMIN_EMAIL="admin@admin.com"
readonly DEFAULT_ADMIN_FIRST_NAME="Admin"
readonly DEFAULT_ADMIN_LAST_NAME="Local"
readonly DEFAULT_APP_PORT="3000"

readonly C_RESET=$'\033[0m'
readonly C_BOLD=$'\033[1m'
readonly C_CYAN=$'\033[36m'
readonly C_GREEN=$'\033[32m'
readonly C_YELLOW=$'\033[33m'
readonly C_RED=$'\033[31m'
readonly C_BLUE=$'\033[34m'

declare -g PACKAGE_MANAGER=""
declare -ga PACKAGE_RUN=()
declare -ga COMPOSE_CMD=()
declare -g APP_PORT="$DEFAULT_APP_PORT"
declare -gA ENV_MAP=()

mkdir -p "$STATE_DIR"

log_info() { printf '%s[INFO]%s %s\n' "$C_CYAN" "$C_RESET" "$1"; }
log_ok() { printf '%s[OK]%s %s\n' "$C_GREEN" "$C_RESET" "$1"; }
log_warn() { printf '%s[AVISO]%s %s\n' "$C_YELLOW" "$C_RESET" "$1"; }
log_error() { printf '%s[ERRO]%s %s\n' "$C_RED" "$C_RESET" "$1" >&2; }
die() { log_error "$1"; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

banner() {
  printf '\n%sLyra MetaCare Local Orchestrator%s\n' "$C_BOLD" "$C_RESET"
  printf '%sVersao:%s %s\n' "$C_BLUE" "$C_RESET" "$SCRIPT_VERSION"
  printf '%sRaiz:%s %s\n\n' "$C_BLUE" "$C_RESET" "$ROOT_DIR"
}

section() {
  printf '\n%s== %s ==%s\n' "$C_BLUE" "$1" "$C_RESET"
}

trim() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

strip_quotes() {
  local value="$1"
  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "$value"
}

quote_env() {
  local value="$1"
  if [[ "$value" =~ ^[A-Za-z0-9_./:@+-]+$ ]]; then
    printf '%s' "$value"
    return
  fi
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

load_env_map() {
  ENV_MAP=()
  [[ -f "$ENV_FILE" ]] || return 0

  local raw line key value
  while IFS= read -r raw || [[ -n "$raw" ]]; do
    line="$(trim "$raw")"
    [[ -z "$line" || "${line:0:1}" == "#" || "$line" != *=* ]] && continue
    key="$(trim "${line%%=*}")"
    value="$(strip_quotes "$(trim "${line#*=}")")"
    ENV_MAP["$key"]="$value"
  done < "$ENV_FILE"
}

env_value() {
  local key="$1"
  local fallback="${2:-}"
  if [[ -n "${ENV_MAP[$key]+x}" ]]; then
    printf '%s' "${ENV_MAP[$key]}"
  else
    printf '%s' "$fallback"
  fi
}

upsert_env() {
  local key="$1"
  local value="$2"
  local encoded
  local temp
  local replaced=0

  encoded="$(quote_env "$value")"
  temp="$(mktemp)"

  if [[ -f "$ENV_FILE" ]]; then
    local raw
    while IFS= read -r raw || [[ -n "$raw" ]]; do
      if [[ "$raw" =~ ^[[:space:]]*${key}= ]]; then
        printf '%s=%s\n' "$key" "$encoded" >> "$temp"
        replaced=1
      else
        printf '%s\n' "$raw" >> "$temp"
      fi
    done < "$ENV_FILE"
  fi

  if (( replaced == 0 )); then
    printf '%s=%s\n' "$key" "$encoded" >> "$temp"
  fi

  mv "$temp" "$ENV_FILE"
}

generate_hex() {
  if have openssl; then
    openssl rand -hex 32
  else
    node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
  fi
}

generate_password() {
  node -e "console.log(require('node:crypto').randomBytes(18).toString('base64url'))"
}

export_runtime_env() {
  load_env_map
  export MYSQL_HOST="$(env_value MYSQL_HOST "$DEFAULT_MYSQL_HOST")"
  export MYSQL_HOST_PORT="$(env_value MYSQL_HOST_PORT "$DEFAULT_MYSQL_HOST_PORT")"
  export MYSQL_PORT="$(env_value MYSQL_PORT "$MYSQL_HOST_PORT")"
  export MYSQL_DATABASE="$(env_value MYSQL_DATABASE "$DEFAULT_MYSQL_DATABASE")"
  export MYSQL_USER="$(env_value MYSQL_USER "$DEFAULT_MYSQL_USER")"
  export MYSQL_PASSWORD="$(env_value MYSQL_PASSWORD "$DEFAULT_MYSQL_PASSWORD")"
  export MYSQL_ROOT_PASSWORD="$(env_value MYSQL_ROOT_PASSWORD "$DEFAULT_MYSQL_ROOT_PASSWORD")"
  export AUTH_SECRET="$(env_value AUTH_SECRET "")"
  export ADMIN_BOOTSTRAP_EMAIL="$(env_value ADMIN_BOOTSTRAP_EMAIL "$DEFAULT_ADMIN_EMAIL")"
  export ADMIN_BOOTSTRAP_PASSWORD="$(env_value ADMIN_BOOTSTRAP_PASSWORD "")"
  export ADMIN_BOOTSTRAP_FIRST_NAME="$(env_value ADMIN_BOOTSTRAP_FIRST_NAME "$DEFAULT_ADMIN_FIRST_NAME")"
  export ADMIN_BOOTSTRAP_LAST_NAME="$(env_value ADMIN_BOOTSTRAP_LAST_NAME "$DEFAULT_ADMIN_LAST_NAME")"
  export PORT="$(env_value PORT "$DEFAULT_APP_PORT")"
  APP_PORT="$PORT"
}

require_file() {
  [[ -f "$1" ]] || die "Arquivo obrigatorio ausente: $1"
}

select_package_manager() {
  [[ -n "$PACKAGE_MANAGER" ]] && return 0
  if [[ -f "$ROOT_DIR/pnpm-lock.yaml" ]]; then
    PACKAGE_MANAGER="pnpm"
    PACKAGE_RUN=(pnpm)
  else
    PACKAGE_MANAGER="npm"
    PACKAGE_RUN=(npm)
  fi
}

ensure_package_manager() {
  select_package_manager
  if [[ "$PACKAGE_MANAGER" == "pnpm" ]] && ! have pnpm; then
    if have corepack; then
      log_info "pnpm nao encontrado. Ativando via corepack."
      corepack enable >/dev/null 2>&1 || true
      corepack prepare pnpm@latest --activate >/dev/null
    else
      die "pnpm nao encontrado e corepack indisponivel."
    fi
  fi
}

ensure_compose() {
  if (( ${#COMPOSE_CMD[@]} > 0 )); then
    return 0
  fi
  if have docker && docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker compose)
  elif have docker-compose; then
    COMPOSE_CMD=(docker-compose)
  else
    die "Docker Compose nao encontrado."
  fi
}

compose() {
  ensure_compose
  export_runtime_env
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" "$@"
}

validate_layout() {
  require_file "$PACKAGE_FILE"
  require_file "$COMPOSE_FILE"
  require_file "$MIGRATE_SCRIPT"
}

doctor() {
  section "Requisitos do sistema"
  validate_layout
  select_package_manager

  have git && log_ok "Git disponivel." || die "Git nao encontrado."
  have node && log_ok "Node.js disponivel: $(node --version)" || die "Node.js nao encontrado."
  have npm && log_ok "npm disponivel: $(npm --version)" || die "npm nao encontrado."
  have docker && log_ok "Docker CLI disponivel." || die "Docker nao encontrado."
  docker info >/dev/null 2>&1 && log_ok "Docker daemon acessivel." || die "Docker daemon indisponivel."

  if [[ "$PACKAGE_MANAGER" == "pnpm" ]]; then
    if have pnpm; then
      log_ok "pnpm disponivel: $(pnpm --version)"
    elif have corepack; then
      log_warn "pnpm ausente, mas sera ativado automaticamente quando necessario."
    else
      die "pnpm ausente e corepack indisponivel."
    fi
  fi

  ensure_compose
  log_ok "Docker Compose disponivel."
}

hash_files() {
  if have sha256sum; then
    sha256sum "$@" | awk '{print $1}' | tr -d '\n'
  elif have shasum; then
    shasum -a 256 "$@" | awk '{print $1}' | tr -d '\n'
  else
    node - "$@" <<'NODE'
const crypto = require('node:crypto');
const fs = require('node:fs');
const hash = crypto.createHash('sha256');
for (const file of process.argv.slice(2)) hash.update(fs.readFileSync(file));
process.stdout.write(hash.digest('hex'));
NODE
  fi
}

install_deps() {
  validate_layout
  doctor
  ensure_package_manager

  local files=("$PACKAGE_FILE")
  [[ -f "$ROOT_DIR/pnpm-lock.yaml" ]] && files+=("$ROOT_DIR/pnpm-lock.yaml")
  [[ -f "$ROOT_DIR/package-lock.json" ]] && files+=("$ROOT_DIR/package-lock.json")

  local current_hash
  local saved_hash=""
  current_hash="$(hash_files "${files[@]}")"
  [[ -f "$INSTALL_HASH_FILE" ]] && saved_hash="$(<"$INSTALL_HASH_FILE")"

  if [[ -d "$ROOT_DIR/node_modules" && "$current_hash" == "$saved_hash" ]]; then
    log_ok "Dependencias ja instaladas e alinhadas ao estado atual do projeto."
    return 0
  fi

  section "Instalacao de dependencias"
  (
    cd "$ROOT_DIR"
    if [[ "$PACKAGE_MANAGER" == "pnpm" ]]; then
      CI=true pnpm install --frozen-lockfile
    else
      npm install
    fi
  )

  printf '%s\n' "$current_hash" > "$INSTALL_HASH_FILE"
  log_ok "Dependencias instaladas com sucesso."
}

ask_value() {
  local label="$1"
  local current="$2"
  local secret="${3:-0}"
  local answer=""

  if [[ ! -t 0 ]]; then
    printf '%s' "$current"
    return 0
  fi

  if [[ "$secret" == "1" ]]; then
    if [[ -n "$current" ]]; then
      read -r -s -p "$label [manter atual]: " answer
    else
      read -r -s -p "$label [gerar automaticamente]: " answer
    fi
    printf '\n'
  else
    read -r -p "$label [$current]: " answer
  fi

  printf '%s' "${answer:-$current}"
}

ensure_env() {
  load_env_map

  local mysql_host
  local mysql_host_port
  local mysql_port
  local mysql_database
  local mysql_user
  local mysql_password
  local mysql_root_password
  local auth_secret
  local admin_email
  local admin_password
  local admin_first_name
  local admin_last_name
  local port_value

  mysql_host="$(ask_value "Host do MySQL local" "$(env_value MYSQL_HOST "$DEFAULT_MYSQL_HOST")")"
  mysql_host_port="$(ask_value "Porta publicada do MySQL" "$(env_value MYSQL_HOST_PORT "$DEFAULT_MYSQL_HOST_PORT")")"
  mysql_port="$(ask_value "Porta do MySQL para a aplicacao" "$(env_value MYSQL_PORT "$mysql_host_port")")"
  mysql_database="$(ask_value "Banco MySQL" "$(env_value MYSQL_DATABASE "$DEFAULT_MYSQL_DATABASE")")"
  mysql_user="$(ask_value "Usuario MySQL da aplicacao" "$(env_value MYSQL_USER "$DEFAULT_MYSQL_USER")")"
  mysql_password="$(ask_value "Senha MySQL da aplicacao" "$(env_value MYSQL_PASSWORD "$DEFAULT_MYSQL_PASSWORD")" 1)"
  mysql_root_password="$(ask_value "Senha root do MySQL" "$(env_value MYSQL_ROOT_PASSWORD "$DEFAULT_MYSQL_ROOT_PASSWORD")" 1)"
  auth_secret="$(env_value AUTH_SECRET "")"
  admin_email="$(ask_value "Email do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_EMAIL "$DEFAULT_ADMIN_EMAIL")")"
  admin_password="$(ask_value "Senha do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_PASSWORD "")" 1)"
  admin_first_name="$(ask_value "Nome do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_FIRST_NAME "$DEFAULT_ADMIN_FIRST_NAME")")"
  admin_last_name="$(ask_value "Sobrenome do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_LAST_NAME "$DEFAULT_ADMIN_LAST_NAME")")"
  port_value="$(ask_value "Porta HTTP local da aplicacao" "$(env_value PORT "$DEFAULT_APP_PORT")")"

  [[ -z "$auth_secret" ]] && auth_secret="$(generate_hex)"
  [[ -z "$admin_password" ]] && admin_password="$(generate_password)"

  upsert_env "MYSQL_HOST" "$mysql_host"
  upsert_env "MYSQL_HOST_PORT" "$mysql_host_port"
  upsert_env "MYSQL_PORT" "$mysql_port"
  upsert_env "MYSQL_DATABASE" "$mysql_database"
  upsert_env "MYSQL_USER" "$mysql_user"
  upsert_env "MYSQL_PASSWORD" "$mysql_password"
  upsert_env "MYSQL_ROOT_PASSWORD" "$mysql_root_password"
  upsert_env "AUTH_SECRET" "$auth_secret"
  upsert_env "ADMIN_BOOTSTRAP_EMAIL" "$admin_email"
  upsert_env "ADMIN_BOOTSTRAP_PASSWORD" "$admin_password"
  upsert_env "ADMIN_BOOTSTRAP_FIRST_NAME" "$admin_first_name"
  upsert_env "ADMIN_BOOTSTRAP_LAST_NAME" "$admin_last_name"
  upsert_env "PORT" "$port_value"

  export_runtime_env
  validate_env
  log_ok ".env.local configurado e validado."
}

validate_env() {
  export_runtime_env
  local missing=()
  [[ -z "$MYSQL_HOST" ]] && missing+=("MYSQL_HOST")
  [[ -z "$MYSQL_HOST_PORT" ]] && missing+=("MYSQL_HOST_PORT")
  [[ -z "$MYSQL_PORT" ]] && missing+=("MYSQL_PORT")
  [[ -z "$MYSQL_DATABASE" ]] && missing+=("MYSQL_DATABASE")
  [[ -z "$MYSQL_USER" ]] && missing+=("MYSQL_USER")
  [[ -z "$MYSQL_PASSWORD" ]] && missing+=("MYSQL_PASSWORD")
  [[ -z "$MYSQL_ROOT_PASSWORD" ]] && missing+=("MYSQL_ROOT_PASSWORD")
  [[ -z "$AUTH_SECRET" ]] && missing+=("AUTH_SECRET")
  [[ -z "$ADMIN_BOOTSTRAP_EMAIL" ]] && missing+=("ADMIN_BOOTSTRAP_EMAIL")
  [[ -z "$ADMIN_BOOTSTRAP_PASSWORD" ]] && missing+=("ADMIN_BOOTSTRAP_PASSWORD")
  [[ -z "$ADMIN_BOOTSTRAP_FIRST_NAME" ]] && missing+=("ADMIN_BOOTSTRAP_FIRST_NAME")
  [[ -z "$ADMIN_BOOTSTRAP_LAST_NAME" ]] && missing+=("ADMIN_BOOTSTRAP_LAST_NAME")
  [[ -z "$PORT" ]] && missing+=("PORT")
  (( ${#missing[@]} == 0 )) || die "Variaveis obrigatorias ausentes em .env.local: ${missing[*]}"
}

ensure_env_ready() {
  load_env_map
  local required=(
    MYSQL_HOST MYSQL_HOST_PORT MYSQL_PORT MYSQL_DATABASE MYSQL_USER
    MYSQL_PASSWORD MYSQL_ROOT_PASSWORD AUTH_SECRET ADMIN_BOOTSTRAP_EMAIL
    ADMIN_BOOTSTRAP_PASSWORD ADMIN_BOOTSTRAP_FIRST_NAME ADMIN_BOOTSTRAP_LAST_NAME PORT
  )
  local key
  for key in "${required[@]}"; do
    if [[ -z "$(env_value "$key" "")" ]]; then
      log_warn ".env.local ausente ou incompleto. Sera configurado agora."
      ensure_env
      return 0
    fi
  done
  validate_env
  log_ok ".env.local ja esta completo."
}

mysql_running() {
  local id
  id="$(compose ps -q mysql 2>/dev/null || true)"
  [[ -n "$id" ]] || return 1
  docker inspect --format '{{.State.Running}}' "$id" 2>/dev/null | grep -qi '^true$'
}

mysql_health() {
  local id
  id="$(compose ps -q mysql 2>/dev/null || true)"
  [[ -n "$id" ]] || return 1
  docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$id" 2>/dev/null
}

wait_mysql() {
  local attempt=1
  while (( attempt <= 60 )); do
    if [[ "$(mysql_health || true)" == "healthy" ]]; then
      log_ok "MySQL local esta saudavel."
      return 0
    fi
    log_info "Aguardando saude do MySQL ($attempt/60)."
    sleep 2
    (( attempt += 1 ))
  done
  die "MySQL nao ficou saudavel dentro do tempo esperado."
}

mysql_up() {
  ensure_env_ready
  doctor
  section "Subindo MySQL local"
  compose up -d mysql
  wait_mysql
}

mysql_migrate() {
  install_deps
  ensure_env_ready
  mysql_up
  section "Aplicando migracoes MySQL"
  (
    cd "$ROOT_DIR"
    export_runtime_env
    node "$MIGRATE_SCRIPT"
  )
  log_ok "Migracoes MySQL concluidas."
}

read_meta() {
  local key="$1"
  [[ -f "$APP_META_FILE" ]] || return 1
  awk -F= -v target="$key" '$1 == target {print substr($0, index($0, "=") + 1)}' "$APP_META_FILE"
}

app_pid() {
  [[ -f "$APP_PID_FILE" ]] || return 1
  tr -d '[:space:]' < "$APP_PID_FILE"
}

pid_running() {
  local pid="$1"
  [[ -n "$pid" ]] || return 1
  kill -0 "$pid" 2>/dev/null
}

stop_app_internal() {
  local pid
  pid="$(app_pid || true)"
  [[ -n "$pid" ]] || return 1
  pid_running "$pid" || { rm -f "$APP_PID_FILE" "$APP_META_FILE"; return 1; }
  kill "$pid" 2>/dev/null || true
  for _ in $(seq 1 15); do
    pid_running "$pid" || { rm -f "$APP_PID_FILE" "$APP_META_FILE"; return 0; }
    sleep 1
  done
  kill -9 "$pid" 2>/dev/null || true
  rm -f "$APP_PID_FILE" "$APP_META_FILE"
}

wait_http() {
  local url="$1"
  local attempt=1
  while (( attempt <= 90 )); do
    if have curl; then
      if curl --silent --fail --max-time 3 "$url" >/dev/null 2>&1; then
        log_ok "Aplicacao respondeu em $url"
        return 0
      fi
    else
      if node - "$url" <<'NODE' >/dev/null 2>&1
const http = require('node:http');
const https = require('node:https');
const url = new URL(process.argv[2]);
const client = url.protocol === 'https:' ? https : http;
const req = client.request(url, { method: 'GET', timeout: 3000 }, (res) => {
  process.exit(res.statusCode && res.statusCode < 500 ? 0 : 1);
});
req.on('error', () => process.exit(1));
req.on('timeout', () => { req.destroy(); process.exit(1); });
req.end();
NODE
      then
        log_ok "Aplicacao respondeu em $url"
        return 0
      fi
    fi
    sleep 2
    (( attempt += 1 ))
  done
  die "Aplicacao nao respondeu em $url dentro do tempo esperado."
}

start_app() {
  local mode="$1"
  shift

  ensure_package_manager
  [[ -d "$ROOT_DIR/node_modules" ]] || die "Dependencias ausentes. Execute ./run.sh install ou ./run.sh dev."
  stop_app_internal >/dev/null 2>&1 || true
  export_runtime_env
  (
    cd "$ROOT_DIR"
    export PORT="$APP_PORT"
    nohup "$@" >/dev/null 2>&1 &
    local pid=$!
    printf '%s\n' "$pid" > "$APP_PID_FILE"
    {
      printf 'mode=%s\n' "$mode"
      printf 'port=%s\n' "$APP_PORT"
      printf 'started_at=%s\n' "$(date '+%Y-%m-%d %H:%M:%S')"
    } > "$APP_META_FILE"
  )
}

dev_mode() {
  install_deps
  mysql_migrate
  section "Subindo stack de desenvolvimento"
  start_app "dev" "${PACKAGE_RUN[@]}" run dev
  wait_http "http://127.0.0.1:${APP_PORT}"
  log_ok "Aplicacao em desenvolvimento ativa."
}

fast_dev_mode() {
  ensure_package_manager
  ensure_env_ready
  mysql_up
  section "Subindo modo desenvolvimento rapido"
  start_app "dev" "${PACKAGE_RUN[@]}" run dev
  wait_http "http://127.0.0.1:${APP_PORT}"
  log_ok "Aplicacao em desenvolvimento ativa sem reinstalacao."
}

prod_mode() {
  install_deps
  mysql_migrate
  section "Gerando build de producao"
  (
    cd "$ROOT_DIR"
    export_runtime_env
    "${PACKAGE_RUN[@]}" run build
  )
  section "Subindo stack de producao"
  start_app "prod" "${PACKAGE_RUN[@]}" run start
  wait_http "http://127.0.0.1:${APP_PORT}"
  log_ok "Aplicacao em producao ativa."
}

fast_prod_mode() {
  ensure_package_manager
  ensure_env_ready
  mysql_up
  [[ -f "$ROOT_DIR/.next/BUILD_ID" ]] || die "Build inexistente. Execute ./run.sh prod primeiro."
  section "Subindo modo producao rapido"
  start_app "prod" "${PACKAGE_RUN[@]}" run start
  wait_http "http://127.0.0.1:${APP_PORT}"
  log_ok "Aplicacao em producao ativa com build existente."
}

stop_app() {
  section "Encerrando aplicacao local"
  if stop_app_internal; then
    log_ok "Aplicacao encerrada."
  else
    log_warn "Nenhuma aplicacao gerenciada pelo run.sh estava ativa."
  fi
}

mysql_down() {
  section "Parando MySQL local"
  compose stop mysql
  log_ok "MySQL local parado."
}

mysql_reset() {
  if [[ -t 0 ]]; then
    local confirmation=""
    read -r -p "Isso remove o volume local do MySQL. Digite RESETAR para continuar: " confirmation
    [[ "$confirmation" == "RESETAR" ]] || die "Reset do MySQL cancelado."
  fi
  section "Reset completo do MySQL local"
  compose down -v
  log_ok "Container e volume do MySQL removidos."
}

status_report() {
  section "Status geral"
  if [[ -f "$ENV_FILE" ]]; then
    log_ok ".env.local presente."
  else
    log_warn ".env.local ausente."
  fi

  if [[ -d "$ROOT_DIR/node_modules" ]]; then
    log_ok "Dependencias do projeto presentes."
  else
    log_warn "Dependencias do projeto ausentes."
  fi

  if mysql_running; then
    log_ok "MySQL em execucao. Health: $(mysql_health || printf 'desconhecido')"
  else
    log_warn "MySQL local parado."
  fi

  local pid
  pid="$(app_pid || true)"
  if [[ -n "$pid" ]] && pid_running "$pid"; then
    log_ok "Aplicacao ativa. PID: $pid | Modo: $(read_meta mode || printf 'desconhecido') | Porta: $(read_meta port || printf "$DEFAULT_APP_PORT")"
  else
    log_warn "Aplicacao local parada."
  fi
}

health_report() {
  doctor
  section "Saude operacional"
  if [[ -f "$ENV_FILE" ]]; then
    validate_env
    log_ok ".env.local atende aos requisitos."
  else
    log_warn ".env.local ainda nao existe."
  fi
  if mysql_running; then
    log_ok "MySQL local em execucao."
  else
    log_warn "MySQL local nao esta ativo."
  fi
  local pid
  pid="$(app_pid || true)"
  if [[ -n "$pid" ]] && pid_running "$pid"; then
    log_ok "Aplicacao local em execucao."
  else
    log_warn "Aplicacao local nao esta ativa."
  fi
}

stop_all() {
  stop_app
  mysql_down
}

menu() {
  local choice=""
  while true; do
    banner
    printf '%s1.%s Validar requisitos do sistema\n' "$C_BOLD" "$C_RESET"
    printf '%s2.%s Instalar dependencias do projeto\n' "$C_BOLD" "$C_RESET"
    printf '%s3.%s Configurar ambiente local\n' "$C_BOLD" "$C_RESET"
    printf '%s4.%s Subir MySQL local\n' "$C_BOLD" "$C_RESET"
    printf '%s5.%s Aplicar migracoes MySQL\n' "$C_BOLD" "$C_RESET"
    printf '%s6.%s Subir stack completa em desenvolvimento\n' "$C_BOLD" "$C_RESET"
    printf '%s7.%s Subir stack completa em producao\n' "$C_BOLD" "$C_RESET"
    printf '%s8.%s Modo desenvolvimento rapido\n' "$C_BOLD" "$C_RESET"
    printf '%s9.%s Modo producao rapido\n' "$C_BOLD" "$C_RESET"
    printf '%s10.%s Status geral\n' "$C_BOLD" "$C_RESET"
    printf '%s11.%s Saude operacional\n' "$C_BOLD" "$C_RESET"
    printf '%s12.%s Logs do MySQL\n' "$C_BOLD" "$C_RESET"
    printf '%s13.%s Encerrar aplicacao\n' "$C_BOLD" "$C_RESET"
    printf '%s14.%s Parar MySQL local\n' "$C_BOLD" "$C_RESET"
    printf '%s15.%s Reset completo do MySQL local\n' "$C_BOLD" "$C_RESET"
    printf '%s16.%s Encerrar tudo\n' "$C_BOLD" "$C_RESET"
    printf '%s0.%s Sair\n\n' "$C_BOLD" "$C_RESET"
    read -r -p "Escolha uma opcao: " choice

    case "$choice" in
      1) doctor ;;
      2) install_deps ;;
      3) ensure_env ;;
      4) mysql_up ;;
      5) mysql_migrate ;;
      6) dev_mode ;;
      7) prod_mode ;;
      8) fast_dev_mode ;;
      9) fast_prod_mode ;;
      10) status_report ;;
      11) health_report ;;
      12) compose logs -f mysql ;;
      13) stop_app ;;
      14) mysql_down ;;
      15) mysql_reset ;;
      16) stop_all ;;
      0) break ;;
      *) log_warn "Opcao invalida." ;;
    esac

    printf '\nPressione Enter para continuar...'
    read -r _
    clear
  done
}

help_text() {
  cat <<'HELP'
Uso:
  ./run.sh                abre o menu interativo
  ./run.sh doctor         valida requisitos do sistema
  ./run.sh install        instala dependencias somente se necessario
  ./run.sh config         cria ou atualiza .env.local
  ./run.sh mysql-up       sobe o MySQL local
  ./run.sh migrate        sobe MySQL e aplica migracoes
  ./run.sh dev            instala, configura, sobe MySQL, migra e inicia o app em desenvolvimento
  ./run.sh fast-dev       sobe MySQL e inicia o app sem reinstalar
  ./run.sh prod           instala, configura, sobe MySQL, migra, builda e inicia o app em producao
  ./run.sh fast-prod      sobe MySQL e inicia o app com build existente
  ./run.sh status         mostra status do ambiente local
  ./run.sh health         mostra checks operacionais
  ./run.sh logs mysql     acompanha logs do MySQL
  ./run.sh stop-app       encerra a aplicacao gerenciada por este script
  ./run.sh mysql-down     para o MySQL local
  ./run.sh mysql-reset    remove container e volume local do MySQL
  ./run.sh stop-all       encerra app e MySQL local
  ./run.sh help           mostra esta ajuda
HELP
}

main() {
  validate_layout
  select_package_manager
  case "${1:-menu}" in
    menu) menu ;;
    doctor) doctor ;;
    install) install_deps ;;
    config|configure) ensure_env ;;
    mysql-up) mysql_up ;;
    migrate) mysql_migrate ;;
    dev) dev_mode ;;
    fast-dev) fast_dev_mode ;;
    prod) prod_mode ;;
    fast-prod) fast_prod_mode ;;
    status) status_report ;;
    health) health_report ;;
    logs)
      [[ "${2:-mysql}" == "mysql" ]] || die "Apenas logs do MySQL estao disponiveis sem persistencia em arquivo."
      compose logs -f mysql
      ;;
    stop-app) stop_app ;;
    mysql-down) mysql_down ;;
    mysql-reset) mysql_reset ;;
    stop-all) stop_all ;;
    help|-h|--help) help_text ;;
    *) die "Comando desconhecido: $1" ;;
  esac
}

main "$@"
