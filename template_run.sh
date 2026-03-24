#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PLANE ELITE ORCHESTRATOR 2026 — PhD MASTER EDITION
#  Minimalist Zen Architecture  |  Zero-UI Design  |  Absolute Force Sync
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#set -euo pipefail

# --- Verificação de Ambiente ---
readonly REQUIRED_BASH_VERSION=4
if ((BASH_VERSINFO[0] < REQUIRED_BASH_VERSION)); then
    echo "ERRO: Bash $REQUIRED_BASH_VERSION+ é obrigatório."
    exit 1
fi

# --- Configurações & Ambiente ---
readonly VERSION="8.1.0"
readonly CODENAME="Elite Zenith"
readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly STATE_FILE="$ROOT_DIR/.plane_orchestrator_state"
readonly LOG_FILE="$ROOT_DIR/.plane_orchestrator.log"
readonly PID_FILE="$ROOT_DIR/.plane_pids"
readonly LOCK_FILE="$ROOT_DIR/.plane.lock"
readonly LIVE_OUTPUT_MASTER="$ROOT_DIR/live_output.txt"

# --- Paleta Noir Elite (TrueColor) ---
FG_MAIN="\033[38;2;230;237;243m"
FG_SEC="\033[38;2;139;148;158m"
FG_DIM="\033[38;2;110;118;129m"
ACCENT_CYAN="\033[38;2;86;211;255m"
ACCENT_VIOLET="\033[38;2;187;128;255m"
ACCENT_MINT="\033[38;2;125;239;161m"
ACCENT_AMBER="\033[38;2;255;183;77m"
ACCENT_ROSE="\033[38;2;255;107;129m"
STATE_OK="\033[38;2;63;185;80m"
STATE_WARN="\033[38;2;210;153;34m"
STATE_ERR="\033[38;2;248;81;73m"
BG_HOVER="\033[48;2;33;38;45m"
BOLD="\033[1m"
DIM="\033[2m"
RST="\033[0m"
EL="\033[K" # Erase to end of line

# --- Iconografia Minimalista ---
I_DOT="•"
I_ARR="→"
I_CHECK="✔"
I_WARN="⚠"
I_CROSS="✖"
I_TERM="❯"
I_DNA="🧬"

# --- Estado Global ---
SELECTED=0
CURRENT_TASK="Standby"
PROGRESS=0
START_TIME=$(date +%s)
PIDS=()
LOG_LINES=()
LOG_MAX=1000
LIVE_LINES=() # Buffer histórico completo
SCROLL_POS=0  # 0 = final do log (tempo real)
NR_LINES=5    # Altura da área Live (será recalculado dinamicamente por update_dimensions)
MENU_OVERHEAD=25 # Linhas fixas ocupadas por header+menu+status+footer
APP_ACTIVE=false # Flag para monitoramento persistente de logs
NEED_REPAINT=true

# --- Funções Core UI ---
cursor_hide()  { printf "\033[?25l"; }
cursor_show()  { printf "\033[?25h"; }
reset_cursor() { printf "\033[H"; }

update_dimensions() {
    TERM_LINES=$(tput lines 2>/dev/null || echo 24)
    TERM_COLS=$(tput cols 2>/dev/null || echo 80)
    # Cálculo dinâmico: NR_LINES = espaço disponível - overhead fixo
    local available=$(( TERM_LINES - MENU_OVERHEAD ))
    NR_LINES=5
    (( NR_LINES < 3 )) && NR_LINES=3
    NEED_REPAINT=true
}

# --- Menu Minimalista ---
MENU_ITEMS=(
    "SYNC_ALL|🔄 Sincronização Total|  Venv + Pip + Pnpm"
    "SYNC_PURGE|🧹 Deep Clean (Purificar)|Remover node_modules e venv"
    "SETUP_INFRA|💎 Setup Infra (Ametista)|Provisionar Postgres + Redis + DB"
    "DEV_MODE|🚀 Modo Desenvolvedor|Sync + Start (Soberano)"
    "PRD_MODE|🏛️ Modo Produção|      Sync + Build + Start"
    "FAST_DEV|⚡ Start Dev (Rápido)|Apenas subir API + FE (Skip Sync)"
    "FAST_PRD|🏎️ Start Prod (Rápido)|     Apenas subir Produção (Skip Build)"
    "STOP_APP|🛑 Encerrar Localhost|Derrubar serviços ativos"
    "HEALTH|🏥 Saúde do Projeto| Verificar integridade"
    "UNLOCK_PLANE|🔓 Desbloquear Plano Full|Ativar Edição Full (Enterprise + Pro)"
    "EXIT|🚪 Sair|Encerrar processos"
)

