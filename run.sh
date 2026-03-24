#!/usr/bin/env bash

set -uo pipefail

readonly SCRIPT_VERSION="2026.03.14"
readonly REQUIRED_BASH_VERSION=4

if (( BASH_VERSINFO[0] < REQUIRED_BASH_VERSION )); then
  printf 'ERRO: Bash %s+ e obrigatorio.\n' "$REQUIRED_BASH_VERSION" >&2
  exit 1
fi

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly STATE_DIR="$ROOT_DIR/.lyra-run"
readonly ENV_FILE="$ROOT_DIR/.env.local"
readonly BACKUP_DIR="$ROOT_DIR/backups/mysql"
readonly PACKAGE_FILE="$ROOT_DIR/package.json"
readonly MIGRATE_SCRIPT="$ROOT_DIR/scripts/mysql-migrate.mjs"
readonly APP_PID_FILE="$STATE_DIR/app.pid"
readonly APP_META_FILE="$STATE_DIR/app.meta"
readonly INSTALL_HASH_FILE="$STATE_DIR/install.hash"

readonly DEFAULT_MYSQL_HOST="127.0.0.1"
readonly DEFAULT_MYSQL_HOST_PORT="3306"
readonly DEFAULT_MYSQL_DATABASE="lyra_metacare"
readonly DEFAULT_MYSQL_USER="lyra"
readonly DEFAULT_MYSQL_PASSWORD=""
readonly DEFAULT_MYSQL_ROOT_PASSWORD=""
readonly DEFAULT_MYSQL_ADMIN_USER="root"
readonly DEFAULT_ADMIN_EMAIL=""
readonly DEFAULT_ADMIN_FIRST_NAME=""
readonly DEFAULT_ADMIN_LAST_NAME=""
readonly DEFAULT_APP_PORT="3000"

# --- Paleta Noir Elite (TrueColor RGB 24-bit) ---
readonly C_RESET=$'\033[0m'
readonly C_BOLD=$'\033[1m'
readonly C_DIM=$'\033[2m'
readonly C_WHITE=$'\033[38;2;230;237;243m'
readonly C_GRAY=$'\033[38;2;110;118;129m'
readonly C_SEC=$'\033[38;2;139;148;158m'
readonly C_CYAN=$'\033[38;2;86;211;255m'
readonly C_GREEN=$'\033[38;2;63;185;80m'
readonly C_MINT=$'\033[38;2;125;239;161m'
readonly C_YELLOW=$'\033[38;2;210;153;34m'
readonly C_AMBER=$'\033[38;2;255;183;77m'
readonly C_RED=$'\033[38;2;248;81;73m'
readonly C_ROSE=$'\033[38;2;255;107;129m'
readonly C_BLUE=$'\033[38;2;86;211;255m'
readonly C_VIOLET=$'\033[38;2;187;128;255m'
readonly C_BG_HOVER=$'\033[48;2;33;38;45m'
readonly EL=$'\033[K'

# --- Iconografia Minimalista Unicode ---
readonly I_DOT='•'
readonly I_ARR='→'
readonly I_CHECK='✔'
readonly I_WARN='⚠'
readonly I_CROSS='✖'
readonly I_TERM='❯'
readonly I_DNA='🧬'

declare -g PACKAGE_MANAGER=""
declare -ga PACKAGE_RUN=()
declare -ga NPM_CMD=()
declare -ga PNPM_CMD=()
declare -ga TASKKILL_CMD=()
declare -ga COREPACK_CMD=()
declare -ga MYSQL_CLIENT_CMD=()
declare -ga MYSQLADMIN_CMD=()
declare -ga MYSQLD_CMD=()
declare -ga MYSQLDUMP_CMD=()
declare -ga SYSTEMCTL_CMD=()
declare -ga SERVICE_CMD=()
declare -ga GZIP_CMD=()
declare -ga MYSQL_AUTH_ARGS=()
declare -g APP_PORT="$DEFAULT_APP_PORT"
declare -g OS_FAMILY=""
declare -g OS_LABEL=""
declare -g MYSQL_SERVICE_NAME=""
declare -g NODE_CMD=""
declare -gA ENV_MAP=()

mkdir -p "$STATE_DIR"

log_info() { printf '%s%s%s %s\n' "$C_CYAN" "$I_DOT" "$C_RESET" "$1"; }
log_ok() { printf '%s%s%s %s\n' "$C_GREEN" "$I_CHECK" "$C_RESET" "$1"; }
log_warn() { printf '%s%s%s %s\n' "$C_AMBER" "$I_WARN" "$C_RESET" "$1"; }
log_error() { printf '%s%s%s %s\n' "$C_RED" "$I_CROSS" "$C_RESET" "$1" >&2; }
die() { log_error "$1"; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

refresh_commands() {
  PACKAGE_MANAGER=""
  PACKAGE_RUN=()
  NPM_CMD=()
  PNPM_CMD=()
  TASKKILL_CMD=()
  COREPACK_CMD=()
  MYSQL_CLIENT_CMD=()
  MYSQLADMIN_CMD=()
  MYSQLD_CMD=()
  MYSQLDUMP_CMD=()
  SYSTEMCTL_CMD=()
  SERVICE_CMD=()
  GZIP_CMD=()
  MYSQL_AUTH_ARGS=()
  MYSQL_SERVICE_NAME=""
  NODE_CMD=""
}

find_cmd() {
  local candidate
  for candidate in "$@"; do
    if have "$candidate"; then
      command -v "$candidate"
      return 0
    fi
  done
  return 1
}

linux_distribution_value() {
  local key="$1"
  [[ -r /etc/os-release ]] || return 1
  awk -F= -v target="$key" '
    $1 == target {
      gsub(/"/, "", $2)
      print tolower($2)
      exit
    }
  ' /etc/os-release
}

linux_distribution_id() {
  linux_distribution_value "ID"
}

linux_distribution_like() {
  linux_distribution_value "ID_LIKE"
}

linux_package_manager() {
  if have apt-get; then
    printf 'apt'
  elif have dnf; then
    printf 'dnf'
  elif have yum; then
    printf 'yum'
  elif have zypper; then
    printf 'zypper'
  elif have pacman; then
    printf 'pacman'
  else
    printf 'unknown'
  fi
}

detect_os() {
  [[ -n "$OS_FAMILY" ]] && return 0

  local uname_s uname_r
  uname_s="$(uname -s 2>/dev/null || printf 'unknown')"
  uname_r="$(uname -r 2>/dev/null || printf 'unknown')"

  case "$uname_s" in
    Linux)
      if [[ -n "${WSL_DISTRO_NAME:-}" ]] || grep -qi microsoft /proc/version 2>/dev/null || [[ "$uname_r" == *[Mm]icrosoft* ]]; then
        OS_FAMILY="wsl"
        OS_LABEL="WSL"
      else
        OS_FAMILY="linux"
        OS_LABEL="Linux"
      fi
      ;;
    MINGW*|MSYS*|CYGWIN*)
      OS_FAMILY="windows"
      OS_LABEL="Windows"
      ;;
    *)
      if have powershell.exe; then
        OS_FAMILY="windows"
        OS_LABEL="Windows"
      else
        OS_FAMILY="unknown"
        OS_LABEL="$uname_s"
      fi
      ;;
  esac
}

resolve_commands() {
  detect_os
  [[ -n "$NODE_CMD" ]] && return 0

  local path=""
  case "$OS_FAMILY" in
    windows)
      path="$(find_cmd node.exe node || true)"; [[ -n "$path" ]] && NODE_CMD="$path"
      path="$(find_cmd npm.cmd npm || true)"; [[ -n "$path" ]] && NPM_CMD=("$path")
      path="$(find_cmd pnpm.cmd pnpm || true)"; [[ -n "$path" ]] && PNPM_CMD=("$path")
      path="$(find_cmd taskkill.exe taskkill || true)"; [[ -n "$path" ]] && TASKKILL_CMD=("$path")
      path="$(find_cmd corepack.cmd corepack || true)"; [[ -n "$path" ]] && COREPACK_CMD=("$path")
      path="$(find_cmd mysql.exe mysql || true)"; [[ -n "$path" ]] && MYSQL_CLIENT_CMD=("$path")
      path="$(find_cmd mysqladmin.exe mysqladmin || true)"; [[ -n "$path" ]] && MYSQLADMIN_CMD=("$path")
      path="$(find_cmd mysqld.exe mysqld || true)"; [[ -n "$path" ]] && MYSQLD_CMD=("$path")
      path="$(find_cmd mysqldump.exe mysqldump || true)"; [[ -n "$path" ]] && MYSQLDUMP_CMD=("$path")
      path="$(find_cmd gzip.exe gzip || true)"; [[ -n "$path" ]] && GZIP_CMD=("$path")
      if have powershell.exe; then
        local caption=""
        caption="$(powershell.exe -NoProfile -Command "(Get-CimInstance Win32_OperatingSystem).Caption" 2>/dev/null | tr -d '\r')"
        [[ -n "$caption" ]] && OS_LABEL="$caption"
      fi
      ;;
    *)
      path="$(find_cmd node || true)"; [[ -n "$path" ]] && NODE_CMD="$path"
      path="$(find_cmd npm || true)"; [[ -n "$path" ]] && NPM_CMD=("$path")
      path="$(find_cmd pnpm || true)"; [[ -n "$path" ]] && PNPM_CMD=("$path")
      path="$(find_cmd taskkill || true)"; [[ -n "$path" ]] && TASKKILL_CMD=("$path")
      path="$(find_cmd corepack || true)"; [[ -n "$path" ]] && COREPACK_CMD=("$path")
      path="$(find_cmd mysql || true)"; [[ -n "$path" ]] && MYSQL_CLIENT_CMD=("$path")
      path="$(find_cmd mysqladmin || true)"; [[ -n "$path" ]] && MYSQLADMIN_CMD=("$path")
      path="$(find_cmd mysqld || true)"; [[ -n "$path" ]] && MYSQLD_CMD=("$path")
      path="$(find_cmd mysqldump || true)"; [[ -n "$path" ]] && MYSQLDUMP_CMD=("$path")
      path="$(find_cmd systemctl || true)"; [[ -n "$path" ]] && SYSTEMCTL_CMD=("$path")
      path="$(find_cmd service || true)"; [[ -n "$path" ]] && SERVICE_CMD=("$path")
      path="$(find_cmd gzip || true)"; [[ -n "$path" ]] && GZIP_CMD=("$path")
      ;;
  esac
}

banner() {
  resolve_commands
  select_package_manager
  export_runtime_env
  local width
  width="$(tput cols 2>/dev/null || printf '120')"
  (( width < 60 )) && width=60
  local sep
  sep="$(repeat_char '─' "$((width - 4))")"
  printf '\n  %s%s%s LYRA METACARE %sv%s%s\n' "$C_GRAY" "$I_DOT" "$C_RESET" "$C_BOLD" "$SCRIPT_VERSION" "$C_RESET"
  printf '  %s%s%s\n' "$C_SEC" "$sep" "$C_RESET"
  printf '  %s%s Raiz:%s     %s\n' "$C_CYAN" "$I_ARR" "$C_RESET" "$ROOT_DIR"
  printf '  %s%s Ambiente:%s %s %s|%s pacote=%s %s|%s app=%s\n' "$C_CYAN" "$I_ARR" "$C_RESET" "$OS_LABEL" "$C_SEC" "$C_RESET" "$PACKAGE_MANAGER" "$C_SEC" "$C_RESET" "$PORT"
  printf '  %s%s MySQL:%s   %s:%s\n' "$C_CYAN" "$I_ARR" "$C_RESET" "$MYSQL_HOST" "$MYSQL_PORT"
  printf '  %s%s%s\n\n' "$C_SEC" "$sep" "$C_RESET"
}

section() {
  local width
  width="$(tput cols 2>/dev/null || printf '120')"
  (( width < 60 )) && width=60
  local sep
  sep="$(repeat_char '─' "$((width - 4))")"
  printf '\n  %s%s%s\n' "$C_SEC" "$sep" "$C_RESET"
  printf '  %s%s%s %s%s\n' "$C_CYAN" "$I_TERM" "$C_RESET" "$C_BOLD$1" "$C_RESET"
  printf '  %s%s%s\n' "$C_SEC" "$sep" "$C_RESET"
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
  resolve_commands
  if have openssl; then
    openssl rand -hex 32
  else
    "$NODE_CMD" -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
  fi
}

generate_password() {
  resolve_commands
  "$NODE_CMD" -e "console.log(require('node:crypto').randomBytes(18).toString('base64url'))"
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
  export MYSQL_ADMIN_USER="$(env_value MYSQL_ADMIN_USER "$DEFAULT_MYSQL_ADMIN_USER")"
  export MYSQL_ADMIN_PASSWORD="$(env_value MYSQL_ADMIN_PASSWORD "$(env_value MYSQL_ROOT_PASSWORD "")")"
  export AUTH_SECRET="$(env_value AUTH_SECRET "")"
  export ADMIN_BOOTSTRAP_EMAIL="$(env_value ADMIN_BOOTSTRAP_EMAIL "$DEFAULT_ADMIN_EMAIL")"
  export ADMIN_BOOTSTRAP_PASSWORD="$(env_value ADMIN_BOOTSTRAP_PASSWORD "")"
  export ADMIN_BOOTSTRAP_FIRST_NAME="$(env_value ADMIN_BOOTSTRAP_FIRST_NAME "$DEFAULT_ADMIN_FIRST_NAME")"
  export ADMIN_BOOTSTRAP_LAST_NAME="$(env_value ADMIN_BOOTSTRAP_LAST_NAME "$DEFAULT_ADMIN_LAST_NAME")"
  export MYSQL_LOCAL_RUNTIME="native"
  export PORT="$(env_value PORT "$DEFAULT_APP_PORT")"
  APP_PORT="$PORT"
}

