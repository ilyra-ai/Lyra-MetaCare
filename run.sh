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
readonly BACKUP_DIR="$ROOT_DIR/backups/mysql"
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
declare -g APP_PORT="$DEFAULT_APP_PORT"
declare -g OS_FAMILY=""
declare -g OS_LABEL=""
declare -g NODE_CMD=""
declare -gA ENV_MAP=()

mkdir -p "$STATE_DIR"

log_info() { printf '%s[INFO]%s %s\n' "$C_CYAN" "$C_RESET" "$1"; }
log_ok() { printf '%s[OK]%s %s\n' "$C_GREEN" "$C_RESET" "$1"; }
log_warn() { printf '%s[AVISO]%s %s\n' "$C_YELLOW" "$C_RESET" "$1"; }
log_error() { printf '%s[ERRO]%s %s\n' "$C_RED" "$C_RESET" "$1" >&2; }
die() { log_error "$1"; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

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
  export MYSQL_ADMIN_USER="$(env_value MYSQL_ADMIN_USER "root")"
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

native_mysql_installed() {
  resolve_commands
  if [[ "$OS_FAMILY" == "windows" ]] && have powershell.exe; then
    (( ${#MYSQLD_CMD[@]} > 0 )) && return 0
    powershell.exe -NoProfile -Command "if (Get-Service -ErrorAction SilentlyContinue | Where-Object { \$_.Name -match 'mysql|mariadb' }) { exit 0 } else { exit 1 }" >/dev/null 2>&1
    return $?
  fi

  if (( ${#MYSQLD_CMD[@]} > 0 )); then
    return 0
  fi

  if (( ${#SYSTEMCTL_CMD[@]} > 0 )); then
    "${SYSTEMCTL_CMD[@]}" list-unit-files mysql.service >/dev/null 2>&1 && return 0
    "${SYSTEMCTL_CMD[@]}" list-unit-files mariadb.service >/dev/null 2>&1 && return 0
  fi

  if (( ${#SERVICE_CMD[@]} > 0 )); then
    "${SERVICE_CMD[@]}" --status-all 2>&1 | grep -Eiq 'mysql|mariadb' && return 0
  fi

  return 1
}

mysql_runtime() {
  printf 'native'
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
  have git && log_ok "Git disponivel." || die "Git nao encontrado."
  [[ -n "$NODE_CMD" ]] && log_ok "Node.js disponivel: $("$NODE_CMD" --version)" || die "Node.js nao encontrado."
  (( ${#NPM_CMD[@]} > 0 )) && log_ok "npm disponivel: $("${NPM_CMD[@]}" --version)" || die "npm nao encontrado."

  if [[ "$PACKAGE_MANAGER" == "pnpm" ]]; then
    if (( ${#PNPM_CMD[@]} > 0 )); then
      log_ok "pnpm disponivel: $("${PNPM_CMD[@]}" --version)"
    elif (( ${#COREPACK_CMD[@]} > 0 )); then
      log_warn "pnpm ausente, mas sera ativado automaticamente quando necessario."
    else
      die "pnpm ausente e corepack indisponivel."
    fi
  fi

  native_mysql_installed && log_ok "Servico MySQL nativo detectado." || log_warn "Nao foi detectado servico MySQL nativo instalado."
  (( ${#MYSQL_CLIENT_CMD[@]} > 0 )) && log_ok "Cliente mysql disponivel." || log_warn "Cliente mysql nao encontrado."
  (( ${#MYSQLDUMP_CMD[@]} > 0 )) && log_ok "mysqldump disponivel." || log_warn "mysqldump nao encontrado."
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
  local mysql_admin_user
  local mysql_admin_password
  local auth_secret
  local admin_email
  local admin_password
  local admin_first_name
  local admin_last_name
  local port_value

  mysql_host="$(ask_value "Host do MySQL local" "$(env_value MYSQL_HOST "$DEFAULT_MYSQL_HOST")")"
  mysql_host_port="$(ask_value "Porta publicada do MySQL" "$(env_value MYSQL_HOST_PORT "3306")")"
  mysql_port="$(ask_value "Porta do MySQL para a aplicacao" "$(env_value MYSQL_PORT "$mysql_host_port")")"
  mysql_database="$(ask_value "Banco MySQL" "$(env_value MYSQL_DATABASE "$DEFAULT_MYSQL_DATABASE")")"
  mysql_user="$(ask_value "Usuario MySQL da aplicacao" "$(env_value MYSQL_USER "$DEFAULT_MYSQL_USER")")"
  mysql_password="$(ask_value "Senha MySQL da aplicacao" "$(env_value MYSQL_PASSWORD "$DEFAULT_MYSQL_PASSWORD")" 1)"
  mysql_root_password="$(ask_value "Senha root do MySQL (opcional se usar admin dedicado ou sudo)" "$(env_value MYSQL_ROOT_PASSWORD "")" 1)"
  mysql_admin_user="$(ask_value "Usuario administrativo do MySQL" "$(env_value MYSQL_ADMIN_USER "root")")"
  mysql_admin_password="$(ask_value "Senha do usuario administrativo do MySQL" "$(env_value MYSQL_ADMIN_PASSWORD "$(env_value MYSQL_ROOT_PASSWORD "")")" 1)"
  auth_secret="$(env_value AUTH_SECRET "")"
  admin_email="$(ask_value "Email do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_EMAIL "$DEFAULT_ADMIN_EMAIL")")"
  admin_password="$(ask_value "Senha do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_PASSWORD "")" 1)"
  admin_first_name="$(ask_value "Nome do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_FIRST_NAME "$DEFAULT_ADMIN_FIRST_NAME")")"
  admin_last_name="$(ask_value "Sobrenome do admin bootstrap" "$(env_value ADMIN_BOOTSTRAP_LAST_NAME "$DEFAULT_ADMIN_LAST_NAME")")"
  port_value="$(ask_value "Porta HTTP local da aplicacao" "$(env_value PORT "$DEFAULT_APP_PORT")")"

  [[ -z "$auth_secret" ]] && auth_secret="$(generate_hex)"
  [[ -z "$admin_password" ]] && admin_password="$(generate_password)"

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
  if (( ${#MYSQLADMIN_CMD[@]} > 0 )); then
    if "${MYSQLADMIN_CMD[@]}" ping -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" "-p$MYSQL_PASSWORD" --silent >/dev/null 2>&1; then
      return 0
    fi
    "${MYSQLADMIN_CMD[@]}" ping -h"$MYSQL_HOST" -P"$MYSQL_PORT" -uroot "-p$MYSQL_ROOT_PASSWORD" --silent >/dev/null 2>&1
    return $?
  fi

  if [[ -n "$NODE_CMD" && -d "$ROOT_DIR/node_modules" ]]; then
    "$NODE_CMD" - <<'NODE' >/dev/null 2>&1
const mysql = require('mysql2/promise');
(async () => {
  const attempts = [
    { user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD },
    { user: 'root', password: process.env.MYSQL_ROOT_PASSWORD },
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

  if [[ "$OS_FAMILY" == "windows" ]] && have powershell.exe; then
    powershell.exe -NoProfile -Command "\$service = Get-Service -ErrorAction SilentlyContinue | Where-Object { \$_.Name -match 'mysql|mariadb' } | Select-Object -First 1; if (-not \$service) { exit 1 }; if (\$service.Status -ne 'Running') { Start-Service -Name \$service.Name }; exit 0" >/dev/null 2>&1 || die "MySQL nativo detectado, mas nao foi possivel iniciar o servico no Windows."
  elif (( ${#SYSTEMCTL_CMD[@]} > 0 )); then
    "${SYSTEMCTL_CMD[@]}" is-active --quiet mysql >/dev/null 2>&1 || "${SYSTEMCTL_CMD[@]}" start mysql >/dev/null 2>&1 || "${SYSTEMCTL_CMD[@]}" start mariadb >/dev/null 2>&1 || true
  elif (( ${#SERVICE_CMD[@]} > 0 )); then
    "${SERVICE_CMD[@]}" mysql status >/dev/null 2>&1 || "${SERVICE_CMD[@]}" mysql start >/dev/null 2>&1 || "${SERVICE_CMD[@]}" mariadb start >/dev/null 2>&1 || true
  fi

  mysql_tcp_open || die "MySQL nativo foi detectado, mas a porta configurada nao respondeu apos a tentativa de inicializacao."
}

ensure_database_exists() {
  export_runtime_env
  [[ -d "$ROOT_DIR/node_modules" ]] || die "Dependencias ausentes. Execute ./run.sh install antes de preparar o banco."
  "$NODE_CMD" - <<'NODE'
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
  } catch {}

  if (process.env.MYSQL_ADMIN_PASSWORD) {
    const adminConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_ADMIN_USER || 'root',
      password: process.env.MYSQL_ADMIN_PASSWORD,
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

  if [[ $? -eq 0 ]]; then
    return 0
  fi

  if [[ "$OS_FAMILY" != "windows" ]] && sudo -n true >/dev/null 2>&1; then
    local sql
    sql="CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    sql+=" CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';"
    sql+=" CREATE USER IF NOT EXISTS '$MYSQL_USER'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
    sql+=" GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '$MYSQL_USER'@'%';"
    sql+=" GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '$MYSQL_USER'@'localhost';"
    sql+=" FLUSH PRIVILEGES;"
    sudo -n mysql -e "$sql"
    return 0
  fi

  die "Nao foi possivel criar ou validar o schema do app no MySQL nativo. Informe credenciais administrativas validas ou habilite acesso sudo ao mysql."
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
  if [[ -n "$MYSQL_ADMIN_PASSWORD" ]]; then
    TARGET_DATABASE="$target_database" "$NODE_CMD" - <<'NODE'
const mysql = require('mysql2/promise');

(async () => {
  const target = process.env.TARGET_DATABASE;
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
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

  if [[ "$OS_FAMILY" != "windows" ]] && sudo -n true >/dev/null 2>&1; then
    local check_sql
    check_sql="CREATE DATABASE IF NOT EXISTS \`$target_database\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    sudo -n mysql -e "$check_sql"
    local table_count
    table_count="$(sudo -n mysql -N -B -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$target_database';")"
    [[ "${table_count:-0}" == "0" ]] || die "O schema alvo $target_database ja possui tabelas. O restore full exige um schema vazio."
    return 0
  fi

  die "Restore full exige credenciais administrativas validas ou acesso sudo ao mysql."
}

backup_database() {
  install_deps
  mysql_up
  export_runtime_env
  ensure_backup_dir

  local timestamp
  local backup_file
  timestamp="$(date +%Y%m%d_%H%M%S)"
  backup_file="$BACKUP_DIR/${MYSQL_DATABASE}_${timestamp}.sql"

  section "Backup full do banco"
  if [[ "$(mysql_runtime)" == "docker" ]]; then
    "${DOCKER_CMD[@]}" exec "$MYSQL_CONTAINER_NAME" sh -lc "exec mysqldump -uroot -p\"$MYSQL_ROOT_PASSWORD\" --single-transaction --routines --triggers --events --hex-blob --set-gtid-purged=OFF --no-tablespaces \"$MYSQL_DATABASE\"" > "$backup_file"
  else
    (( ${#MYSQLDUMP_CMD[@]} > 0 )) || die "mysqldump nao encontrado no ambiente nativo."
    "${MYSQLDUMP_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" -uroot "-p$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers --events --hex-blob --set-gtid-purged=OFF --no-tablespaces "$MYSQL_DATABASE" > "$backup_file"
  fi

  if (( ${#GZIP_CMD[@]} > 0 )); then
    "${GZIP_CMD[@]}" -f "$backup_file"
    backup_file="${backup_file}.gz"
  fi

  log_ok "Backup full gerado em: $backup_file"
}

restore_database() {
  install_deps
  mysql_up
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
  if [[ "$backup_path" == *.gz ]]; then
    (( ${#GZIP_CMD[@]} > 0 )) || die "gzip nao encontrado para restaurar arquivo compactado."
    if [[ "$(mysql_runtime)" == "docker" ]]; then
      "${GZIP_CMD[@]}" -dc "$backup_path" | "${DOCKER_CMD[@]}" exec -i "$MYSQL_CONTAINER_NAME" mysql -uroot "-p$MYSQL_ROOT_PASSWORD" "$target_database"
    else
      (( ${#MYSQL_CLIENT_CMD[@]} > 0 )) || die "Cliente mysql nao encontrado no ambiente nativo."
      "${GZIP_CMD[@]}" -dc "$backup_path" | "${MYSQL_CLIENT_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" -uroot "-p$MYSQL_ROOT_PASSWORD" "$target_database"
    fi
  else
    if [[ "$(mysql_runtime)" == "docker" ]]; then
      "${DOCKER_CMD[@]}" exec -i "$MYSQL_CONTAINER_NAME" mysql -uroot "-p$MYSQL_ROOT_PASSWORD" "$target_database" < "$backup_path"
    else
      (( ${#MYSQL_CLIENT_CMD[@]} > 0 )) || die "Cliente mysql nao encontrado no ambiente nativo."
      "${MYSQL_CLIENT_CMD[@]}" -h"$MYSQL_HOST" -P"$MYSQL_PORT" -uroot "-p$MYSQL_ROOT_PASSWORD" "$target_database" < "$backup_path"
    fi
  fi

  log_ok "Restore full concluido no schema seguro: $target_database"
}

docker_mysql_running() {
  local id
  id="$(compose ps -q mysql 2>/dev/null || true)"
  [[ -n "$id" ]] || return 1
  "${DOCKER_CMD[@]}" inspect --format '{{.State.Running}}' "$id" 2>/dev/null | grep -qi '^true$'
}

docker_mysql_health() {
  local id
  id="$(compose ps -q mysql 2>/dev/null || true)"
  [[ -n "$id" ]] || return 1
  "${DOCKER_CMD[@]}" inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$id" 2>/dev/null
}

wait_mysql() {
  local attempt=1
  while (( attempt <= 60 )); do
    if [[ "$(docker_mysql_health || true)" == "healthy" ]]; then
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
  install_deps
  ensure_env_ready
  doctor
  local runtime
  runtime="$(mysql_runtime)"

  if [[ "$runtime" == "native" ]]; then
    start_native_mysql
    ensure_database_exists
    log_ok "MySQL nativo pronto para uso pelo app."
    return 0
  fi

  section "Subindo MySQL local via Docker"
  compose up -d mysql
  wait_mysql
  ensure_database_exists
  log_ok "MySQL local via Docker pronto para uso pelo app."
}

mysql_migrate() {
  install_deps
  ensure_env_ready
  mysql_up
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
  local runtime
  runtime="$(mysql_runtime)"
  if [[ "$runtime" == "native" ]]; then
    log_warn "MySQL nativo detectado. O run.sh nao encerra servicos nativos automaticamente."
    return 0
  fi
  section "Parando MySQL local"
  compose stop mysql
  log_ok "MySQL local parado."
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

  local runtime
  runtime="$(mysql_runtime)"
  log_ok "Runtime MySQL selecionado: $runtime"

  if [[ "$runtime" == "native" ]]; then
    if native_mysql_responding; then
      log_ok "MySQL nativo acessivel."
    else
      log_warn "MySQL nativo detectado, mas nao acessivel com as credenciais atuais."
    fi
  else
    if docker_mysql_running; then
      log_ok "MySQL em execucao via Docker. Health: $(docker_mysql_health || printf 'desconhecido')"
    else
      log_warn "MySQL local via Docker parado."
    fi
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

  local runtime
  runtime="$(mysql_runtime)"
  if [[ "$runtime" == "native" ]]; then
    if native_mysql_responding; then
      log_ok "MySQL nativo em execucao e acessivel."
    else
      log_warn "MySQL nativo detectado, mas ainda nao esta acessivel."
    fi
  else
    if docker_mysql_running; then
      log_ok "MySQL via Docker em execucao."
    else
      log_warn "MySQL via Docker nao esta ativo."
    fi
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
    printf '  4. Mostrar status consolidado\n'
    printf '  5. Rodar check de saude operacional\n'
    printf '  0. Voltar\n\n'
    read -r -p "Escolha uma opcao: " choice
    case "$choice" in
      1) doctor ;;
      2) install_deps ;;
      3) ensure_env ;;
      4) status_report ;;
      5) health_report ;;
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
    printf '  1. Preparar MySQL local para o app\n'
    printf '  2. Criar schema do app se necessario\n'
    printf '  3. Aplicar migracoes MySQL\n'
    printf '  4. Verificar schema e tabelas do app\n'
    printf '  5. Logs do MySQL em Docker\n'
    printf '  6. Parar MySQL gerenciado por Docker\n'
    printf '  0. Voltar\n\n'
    read -r -p "Escolha uma opcao: " choice
    case "$choice" in
      1) mysql_up ;;
      2) install_deps; ensure_env_ready; mysql_up; ensure_database_exists; log_ok "Schema do app garantido sem apagar dados existentes." ;;
      3) mysql_migrate ;;
      4) install_deps; ensure_env_ready; mysql_up; verify_database_state ;;
      5)
        [[ "$(mysql_runtime)" == "docker" ]] || die "Logs integrados so estao disponiveis quando o MySQL esta sendo gerenciado via Docker."
        compose logs -f mysql
        ;;
      6) mysql_down ;;
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

menu() {
  local choice=""
  while true; do
    banner
    printf '%sMenu principal%s\n' "$C_BOLD" "$C_RESET"
    printf '  1. Preparacao e diagnostico\n'
    printf '  2. Banco de dados MySQL\n'
    printf '  3. Backup e restore\n'
    printf '  4. Aplicacao web\n'
    printf '  0. Sair\n\n'
    read -r -p "Escolha uma opcao: " choice
    case "$choice" in
      1) environment_menu ;;
      2) database_menu ;;
      3) backup_menu ;;
      4) application_menu ;;
      0) break ;;
      *) log_warn "Opcao invalida." ;;
    esac
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
  ./run.sh verify-db      verifica se o schema e as tabelas do app estao consistentes
  ./run.sh backup         gera backup full do banco do app
  ./run.sh restore        restaura backup full para um schema alvo seguro
  ./run.sh dev            instala, configura, sobe MySQL, migra e inicia o app em desenvolvimento
  ./run.sh fast-dev       sobe MySQL e inicia o app sem reinstalar
  ./run.sh prod           instala, configura, sobe MySQL, migra, builda e inicia o app em producao
  ./run.sh fast-prod      sobe MySQL e inicia o app com build existente
  ./run.sh status         mostra status do ambiente local
  ./run.sh health         mostra checks operacionais
  ./run.sh logs mysql     acompanha logs do MySQL quando o runtime estiver em Docker
  ./run.sh stop-app       encerra a aplicacao gerenciada por este script
  ./run.sh mysql-down     para apenas o MySQL gerenciado por Docker
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
    verify-db) install_deps; ensure_env_ready; mysql_up; verify_database_state ;;
    backup) backup_database ;;
    restore) restore_database ;;
    dev) dev_mode ;;
    fast-dev) fast_dev_mode ;;
    prod) prod_mode ;;
    fast-prod) fast_prod_mode ;;
    status) status_report ;;
    health) health_report ;;
    logs)
      [[ "${2:-mysql}" == "mysql" ]] || die "Apenas logs do MySQL estao disponiveis sem persistencia em arquivo."
      [[ "$(mysql_runtime)" == "docker" ]] || die "Logs integrados so estao disponiveis quando o MySQL esta sendo gerenciado via Docker."
      compose logs -f mysql
      ;;
    stop-app) stop_app ;;
    mysql-down) mysql_down ;;
    stop-all) stop_all ;;
    help|-h|--help) help_text ;;
    *) die "Comando desconhecido: $1" ;;
  esac
}

main "$@"