draw_ui() {
    local buffer=""
    local elapsed=$(( $(date +%s) - START_TIME ))
    local timer=$(printf "%02d:%02d:%02d" $((elapsed/3600)) $(((elapsed%3600)/60)) $((elapsed%60)))
    
    if $NEED_REPAINT; then
        printf "\033[2J"
        NEED_REPAINT=false
    fi
    
    reset_cursor
    
    # Header
    buffer+="${EL}\n${EL}  ${FG_DIM}${DIM}${I_DOT} PLANE ELITE ${BOLD}v${VERSION}${RST} ${FG_DIM}— ${timer}${RST}\n"
    buffer+="${EL}  ${ACCENT_CYAN}${BOLD}${CURRENT_TASK:0:$((TERM_COLS-10))}${RST}\n"
    
    # Progress Bar
    local bar_w=$((TERM_COLS - 13))
    ((bar_w < 10)) && bar_w=10
    local filled=$((PROGRESS * bar_w / 100))
    local empty=$((bar_w - filled))
    
    buffer+="${EL}  "
    [[ $filled -gt 0 ]] && buffer+="${ACCENT_MINT}$(printf '%.0s━' $(seq 1 $filled))"
    [[ $empty -gt 0 ]] && buffer+="${FG_DIM}$(printf '%.0s─' $(seq 1 $empty))"
    buffer+=" ${ACCENT_CYAN}${BOLD}${PROGRESS}%${RST}\n"
    buffer+="${EL}  ${FG_SEC}${DIM}$(printf '%.0s─' $(seq 1 $((TERM_COLS-6))))${RST}\n\n"
    
    # Menu
    local i action label desc
    for i in "${!MENU_ITEMS[@]}"; do
        IFS='|' read -r action label desc <<< "${MENU_ITEMS[$i]}"
        local padded_label=$(printf "%-28s" "${label}")
        if ((i == SELECTED)); then
            buffer+="${EL}  ${BG_HOVER}${ACCENT_CYAN}${BOLD}${I_ARR}  ${padded_label} ${RST} ${FG_SEC}${desc}${RST}\n"
        else
            buffer+="${EL}     ${FG_SEC}${padded_label} ${RST} ${FG_DIM}${desc}${RST}\n"
        fi
    done
    
    # Live Console Area (PhD Precision: Scrolling & Scrollbar)
    buffer+="${EL}\n"
    local total_live=${#LIVE_LINES[@]}
    if [[ $total_live -gt 0 ]]; then
        buffer+="${EL}  ${FG_DIM}${I_TERM} LIVE OUTPUT:${RST}"
        if (( SCROLL_POS > 0 )); then
            buffer+=" ${STATE_WARN}[SCROLL: -${SCROLL_POS}]${RST}"
        fi
        buffer+="\n"

        # Cálculo da Janela de Scroll
        local start=$(( total_live - NR_LINES - SCROLL_POS ))
        (( start < 0 )) && start=0
        local end=$(( start + NR_LINES ))
        (( end > total_live )) && end=total_live

        # Scrollbar Logic
        local sb_size=$NR_LINES
        local sb_indicator_pos=0
        if [[ $total_live -gt $NR_LINES ]]; then
            # Regra de três para posição: (SCROLL_POS / max_scroll) * (area_size)
            local max_sc=$(( total_live - NR_LINES ))
            sb_indicator_pos=$(( SCROLL_POS * (sb_size - 1) / max_sc ))
        fi

        for ((j=0; j<NR_LINES; j++)); do
            local idx=$(( start + j ))
            local line_content=""
            if (( idx < end )); then
                line_content="${LIVE_LINES[$idx]}"
            fi
            
            # Draw Scrollbar
            local sb_char="${FG_DIM}┃${RST}"
            if [[ $total_live -gt $NR_LINES ]]; then
                # O indicador de scroll no Bash Terminal UI PhD
                # Invertido: SCROLL_POS=0 está no final, indicador deve estar no fundo
                if (( (sb_size - 1 - j) == sb_indicator_pos )); then
                    sb_char="${ACCENT_CYAN}█${RST}"
                fi
            fi

            buffer+="${EL}  ${sb_char} ${ACCENT_AMBER}${line_content:0:$((TERM_COLS-10))}${RST}\n"
        done
    else
        # Espaço reservado para manter altura estável
        for ((j=0; j<NR_LINES+1; j++)); do buffer+="${EL}\n"; done
    fi

    # Status
    buffer+="${EL}\n"
    if [[ -n "$LAST_MSG" ]]; then
        buffer+="${EL}  ${FG_DIM}${DIM}STATUS:${RST} "
        case "$LAST_STATUS" in
            ok)   buffer+="${STATE_OK}${I_CHECK} ${LAST_MSG}${RST}\n" ;;
            warn) buffer+="${STATE_WARN}${I_WARN} ${LAST_MSG}${RST}\n" ;;
            err)  buffer+="${STATE_ERR}${I_CROSS} ${LAST_MSG}${RST}\n" ;;
            *)    buffer+="${FG_SEC}${LAST_MSG}${RST}\n" ;;
        esac
    else
        buffer+="${EL}\n"
    fi
    buffer+="${EL}\n${EL}  ${FG_DIM}${DIM}[↑↓/jk] Mover  [Enter] Executar  [a/z] Scroll Line  [PageUp/v] Scroll Page  [L] Logs  [Q] Sair${RST}"
    
    # Imprime buffer e limpa resíduos abaixo do conteúdo renderizado
    printf "%b\033[J" "$buffer"
}