set_mysql_auth_args() {
  local user="$1"
  local password="${2:-}"

  [[ -n "$user" ]] || die "Usuario MySQL nao informado para montar os argumentos de autenticacao."

  MYSQL_AUTH_ARGS=("-u$user")
  if [[ -n "$password" ]]; then
    MYSQL_AUTH_ARGS+=("-p$password")
  fi
}

admin_bootstrap_configured() {
  export_runtime_env
  [[ -n "$ADMIN_BOOTSTRAP_EMAIL" || -n "$ADMIN_BOOTSTRAP_PASSWORD" || -n "$ADMIN_BOOTSTRAP_FIRST_NAME" || -n "$ADMIN_BOOTSTRAP_LAST_NAME" ]]
}

admin_bootstrap_ready() {
  export_runtime_env
  [[ -n "$ADMIN_BOOTSTRAP_EMAIL" && -n "$ADMIN_BOOTSTRAP_PASSWORD" ]]
}

mask_secret() {
  local value="${1:-}"
  local length="${#value}"

  if [[ -z "$value" ]]; then
    printf '(vazio)'
  elif (( length <= 4 )); then
    printf '****'
  else
    printf '%s****%s' "${value:0:2}" "${value:length-2:2}"
  fi
}

sudo_mysql_available() {
  [[ "$OS_FAMILY" != "windows" ]] || return 1
  have sudo || return 1
  sudo -n true >/dev/null 2>&1 || return 1
  # Verify that sudo mysql actually connects (auth_socket may or may not work)
  sudo -n mysql -N -B -e "SELECT 1" >/dev/null 2>&1
}

native_mysql_service_name() {
  resolve_commands
  if [[ -n "$MYSQL_SERVICE_NAME" ]]; then
    printf '%s' "$MYSQL_SERVICE_NAME"
    return 0
  fi

  local service_name=""
  local candidate=""

  if [[ "$OS_FAMILY" == "windows" ]] && have powershell.exe; then
    service_name="$(
      powershell.exe -NoProfile -Command "\$svc = Get-Service -ErrorAction SilentlyContinue | Where-Object { \$_.Name -match 'mysql|mariadb' } | Select-Object -First 1 -ExpandProperty Name; if (\$svc) { \$svc }" 2>/dev/null | tr -d '\r'
    )"
  elif (( ${#SYSTEMCTL_CMD[@]} > 0 )); then
    for candidate in mysql mysqld mariadb; do
      if "${SYSTEMCTL_CMD[@]}" list-unit-files "${candidate}.service" >/dev/null 2>&1 || "${SYSTEMCTL_CMD[@]}" status "$candidate" >/dev/null 2>&1; then
        service_name="$candidate"
        break
      fi
    done
  elif (( ${#SERVICE_CMD[@]} > 0 )); then
    for candidate in mysql mysqld mariadb; do
      if "${SERVICE_CMD[@]}" "$candidate" status >/dev/null 2>&1; then
        service_name="$candidate"
        break
      fi
    done
  fi

  [[ -n "$service_name" ]] || return 1
  MYSQL_SERVICE_NAME="$service_name"
  printf '%s' "$service_name"
}

mysql_admin_auth_works() {
  resolve_commands
  export_runtime_env

  [[ -n "$MYSQL_ADMIN_USER" ]] || return 1

  if (( ${#MYSQL_CLIENT_CMD[@]} > 0 )); then
    set_mysql_auth_args "$MYSQL_ADMIN_USER" "$MYSQL_ADMIN_PASSWORD"
    "${MYSQL_CLIENT_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}" -N -B -e "SELECT 1" >/dev/null 2>&1
    return $?
  fi

  if [[ -n "$NODE_CMD" && -d "$ROOT_DIR/node_modules" ]]; then
    "$NODE_CMD" - <<'NODE' >/dev/null 2>&1
const mysql = require('mysql2/promise');
(async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_ADMIN_USER,
    password: process.env.MYSQL_ADMIN_PASSWORD || '',
  });
  await connection.query('SELECT 1');
  await connection.end();
})().then(() => process.exit(0)).catch(() => process.exit(1));
NODE
    return $?
  fi

  return 1
}

mysql_admin_strategy() {
  export_runtime_env

  if mysql_admin_auth_works; then
    printf 'credenciais administrativas validadas (%s)' "$MYSQL_ADMIN_USER"
  elif sudo_mysql_available; then
    printf 'sudo mysql sem senha'
  elif [[ -n "$MYSQL_ADMIN_USER" ]]; then
    printf 'usuario administrativo configurado, mas ainda nao validado'
  else
    printf 'sem acesso administrativo configurado'
  fi
}

show_config_summary() {
  resolve_commands
  select_package_manager
  export_runtime_env
  section "Configuracao efetiva"
  printf '  SO detectado: %s\n' "${OS_LABEL:-nao detectado}"
  printf '  Gerenciador Node: %s\n' "${PACKAGE_MANAGER:-nao definido}"
  printf '  App: http://127.0.0.1:%s\n' "$PORT"
  printf '  MySQL host: %s:%s\n' "$MYSQL_HOST" "$MYSQL_PORT"
  printf '  MySQL schema: %s\n' "$MYSQL_DATABASE"
  printf '  MySQL usuario app: %s\n' "$MYSQL_USER"
  printf '  MySQL senha app: %s\n' "$(mask_secret "$MYSQL_PASSWORD")"
  printf '  MySQL usuario admin: %s\n' "${MYSQL_ADMIN_USER:-nao configurado}"
  printf '  MySQL senha admin: %s\n' "$(mask_secret "$MYSQL_ADMIN_PASSWORD")"
  printf '  Estrategia admin MySQL: %s\n' "$(mysql_admin_strategy)"
  printf '  AUTH_SECRET: %s\n' "$(mask_secret "$AUTH_SECRET")"
  if admin_bootstrap_ready; then
    printf '  Bootstrap admin: habilitado (%s)\n' "$ADMIN_BOOTSTRAP_EMAIL"
  else
    printf '  Bootstrap admin: desabilitado\n'
  fi
}

native_mysql_installed() {
  resolve_commands
  (( ${#MYSQLD_CMD[@]} > 0 )) && return 0
  native_mysql_service_name >/dev/null 2>&1
}

mysql_runtime() {
  printf 'native'
}

run_privileged() {
  if [[ "$OS_FAMILY" == "windows" ]] || (( EUID == 0 )); then
    "$@"
    return 0
  fi

  have sudo || die "Permissao elevada necessaria, mas o comando sudo nao esta disponivel."
  if sudo -n true >/dev/null 2>&1; then
    sudo -n "$@"
  elif [[ -t 0 ]]; then
    sudo "$@"
  else
    die "Permissao elevada necessaria para concluir a operacao neste ambiente nao interativo."
  fi
}

enable_native_mysql_service() {
  local service_name
  service_name="$(native_mysql_service_name || true)"
  [[ -n "$service_name" ]] || return 0

  if [[ "$OS_FAMILY" == "windows" ]] && have powershell.exe; then
    powershell.exe -NoProfile -Command "Set-Service -Name '$service_name' -StartupType Automatic -ErrorAction Stop; Start-Service -Name '$service_name' -ErrorAction SilentlyContinue" >/dev/null 2>&1 || true
    return 0
  fi

  if (( ${#SYSTEMCTL_CMD[@]} > 0 )); then
    run_privileged "${SYSTEMCTL_CMD[@]}" enable "$service_name" >/dev/null 2>&1 || true
    run_privileged "${SYSTEMCTL_CMD[@]}" start "$service_name" >/dev/null 2>&1 || true
  elif (( ${#SERVICE_CMD[@]} > 0 )); then
    run_privileged "${SERVICE_CMD[@]}" "$service_name" start >/dev/null 2>&1 || true
  fi
}

install_mysql_windows() {
  have powershell.exe || die "powershell.exe nao encontrado para instalar o MySQL no Windows."
  powershell.exe -NoProfile -Command "
    if (Get-Command winget -ErrorAction SilentlyContinue) {
      Start-Process -FilePath 'winget' -ArgumentList 'install --id Oracle.MySQL --exact --accept-package-agreements --accept-source-agreements --disable-interactivity' -Verb RunAs -Wait
      exit \$LASTEXITCODE
    }

    if (Get-Command choco -ErrorAction SilentlyContinue) {
      Start-Process -FilePath 'choco' -ArgumentList 'install mysql -y' -Verb RunAs -Wait
      exit \$LASTEXITCODE
    }

    throw 'Nao foi encontrado winget nem choco para instalar o MySQL no Windows.'
  "
}

install_mysql_linux() {
  local package_manager
  package_manager="$(linux_package_manager)"

  case "$package_manager" in
    apt)
      run_privileged apt-get update
      run_privileged env DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server mysql-client
      ;;
    dnf)
      run_privileged dnf install -y community-mysql-server
      ;;
    yum)
      run_privileged yum install -y community-mysql-server
      ;;
    zypper)
      die "Nao implementei instalacao automatica segura para zypper porque o nome do pacote Oracle MySQL depende do repositório configurado neste host."
      ;;
    pacman)
      die "Arch e derivados nao expõem Oracle MySQL nativamente de forma padronizada no pacote oficial. O run.sh nao vai simular uma instalacao incorreta."
      ;;
    *)
      die "Nao foi possivel determinar um gerenciador de pacotes suportado para instalar o MySQL nativo neste Linux."
      ;;
  esac
}

install_native_mysql() {
  resolve_commands
  detect_os

  if native_mysql_installed; then
    log_ok "MySQL nativo ja esta instalado neste ambiente."
    enable_native_mysql_service
    return 0
  fi

  section "Instalacao do MySQL nativo"
  case "$OS_FAMILY" in
    windows)
      install_mysql_windows
      ;;
    linux|wsl)
      install_mysql_linux
      ;;
    *)
      die "Sistema operacional sem suporte para instalacao automatica do MySQL nativo: $OS_LABEL"
      ;;
  esac

  refresh_commands
  resolve_commands
  native_mysql_installed || die "A instalacao foi executada, mas o MySQL nativo nao foi detectado ao final."
  enable_native_mysql_service
  log_ok "MySQL nativo instalado e habilitado no sistema."
}

require_file() {
  [[ -f "$1" ]] || die "Arquivo obrigatorio ausente: $1"
}

select_package_manager() {
  resolve_commands
  [[ -n "$PACKAGE_MANAGER" ]] && return 0
  if [[ -f "$ROOT_DIR/pnpm-lock.yaml" ]]; then
    PACKAGE_MANAGER="pnpm"
    PACKAGE_RUN=("${PNPM_CMD[@]}")
  else
    PACKAGE_MANAGER="npm"
    PACKAGE_RUN=("${NPM_CMD[@]}")
  fi
}

ensure_package_manager() {
  select_package_manager
  if [[ "$PACKAGE_MANAGER" == "pnpm" ]] && (( ${#PNPM_CMD[@]} == 0 )); then
    if (( ${#COREPACK_CMD[@]} > 0 )); then
      log_info "pnpm nao encontrado. Ativando via corepack."
      "${COREPACK_CMD[@]}" enable >/dev/null 2>&1 || true
      "${COREPACK_CMD[@]}" prepare pnpm@latest --activate >/dev/null
      resolve_commands
      PACKAGE_RUN=("${PNPM_CMD[@]}")
    else
      die "pnpm nao encontrado e corepack indisponivel."
    fi
  fi
}

validate_layout() {
  require_file "$PACKAGE_FILE"
  require_file "$MIGRATE_SCRIPT"
}

doctor() {
  section "Requisitos do sistema"
  validate_layout
  resolve_commands
  select_package_manager

  log_ok "Sistema operacional detectado: $OS_LABEL"
  log_ok "Runtime MySQL preferencial: $(mysql_runtime)"
  if [[ "$OS_FAMILY" == "linux" || "$OS_FAMILY" == "wsl" ]]; then
    log_ok "Distribuicao Linux detectada: $(linux_distribution_id || printf 'desconhecida')"
    log_ok "Gerenciador de pacotes do SO: $(linux_package_manager)"
  fi
  have git && log_ok "Git disponivel." || die "Git nao encontrado."
  [[ -n "$NODE_CMD" ]] && log_ok "Node.js disponivel: $("$NODE_CMD" --version)" || die "Node.js nao encontrado."
  (( ${#NPM_CMD[@]} > 0 )) && log_ok "npm disponivel: $("${NPM_CMD[@]}" --version)" || die "npm nao encontrado."
  log_ok "Gerenciador do projeto: $PACKAGE_MANAGER"

  if [[ "$PACKAGE_MANAGER" == "pnpm" ]]; then
    if (( ${#PNPM_CMD[@]} > 0 )); then
      log_ok "pnpm disponivel: $("${PNPM_CMD[@]}" --version)"
    elif (( ${#COREPACK_CMD[@]} > 0 )); then
      log_warn "pnpm ausente, mas sera ativado automaticamente quando necessario."
    else
      die "pnpm ausente e corepack indisponivel."
    fi
  fi

  if native_mysql_installed; then
    log_ok "Servico MySQL nativo detectado."
    local service_name
    service_name="$(native_mysql_service_name || true)"
    [[ -n "$service_name" ]] && log_ok "Servico MySQL do host: $service_name"
  else
    log_warn "Nao foi detectado servico MySQL nativo instalado."
  fi
  (( ${#MYSQL_CLIENT_CMD[@]} > 0 )) && log_ok "Cliente mysql disponivel." || log_warn "Cliente mysql nao encontrado."
  (( ${#MYSQLDUMP_CMD[@]} > 0 )) && log_ok "mysqldump disponivel." || log_warn "mysqldump nao encontrado."
  log_ok "Estrategia administrativa MySQL: $(mysql_admin_strategy)"

  # OS-specific diagnostics
  export_runtime_env
  case "$OS_FAMILY" in
    windows)
      have powershell.exe && log_ok "PowerShell disponivel (necessario para gerenciamento do MySQL no Windows)." || log_warn "PowerShell nao encontrado. Gerenciamento de servicos MySQL no Windows sera limitado."
      if [[ -z "$MYSQL_ADMIN_USER" ]]; then
        log_warn "MYSQL_ADMIN_USER nao configurado. No Windows, backup, restore e criacao de schema dependem de credenciais administrativas explicitas."
      fi
      ;;
    wsl)
      log_info "WSL detectado: o MySQL local roda no ambiente Linux do WSL, nao no Windows host."
      if ! sudo_mysql_available && [[ -z "$MYSQL_ADMIN_USER" ]]; then
        log_warn "Sem sudo passwordless e sem MYSQL_ADMIN_USER. Configure um deles para operacoes administrativas do MySQL."
      fi
      ;;
    linux)
      if ! sudo_mysql_available && [[ -z "$MYSQL_ADMIN_USER" ]]; then
        log_warn "Sem sudo passwordless e sem MYSQL_ADMIN_USER. Configure um deles para operacoes administrativas do MySQL."
      fi
      ;;
  esac
}

hash_files() {
  if have sha256sum; then
    sha256sum "$@" | awk '{print $1}' | tr -d '\n'
  elif have shasum; then
    shasum -a 256 "$@" | awk '{print $1}' | tr -d '\n'
  else
    resolve_commands
    "$NODE_CMD" - "$@" <<'NODE'
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
      CI=true "${PACKAGE_RUN[@]}" install --frozen-lockfile
    else
      "${PACKAGE_RUN[@]}" install
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

ask_yes_no() {
  local label="$1"
  local default_answer="${2:-n}"
  local answer=""
  local prompt="[s/N]"

  [[ "$default_answer" =~ ^[SsYy1]$ ]] && prompt="[S/n]"

  if [[ ! -t 0 ]]; then
    [[ "$default_answer" =~ ^[SsYy1]$ ]]
    return $?
  fi

  read -r -p "$label $prompt: " answer
  answer="${answer:-$default_answer}"
  [[ "$answer" =~ ^[SsYy1]$ ]]
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
  local mysql_admin_user
  local mysql_admin_password
  local auth_secret
  local admin_email
  local admin_password
  local admin_first_name
  local admin_last_name
  local port_value
  local bootstrap_default="n"
  local generated_mysql_password=0
  local generated_admin_password=0

  admin_bootstrap_configured && bootstrap_default="s"

  mysql_host="$(ask_value "Host do MySQL local" "$(env_value MYSQL_HOST "$DEFAULT_MYSQL_HOST")")"
  mysql_host_port="$(ask_value "Porta publicada do MySQL" "$(env_value MYSQL_HOST_PORT "3306")")"
  mysql_port="$(ask_value "Porta do MySQL para a aplicacao" "$(env_value MYSQL_PORT "$mysql_host_port")")"
  mysql_database="$(ask_value "Banco MySQL" "$(env_value MYSQL_DATABASE "$DEFAULT_MYSQL_DATABASE")")"
  mysql_user="$(ask_value "Usuario MySQL da aplicacao" "$(env_value MYSQL_USER "$DEFAULT_MYSQL_USER")")"
  mysql_password="$(ask_value "Senha MySQL da aplicacao" "$(env_value MYSQL_PASSWORD "$DEFAULT_MYSQL_PASSWORD")" 1)"
  mysql_root_password="$(ask_value "Senha root do MySQL (opcional se usar admin dedicado ou sudo)" "$(env_value MYSQL_ROOT_PASSWORD "")" 1)"
  mysql_admin_user="$(ask_value "Usuario administrativo do MySQL" "$(env_value MYSQL_ADMIN_USER "$DEFAULT_MYSQL_ADMIN_USER")")"
  mysql_admin_password="$(ask_value "Senha do usuario administrativo do MySQL" "$(env_value MYSQL_ADMIN_PASSWORD "$(env_value MYSQL_ROOT_PASSWORD "")")" 1)"
  auth_secret="$(env_value AUTH_SECRET "")"
  port_value="$(ask_value "Porta HTTP local da aplicacao" "$(env_value PORT "$DEFAULT_APP_PORT")")"

  if [[ -z "$mysql_password" ]]; then
    mysql_password="$(generate_password)"
    generated_mysql_password=1
  fi
  [[ -z "$auth_secret" ]] && auth_secret="$(generate_hex)"

  if ask_yes_no "Deseja habilitar o bootstrap de usuario administrador no app" "$bootstrap_default"; then
    admin_email="$(ask_value "Email do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_EMAIL "$DEFAULT_ADMIN_EMAIL")")"
    admin_password="$(ask_value "Senha do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_PASSWORD "")" 1)"
    admin_first_name="$(ask_value "Nome do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_FIRST_NAME "$DEFAULT_ADMIN_FIRST_NAME")")"
    admin_last_name="$(ask_value "Sobrenome do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_LAST_NAME "$DEFAULT_ADMIN_LAST_NAME")")"
    [[ -n "$admin_email" ]] || die "Bootstrap admin habilitado, mas o email nao foi informado."
    if [[ -z "$admin_password" ]]; then
      admin_password="$(generate_password)"
      generated_admin_password=1
    fi
  else
    admin_email=""
    admin_password=""
    admin_first_name=""
    admin_last_name=""
  fi

  upsert_env "MYSQL_HOST" "$mysql_host"
  upsert_env "MYSQL_LOCAL_RUNTIME" "native"
  upsert_env "MYSQL_HOST_PORT" "$mysql_host_port"
  upsert_env "MYSQL_PORT" "$mysql_port"
  upsert_env "MYSQL_DATABASE" "$mysql_database"
  upsert_env "MYSQL_USER" "$mysql_user"
  upsert_env "MYSQL_PASSWORD" "$mysql_password"
  upsert_env "MYSQL_ROOT_PASSWORD" "$mysql_root_password"
  upsert_env "MYSQL_ADMIN_USER" "$mysql_admin_user"
  upsert_env "MYSQL_ADMIN_PASSWORD" "$mysql_admin_password"
  upsert_env "AUTH_SECRET" "$auth_secret"
  upsert_env "ADMIN_BOOTSTRAP_EMAIL" "$admin_email"
  upsert_env "ADMIN_BOOTSTRAP_PASSWORD" "$admin_password"
  upsert_env "ADMIN_BOOTSTRAP_FIRST_NAME" "$admin_first_name"
  upsert_env "ADMIN_BOOTSTRAP_LAST_NAME" "$admin_last_name"
  upsert_env "PORT" "$port_value"

  export_runtime_env
  validate_env
  (( generated_mysql_password == 1 )) && log_info "Uma nova senha forte para o usuario MySQL do app foi gerada e gravada em .env.local."
  if (( generated_admin_password == 1 )); then
    printf 'Senha gerada para o admin bootstrap: %s\n' "$admin_password"
  fi
  log_ok ".env.local configurado e validado."
}

validate_env() {
  export_runtime_env
  local missing=()
  [[ "$MYSQL_LOCAL_RUNTIME" != "native" ]] && die "MYSQL_LOCAL_RUNTIME invalido. O run.sh trabalha somente com MySQL nativo local."
  [[ -z "$MYSQL_HOST" ]] && missing+=("MYSQL_HOST")
  [[ -z "$MYSQL_HOST_PORT" ]] && missing+=("MYSQL_HOST_PORT")
  [[ -z "$MYSQL_PORT" ]] && missing+=("MYSQL_PORT")
  [[ -z "$MYSQL_DATABASE" ]] && missing+=("MYSQL_DATABASE")
  [[ -z "$MYSQL_USER" ]] && missing+=("MYSQL_USER")
  [[ -z "$MYSQL_PASSWORD" ]] && missing+=("MYSQL_PASSWORD")
  [[ -z "$AUTH_SECRET" ]] && missing+=("AUTH_SECRET")
  [[ -z "$PORT" ]] && missing+=("PORT")
  (( ${#missing[@]} == 0 )) || die "Variaveis obrigatorias ausentes em .env.local: ${missing[*]}"

  if admin_bootstrap_configured; then
    [[ -n "$ADMIN_BOOTSTRAP_EMAIL" ]] || die "Bootstrap admin configurado de forma incompleta: ADMIN_BOOTSTRAP_EMAIL e obrigatorio."
    [[ -n "$ADMIN_BOOTSTRAP_PASSWORD" ]] || die "Bootstrap admin configurado de forma incompleta: ADMIN_BOOTSTRAP_PASSWORD e obrigatorio."
  fi
}

ensure_env_ready() {
  load_env_map
  local required=(
    MYSQL_HOST MYSQL_HOST_PORT MYSQL_PORT MYSQL_DATABASE MYSQL_USER
    MYSQL_PASSWORD AUTH_SECRET PORT
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

mysql_tcp_open() {
  export_runtime_env
  resolve_commands
  "$NODE_CMD" - <<'NODE' >/dev/null 2>&1
const net = require('node:net');
const socket = net.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
});
socket.setTimeout(2500);
socket.on('connect', () => {
  socket.end();
  process.exit(0);
});
socket.on('timeout', () => {
  socket.destroy();
  process.exit(1);
});
socket.on('error', () => process.exit(1));
NODE
}

native_mysql_responding() {
  resolve_commands
  export_runtime_env
  if (( ${#MYSQL_CLIENT_CMD[@]} > 0 )); then
    set_mysql_auth_args "$MYSQL_USER" "$MYSQL_PASSWORD"
    if "${MYSQL_CLIENT_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}" -N -B -e "SELECT 1" >/dev/null 2>&1; then
      return 0
    fi
    if [[ -n "$MYSQL_ADMIN_USER" ]]; then
      set_mysql_auth_args "$MYSQL_ADMIN_USER" "$MYSQL_ADMIN_PASSWORD"
      if "${MYSQL_CLIENT_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}" -N -B -e "SELECT 1" >/dev/null 2>&1; then
        return 0
      fi
    fi
  fi

  if [[ -n "$NODE_CMD" && -d "$ROOT_DIR/node_modules" ]]; then
    "$NODE_CMD" - <<'NODE' >/dev/null 2>&1
const mysql = require('mysql2/promise');
(async () => {
  const attempts = [
    { user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD },
    { user: process.env.MYSQL_ADMIN_USER || 'root', password: process.env.MYSQL_ADMIN_PASSWORD },
  ];

  for (const attempt of attempts) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: attempt.user,
        password: attempt.password,
      });
      await connection.query('SELECT 1');
      await connection.end();
      process.exit(0);
    } catch {}
  }

  process.exit(1);
})().then(() => process.exit(0)).catch(() => process.exit(1));
NODE
    return $?
  fi

  return 1
}

start_native_mysql() {
  resolve_commands
  export_runtime_env
  mysql_tcp_open && return 0

  section "MySQL nativo detectado"
  local service_name
  service_name="$(native_mysql_service_name || true)"
  [[ -n "$service_name" ]] || die "MySQL nativo nao foi detectado no sistema. Execute ./run.sh mysql-install primeiro."

  if [[ "$OS_FAMILY" == "windows" ]] && have powershell.exe; then
    powershell.exe -NoProfile -Command "Set-Service -Name '$service_name' -StartupType Automatic -ErrorAction Stop; Start-Service -Name '$service_name' -ErrorAction Stop" >/dev/null 2>&1 || die "MySQL nativo detectado, mas nao foi possivel iniciar o servico no Windows."
  elif (( ${#SYSTEMCTL_CMD[@]} > 0 )); then
    run_privileged "${SYSTEMCTL_CMD[@]}" start "$service_name" >/dev/null 2>&1 || die "Falha ao iniciar o servico $service_name via systemctl."
  elif (( ${#SERVICE_CMD[@]} > 0 )); then
    run_privileged "${SERVICE_CMD[@]}" "$service_name" start >/dev/null 2>&1 || die "Falha ao iniciar o servico $service_name via service."
  else
    die "Nao encontrei um gerenciador de servico compativel para iniciar o MySQL nativo."
  fi

  mysql_tcp_open || die "MySQL nativo foi detectado, mas a porta configurada nao respondeu apos a tentativa de inicializacao."
}

ensure_database_exists() {
  export_runtime_env
  [[ -d "$ROOT_DIR/node_modules" ]] || die "Dependencias ausentes. Execute ./run.sh install antes de preparar o banco."
  if "$NODE_CMD" - <<'NODE'; then
const mysql = require('mysql2/promise');
const database = process.env.MYSQL_DATABASE;

(async () => {
  const appConfig = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: true,
  };

  try {
    const appConnection = await mysql.createConnection(appConfig);
    await appConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await appConnection.end();
    process.exit(0);
  } catch (appErr) {
    // App user could not create the database; fall through to admin credentials
  }

  if (process.env.MYSQL_ADMIN_USER) {
    const adminConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_ADMIN_USER || 'root',
      password: process.env.MYSQL_ADMIN_PASSWORD || '',
      multipleStatements: true,
    });

    const escapedUser = adminConnection.escape(process.env.MYSQL_USER);
    const escapedPassword = adminConnection.escape(process.env.MYSQL_PASSWORD);
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await adminConnection.query(`CREATE USER IF NOT EXISTS ${escapedUser}@'%' IDENTIFIED BY ${escapedPassword}`);
    await adminConnection.query(`CREATE USER IF NOT EXISTS ${escapedUser}@'localhost' IDENTIFIED BY ${escapedPassword}`);
    await adminConnection.query(`GRANT ALL PRIVILEGES ON \`${database}\`.* TO ${escapedUser}@'%'`);
    await adminConnection.query(`GRANT ALL PRIVILEGES ON \`${database}\`.* TO ${escapedUser}@'localhost'`);
    await adminConnection.query('FLUSH PRIVILEGES');
    await adminConnection.end();
    process.exit(0);
  }

  throw new Error('Nao foi possivel preparar o banco com o usuario da aplicacao. Configure MYSQL_ADMIN_USER/MYSQL_ADMIN_PASSWORD validos ou execute o script em um ambiente com sudo sem senha para mysql.');
})().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
NODE
    return 0
  fi

  # Fallback: mysql client with admin credentials (cross-platform, works on Windows/Linux/WSL)
  if (( ${#MYSQL_CLIENT_CMD[@]} > 0 )) && [[ -n "$MYSQL_ADMIN_USER" ]]; then
    local escaped_user escaped_password
    escaped_user="${MYSQL_USER//\'/\'\'}"
    escaped_password="${MYSQL_PASSWORD//\'/\'\'}"
    local sql
    sql="CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    sql+=" CREATE USER IF NOT EXISTS '${escaped_user}'@'%' IDENTIFIED BY '${escaped_password}';"
    sql+=" CREATE USER IF NOT EXISTS '${escaped_user}'@'localhost' IDENTIFIED BY '${escaped_password}';"
    sql+=" GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '${escaped_user}'@'%';"
    sql+=" GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '${escaped_user}'@'localhost';"
    sql+=" FLUSH PRIVILEGES;"
    set_mysql_auth_args "$MYSQL_ADMIN_USER" "$MYSQL_ADMIN_PASSWORD"
    "${MYSQL_CLIENT_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}" -e "$sql"
    return 0
  fi

  # Fallback: sudo mysql via unix socket auth (Linux/WSL only)
  # This works on Ubuntu/Debian where root uses auth_socket plugin
  if [[ "$OS_FAMILY" != "windows" ]] && sudo -n true >/dev/null 2>&1; then
    # Verify sudo mysql actually works before attempting schema operations
    if sudo -n mysql -N -B -e "SELECT 1" >/dev/null 2>&1; then
      local escaped_user escaped_password
      escaped_user="${MYSQL_USER//\'/\'\'}"
      escaped_password="${MYSQL_PASSWORD//\'/\'\'}"
      local sql
      sql="CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
      sql+=" CREATE USER IF NOT EXISTS '${escaped_user}'@'%' IDENTIFIED BY '${escaped_password}';"
      sql+=" CREATE USER IF NOT EXISTS '${escaped_user}'@'localhost' IDENTIFIED BY '${escaped_password}';"
      sql+=" GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '${escaped_user}'@'%';"
      sql+=" GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '${escaped_user}'@'localhost';"
      sql+=" FLUSH PRIVILEGES;"
      sudo -n mysql -e "$sql"
      return 0
    fi
  fi

  die "Nao foi possivel criar ou validar o schema do app no MySQL nativo. Informe credenciais administrativas validas (MYSQL_ADMIN_USER/MYSQL_ADMIN_PASSWORD) ou habilite acesso sudo ao mysql."
}

verify_database_state() {
  export_runtime_env
  [[ -d "$ROOT_DIR/node_modules" ]] || die "Dependencias ausentes. Execute ./run.sh install antes de verificar o banco."
  "$NODE_CMD" - <<'NODE'
const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [tables] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = ?`,
    [process.env.MYSQL_DATABASE]
  );

  const [migrationTable] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = ?
       AND table_name = '_lyra_schema_migrations'`,
    [process.env.MYSQL_DATABASE]
  );

  await connection.end();
  const total = tables[0]?.total ?? 0;
  const hasMigrationTable = (migrationTable[0]?.total ?? 0) > 0;
  console.log(`Tabelas no schema: ${total}`);
  console.log(`Tabela de migracao presente: ${hasMigrationTable ? 'sim' : 'nao'}`);
})().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
NODE
}

ensure_backup_dir() {
  mkdir -p "$BACKUP_DIR"
}

prompt_text() {
  local label="$1"
  local default_value="$2"
  local answer=""
  if [[ ! -t 0 ]]; then
    printf '%s' "$default_value"
    return 0
  fi
  read -r -p "$label [$default_value]: " answer
  printf '%s' "${answer:-$default_value}"
}

safe_restore_target() {
  export_runtime_env
  local suggested="${MYSQL_DATABASE}_restore_$(date +%Y%m%d_%H%M%S)"
  local target
  target="$(prompt_text "Schema alvo para restore full sem sobrescrever o banco ativo" "$suggested")"
  [[ "$target" != "$MYSQL_DATABASE" ]] || die "O restore nao pode sobrescrever o schema ativo do app."
  printf '%s' "$target"
}

ensure_restore_target_safe() {
  local target_database="$1"
  export_runtime_env
  [[ -d "$ROOT_DIR/node_modules" ]] || die "Dependencias ausentes. Execute ./run.sh install antes de restaurar."
  if [[ -n "$MYSQL_ADMIN_USER" ]]; then
    TARGET_DATABASE="$target_database" "$NODE_CMD" - <<'NODE'
const mysql = require('mysql2/promise');

(async () => {
  const target = process.env.TARGET_DATABASE;
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_ADMIN_USER || 'root',
    password: process.env.MYSQL_ADMIN_PASSWORD || '',
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${target}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = ?`,
    [target]
  );

  await connection.end();
  if ((rows[0]?.total ?? 0) > 0) {
    throw new Error(`O schema alvo ${target} ja possui tabelas. O restore full exige um schema vazio para nao sobrescrever dados existentes.`);
  }
})().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
NODE
    return 0
  fi

  # Fallback: mysql client with admin credentials (cross-platform)
  if (( ${#MYSQL_CLIENT_CMD[@]} > 0 )) && [[ -n "$MYSQL_ADMIN_USER" ]]; then
    set_mysql_auth_args "$MYSQL_ADMIN_USER" "$MYSQL_ADMIN_PASSWORD"
    local check_sql
    check_sql="CREATE DATABASE IF NOT EXISTS \`$target_database\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    "${MYSQL_CLIENT_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}" -e "$check_sql"
    local table_count
    table_count="$("${MYSQL_CLIENT_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}" -N -B -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$target_database';")"
    [[ "${table_count:-0}" == "0" ]] || die "O schema alvo $target_database ja possui tabelas. O restore full exige um schema vazio."
    return 0
  fi

  # Fallback: sudo mysql via unix socket auth (Linux/WSL only)
  if sudo_mysql_available; then
    local check_sql
    check_sql="CREATE DATABASE IF NOT EXISTS \`$target_database\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    sudo -n mysql -e "$check_sql"
    local table_count
    table_count="$(sudo -n mysql -N -B -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$target_database';")"
    [[ "${table_count:-0}" == "0" ]] || die "O schema alvo $target_database ja possui tabelas. O restore full exige um schema vazio."
    return 0
  fi

  die "Restore full exige credenciais administrativas validas (MYSQL_ADMIN_USER/MYSQL_ADMIN_PASSWORD) ou acesso sudo ao mysql."
}

backup_database() {
  install_deps
  section "Preparando MySQL nativo local"
  prepare_mysql_runtime
  export_runtime_env
  ensure_backup_dir

  local timestamp
  local backup_file
  timestamp="$(date +%Y%m%d_%H%M%S)"
  backup_file="$BACKUP_DIR/${MYSQL_DATABASE}_${timestamp}.sql"

  section "Backup full do banco"
  (( ${#MYSQLDUMP_CMD[@]} > 0 )) || die "mysqldump nao encontrado no ambiente local. Instale o pacote mysql-client (Linux) ou adicione o mysqldump ao PATH (Windows)."

  if [[ -n "$MYSQL_ADMIN_USER" ]]; then
    set_mysql_auth_args "$MYSQL_ADMIN_USER" "$MYSQL_ADMIN_PASSWORD"
    "${MYSQLDUMP_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}" --single-transaction --routines --triggers --events --hex-blob --set-gtid-purged=OFF --no-tablespaces "$MYSQL_DATABASE" > "$backup_file"
  elif [[ -n "$MYSQL_USER" ]]; then
    # Fallback: use app credentials (may lack SUPER/PROCESS privileges for --events/--routines)
    set_mysql_auth_args "$MYSQL_USER" "$MYSQL_PASSWORD"
    "${MYSQLDUMP_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}" --single-transaction --hex-blob --set-gtid-purged=OFF --no-tablespaces "$MYSQL_DATABASE" > "$backup_file"
    log_warn "Backup gerado com usuario do app. Rotinas, eventos e triggers podem nao estar incluidos por falta de privilegios."
  elif sudo_mysql_available; then
    sudo -n "${MYSQLDUMP_CMD[@]}" --single-transaction --routines --triggers --events --hex-blob --set-gtid-purged=OFF --no-tablespaces "$MYSQL_DATABASE" > "$backup_file"
  else
    die "Backup full exige mysqldump e ao menos um metodo de autenticacao: MYSQL_ADMIN_USER, MYSQL_USER, ou acesso sudo ao mysql."
  fi

  if (( ${#GZIP_CMD[@]} > 0 )); then
    "${GZIP_CMD[@]}" -f "$backup_file"
    backup_file="${backup_file}.gz"
  fi

  log_ok "Backup full gerado em: $backup_file"
}

restore_database() {
  install_deps
  section "Preparando MySQL nativo local"
  prepare_mysql_runtime
  export_runtime_env

  local default_backup=""
  if compgen -G "$BACKUP_DIR/${MYSQL_DATABASE}_*.sql.gz" >/dev/null; then
    default_backup="$(ls -1t "$BACKUP_DIR/${MYSQL_DATABASE}_"*.sql.gz | head -n 1)"
  elif compgen -G "$BACKUP_DIR/${MYSQL_DATABASE}_*.sql" >/dev/null; then
    default_backup="$(ls -1t "$BACKUP_DIR/${MYSQL_DATABASE}_"*.sql | head -n 1)"
  fi
  [[ -n "$default_backup" ]] || die "Nenhum backup full foi encontrado em $BACKUP_DIR"

  local backup_path
  local target_database
  backup_path="$(prompt_text "Arquivo de backup para restore" "$default_backup")"
  [[ -f "$backup_path" ]] || die "Arquivo de backup nao encontrado: $backup_path"
  target_database="$(safe_restore_target)"
  ensure_restore_target_safe "$target_database"

  section "Restore full do banco"
  (( ${#MYSQL_CLIENT_CMD[@]} > 0 )) || die "Cliente mysql nao encontrado no ambiente local. Instale o pacote mysql-client (Linux) ou adicione o mysql ao PATH (Windows)."

  # Determine authentication method: admin > app user > sudo
  local -a restore_auth_args=()
  local restore_via=""
  if [[ -n "$MYSQL_ADMIN_USER" ]]; then
    set_mysql_auth_args "$MYSQL_ADMIN_USER" "$MYSQL_ADMIN_PASSWORD"
    restore_auth_args=("-h$MYSQL_HOST" "-P$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}")
    restore_via="admin"
  elif [[ -n "$MYSQL_USER" ]]; then
    set_mysql_auth_args "$MYSQL_USER" "$MYSQL_PASSWORD"
    restore_auth_args=("-h$MYSQL_HOST" "-P$MYSQL_PORT" "${MYSQL_AUTH_ARGS[@]}")
    restore_via="app"
  elif sudo_mysql_available; then
    restore_via="sudo"
  else
    die "Restore full exige ao menos um metodo de autenticacao: MYSQL_ADMIN_USER, MYSQL_USER, ou acesso sudo ao mysql."
  fi

  if [[ "$backup_path" == *.gz ]]; then
    (( ${#GZIP_CMD[@]} > 0 )) || die "gzip nao encontrado para restaurar arquivo compactado."
    if [[ "$restore_via" == "sudo" ]]; then
      "${GZIP_CMD[@]}" -dc "$backup_path" | sudo -n "${MYSQL_CLIENT_CMD[@]}" "$target_database"
    else
      "${GZIP_CMD[@]}" -dc "$backup_path" | "${MYSQL_CLIENT_CMD[@]}" "${restore_auth_args[@]}" "$target_database"
    fi
  else
    if [[ "$restore_via" == "sudo" ]]; then
      sudo -n "${MYSQL_CLIENT_CMD[@]}" "$target_database" < "$backup_path"
    else
      "${MYSQL_CLIENT_CMD[@]}" "${restore_auth_args[@]}" "$target_database" < "$backup_path"
    fi
  fi

  log_ok "Restore full concluido no schema seguro: $target_database"
}

show_mysql_logs() {
  if [[ "$OS_FAMILY" == "windows" ]] && have powershell.exe; then
    # Detect MySQL data directory dynamically via registry, mysqld --help, or common locations
    powershell.exe -NoProfile -Command "
      \$searchPaths = @()

      # Try reading MySQL base/data path from registry
      \$regPaths = @(
        'HKLM:\\SOFTWARE\\MySQL AB',
        'HKLM:\\SOFTWARE\\WOW6432Node\\MySQL AB'
      )
      foreach (\$rp in \$regPaths) {
        if (Test-Path \$rp) {
          Get-ChildItem \$rp -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
            \$dp = (Get-ItemProperty \$_.PSPath -ErrorAction SilentlyContinue).DataPath
            if (\$dp -and (Test-Path \$dp)) { \$searchPaths += \$dp }
            \$lp = (Get-ItemProperty \$_.PSPath -ErrorAction SilentlyContinue).Location
            if (\$lp -and (Test-Path \$lp)) { \$searchPaths += \$lp }
          }
        }
      }

      # Common installation paths
      \$searchPaths += @(
        'C:\\ProgramData\\MySQL',
        'C:\\Program Files\\MySQL',
        'C:\\Program Files (x86)\\MySQL',
        'C:\\MySQL',
        \"\$env:APPDATA\\MySQL\",
        \"\$env:LOCALAPPDATA\\MySQL\"
      )

      \$err = \$null
      foreach (\$sp in \$searchPaths) {
        if (Test-Path \$sp) {
          \$found = Get-ChildItem \$sp -Recurse -Filter *.err -ErrorAction SilentlyContinue |
                    Sort-Object LastWriteTime -Descending |
                    Select-Object -First 1
          if (\$found) { \$err = \$found; break }
        }
      }

      if (-not \$err) {
        throw 'Arquivo de log MySQL nao encontrado. Verifique a instalacao do MySQL ou execute: mysqld --help --verbose 2>nul | findstr datadir'
      }

      Write-Host \"Log encontrado: \$(\$err.FullName)\" -ForegroundColor Green
      Get-Content -Path \$err.FullName -Wait
    "
    return 0
  fi

  # Linux / WSL: try known log file locations first
  local service_name
  service_name="$(native_mysql_service_name || true)"
  local log_file=""
  local candidate_logs=(
    /var/log/mysql/error.log
    /var/log/mysql/mysql-error.log
    /var/log/mysql/mysql.log
    /var/log/mysqld.log
    /var/log/mariadb/mariadb.log
  )

  # Try to detect the actual datadir from mysqld for non-standard installations
  if (( ${#MYSQLD_CMD[@]} > 0 )); then
    local datadir_log=""
    datadir_log="$("${MYSQLD_CMD[@]}" --help --verbose 2>/dev/null | awk '/^datadir/ {print $2}' || true)"
    if [[ -n "$datadir_log" ]]; then
      local hostname_short
      hostname_short="$(hostname -s 2>/dev/null || printf 'localhost')"
      candidate_logs+=("${datadir_log%/}/${hostname_short}.err")
      candidate_logs+=("${datadir_log%/}/error.log")
    fi
  fi

  for log_file in "${candidate_logs[@]}"; do
    if [[ -f "$log_file" ]]; then
      log_info "Log encontrado: $log_file"
      tail -f "$log_file"
      return 0
    fi
    # Try with sudo if file exists but is unreadable
    if [[ "$OS_FAMILY" != "windows" ]] && sudo -n test -f "$log_file" 2>/dev/null; then
      log_info "Log encontrado (acesso root): $log_file"
      run_privileged tail -f "$log_file"
      return 0
    fi
  done

  if [[ -n "$service_name" ]] && have journalctl; then
    run_privileged journalctl -u "$service_name" -f -n 100
    return 0
  fi

  die "Nao foi possivel localizar um arquivo de log do MySQL nativo neste sistema."
}

prepare_mysql_runtime() {
  ensure_env_ready
  start_native_mysql
  ensure_database_exists
}

mysql_up() {
  install_deps
  doctor
  section "Preparando MySQL nativo local"
  prepare_mysql_runtime
  log_ok "MySQL nativo local pronto para uso pelo app."
}

mysql_migrate() {
  install_deps
  section "Preparando MySQL nativo local"
  prepare_mysql_runtime
  section "Aplicando migracoes MySQL"
  (
    cd "$ROOT_DIR"
    export_runtime_env
    "$NODE_CMD" "$MIGRATE_SCRIPT"
  )
  verify_database_state
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
  if [[ "$OS_FAMILY" == "windows" && ${#TASKKILL_CMD[@]} -gt 0 ]]; then
    "${TASKKILL_CMD[@]}" /PID "$pid" /T /F >/dev/null 2>&1 || true
  fi
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
      if "$NODE_CMD" - "$url" <<'NODE' >/dev/null 2>&1
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
  [[ -d "$ROOT_DIR/node_modules" ]] || die "Dependencias ausentes. Execute ./run.sh install antes de usar o modo rapido."
  prepare_mysql_runtime
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
  [[ -d "$ROOT_DIR/node_modules" ]] || die "Dependencias ausentes. Execute ./run.sh install antes de usar o modo rapido."
  prepare_mysql_runtime
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
  log_warn "O run.sh nao encerra automaticamente o servico MySQL nativo do sistema."
}

status_report() {
  export_runtime_env
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

  log_ok "Runtime MySQL selecionado: native"
  local service_name
  service_name="$(native_mysql_service_name || true)"
  [[ -n "$service_name" ]] && log_ok "Servico MySQL do host: $service_name"
  log_ok "Estrategia administrativa MySQL: $(mysql_admin_strategy)"
  if mysql_tcp_open; then
    log_ok "MySQL nativo respondendo em ${MYSQL_HOST}:${MYSQL_PORT}."
    if native_mysql_responding; then
      log_ok "Autenticacao MySQL valida com as credenciais configuradas."
    else
      log_warn "MySQL nativo esta ativo, mas as credenciais configuradas ainda nao autenticam."
    fi
  else
    log_warn "MySQL nativo nao respondeu na porta configurada."
  fi
  if admin_bootstrap_ready; then
    log_ok "Bootstrap admin habilitado para ${ADMIN_BOOTSTRAP_EMAIL}."
  else
    log_warn "Bootstrap admin desabilitado."
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
  export_runtime_env
  doctor
  section "Saude operacional"
  if [[ -f "$ENV_FILE" ]]; then
    validate_env
    log_ok ".env.local atende aos requisitos."
  else
    log_warn ".env.local ainda nao existe."
  fi

  if mysql_tcp_open; then
    if native_mysql_responding; then
      log_ok "MySQL nativo em execucao e acessivel."
    else
      log_warn "MySQL nativo esta em execucao, mas as credenciais atuais nao autenticam."
    fi
  else
    log_warn "MySQL nativo nao esta acessivel na porta configurada."
  fi
  if mysql_admin_auth_works || sudo_mysql_available; then
    log_ok "O ambiente possui caminho administrativo valido para schema, grants, backup e restore."
  else
    log_warn "O ambiente ainda nao possui caminho administrativo comprovado para schema, grants, backup e restore."
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
  log_warn "O servico MySQL nativo permanece sob controle do sistema operacional."
}

pause_menu() {
  printf '\nPressione Enter para continuar...'
  read -r _
  clear
}

environment_menu() {
  local choice=""
  while true; do
    banner
    printf '%sPreparacao e diagnostico%s\n' "$C_BOLD" "$C_RESET"
    printf '  1. Validar requisitos do sistema\n'
    printf '  2. Instalar dependencias do projeto\n'
    printf '  3. Configurar ambiente local (.env.local)\n'
    printf '  4. Mostrar configuracao efetiva segura\n'
    printf '  5. Mostrar status consolidado\n'
    printf '  6. Rodar check de saude operacional\n'
    printf '  0. Voltar\n\n'
    read -r -p "Escolha uma opcao: " choice
    case "$choice" in
      1) doctor ;;
      2) install_deps ;;
      3) ensure_env ;;
      4) show_config_summary ;;
      5) status_report ;;
      6) health_report ;;
      0) break ;;
      *) log_warn "Opcao invalida." ;;
    esac
    pause_menu
  done
}

database_menu() {
  local choice=""
  while true; do
    banner
    printf '%sBanco de dados MySQL%s\n' "$C_BOLD" "$C_RESET"
    printf '  1. Instalar MySQL nativo se ainda nao existir\n'
    printf '  2. Preparar MySQL local para o app\n'
    printf '  3. Criar schema e grants do app sem apagar dados\n'
    printf '  4. Aplicar migracoes MySQL\n'
    printf '  5. Verificar schema e tabelas do app\n'
    printf '  6. Acompanhar logs do MySQL local\n'
    printf '  0. Voltar\n\n'
    read -r -p "Escolha uma opcao: " choice
    case "$choice" in
      1) install_native_mysql ;;
      2) mysql_up ;;
      3) install_deps; section "Preparando MySQL nativo local"; prepare_mysql_runtime; log_ok "Schema do app garantido sem apagar dados existentes." ;;
      4) mysql_migrate ;;
      5) install_deps; section "Preparando MySQL nativo local"; prepare_mysql_runtime; verify_database_state ;;
      6) show_mysql_logs ;;
      0) break ;;
      *) log_warn "Opcao invalida." ;;
    esac
    pause_menu
  done
}

backup_menu() {
  local choice=""
  while true; do
    banner
    printf '%sBackup e restore%s\n' "$C_BOLD" "$C_RESET"
    printf '  1. Gerar backup full do banco do app\n'
    printf '  2. Restaurar backup full para schema seguro\n'
    printf '  3. Verificar ultimo backup disponivel\n'
    printf '  0. Voltar\n\n'
    read -r -p "Escolha uma opcao: " choice
    case "$choice" in
      1) backup_database ;;
      2) restore_database ;;
      3)
        ensure_backup_dir
        if compgen -G "$BACKUP_DIR/*.sql*" >/dev/null; then
          ls -1t "$BACKUP_DIR" | head -n 10
        else
          log_warn "Nenhum backup encontrado em $BACKUP_DIR"
        fi
        ;;
      0) break ;;
      *) log_warn "Opcao invalida." ;;
    esac
    pause_menu
  done
}

application_menu() {
  local choice=""
  while true; do
    banner
    printf '%sAplicacao web%s\n' "$C_BOLD" "$C_RESET"
    printf '  1. Subir stack completa em desenvolvimento\n'
    printf '  2. Subir stack completa em producao\n'
    printf '  3. Modo desenvolvimento rapido\n'
    printf '  4. Modo producao rapido\n'
    printf '  5. Encerrar aplicacao\n'
    printf '  6. Encerrar tudo\n'
    printf '  0. Voltar\n\n'
    read -r -p "Escolha uma opcao: " choice
    case "$choice" in
      1) dev_mode ;;
      2) prod_mode ;;
      3) fast_dev_mode ;;
      4) fast_prod_mode ;;
      5) stop_app ;;
      6) stop_all ;;
      0) break ;;
      *) log_warn "Opcao invalida." ;;
    esac
    pause_menu
  done
}

ensure_schema_action() {
  install_deps
  section "Preparando MySQL nativo local"
  prepare_mysql_runtime
  log_ok "Schema do app garantido sem apagar dados existentes."
}

verify_db_action() {
  install_deps
  section "Preparando MySQL nativo local"
  prepare_mysql_runtime
  verify_database_state
}

list_backups_action() {
  ensure_backup_dir
  if compgen -G "$BACKUP_DIR/*.sql*" >/dev/null; then
    ls -1t "$BACKUP_DIR" | head -n 10
  else
    log_warn "Nenhum backup encontrado em $BACKUP_DIR"
  fi
}

help_cli_action() {
  help_text
}

repeat_char() {
  local char="$1"
  local count="$2"
  local buffer=""
  while (( count > 0 )); do
    buffer+="$char"
    (( count -= 1 ))
  done
  printf '%s' "$buffer"
}

fit_text() {
  local text="$1"
  local width="$2"
  if (( width <= 0 )); then
    printf ''
  elif (( ${#text} > width )); then
    if (( width <= 3 )); then
      printf '%s' "${text:0:width}"
    else
      printf '%s...' "${text:0:width-3}"
    fi
  else
    printf "%-${width}s" "$text"
  fi
}

tui_menu_title() {
  case "$1" in
    main) printf 'Menu principal' ;;
    environment) printf 'Preparacao e diagnostico' ;;
    database) printf 'Banco de dados MySQL' ;;
    backup) printf 'Backup e restore' ;;
    application) printf 'Aplicacao web' ;;
    *) printf 'Menu' ;;
  esac
}

tui_menu_items_name() {
  case "$1" in
    main) printf 'TUI_MAIN_ITEMS' ;;
    environment) printf 'TUI_ENV_ITEMS' ;;
    database) printf 'TUI_DB_ITEMS' ;;
    backup) printf 'TUI_BACKUP_ITEMS' ;;
    application) printf 'TUI_APP_ITEMS' ;;
    *) return 1 ;;
  esac
}

declare -ga TUI_MAIN_ITEMS=(
  "submenu|environment|Preparacao e diagnostico|Validacoes do host, dependencias, configuracao e saude operacional"
  "submenu|database|Banco de dados MySQL|Instalacao nativa, servico local, schema, grants e migracoes"
  "submenu|backup|Backup e restore|Backup full do banco do app e restore seguro em schema isolado"
  "submenu|application|Aplicacao web|Subida dev/prod e controle do processo local"
  "action|help_cli_action|Ajuda rapida|Mostra os comandos CLI e a trilha suportada pelo orquestrador"
  "exit|exit|Sair|Encerra a interface interativa"
)

declare -ga TUI_ENV_ITEMS=(
  "action|doctor|Validar requisitos do sistema|Checa Bash, SO, Node, pacote do projeto, MySQL e ferramentas"
  "action|install_deps|Instalar dependencias do projeto|Instala apenas se o estado atual exigir"
  "action|ensure_env|Configurar ambiente local|Atualiza .env.local com secrets, portas e credenciais"
  "action|show_config_summary|Mostrar configuracao efetiva|Exibe a configuracao ativa com segredos mascarados"
  "action|status_report|Mostrar status consolidado|Resume app, MySQL, bootstrap admin e autenticacao"
  "action|health_report|Rodar check de saude operacional|Valida ambiente, acesso e prontidao operacional"
  "back|main|Voltar ao menu principal|Retorna para a camada raiz do orquestrador"
)

declare -ga TUI_DB_ITEMS=(
  "action|install_native_mysql|Instalar MySQL nativo|Instala apenas se o host ainda nao possuir MySQL local"
  "action|mysql_up|Preparar MySQL local para o app|Inicia o servico e garante schema e grants sem apagar dados"
  "action|ensure_schema_action|Garantir schema e grants|Prepara schema e usuario do app sem substituir dados existentes"
  "action|mysql_migrate|Aplicar migracoes MySQL|Executa o motor real de migracao do projeto"
  "action|verify_db_action|Verificar schema e tabelas|Confere consistencia basica e tabela de migracoes"
  "action|show_mysql_logs|Acompanhar logs do MySQL|Abre o stream real do servico local do banco"
  "back|main|Voltar ao menu principal|Retorna para a camada raiz do orquestrador"
)

declare -ga TUI_BACKUP_ITEMS=(
  "action|backup_database|Gerar backup full|Executa dump completo do schema do app"
  "action|restore_database|Restaurar backup full|Restaura para um schema seguro sem sobrescrever o schema ativo"
  "action|list_backups_action|Listar backups disponiveis|Mostra os backups locais mais recentes"
  "back|main|Voltar ao menu principal|Retorna para a camada raiz do orquestrador"
)

declare -ga TUI_APP_ITEMS=(
  "action|dev_mode|Subir stack completa em desenvolvimento|Instala, prepara MySQL, migra e sobe Next em dev"
  "action|prod_mode|Subir stack completa em producao|Instala, prepara MySQL, migra, builda e sobe Next em start"
  "action|fast_dev_mode|Modo desenvolvimento rapido|Usa dependencias existentes e sobe o ambiente mais rapido"
  "action|fast_prod_mode|Modo producao rapido|Usa build existente e valida MySQL antes de subir"
  "action|stop_app|Encerrar aplicacao|Finaliza somente o processo do app gerenciado por este script"
  "action|stop_all|Encerrar tudo|Encerra o app e preserva o MySQL sob controle do sistema"
  "back|main|Voltar ao menu principal|Retorna para a camada raiz do orquestrador"
)

tui_enter_screen() {
  printf '\033[?1049h\033[?25l'
}

tui_leave_screen() {
  printf '\033[?25h\033[?1049l'
}

tui_draw_screen() {
  local menu_name="$1"
  local selected_index="$2"
  local status_kind="$3"
  local status_message="$4"
  local width height left_width right_width separator
  local items_name title

  width="$(tput cols 2>/dev/null || printf '120')"
  height="$(tput lines 2>/dev/null || printf '32')"
  (( width < 90 )) && width=90
  left_width=42
  right_width=$(( width - left_width - 7 ))
  (( right_width < 30 )) && right_width=30
  separator="$(repeat_char "-" "$width")"

  resolve_commands
  select_package_manager
  export_runtime_env

  items_name="$(tui_menu_items_name "$menu_name")"
  local -n menu_items="$items_name"
  title="$(tui_menu_title "$menu_name")"

  if (( selected_index < 0 )); then
    selected_index=0
  elif (( selected_index >= ${#menu_items[@]} )); then
    selected_index=$((${#menu_items[@]} - 1))
  fi

  local selected_record selected_kind selected_target selected_label selected_desc
  selected_record="${menu_items[$selected_index]}"
  IFS='|' read -r selected_kind selected_target selected_label selected_desc <<< "$selected_record"

  printf '\033[H\033[2J'
  printf '%s%s%s\n' "$C_BOLD" "$(fit_text "Lyra MetaCare Local Orchestrator" "$width")" "$C_RESET"
  printf '%s\n' "$separator"
  printf '%s\n' "$(fit_text "Tela: $title | SO: $OS_LABEL | pacote: $PACKAGE_MANAGER | app: 127.0.0.1:$PORT | mysql: $MYSQL_HOST:$MYSQL_PORT" "$width")"
  printf '%s\n' "$separator"

  local max_rows=0
  max_rows=${#menu_items[@]}
  local row=0
  while (( row < max_rows )); do
    local left_text=""
    local right_text=""
    if (( row < ${#menu_items[@]} )); then
      local record kind target label desc prefix
      record="${menu_items[$row]}"
      IFS='|' read -r kind target label desc <<< "$record"
      prefix="  "
      (( row == selected_index )) && prefix="> "
      left_text="${prefix}${label}"
      if (( row == 0 )); then
        right_text="Descricao: $selected_desc"
      elif (( row == 1 )); then
        right_text="Acao: ${selected_target}"
      elif (( row == 2 )); then
        right_text="Admin MySQL: $(mysql_admin_strategy)"
      elif (( row == 3 )); then
        if admin_bootstrap_ready; then
          right_text="Bootstrap admin: ${ADMIN_BOOTSTRAP_EMAIL}"
        else
          right_text="Bootstrap admin: desabilitado"
        fi
      elif (( row == 4 )); then
        if mysql_tcp_open; then
          right_text="MySQL: porta local respondendo"
        else
          right_text="MySQL: porta local sem resposta"
        fi
      elif (( row == 5 )); then
        local pid
        pid="$(app_pid || true)"
        if [[ -n "$pid" ]] && pid_running "$pid"; then
          right_text="App: ativo em $(read_meta port || printf "$DEFAULT_APP_PORT")"
        else
          right_text="App: parado"
        fi
      fi
    fi
    printf '| %s | %s |\n' "$(fit_text "$left_text" "$left_width")" "$(fit_text "$right_text" "$right_width")"
    (( row += 1 ))
  done

  local filler_rows
  filler_rows=$(( height - max_rows - 10 ))
  while (( filler_rows > 0 )); do
    printf '| %s | %s |\n' "$(fit_text "" "$left_width")" "$(fit_text "" "$right_width")"
    (( filler_rows -= 1 ))
  done

  printf '%s\n' "$separator"
  case "$status_kind" in
    ok) printf '%s\n' "$(fit_text "Status: OK - $status_message" "$width")" ;;
    err) printf '%s\n' "$(fit_text "Status: ERRO - $status_message" "$width")" ;;
    warn) printf '%s\n' "$(fit_text "Status: AVISO - $status_message" "$width")" ;;
    *) printf '%s\n' "$(fit_text "Status: $status_message" "$width")" ;;
  esac
  printf '%s\n' "$(fit_text "Atalhos: seta/j-k navega | Enter executa | b volta | q sai" "$width")"
}

tui_run_action() {
  local action_fn="$1"
  local action_label="$2"
  local status_kind_ref="$3"
  local status_message_ref="$4"

  tui_leave_screen
  printf '\n%s%s%s\n' "$C_BOLD" "$action_label" "$C_RESET"
  printf '%s\n\n' "$(repeat_char "=" 72)"

  local exit_code=0
  if "$action_fn"; then
    printf '\n%s[OK]%s %s\n' "$C_GREEN" "$C_RESET" "$action_label"
    printf -v "$status_kind_ref" '%s' "ok"
    printf -v "$status_message_ref" '%s' "$action_label concluido"
  else
    exit_code=$?
    printf '\n%s[ERRO]%s %s\n' "$C_RED" "$C_RESET" "$action_label"
    printf -v "$status_kind_ref" '%s' "err"
    printf -v "$status_message_ref" '%s' "$action_label falhou com codigo $exit_code"
  fi

  printf '\nPressione Enter para voltar ao menu...'
  read -r _
  tui_enter_screen
  return 0
}

interactive_tui_menu() {
  local current_menu="main"
  local selected_index=0
  local status_kind="info"
  local status_message="Pronto para operar localmente com MySQL nativo e app sem containers."
  local key="" seq="" items_name="" selected_record="" kind="" target="" label="" desc=""

  tui_enter_screen
  trap 'tui_leave_screen' INT TERM

  while true; do
    items_name="$(tui_menu_items_name "$current_menu")"
    local -n current_items="$items_name"
    (( selected_index < 0 )) && selected_index=0
    (( selected_index >= ${#current_items[@]} )) && selected_index=$((${#current_items[@]} - 1))
    tui_draw_screen "$current_menu" "$selected_index" "$status_kind" "$status_message"

    read -rsn1 key
    case "$key" in
      $'\x1b')
        read -rsn2 -t 0.05 seq || true
        case "$seq" in
          "[A") (( selected_index > 0 )) && (( selected_index -= 1 )) ;;
          "[B") (( selected_index < ${#current_items[@]} - 1 )) && (( selected_index += 1 )) ;;
          "[D") current_menu="main"; selected_index=0 ;;
        esac
        ;;
      k) (( selected_index > 0 )) && (( selected_index -= 1 )) ;;
      j) (( selected_index < ${#current_items[@]} - 1 )) && (( selected_index += 1 )) ;;
      b|B)
        current_menu="main"
        selected_index=0
        status_kind="info"
        status_message="Retornado ao menu principal."
        ;;
      q|Q)
        break
        ;;
      "")
        selected_record="${current_items[$selected_index]}"
        IFS='|' read -r kind target label desc <<< "$selected_record"
        case "$kind" in
          submenu)
            current_menu="$target"
            selected_index=0
            status_kind="info"
            status_message="$label aberto."
            ;;
          back)
            current_menu="$target"
            selected_index=0
            status_kind="info"
            status_message="Retornado ao menu principal."
            ;;
          exit)
            break
            ;;
          action)
            tui_run_action "$target" "$label" status_kind status_message
            ;;
        esac
        ;;
    esac
  done

  trap - INT TERM
  tui_leave_screen
}

menu() {
  if [[ ! -t 0 || ! -t 1 ]]; then
    help_text
    return 0
  fi
  template_tui_menu
}

declare -ga TEMPLATE_TUI_OUTPUT_LINES=()
declare -g TEMPLATE_TUI_OUTPUT_LIMIT=240
declare -g TEMPLATE_TUI_PROGRESS=0
declare -g TEMPLATE_TUI_TASK="Standby"
declare -g TEMPLATE_TUI_STARTED_AT=0
declare -g TEMPLATE_TUI_SCROLL=0
declare -g TEMPLATE_TUI_LAST_SNAPSHOT_AT=0
declare -g TEMPLATE_TUI_MYSQL_STATE="MySQL nao verificado"
declare -g TEMPLATE_TUI_NEED_REPAINT=true
declare -g TEMPLATE_TUI_TERM_COLS=120
declare -g TEMPLATE_TUI_TERM_LINES=32

template_tui_update_dimensions() {
  TEMPLATE_TUI_TERM_COLS=$(tput cols 2>/dev/null || printf '120')
  TEMPLATE_TUI_TERM_LINES=$(tput lines 2>/dev/null || printf '32')
  (( TEMPLATE_TUI_TERM_COLS < 88 )) && TEMPLATE_TUI_TERM_COLS=88
  TEMPLATE_TUI_NEED_REPAINT=true
}
declare -g TEMPLATE_TUI_APP_STATE="Aplicacao nao verificada"
declare -g TEMPLATE_TUI_BOOTSTRAP_STATE="Bootstrap admin nao verificado"
declare -g TEMPLATE_TUI_MIN_OUTPUT_HEIGHT=6

template_tui_timer() {
  local elapsed=0
  elapsed=$(( $(date +%s) - TEMPLATE_TUI_STARTED_AT ))
  printf '%02d:%02d:%02d' $((elapsed / 3600)) $(((elapsed % 3600) / 60)) $((elapsed % 60))
}

template_tui_append_output() {
  local line="${1//$'\r'/}"
  line="${line//$'\t'/  }"
  [[ -n "$line" ]] || line=" "
  TEMPLATE_TUI_OUTPUT_LINES+=("$line")
  while (( ${#TEMPLATE_TUI_OUTPUT_LINES[@]} > TEMPLATE_TUI_OUTPUT_LIMIT )); do
    TEMPLATE_TUI_OUTPUT_LINES=("${TEMPLATE_TUI_OUTPUT_LINES[@]:1}")
  done
  if (( TEMPLATE_TUI_SCROLL < 3 )); then
    TEMPLATE_TUI_SCROLL=0
  fi
}

template_tui_status_prefix() {
  local status_kind="$1"
  case "$status_kind" in
    ok) printf '%s' "$I_CHECK" ;;
    err) printf '%s' "$I_CROSS" ;;
    warn) printf '%s' "$I_WARN" ;;
    *) printf '%s' "$I_DOT" ;;
  esac
}

template_tui_status_color() {
  local status_kind="$1"
  case "$status_kind" in
    ok) printf '%s' "$C_GREEN" ;;
    err) printf '%s' "$C_RED" ;;
    warn) printf '%s' "$C_AMBER" ;;
    *) printf '%s' "$C_CYAN" ;;
  esac
}

template_tui_output_height() {
  local menu_name="$1"
  local height items_name
  height="$(tput lines 2>/dev/null || printf '32')"
  items_name="$(tui_menu_items_name "$menu_name")"
  local -n menu_items="$items_name"
  local output_height=$(( height - ${#menu_items[@]} - 14 ))
  if (( output_height < TEMPLATE_TUI_MIN_OUTPUT_HEIGHT )); then
    output_height="$TEMPLATE_TUI_MIN_OUTPUT_HEIGHT"
  fi
  printf '%s' "$output_height"
}

template_tui_max_scroll() {
  local visible_lines="$1"
  local max_scroll=$(( ${#TEMPLATE_TUI_OUTPUT_LINES[@]} - visible_lines ))
  if (( max_scroll < 0 )); then
    max_scroll=0
  fi
  printf '%s' "$max_scroll"
}

template_tui_clamp_scroll() {
  local menu_name="$1"
  local visible_lines max_scroll
  visible_lines="$(template_tui_output_height "$menu_name")"
  max_scroll="$(template_tui_max_scroll "$visible_lines")"
  if (( TEMPLATE_TUI_SCROLL < 0 )); then
    TEMPLATE_TUI_SCROLL=0
  elif (( TEMPLATE_TUI_SCROLL > max_scroll )); then
    TEMPLATE_TUI_SCROLL="$max_scroll"
  fi
}

template_tui_scroll_lines() {
  local menu_name="$1"
  local delta="$2"
  TEMPLATE_TUI_SCROLL=$(( TEMPLATE_TUI_SCROLL + delta ))
  template_tui_clamp_scroll "$menu_name"
}

template_tui_scroll_page() {
  local menu_name="$1"
  local direction="$2"
  local page_size
  page_size="$(template_tui_output_height "$menu_name")"
  if [[ "$direction" == "up" ]]; then
    TEMPLATE_TUI_SCROLL=$(( TEMPLATE_TUI_SCROLL + page_size ))
  else
    TEMPLATE_TUI_SCROLL=$(( TEMPLATE_TUI_SCROLL - page_size ))
  fi
  template_tui_clamp_scroll "$menu_name"
}

template_tui_refresh_snapshot() {
  local now pid
  now="$(date +%s)"
  if (( now - TEMPLATE_TUI_LAST_SNAPSHOT_AT < 2 )); then
    return 0
  fi

  export_runtime_env

  if mysql_tcp_open; then
    TEMPLATE_TUI_MYSQL_STATE="MySQL local respondendo em $MYSQL_HOST:$MYSQL_PORT"
  else
    TEMPLATE_TUI_MYSQL_STATE="MySQL local indisponivel em $MYSQL_HOST:$MYSQL_PORT"
  fi

  pid="$(app_pid || true)"
  if [[ -n "$pid" ]] && pid_running "$pid"; then
    TEMPLATE_TUI_APP_STATE="Aplicacao local ativa na porta $(read_meta port || printf '%s' "$DEFAULT_APP_PORT")"
  else
    TEMPLATE_TUI_APP_STATE="Aplicacao local parada"
  fi

  if admin_bootstrap_ready; then
    TEMPLATE_TUI_BOOTSTRAP_STATE="Bootstrap admin pronto para ${ADMIN_BOOTSTRAP_EMAIL}"
  else
    TEMPLATE_TUI_BOOTSTRAP_STATE="Bootstrap admin desabilitado"
  fi

  TEMPLATE_TUI_LAST_SNAPSHOT_AT="$now"
}

template_tui_boot_sequence() {
  local width height left i frame
  local -a frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')

  width="$(tput cols 2>/dev/null || printf '120')"
  height="$(tput lines 2>/dev/null || printf '32')"
  left=$(( (width - 52) / 2 ))
  (( left < 2 )) && left=2

  for i in $(seq 0 19); do
    frame="${frames[$(( i % ${#frames[@]} ))]}"
    printf '\033[H\033[2J'
    printf '\033[%d;%dH%s%s%s LYRA METACARE %sv%s%s\n' $(( height / 2 - 1 )) "$left" "$C_GRAY" "$I_DOT" "$C_RESET" "$C_BOLD" "$SCRIPT_VERSION" "$C_RESET"
    printf '\033[%d;%dH%s%sCarregando interface operacional local%s\n' $(( height / 2 )) "$left" "$C_CYAN" "$C_BOLD" "$C_RESET"
    printf '\033[%d;%dH%s%s%s preparando TUI com MySQL nativo e app local real\n' $(( height / 2 + 1 )) "$left" "$C_MINT" "$frame" "$C_RESET"
    sleep 0.04
  done
}

template_tui_show_output_viewer() {
  local key="" seq="" width height visible_lines start_line row total_lines max_scroll viewer_scroll=0 line=""

  while true; do
    width="$(tput cols 2>/dev/null || printf '120')"
    height="$(tput lines 2>/dev/null || printf '32')"
    (( width < 88 )) && width=88
    visible_lines=$(( height - 7 ))
    (( visible_lines < 5 )) && visible_lines=5
    total_lines="${#TEMPLATE_TUI_OUTPUT_LINES[@]}"
    max_scroll=$(( total_lines - visible_lines ))
    (( max_scroll < 0 )) && max_scroll=0
    (( viewer_scroll < 0 )) && viewer_scroll=0
    (( viewer_scroll > max_scroll )) && viewer_scroll=max_scroll
    start_line=$(( total_lines - visible_lines - viewer_scroll ))
    (( start_line < 0 )) && start_line=0

    local sb_indicator_pos=0
    if (( total_lines > visible_lines && max_scroll > 0 )); then
      sb_indicator_pos=$(( viewer_scroll * (visible_lines - 1) / max_scroll ))
    fi

    printf '\033[H'
    printf '%b' "${EL}  ${C_GRAY}${I_DOT}${C_RESET} LIVE OUTPUT HISTORICO ${C_BOLD}v${SCRIPT_VERSION}${C_RESET}\n"
    printf '%b' "${EL}  ${C_CYAN}${C_BOLD}$(fit_text 'Saida real capturada das acoes executadas' $((width - 4)))${C_RESET}\n"
    printf '%b' "${EL}  ${C_SEC}${C_DIM}$(repeat_char '─' $((width - 4)))${C_RESET}\n"

    row=0
    while (( row < visible_lines )); do
      line=""
      if (( start_line + row < total_lines )); then
        line="${TEMPLATE_TUI_OUTPUT_LINES[$(( start_line + row ))]}"
      fi
      local sb_char="${C_SEC}┃${C_RESET}"
      if (( total_lines > visible_lines )); then
        if (( (visible_lines - 1 - row) == sb_indicator_pos )); then
          sb_char="${C_CYAN}█${C_RESET}"
        fi
      fi
      printf '%b' "${EL}  ${sb_char} ${C_AMBER}$(fit_text "$line" $((width - 10)))${C_RESET}\n"
      (( row += 1 ))
    done

    printf '%b' "${EL}  ${C_SEC}${C_DIM}$(repeat_char '─' $((width - 4)))${C_RESET}\n"
    printf '%b' "${EL}  ${C_SEC}${C_DIM}[${I_ARR}${I_ARR}] Mover  [a/z] Linha  [PgUp/v] Pagina  [q/Enter] Voltar${C_RESET}"
    printf '\033[J'

    read -rsn1 key
    case "$key" in
      $'\x1b')
        read -rsn2 -t 0.05 seq || true
        case "$seq" in
          "[A") (( viewer_scroll < max_scroll )) && (( viewer_scroll += 1 )) ;;
          "[B") (( viewer_scroll > 0 )) && (( viewer_scroll -= 1 )) ;;
          "[5~") viewer_scroll=$(( viewer_scroll + visible_lines )) ;;
          "[6~") viewer_scroll=$(( viewer_scroll - visible_lines )) ;;
        esac
        ;;
      k|a|A) (( viewer_scroll < max_scroll )) && (( viewer_scroll += 1 )) ;;
      j|z|Z) (( viewer_scroll > 0 )) && (( viewer_scroll -= 1 )) ;;
      v|V) viewer_scroll=$(( viewer_scroll - visible_lines )) ;;
      q|Q|"") break ;;
    esac
  done
}

template_tui_action_requires_direct_terminal() {
  case "$1" in
    ensure_env|restore_database|show_mysql_logs|install_native_mysql)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

template_tui_draw() {
  local menu_name="$1"
  local selected_index="$2"
  local status_kind="$3"
  local status_message="$4"
  local width height bar_width filled empty menu_height output_height start_line
  local content_width desc_width max_scroll total_live sb_indicator_pos
  local row idx buffer=""

  # Use cached dimensions (updated by WINCH trap and periodically)
  width=$TEMPLATE_TUI_TERM_COLS
  height=$TEMPLATE_TUI_TERM_LINES

  # Full clear only when terminal resized
  if $TEMPLATE_TUI_NEED_REPAINT; then
    printf '\033[2J'
    TEMPLATE_TUI_NEED_REPAINT=false
  fi

  # Menu items via nameref (no subshell)
  local items_name
  case "$menu_name" in
    main) items_name="TUI_MAIN_ITEMS" ;;
    environment) items_name="TUI_ENV_ITEMS" ;;
    database) items_name="TUI_DB_ITEMS" ;;
    backup) items_name="TUI_BACKUP_ITEMS" ;;
    application) items_name="TUI_APP_ITEMS" ;;
    *) items_name="TUI_MAIN_ITEMS" ;;
  esac
  local -n menu_items="$items_name"

  # Title without subshell
  local title
  case "$menu_name" in
    main) title="Menu principal" ;;
    environment) title="Preparacao e diagnostico" ;;
    database) title="Banco de dados MySQL" ;;
    backup) title="Backup e restore" ;;
    application) title="Aplicacao web" ;;
    *) title="Menu" ;;
  esac

  # Timer without subshell
  local elapsed now_s timer
  printf -v now_s '%(%s)T' -1 2>/dev/null || now_s=$(date +%s)
  elapsed=$(( now_s - TEMPLATE_TUI_STARTED_AT ))
  printf -v timer '%02d:%02d:%02d' $((elapsed / 3600)) $(((elapsed % 3600) / 60)) $((elapsed % 60))

  bar_width=$(( width - 13 ))
  (( bar_width < 10 )) && bar_width=10
  filled=$(( TEMPLATE_TUI_PROGRESS * bar_width / 100 ))
  empty=$(( bar_width - filled ))
  menu_height=${#menu_items[@]}

  # Output height calculation inline (no subshell)
  output_height=$(( height - menu_height - 14 ))
  (( output_height < TEMPLATE_TUI_MIN_OUTPUT_HEIGHT )) && output_height=$TEMPLATE_TUI_MIN_OUTPUT_HEIGHT

  # Clamp scroll inline
  total_live=${#TEMPLATE_TUI_OUTPUT_LINES[@]}
  max_scroll=$(( total_live - output_height ))
  (( max_scroll < 0 )) && max_scroll=0
  (( TEMPLATE_TUI_SCROLL < 0 )) && TEMPLATE_TUI_SCROLL=0
  (( TEMPLATE_TUI_SCROLL > max_scroll )) && TEMPLATE_TUI_SCROLL=$max_scroll

  start_line=$(( total_live - output_height - TEMPLATE_TUI_SCROLL ))
  (( start_line < 0 )) && start_line=0

  # Selected item info
  local selected_record selected_kind selected_target selected_label selected_desc
  selected_record="${menu_items[$selected_index]}"
  IFS='|' read -r selected_kind selected_target selected_label selected_desc <<< "$selected_record"
  local selected_mode="stream ao vivo"
  case "$selected_target" in
    ensure_env|restore_database|show_mysql_logs|install_native_mysql) selected_mode="execucao direta no terminal" ;;
  esac

  # Periodic snapshot refresh (throttled inside)
  template_tui_refresh_snapshot

  content_width=$(( width - 4 ))
  desc_width=$(( width - 44 ))
  (( desc_width < 18 )) && desc_width=18

  # Status prefix/color inline (no subshell)
  local status_prefix status_color
  case "$status_kind" in
    ok) status_prefix="$I_CHECK"; status_color="$C_GREEN" ;;
    err) status_prefix="$I_CROSS"; status_color="$C_RED" ;;
    warn) status_prefix="$I_WARN"; status_color="$C_AMBER" ;;
    *) status_prefix="$I_DOT"; status_color="$C_CYAN" ;;
  esac

  local info_line_1="Tela: $title | SO: $OS_LABEL | pacote: $PACKAGE_MANAGER | app: 127.0.0.1:$PORT"
  local info_line_2="Menu: $selected_label | modo: $selected_mode | admin mysql: ${MYSQL_ADMIN_USER:-nao configurado}"
  local footer_text="[${I_ARR}${I_ARR}] Mover  [Enter] Executar  [a/z] Scroll  [PgUp/v] Pagina  [l] Live  [b] Voltar  [q] Sair"

  # --- Build buffer using inline truncation (no subshells) ---
  buffer=$'\033[H'
  buffer+="${EL}\\n"
  buffer+="${EL}  ${C_GRAY}${I_DOT}${C_RESET} LYRA METACARE ${C_BOLD}v${SCRIPT_VERSION}${C_RESET} ${C_GRAY}— ${timer}${C_RESET}\\n"
  buffer+="${EL}  ${C_CYAN}${C_BOLD}${TEMPLATE_TUI_TASK:0:$content_width}${C_RESET}\\n"

  # --- Progress bar inline (no repeat_char subshell) ---
  buffer+="${EL}  "
  if (( filled > 0 )); then
    buffer+="${C_MINT}"
    printf -v _bar '%.0s━' $(seq 1 $filled)
    buffer+="$_bar"
  fi
  if (( empty > 0 )); then
    buffer+="${C_SEC}"
    printf -v _bar '%.0s─' $(seq 1 $empty)
    buffer+="$_bar"
  fi
  buffer+=" ${C_CYAN}${C_BOLD}${TEMPLATE_TUI_PROGRESS}%${C_RESET}\\n"

  # Separator
  printf -v _sep '%.0s─' $(seq 1 $content_width)
  buffer+="${EL}  ${C_SEC}${C_DIM}${_sep}${C_RESET}\\n"

  # --- Info lines (inline truncation) ---
  buffer+="${EL}  ${C_SEC}${C_DIM}${info_line_1:0:$content_width}${C_RESET}\\n"
  buffer+="${EL}  ${C_SEC}${C_DIM}${info_line_2:0:$content_width}${C_RESET}\\n"
  buffer+="${EL}\\n"

  # --- Menu items (inline padding, no fit_text subshell) ---
  row=0
  while (( row < menu_height )); do
    local record kind target label desc
    record="${menu_items[$row]}"
    IFS='|' read -r kind target label desc <<< "$record"
    local padded_label
    printf -v padded_label '%-28s' "${label:0:28}"
    if (( row == selected_index )); then
      buffer+="${EL}  ${C_BG_HOVER}${C_CYAN}${C_BOLD}${I_ARR}  ${padded_label} ${C_RESET} ${C_SEC}${desc:0:$desc_width}${C_RESET}\\n"
    else
      buffer+="${EL}     ${C_SEC}${padded_label} ${C_RESET} ${C_GRAY}${desc:0:$desc_width}${C_RESET}\\n"
    fi
    (( row += 1 ))
  done

  # --- Live output ---
  buffer+="${EL}\\n"
  if (( TEMPLATE_TUI_SCROLL > 0 )); then
    buffer+="${EL}  ${C_GRAY}${I_TERM} LIVE OUTPUT:${C_RESET} ${C_AMBER}[SCROLL: -${TEMPLATE_TUI_SCROLL}]${C_RESET}\\n"
  else
    buffer+="${EL}  ${C_GRAY}${I_TERM} LIVE OUTPUT:${C_RESET}\\n"
  fi

  sb_indicator_pos=0
  if (( total_live > output_height )); then
    local max_sc_sb=$(( total_live - output_height ))
    (( max_sc_sb > 0 )) && sb_indicator_pos=$(( TEMPLATE_TUI_SCROLL * (output_height - 1) / max_sc_sb ))
  fi

  local live_width=$(( content_width - 6 ))
  row=0
  while (( row < output_height )); do
    idx=$(( start_line + row ))
    local live_line=""
    if (( idx < total_live )); then
      live_line="${TEMPLATE_TUI_OUTPUT_LINES[$idx]}"
    fi
    local sb_char="${C_SEC}┃${C_RESET}"
    if (( total_live > output_height )); then
      if (( (output_height - 1 - row) == sb_indicator_pos )); then
        sb_char="${C_CYAN}█${C_RESET}"
      fi
    fi
    buffer+="${EL}  ${sb_char} ${C_AMBER}${live_line:0:$live_width}${C_RESET}\\n"
    (( row += 1 ))
  done

  # --- Status bar ---
  buffer+="${EL}\\n"
  buffer+="${EL}  ${C_SEC}${C_DIM}STATUS:${C_RESET} ${status_color}${status_prefix} ${status_message:0:$((content_width - 12))}${C_RESET}\\n"
  buffer+="${EL}  ${C_GRAY}${TEMPLATE_TUI_MYSQL_STATE:0:$content_width}${C_RESET}\\n"
  buffer+="${EL}  ${C_GRAY}${TEMPLATE_TUI_APP_STATE:0:$content_width}${C_RESET}\\n"
  buffer+="${EL}  ${C_GRAY}${TEMPLATE_TUI_BOOTSTRAP_STATE:0:$content_width}${C_RESET}\\n"
  buffer+="${EL}\\n"
  buffer+="${EL}  ${C_SEC}${C_DIM}${footer_text:0:$content_width}${C_RESET}"

  printf '%b\033[J' "$buffer"
}

template_tui_run_action() {
  local action_fn="$1"
  local action_label="$2"
  local menu_name="$3"
  local selected_index="$4"
  local status_kind_ref="$5"
  local status_message_ref="$6"
  local line="" action_fd="" action_pid=""
  local exit_code=0

  TEMPLATE_TUI_TASK="$action_label"
  TEMPLATE_TUI_PROGRESS=12
  TEMPLATE_TUI_SCROLL=0
  TEMPLATE_TUI_OUTPUT_LINES=()
  template_tui_append_output "[INFO] Iniciando: $action_label"
  printf -v "$status_kind_ref" '%s' "info"
  printf -v "$status_message_ref" '%s' "Executando $action_label"
  template_tui_draw "$menu_name" "$selected_index" "${!status_kind_ref}" "${!status_message_ref}"

  if template_tui_action_requires_direct_terminal "$action_fn"; then
    template_tui_append_output "[INFO] Esta acao precisa do terminal direto para preservar prompts e credenciais reais."
    template_tui_draw "$menu_name" "$selected_index" "${!status_kind_ref}" "${!status_message_ref}"
    tui_leave_screen
    printf '\n%s%s%s\n' "$C_BOLD" "$action_label" "$C_RESET"
    if [[ "$action_fn" == "show_mysql_logs" ]]; then
      printf 'Use Ctrl+C para interromper o stream e voltar ao menu.\n\n'
    else
      printf 'A execucao abaixo esta no terminal direto para manter prompts e interacoes reais.\n\n'
    fi
    set +e
    "$action_fn"
    exit_code=$?
    set -e
    tui_enter_screen
  else
    set +e
    coproc TEMPLATE_TUI_ACTION { "$action_fn" 2>&1; }
    action_fd="${TEMPLATE_TUI_ACTION[0]}"
    action_pid="$TEMPLATE_TUI_ACTION_PID"
    while true; do
      if IFS= read -r -t 0.1 -u "$action_fd" line 2>/dev/null; then
        template_tui_append_output "$line"
        if (( TEMPLATE_TUI_PROGRESS < 90 )); then
          (( TEMPLATE_TUI_PROGRESS += 2 ))
        fi
      else
        if ! kill -0 "$action_pid" 2>/dev/null; then
          break
        fi
        if (( TEMPLATE_TUI_PROGRESS < 90 )); then
          (( TEMPLATE_TUI_PROGRESS += 1 ))
        fi
      fi
      template_tui_draw "$menu_name" "$selected_index" "${!status_kind_ref}" "${!status_message_ref}"
    done
    # Drain any remaining output from the coproc after process exits
    while IFS= read -r -t 0.1 -u "$action_fd" line 2>/dev/null; do
      template_tui_append_output "$line"
    done
    wait "$action_pid"
    exit_code=$?
    set -e
  fi

  TEMPLATE_TUI_PROGRESS=100
  if (( exit_code == 0 )); then
    template_tui_append_output "[OK] Concluido: $action_label"
    printf -v "$status_kind_ref" '%s' "ok"
    printf -v "$status_message_ref" '%s' "$action_label concluido. Pressione Enter para continuar."
  else
    template_tui_append_output "[ERRO] Falha: $action_label (codigo $exit_code)"
    printf -v "$status_kind_ref" '%s' "err"
    printf -v "$status_message_ref" '%s' "$action_label falhou com codigo $exit_code. Pressione Enter para continuar."
  fi

  template_tui_draw "$menu_name" "$selected_index" "${!status_kind_ref}" "${!status_message_ref}"

  # Drain any leftover bytes from terminal input buffer (escape sequences, etc.)
  while read -rsn1 -t 0.05 _ 2>/dev/null; do :; done

  # Wait for Enter (empty key = Enter pressed), with a timeout-based redraw
  # to keep the screen responsive and avoid permanent hang
  while true; do
    if read -rsn1 -t 2 line; then
      [[ -z "$line" ]] && break
    fi
  done
  TEMPLATE_TUI_TASK="Standby"
  TEMPLATE_TUI_PROGRESS=0
  return 0
}

template_tui_menu() {
  local current_menu="main"
  local selected_index=0
  local status_kind="info"
  local status_message="Pronto para operar localmente com MySQL nativo e app sem containers."
  local key="" seq="" items_name="" selected_record="" kind="" target="" label="" desc=""

  resolve_commands
  select_package_manager
  export_runtime_env

  TEMPLATE_TUI_STARTED_AT="$(date +%s)"
  TEMPLATE_TUI_TASK="Standby"
  TEMPLATE_TUI_PROGRESS=0
  TEMPLATE_TUI_OUTPUT_LINES=("Aguardando uma acao do operador.")
  TEMPLATE_TUI_SCROLL=0
  TEMPLATE_TUI_LAST_SNAPSHOT_AT=0

  template_tui_update_dimensions
  trap template_tui_update_dimensions WINCH

  tui_enter_screen
  trap 'tui_leave_screen; exit 0' INT TERM EXIT
  template_tui_boot_sequence

  while true; do
    # Resolve items_name inline (no subshell)
    case "$current_menu" in
      main) items_name="TUI_MAIN_ITEMS" ;;
      environment) items_name="TUI_ENV_ITEMS" ;;
      database) items_name="TUI_DB_ITEMS" ;;
      backup) items_name="TUI_BACKUP_ITEMS" ;;
      application) items_name="TUI_APP_ITEMS" ;;
      *) items_name="TUI_MAIN_ITEMS" ;;
    esac
    local -n current_items="$items_name"
    (( selected_index < 0 )) && selected_index=0
    (( selected_index >= ${#current_items[@]} )) && selected_index=$((${#current_items[@]} - 1))
    template_tui_draw "$current_menu" "$selected_index" "$status_kind" "$status_message"

    if read -rsn1 -t 0.25 key; then
      case "$key" in
        $'\x1b')
          read -rsn2 -t 0.05 seq || true
          case "$seq" in
            "[A") (( selected_index > 0 )) && (( selected_index -= 1 )) ;;
            "[B") (( selected_index < ${#current_items[@]} - 1 )) && (( selected_index += 1 )) ;;
            "[D") current_menu="main"; selected_index=0 ;;
            "[5~") template_tui_scroll_page "$current_menu" "up" ;;
            "[6~") template_tui_scroll_page "$current_menu" "down" ;;
          esac
          ;;
        k) (( selected_index > 0 )) && (( selected_index -= 1 )) ;;
        j) (( selected_index < ${#current_items[@]} - 1 )) && (( selected_index += 1 )) ;;
        a|A) template_tui_scroll_lines "$current_menu" 1 ;;
        z|Z) template_tui_scroll_lines "$current_menu" -1 ;;
        v|V) template_tui_scroll_page "$current_menu" "down" ;;
        l|L) template_tui_show_output_viewer ;;
        b|B)
          current_menu="main"
          selected_index=0
          status_kind="info"
          status_message="Retornado ao menu principal."
          ;;
        q|Q)
          break
          ;;
        "")
          TEMPLATE_TUI_SCROLL=0
          selected_record="${current_items[$selected_index]}"
          IFS='|' read -r kind target label desc <<< "$selected_record"
          case "$kind" in
            submenu)
              current_menu="$target"
              selected_index=0
              status_kind="info"
              status_message="$label aberto."
              ;;
            back)
              current_menu="$target"
              selected_index=0
              status_kind="info"
              status_message="Retornado ao menu principal."
              ;;
            exit)
              break
              ;;
            action)
              template_tui_run_action "$target" "$label" "$current_menu" "$selected_index" status_kind status_message
              ;;
          esac
          ;;
      esac
    fi
  done

  trap - INT TERM EXIT WINCH
  tui_leave_screen
}

help_text() {
  cat <<'HELP'
Uso:
  ./run.sh                abre o menu interativo
  ./run.sh doctor         valida requisitos do sistema
  ./run.sh install        instala dependencias somente se necessario
  ./run.sh config         cria ou atualiza .env.local
  ./run.sh show-config    mostra configuracao efetiva com segredos mascarados
  ./run.sh mysql-install  instala o MySQL nativo se ele ainda nao existir
  ./run.sh mysql-up       sobe o MySQL local
  ./run.sh migrate        sobe MySQL e aplica migracoes
  ./run.sh verify-db      verifica se o schema e as tabelas do app estao consistentes
  ./run.sh backup         gera backup full do banco do app
  ./run.sh restore        restaura backup full para um schema alvo seguro
  ./run.sh logs mysql     acompanha os logs do MySQL nativo local
  ./run.sh dev            instala, configura, sobe MySQL, migra e inicia o app em desenvolvimento
  ./run.sh fast-dev       sobe MySQL e inicia o app sem reinstalar
  ./run.sh prod           instala, configura, sobe MySQL, migra, builda e inicia o app em producao
  ./run.sh fast-prod      sobe MySQL e inicia o app com build existente
  ./run.sh status         mostra status do ambiente local
  ./run.sh health         mostra checks operacionais
  ./run.sh stop-app       encerra a aplicacao gerenciada por este script
  ./run.sh stop-all       encerra apenas a aplicacao gerenciada pelo script
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
    show-config) show_config_summary ;;
    mysql-install) install_native_mysql ;;
    mysql-up) mysql_up ;;
    migrate) mysql_migrate ;;
    verify-db) install_deps; section "Preparando MySQL nativo local"; prepare_mysql_runtime; verify_database_state ;;
    backup) backup_database ;;
    restore) restore_database ;;
    dev) dev_mode ;;
    fast-dev) fast_dev_mode ;;
    prod) prod_mode ;;
    fast-prod) fast_prod_mode ;;
    status) status_report ;;
    health) health_report ;;
    logs)
      [[ "${2:-mysql}" == "mysql" ]] || die "Apenas logs do MySQL nativo estao disponiveis no run.sh."
      show_mysql_logs
      ;;
    stop-app) stop_app ;;
    stop-all) stop_all ;;
    help|-h|--help) help_text ;;
    *) die "Comando desconhecido: $1" ;;
  esac
}

main "$@"