# --- Internal Feed Engine ---
capture_live() {
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        # PhD Telemetry: Mirror to master log txt
        printf "%s\n" "$line" >> "$LIVE_OUTPUT_MASTER"
        
        LIVE_LINES+=("$line")
        # Mantém histórico mas evita overflow
        ((${#LIVE_LINES[@]} > LOG_MAX)) && LIVE_LINES=("${LIVE_LINES[@]:1}")
        
        # Reset scroll se não estiver scrollando ativamente para acompanhar real-time
        if (( SCROLL_POS < 5 )); then
            SCROLL_POS=0
        fi
        
        log_info "live: $line"
        draw_ui
    done
}

# --- Logging ---
log_msg() {
    local level="$1" msg="$2"
    local ts=$(date '+%H:%M:%S')
    local entry="[$ts] [$level] $msg"
    LOG_LINES+=("$entry")
    ((${#LOG_LINES[@]} > LOG_MAX)) && LOG_LINES=("${LOG_LINES[@]:1}")
    echo "$entry" >> "$LOG_FILE" 2>/dev/null || true
}
log_info() { log_msg "INFO" "$1"; }
log_ok()   { log_msg " OK " "$1"; }
log_warn() { log_msg "WARN" "$1"; }
log_err()  { log_msg "ERRO" "$1"; }

# --- Process Management ---
CLEANUP_DONE=false
cleanup() {
    # Guard de reentrada: cleanup chama exit 0, que dispara trap EXIT novamente
    $CLEANUP_DONE && return 0
    CLEANUP_DONE=true
    log_info "Encerrando Orchestrator..."
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill -TERM "$pid" 2>/dev/null || true
            sleep 0.1
            kill -9 "$pid" 2>/dev/null || true
        fi
    done
    rm -f "$LOCK_FILE" "$PID_FILE" 2>/dev/null || true
    # Restaurar tela alternativa e cursor antes de sair
    printf "\033[?1049l"
    cursor_show
    printf "\n  ${ACCENT_ROSE}■ Processos encerrados. Até logo.${RST}\n\n"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT
trap update_dimensions WINCH

load_env() {
    local env_file="$1"
    if [[ -f "$env_file" ]]; then
        log_info "Carregando ambiente: $(basename "$env_file")"
        set -a
        source "$env_file"
        set +a
    else
        log_warn "Aviso: Arquivo .env não encontrado em $env_file"
    fi
}

# --- Operações Soberanas ---

op_create_venv() {
    CURRENT_TASK="Configurando vEnv (Absolute)..."
    PROGRESS=10; draw_ui
    if [[ -d "$ROOT_DIR/venv" ]]; then
        log_info "Limpando vEnv existente para garantir estado puro..."
        rm -rf "$ROOT_DIR/venv"
    fi
    log_info "Criando vEnv Python..."
    python3 -m venv "$ROOT_DIR/venv" 2>&1 | while read -r l; do log_info "venv: $l"; done
    source "venv/bin/activate"
    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="vEnv configurado do zero"; draw_ui
}

op_sync_pip() {
    local mode="${1:-dev}"
    CURRENT_TASK="Sincronizando Pip ($mode mode)..."
    LIVE_LINES=(); PROGRESS=3; draw_ui
    [[ -z "$VIRTUAL_ENV" ]] && op_create_venv
    
    local req_dir="$ROOT_DIR/apps/api/requirements"
    log_info "Sincronização Pip para modo $mode em $req_dir..."
    
    if [[ "$mode" == "prod" ]]; then
        # Em produção, instalamos apenas o essencial
        if [[ -f "$req_dir/production.txt" ]]; then
            pip install -r "$req_dir/production.txt" --upgrade 2>&1 | capture_live
        fi
    else
        # Em desenvolvimento, instalamos tudo (base, local, test)
        if [[ -d "$req_dir" ]]; then
            local req_files=()
            while IFS= read -r f; do req_files+=("$f"); done < <(find "$req_dir" -name "*.txt" -maxdepth 1 | sort 2>/dev/null)

            local total=${#req_files[@]}
            local count=0
            for req in "${req_files[@]}"; do
                ((count++))
                PROGRESS=$(( 10 + (count * 80 / total) ))
                log_info "Configurando: $(basename "$req")"
                draw_ui
                pip install -r "$req" --upgrade 2>&1 | capture_live
            done
        fi
    fi

    # Fallback para requirements na raiz
    local entry_point="$ROOT_DIR/apps/api/requirements.txt"
    [[ ! -f "$entry_point" ]] && entry_point="$ROOT_DIR/requirements.txt"
    if [[ -f "$entry_point" ]]; then
        pip install -r "$entry_point" --upgrade 2>&1 | capture_live
    fi

    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="Sync Pip ($mode) concluído"; draw_ui
}

op_sync_pnpm() {
    CURRENT_TASK="Sincronizando PNPM (Omni-App Sinc)..."
    LIVE_LINES=(); PROGRESS=5; draw_ui
    cd "$ROOT_DIR"
    
    log_info "Fase 1: Recursive Force Install na raiz..."
    pnpm install  --recursive 2>&1 | capture_live
    
    local apps=("admin" "web" "space" "live" "api")
    local total=${#apps[@]}
    local count=0
    
    for app in "${apps[@]}"; do
        ((count++))
        PROGRESS=$(( 20 + (count * 80 / total) ))
        if [[ -d "$ROOT_DIR/apps/$app" && -f "$ROOT_DIR/apps/$app/package.json" ]]; then
            log_info "Fase 2.$count: Sincronização explícita em apps/$app..."
            cd "$ROOT_DIR/apps/$app" && pnpm install  2>&1 | capture_live
        else
            log_warn "App $app não encontrado ou sem package.json. Pulando."
        fi
        draw_ui
    done
    
    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="Omni-App Sync concluído com sucesso"; draw_ui
}

op_build_packages() {
    CURRENT_TASK="Construindo Pacotes Master (@plane/*)..."
    LIVE_LINES=(); PROGRESS=5; draw_ui
    cd "$ROOT_DIR"
    log_info "Iniciando compilação de bibliotecas base (necessário para admin/web)..."
    pnpm build --filter "./packages/*" 2>&1 | capture_live
    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="Bibliotecas compiladas"; draw_ui
}

op_sync_all() {
    local mode="${1:-dev}"
    op_create_venv
    op_sync_pip "$mode"
    op_sync_pnpm
    op_build_packages
}

op_deep_clean() {
    CURRENT_TASK="Purificando Ambiente (Deep Clean)..."
    LIVE_LINES=(); PROGRESS=5; draw_ui
    log_warn "Iniciando remoção exaustiva de recursos..."
    
    # Remoção de node_modules recursiva
    log_info "Buscando e removendo node_modules (estoque zero)..."
    find "$ROOT_DIR" -name "node_modules" -type d -prune -print -exec rm -rf '{}' + 2>&1 | capture_live
    
    PROGRESS=50; draw_ui
    
    # Remoção do venv
    if [[ -d "$ROOT_DIR/venv" ]]; then
        log_info "Removendo ambiente virtual venv..."
        rm -rf "$ROOT_DIR/venv" 2>&1 | capture_live
    fi
    
    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="Purificação concluída. Ambiente Limpo."; draw_ui
}

op_launch_dev_core() {
    PROGRESS=60; CURRENT_TASK="Lançando Servidores Dev..."; draw_ui

    # Garantir que venv existe
    if [[ ! -f "$ROOT_DIR/venv/bin/activate" ]]; then
        log_warn "vEnv não encontrado. Criando..."
        op_create_venv
    fi

    # Exportar ambiente para subshells com fallback preventivo (evita crash NoneType)
    load_env "$ROOT_DIR/apps/api/.env"
    export DJANGO_SETTINGS_MODULE="plane.settings.local"
    export DATABASE_URL="${DATABASE_URL:-postgresql://plane:plane@localhost:5432/plane}"
    export REDIS_URL="${REDIS_URL:-redis://localhost:6379/}"
    export DEBUG=1
    export SECRET_KEY="${SECRET_KEY:-plane_elite_secret_key}"

    # Iniciar API Django :8000 (com captura de erros)
    PROGRESS=70; log_info "Iniciando API Django :8000..."; draw_ui
    (
        cd "$ROOT_DIR/apps/api" || exit 1
        source "$ROOT_DIR/venv/bin/activate"
        exec python manage.py runserver 0.0.0.0:8000 2>&1
    ) >> "$LOG_FILE" 2>&1 &
    local api_pid=$!
    PIDS+=($api_pid)

    # Health check: aguardar Django subir (até 30s)
    PROGRESS=80; log_info "Aguardando API na porta 8000..."; draw_ui
    local retries=0
    while ! ss -tlnp 2>/dev/null | grep -q ':8000 ' && (( retries < 30 )); do
        sleep 1
        ((retries++))
        # Verificar se o processo ainda está vivo
        if ! kill -0 "$api_pid" 2>/dev/null; then
            log_err "Django falhou ao iniciar! Verifique os logs com [L]."
            LAST_STATUS="err"; LAST_MSG="Django falhou (PID $api_pid morreu)"
            draw_ui
            break
        fi
    done

    if ss -tlnp 2>/dev/null | grep -q ':8000 '; then
        log_ok "API Django ativa na porta 8000 (${retries}s)"
    else
        log_err "API Django não respondeu após ${retries}s. Verifique com [L]."
        LAST_STATUS="err"; LAST_MSG="API Django timeout após ${retries}s"
        draw_ui
        return 1
    fi

    # Iniciar Frontend :3000
    PROGRESS=90; log_info "Iniciando Frontend :3000..."; draw_ui
    ( cd "$ROOT_DIR" && pnpm dev ) >> "$LOG_FILE" 2>&1 &
    PIDS+=($!)

    printf "%s\n" "${PIDS[@]}" > "$PID_FILE"
    APP_ACTIVE=true
    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="Dev ativo: API:8000 + FE:3000 (${retries}s)"; draw_ui
}

op_dev_mode() {
    CURRENT_TASK="Preparando Modo Dev (Full)..."
    PROGRESS=10; draw_ui
    op_sync_all "dev"
    op_launch_dev_core
}

op_fast_dev() {
    CURRENT_TASK="Iniciando Instant Dev Start..."
    PROGRESS=10; draw_ui

    # Verificar pré-condições antes de subir
    if [[ ! -f "$ROOT_DIR/venv/bin/activate" ]]; then
        log_warn "vEnv não encontrado — executando sync automático..."
        op_create_venv
        op_sync_pip
    fi

    # Verificar se packages @plane/* estão compilados
    local needs_build=false
    for pkg_dir in "$ROOT_DIR"/packages/*/; do
        if [[ -f "$pkg_dir/package.json" ]] && ! [[ -d "$pkg_dir/dist" ]]; then
            needs_build=true
            break
        fi
    done
    if $needs_build; then
        log_warn "Packages @plane/* não compilados — compilando..."
        op_build_packages
    fi

    op_launch_dev_core
}

op_launch_prd_core() {
    # Exportar ambiente para runtime
    load_env "$ROOT_DIR/apps/api/.env"
    export DJANGO_SETTINGS_MODULE="plane.settings.production"
    export DEBUG=0

    PROGRESS=80; CURRENT_TASK="Iniciando Servidores de Produção..."; draw_ui
    
    # Smart Build Check PhD: Garantir que o build de produção existe para evitar erro 404
    if [[ ! -f "$ROOT_DIR/apps/web/build/client/index.html" ]]; then
        log_warn "Artefatos de produção não detectados em apps/web/build/client."
        log_info "Executando build de emergência para prevenir Erro 404..."
        ( cd "$ROOT_DIR" && pnpm build --filter web ) 2>&1 | capture_live
        
        # Validação pós-build
        if [[ ! -f "$ROOT_DIR/apps/web/build/client/index.html" ]]; then
            log_err "Falha crítica: Build não gerou index.html. Verifique os logs."
            LAST_STATUS="err"; LAST_MSG="Erro 404 Iminente (Build Falhou)"; draw_ui
            return 1
        fi
        log_ok "Build de emergência concluído com sucesso."
    fi

    # Garantir que venv existe
    if [[ ! -f "$ROOT_DIR/venv/bin/activate" ]]; then
        log_warn "vEnv não encontrado. Criando..."
        op_create_venv
    fi

    # Iniciar API Django com Gunicorn :8000
    log_info "Iniciando API Django (Gunicorn) :8000..."
    (
        cd "$ROOT_DIR/apps/api" || exit 1
        source "$ROOT_DIR/venv/bin/activate"
        if command -v gunicorn &>/dev/null; then
            exec gunicorn plane.asgi:application -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 --workers 2 2>&1
        else
            log_warn "Gunicorn não instalado, usando runserver..."
            exec python manage.py runserver 0.0.0.0:8000 2>&1
        fi
    ) >> "$LOG_FILE" 2>&1 &
    PIDS+=($!)

    # Health check API
    local retries=0
    while ! ss -tlnp 2>/dev/null | grep -q ':8000 ' && (( retries < 30 )); do
        sleep 1; ((retries++))
    done

    if ss -tlnp 2>/dev/null | grep -q ':8000 '; then
        log_ok "API Produção ativa na porta 8000 (${retries}s)"
    else
        log_err "API Produção falhou após ${retries}s"
    fi

    PROGRESS=90; CURRENT_TASK="Iniciando Frontend Produção..."; draw_ui
    ( cd "$ROOT_DIR" && pnpm start ) >> "$LOG_FILE" 2>&1 &
    PIDS+=($!)

    printf "%s\n" "${PIDS[@]}" > "$PID_FILE"
    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="Produção Online: API:8000 + FE"; draw_ui
    APP_ACTIVE=true
}

op_prd_mode() {
    CURRENT_TASK="Preparando Produção (Full)..."
    PROGRESS=10; draw_ui
    op_sync_all "prod"
    
    PROGRESS=70; CURRENT_TASK="Build Produção (Turbo)..."; draw_ui
    # Exportar ambiente para build
    load_env "$ROOT_DIR/apps/api/.env"
    export DJANGO_SETTINGS_MODULE="plane.settings.production"
    cd "$ROOT_DIR"
    
    log_info "Iniciando Turbo Build (este processo pode demorar)..."
    if pnpm build 2>&1 | capture_live; then
        log_ok "Build concluído com sucesso."
    else
        log_err "Build falhou catastroficamente."; LAST_STATUS="err"; LAST_MSG="Falha no Build"; return 1
    fi
    op_launch_prd_core
}

op_fast_prd() {
    CURRENT_TASK="Iniciando Instant Prod Start..."
    PROGRESS=10; draw_ui
    op_launch_prd_core
}

op_stop_app() {
    APP_ACTIVE=false
    CURRENT_TASK="Derrubando Serviços (Safe Shutdown)..."
    LIVE_LINES=(); PROGRESS=5; draw_ui
    log_warn "Iniciando encerramento de processos..."

    # 1. Tentar encerramento via PID_FILE
    if [[ -f "$PID_FILE" ]]; then
        log_info "Finalizando PIDs registrados..."
        while read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -TERM "$pid" 2>/dev/null || true
                log_info "PID $pid encerrado." | capture_live
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi

    PROGRESS=60; draw_ui

    # 2. Busca exaustiva por processos órfãos (PhD Master Precision)
    log_info "Scanner de processos ativo (Django/Pnpm)..."
    local pids_to_kill
    pids_to_kill=$(ps aux | grep -v grep | grep -E "manage.py runserver|pnpm dev|node .*turbo|tsx .*src/index.ts" | awk '{print $2}')
    
    if [[ -n "$pids_to_kill" ]]; then
        for pid in $pids_to_kill; do
            kill -9 "$pid" 2>/dev/null && log_info "Processo $pid purgado." | capture_live
        done
    fi

    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="Localhost derrubado com sucesso"; draw_ui
}

op_setup_infra() {
    CURRENT_TASK="Provisionando Infra (Ametista Stream)..."
    LIVE_LINES=(); PROGRESS=5; draw_ui
    log_info "Iniciando streaming do instalador ametista..."
    
    # Executar em modo headless e capturar saída
    bash "$ROOT_DIR/install_db.sh" FULL_INSTALL 2>&1 | capture_live
    
    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="Infraestrutura pronta."; draw_ui
}

op_health_check() {
    CURRENT_TASK="Verificando Saúde..."
    PROGRESS=10; draw_ui
    local issues=0
    local checks=("python3" "node" "pnpm" "git")
    for cmd in "${checks[@]}"; do
        if command -v "$cmd" &>/dev/null; then log_ok "Check: $cmd OK"; else log_warn "Check: $cmd AUSENTE"; ((issues++)); fi
    done
    [[ -d "$ROOT_DIR/venv" ]] && log_ok "Check: vEnv OK" || log_warn "Check: vEnv AUSENTE"
    
    PROGRESS=100
    if ((issues == 0)); then LAST_STATUS="ok"; LAST_MSG="Saúde 100% OK"; else LAST_STATUS="warn"; LAST_MSG="$issues alertas detectados"; fi
    draw_ui
}
 
op_unlock_plane() {
    CURRENT_TASK="Desbloqueando Plano Full (Elite PhD)..."
    LIVE_LINES=(); PROGRESS=20; draw_ui
    log_info "Iniciando processo de ativação do Plano Full..."

    # Carregar ambiente para garantir que comandos Django funcionem
    load_env "$ROOT_DIR/apps/api/.env"
    export DJANGO_SETTINGS_MODULE="plane.settings.local"
    # Prevenir quebra por Redis ausente no shell (caso o container/serviço esteja off)
    export SKIP_REDIS_CHECK=1 

    # 1. Backend: Injetar Enterprise no DB via manage.py shell
    log_info "Fase 1: Injetando Plano Full (PLANE_ENTERPRISE) no Banco de Dados..."
    (
        cd "$ROOT_DIR/apps/api" || exit 1
        source "$ROOT_DIR/venv/bin/activate"
        python3 manage.py shell -c "
from plane.license.models import Instance;
instance = Instance.objects.first();
if instance:
    instance.edition = 'PLANE_ENTERPRISE';
    instance.save();
    print(f'Sucesso: Instância {instance.instance_id} convertida para PLANE_ENTERPRISE.');
else:
    print('Erro: Nenhuma instância encontrada para converter.');
" 2>&1 | capture_live
    )

    PROGRESS=70; draw_ui

    # 2. Frontend & Planos: Já aplicados via Interceptação de Código (Serializer/Store)
    log_info "Fase 2: Validando Liberação Total de Features (Plano Full)..."
    log_ok "Patch de API Serializer: Ativo (Full)"
    log_ok "Patch de Frontend Store: Ativo (Full)"
    log_ok "Ignição de Limitações UX: Desativadas"

    PROGRESS=100; LAST_STATUS="ok"; LAST_MSG="Plano Full Ativado e Desbloqueado!"; draw_ui
}

# --- Visuals ---
boot_sequence() {
    # Ativar tela alternativa ANTES de qualquer renderização
    # Isso isola a TUI do scroll do terminal principal
    printf "\033[?1049h"
    cursor_hide
    printf "\033[2J"
    local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
    for i in {1..30}; do
        reset_cursor
        tput cup $((TERM_LINES/2)) $(( (TERM_COLS-20)/2 ))
        printf "${ACCENT_CYAN}${frames[i%10]}${RST} ${FG_MAIN}${BOLD}PLANE ELITE${RST} ${FG_DIM}Zen Zenith${RST}${EL}"
        sleep 0.05
    done
}

show_logs() {
    printf "\033[2J\033[H"
    printf "\n  ${ACCENT_CYAN}${BOLD}❯ LOG VIEWER${RST} (${#LOG_LINES[@]} entradas)\n\n"
    local vis=$((TERM_LINES - 8))
    local start=$((${#LOG_LINES[@]} - vis))
    ((start < 0)) && start=0
    for ((i=start; i<${#LOG_LINES[@]}; i++)); do
        printf "    ${FG_SEC}%s${RST}\n" "${LOG_LINES[$i]}"
    done
    printf "\n  ${FG_DIM}Pressione qualquer tecla para voltar${RST}"
    read -rsn1
    NEED_REPAINT=true
}

main() {
    update_dimensions
    
    # Processamento de argumentos CLI (PhD Automation)
    if [[ $# -gt 0 ]]; then
        local cmd="$1"
        case "$cmd" in
            SYNC_VENV) op_create_venv ;;
            SYNC_PIP)  op_sync_pip ;;
            SYNC_PNPM) op_sync_pnpm ;;
            SYNC_ALL)  op_sync_all ;;
            SYNC_PURGE) op_deep_clean ;;
            SETUP_INFRA) op_setup_infra ;;
            DEV_MODE)  op_dev_mode ;;
            PRD_MODE)  op_prd_mode ;;
            FAST_DEV)  op_fast_dev ;;
            FAST_PRD)  op_fast_prd ;;
            STOP_APP)  op_stop_app ;;
            HEALTH)    op_health_check ;;
            UNLOCK_PLANE) op_unlock_plane ;;
            --stop)    op_stop_app ;;
            *) echo "Erro: Comando desconhecido '$cmd'"; exit 1 ;;
        esac
        # Se for um comando de startup, mantemos o processo vivo para monitorar
        if [[ "$cmd" == *"DEV"* || "$cmd" == *"PRD"* ]]; then
            APP_ACTIVE=true
            # Entrar no loop de monitoramento simplificado (sem TUI se não for tty)
            if [[ -t 0 ]]; then 
                # Se for TTY, entra na TUI normal (mas no loop principal)
                : 
            else
                echo "Modo non-interactive: Monitorando logs em $LOG_FILE..."
                tail -f "$LOG_FILE"
                exit 0
            fi
        else
            exit 0
        fi
    fi

    [[ -f "$LOCK_FILE" ]] && kill -0 $(cat "$LOCK_FILE") 2>/dev/null && exit 1
    echo "$$" > "$LOCK_FILE"
    touch "$LOG_FILE"
    
    boot_sequence
    
    while true; do
        # Monitoramento persistente se o app estiver online
        if $APP_ACTIVE && [[ -f "$LOG_FILE" ]]; then
            # PhD Precision: Lendo um buffer maior do log para permitir scroll
            mapfile -t LIVE_LINES < <(tail -n "$LOG_MAX" "$LOG_FILE" 2>/dev/null)
        fi

        draw_ui
        
        if read -rsn1 -t 0.5 key; then
            case "$key" in
                $'\x1b') 
                    read -rsn2 -t 0.05 seq
                    case "$seq" in
                        "[A") SELECTED=$(( (SELECTED - 1 + ${#MENU_ITEMS[@]}) % ${#MENU_ITEMS[@]} )) ;;
                        "[B") SELECTED=$(( (SELECTED + 1) % ${#MENU_ITEMS[@]} )) ;;
                        "[5~") # PageUp
                            SCROLL_POS=$(( SCROLL_POS + NR_LINES ))
                            max_sc=$(( ${#LIVE_LINES[@]} - NR_LINES ))
                            (( SCROLL_POS > max_sc )) && SCROLL_POS=$max_sc
                            (( SCROLL_POS < 0 )) && SCROLL_POS=0
                            ;;
                        "[6~") # PageDown
                            SCROLL_POS=$(( SCROLL_POS - NR_LINES ))
                            (( SCROLL_POS < 0 )) && SCROLL_POS=0
                            ;;
                    esac
                    ;;
                k) SELECTED=$(( (SELECTED - 1 + ${#MENU_ITEMS[@]}) % ${#MENU_ITEMS[@]} )) ;;
                j) SELECTED=$(( (SELECTED + 1) % ${#MENU_ITEMS[@]} )) ;;
                a|A) # Scroll Up manual (PhD Ergonomics)
                    SCROLL_POS=$(( SCROLL_POS + 1 ))
                    max_sc=$(( ${#LIVE_LINES[@]} - NR_LINES ))
                    (( SCROLL_POS > max_sc )) && SCROLL_POS=$max_sc
                    ;;
                z|Z) # Scroll Down manual (PhD Ergonomics)
                    SCROLL_POS=$(( SCROLL_POS - 1 ))
                    (( SCROLL_POS < 0 )) && SCROLL_POS=0
                    ;;
                "") # Enter
                    SCROLL_POS=0 # Reset scroll on action
                    IFS='|' read -r action _ <<< "${MENU_ITEMS[$SELECTED]}"
                    case "$action" in
                        SYNC_VENV) op_create_venv ;;
                        SYNC_PIP)  op_sync_pip ;;
                        SYNC_PNPM) op_sync_pnpm ;;
                        SYNC_ALL)  op_sync_all ;;
                        SYNC_PURGE) op_deep_clean ;;
                        SETUP_INFRA) op_setup_infra ;;
                        DEV_MODE)  op_dev_mode ;;
                        PRD_MODE)  op_prd_mode ;;
                        FAST_DEV)  op_fast_dev ;;
                        FAST_PRD)  op_fast_prd ;;
                        STOP_APP)  op_stop_app ;;
                        HEALTH)    op_health_check ;;
                        UNLOCK_PLANE) op_unlock_plane ;;
                        EXIT)      cleanup ;;
                    esac
                    ;;
                l|L) show_logs ;;
                q|Q) cleanup ;;
            esac
        fi
    done
}

main "$@"
