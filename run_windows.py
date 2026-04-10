#!/usr/bin/env python3
"""
Lyra MetaCare - Orquestrador local para Windows
==============================================

Objetivo:
- Subir o MySQL via Docker Compose.
- Aplicar as migracoes reais do projeto.
- Levantar o app Next.js em modo dev ou prod no Windows.
- Fazer checks de saude e status do ambiente.

Este arquivo existe porque `run.py` foi desenhado para WSL/Ubuntu e nao
representa com fidelidade o fluxo real do projeto no Windows.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parent
ENV_FILE = ROOT_DIR / ".env.local"
COMPOSE_FILE = ROOT_DIR / "compose.yaml"
MIGRATE_SCRIPT = ROOT_DIR / "scripts" / "mysql-migrate.mjs"
STATE_DIR = ROOT_DIR / ".lyra-run-windows"
LOG_DIR = ROOT_DIR / ".logs"
APP_PID_FILE = STATE_DIR / "app.pid"
APP_META_FILE = STATE_DIR / "app.meta.json"
INSTALL_HASH_FILE = STATE_DIR / "install.hash"

DEFAULT_ENV = {
    "APP_BASE_URL": "http://localhost:3000",
    "NEXT_PUBLIC_APP_URL": "http://localhost:3000",
    "MYSQL_HOST": "127.0.0.1",
    "MYSQL_HOST_PORT": "3307",
    "MYSQL_PORT": "3307",
    "MYSQL_USER": "lyra",
    "MYSQL_PASSWORD": "lyra_mysql_local_2026",
    "MYSQL_ROOT_PASSWORD": "lyra_mysql_root_2026",
    "MYSQL_DATABASE": "lyra_metacare",
    "ADMIN_BOOTSTRAP_EMAIL": "admin@coragem.pet",
    "ADMIN_BOOTSTRAP_PASSWORD": "admin123",
    "ADMIN_BOOTSTRAP_FIRST_NAME": "Admin",
    "ADMIN_BOOTSTRAP_LAST_NAME": "Coragem",
    "ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS": '[{"email":"admin@admin.com","password":"admin123","firstName":"Admin","lastName":"Principal"}]',
}


@dataclass
class CommandResult:
    code: int
    stdout: str = ""
    stderr: str = ""


def emit_info(message: str) -> None:
    print(f"[INFO] {message}")


def emit_ok(message: str) -> None:
    print(f"[OK] {message}")


def emit_warn(message: str) -> None:
    print(f"[WARN] {message}")


def emit_error(message: str) -> None:
    print(f"[ERRO] {message}")


def have(command: str) -> bool:
    return shutil.which(command) is not None


def generate_secret(length: int = 32) -> str:
    return os.urandom(length).hex()


def run_cmd(
    cmd: list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    capture: bool = False,
    check: bool = True,
    timeout: int | None = None,
) -> CommandResult:
    process = subprocess.run(
        cmd,
        cwd=cwd or ROOT_DIR,
        env={**os.environ, **(env or {})},
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
        timeout=timeout,
        check=False,
    )
    if check and process.returncode != 0:
        raise subprocess.CalledProcessError(
            process.returncode,
            cmd,
            output=process.stdout,
            stderr=process.stderr,
        )
    return CommandResult(
        code=process.returncode,
        stdout=process.stdout or "",
        stderr=process.stderr or "",
    )


def run_cmd_live(
    cmd: list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
) -> int:
    process = subprocess.Popen(
        cmd,
        cwd=cwd or ROOT_DIR,
        env={**os.environ, **(env or {})},
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    assert process.stdout is not None
    for line in process.stdout:
        print(line.rstrip("\r\n"))
    process.wait()
    return process.returncode


class EnvManager:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.cache: dict[str, str] = {}

    def load(self) -> dict[str, str]:
        self.cache.clear()
        if not self.path.exists():
            return self.cache
        for raw_line in self.path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            value = value.strip()
            if (value.startswith('"') and value.endswith('"')) or (
                value.startswith("'") and value.endswith("'")
            ):
                value = value[1:-1]
            self.cache[key.strip()] = value
        return self.cache

    def get(self, key: str, fallback: str = "") -> str:
        if not self.cache:
            self.load()
        return self.cache.get(key, fallback)

    def upsert(self, key: str, value: str) -> None:
        current_lines = []
        encoded = value
        if any(char in value for char in [" ", "#", "[", "]", "{", "}", '"']):
            encoded = json.dumps(value, ensure_ascii=False)

        replaced = False
        if self.path.exists():
            for raw_line in self.path.read_text(encoding="utf-8").splitlines():
                if raw_line.strip().startswith(f"{key}="):
                    current_lines.append(f"{key}={encoded}")
                    replaced = True
                else:
                    current_lines.append(raw_line)
        if not replaced:
            current_lines.append(f"{key}={encoded}")
        self.path.write_text("\n".join(current_lines) + "\n", encoding="utf-8")
        self.cache[key] = value

    def ensure_defaults(self) -> None:
        self.load()
        for key, value in DEFAULT_ENV.items():
            if not self.get(key):
                self.upsert(key, value)
        if not self.get("AUTH_SECRET"):
            self.upsert("AUTH_SECRET", generate_secret())

    def export(self) -> dict[str, str]:
        self.load()
        return dict(self.cache)


env_mgr = EnvManager(ENV_FILE)


def package_manager() -> str:
    if (ROOT_DIR / "pnpm-lock.yaml").exists() and have("pnpm"):
        return "pnpm"
    return "npm"


def package_binary() -> str:
    manager = package_manager()
    candidates = [f"{manager}.cmd", manager]
    for candidate in candidates:
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    return candidates[0]


def package_install_cmd() -> list[str]:
    return [package_binary(), "install"]


def package_run_cmd(script: str) -> list[str]:
    return [package_binary(), "run", script]


def compute_install_hash() -> str:
    hasher = hashlib.sha256()
    for path in [
        ROOT_DIR / "package.json",
        ROOT_DIR / "pnpm-lock.yaml",
        ROOT_DIR / "package-lock.json",
    ]:
        if path.exists():
            hasher.update(path.read_bytes())
    return hasher.hexdigest()


def ensure_dependencies() -> bool:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    current_hash = compute_install_hash()
    saved_hash = (
        INSTALL_HASH_FILE.read_text(encoding="utf-8").strip()
        if INSTALL_HASH_FILE.exists()
        else ""
    )

    if (ROOT_DIR / "node_modules").exists() and saved_hash == current_hash:
        emit_ok("Dependencias ja estao sincronizadas com o lockfile atual.")
        return True

    emit_info(f"Instalando dependencias com {package_manager()}...")
    rc = run_cmd_live(package_install_cmd(), cwd=ROOT_DIR)
    if rc != 0:
        emit_error("Falha ao instalar dependencias.")
        return False

    INSTALL_HASH_FILE.write_text(current_hash, encoding="utf-8")
    emit_ok("Dependencias instaladas e sincronizadas.")
    return True


def docker_compose_cmd(*args: str) -> list[str]:
    return ["docker", "compose", *args]


def mysql_host_port() -> int:
    env_mgr.load()
    return int(env_mgr.get("MYSQL_HOST_PORT", env_mgr.get("MYSQL_PORT", "3307")))


def mysql_tcp_ready() -> bool:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    try:
        return sock.connect_ex(("127.0.0.1", mysql_host_port())) == 0
    finally:
        sock.close()


def wait_for_mysql(max_wait_seconds: int = 120) -> bool:
    emit_info("Aguardando MySQL ficar pronto...")
    for second in range(1, max_wait_seconds + 1):
        if mysql_tcp_ready():
            emit_ok(f"MySQL respondendo em 127.0.0.1:{mysql_host_port()}.")
            return True
        if second % 10 == 0:
            emit_info(f"MySQL ainda inicializando... ({second}/{max_wait_seconds}s)")
        time.sleep(1)
    emit_error("MySQL nao respondeu dentro do tempo esperado.")
    return False


def db_start() -> bool:
    if not COMPOSE_FILE.exists():
        emit_error("compose.yaml nao encontrado na raiz do projeto.")
        return False

    env_mgr.ensure_defaults()

    emit_info("Subindo MySQL via Docker Compose...")
    rc = run_cmd_live(docker_compose_cmd("up", "-d", "mysql"), cwd=ROOT_DIR)
    if rc != 0:
        emit_error("Falha ao subir o servico mysql via Docker Compose.")
        return False

    if not wait_for_mysql():
        return False

    return migrate()


def db_stop() -> bool:
    emit_info("Encerrando stack Docker do projeto...")
    rc = run_cmd_live(docker_compose_cmd("down"), cwd=ROOT_DIR)
    if rc != 0:
        emit_error("Falha ao encerrar o Docker Compose.")
        return False
    emit_ok("Stack Docker encerrada.")
    return True


def migrate() -> bool:
    env_mgr.ensure_defaults()

    if not MIGRATE_SCRIPT.exists():
        emit_error("scripts/mysql-migrate.mjs nao encontrado.")
        return False

    if not (ROOT_DIR / "node_modules").exists():
        emit_error(
            "node_modules ausente. Execute a instalacao de dependencias primeiro."
        )
        return False

    emit_info("Aplicando migracoes reais do MySQL...")
    rc = run_cmd_live(
        [shutil.which("node") or "node", str(MIGRATE_SCRIPT)],
        cwd=ROOT_DIR,
        env=env_mgr.export(),
    )
    if rc != 0:
        emit_error("Falha ao aplicar migracoes.")
        return False
    emit_ok("Migracoes aplicadas com sucesso.")
    return True


def app_url() -> str:
    env_mgr.load()
    return env_mgr.get("APP_BASE_URL", "http://localhost:3000")


def app_pid() -> int | None:
    if not APP_PID_FILE.exists():
        return None
    try:
        return int(APP_PID_FILE.read_text(encoding="utf-8").strip())
    except ValueError:
        return None


def process_running(pid: int) -> bool:
    result = run_cmd(
        ["powershell", "-NoProfile", "-Command", f"Get-Process -Id {pid}"],
        capture=True,
        check=False,
        timeout=10,
    )
    return result.code == 0


def stop_app() -> bool:
    pid = app_pid()
    if pid is None:
        emit_warn("Nenhum processo gerenciado pelo run_windows.py foi encontrado.")
        return True

    if not process_running(pid):
        emit_warn("O PID salvo ja nao esta em execucao.")
        APP_PID_FILE.unlink(missing_ok=True)
        APP_META_FILE.unlink(missing_ok=True)
        return True

    emit_info(f"Encerrando aplicacao (PID {pid})...")
    run_cmd(
        ["powershell", "-NoProfile", "-Command", f"Stop-Process -Id {pid} -Force"],
        check=False,
        timeout=15,
    )
    APP_PID_FILE.unlink(missing_ok=True)
    APP_META_FILE.unlink(missing_ok=True)
    emit_ok("Aplicacao encerrada.")
    return True


def wait_for_http(url: str, max_wait_seconds: int = 120) -> bool:
    emit_info(f"Aguardando resposta HTTP em {url}...")
    for second in range(1, max_wait_seconds + 1):
        try:
            with urllib.request.urlopen(url, timeout=3) as response:
                if response.status < 500:
                    emit_ok(f"Aplicacao respondendo em {url}.")
                    return True
        except Exception:
            pass
        if second % 10 == 0:
            emit_info(f"Aplicacao ainda subindo... ({second}/{max_wait_seconds}s)")
        time.sleep(1)
    emit_error("Aplicacao nao respondeu dentro do tempo esperado.")
    return False


def start_app(mode: str) -> bool:
    if mode not in {"dev", "prod"}:
        emit_error(f"Modo invalido: {mode}")
        return False

    stop_app()
    env_mgr.ensure_defaults()
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    if mode == "dev":
        next_dir = ROOT_DIR / ".next"
        if next_dir.exists():
            emit_info("Limpando cache .next antes da subida em desenvolvimento...")
            shutil.rmtree(next_dir, ignore_errors=True)

    out_log = LOG_DIR / f"run_windows_{mode}.out.log"
    err_log = LOG_DIR / f"run_windows_{mode}.err.log"
    command = package_run_cmd("dev" if mode == "dev" else "start")

    emit_info(f"Iniciando aplicacao em modo {mode}...")
    stdout_handle = out_log.open("w", encoding="utf-8")
    stderr_handle = err_log.open("w", encoding="utf-8")
    process = subprocess.Popen(
        command,
        cwd=ROOT_DIR,
        env={**os.environ, **env_mgr.export()},
        stdout=stdout_handle,
        stderr=stderr_handle,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
    )
    stdout_handle.close()
    stderr_handle.close()

    APP_PID_FILE.write_text(str(process.pid), encoding="utf-8")
    APP_META_FILE.write_text(
        json.dumps(
            {
                "pid": process.pid,
                "mode": mode,
                "url": app_url(),
                "stdout": str(out_log),
                "stderr": str(err_log),
                "started_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    return wait_for_http(app_url())


def build_app() -> bool:
    emit_info("Gerando build de producao...")
    rc = run_cmd_live(package_run_cmd("build"), cwd=ROOT_DIR, env=env_mgr.export())
    if rc != 0:
        emit_error("Build de producao falhou.")
        return False
    emit_ok("Build de producao concluido.")
    return True


def full_dev() -> bool:
    env_mgr.ensure_defaults()
    if not ensure_dependencies():
        return False
    if not db_start():
        return False
    return start_app("dev")


def full_prod() -> bool:
    env_mgr.ensure_defaults()
    if not ensure_dependencies():
        return False
    if not db_start():
        return False
    if not build_app():
        return False
    return start_app("prod")


def doctor() -> bool:
    emit_info("Validando prerequisitos do ambiente Windows...")
    ok = True
    for command in ["python", "node", package_manager(), "docker"]:
        if have(command):
            emit_ok(f"{command} encontrado no PATH.")
        else:
            emit_error(f"{command} ausente no PATH.")
            ok = False

    if COMPOSE_FILE.exists():
        emit_ok("compose.yaml presente.")
    else:
        emit_error("compose.yaml ausente.")
        ok = False

    if MIGRATE_SCRIPT.exists():
        emit_ok("scripts/mysql-migrate.mjs presente.")
    else:
        emit_error("scripts/mysql-migrate.mjs ausente.")
        ok = False

    return ok


def status() -> bool:
    env_mgr.ensure_defaults()
    emit_info("Status consolidado do ambiente:")
    emit_info(f"URL da aplicacao: {app_url()}")
    emit_info(f"MySQL host/porta: 127.0.0.1:{mysql_host_port()}")

    if APP_META_FILE.exists():
        emit_ok(f"Meta do app presente: {APP_META_FILE}")
    else:
        emit_warn("Nenhum app gerenciado foi registrado ainda.")

    if docker_running():
        emit_ok("Servico mysql do Docker Compose esta em execucao.")
    else:
        emit_warn("Servico mysql do Docker Compose nao esta ativo.")

    if mysql_tcp_ready():
        emit_ok("Porta TCP do MySQL esta respondendo.")
    else:
        emit_warn("Porta TCP do MySQL nao esta respondendo.")

    if http_ready():
        emit_ok("Aplicacao HTTP esta respondendo.")
    else:
        emit_warn("Aplicacao HTTP nao esta respondendo.")

    return True


def docker_running() -> bool:
    result = run_cmd(
        docker_compose_cmd("ps", "--status", "running", "--services"),
        cwd=ROOT_DIR,
        capture=True,
        check=False,
        timeout=20,
    )
    return "mysql" in result.stdout.split()


def http_ready() -> bool:
    try:
        with urllib.request.urlopen(app_url(), timeout=3) as response:
            return response.status < 500
    except Exception:
        return False


def health() -> bool:
    ok = True
    if not docker_running():
        emit_error("MySQL do Docker Compose nao esta ativo.")
        ok = False
    else:
        emit_ok("MySQL do Docker Compose ativo.")

    if not mysql_tcp_ready():
        emit_error("MySQL nao responde na porta configurada.")
        ok = False
    else:
        emit_ok("MySQL responde na porta configurada.")

    if not http_ready():
        emit_error("Aplicacao nao responde via HTTP.")
        ok = False
    else:
        emit_ok("Aplicacao responde via HTTP.")

    return ok


def setup_env() -> bool:
    env_mgr.ensure_defaults()
    emit_ok(f".env.local preparado em {ENV_FILE}")
    return True


COMMANDS: dict[str, Any] = {
    "doctor": doctor,
    "setup-env": setup_env,
    "install-deps": ensure_dependencies,
    "db-start": db_start,
    "db-stop": db_stop,
    "migrate": migrate,
    "build": build_app,
    "start-dev": lambda: start_app("dev"),
    "start-prod": lambda: start_app("prod"),
    "stop-app": stop_app,
    "stop-all": lambda: stop_app() and db_stop(),
    "dev": full_dev,
    "prod": full_prod,
    "status": status,
    "health": health,
}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Orquestrador local do Lyra MetaCare para Windows."
    )
    parser.add_argument(
        "command",
        choices=sorted(COMMANDS.keys()),
        help="Comando a executar.",
    )
    args = parser.parse_args()

    try:
        success = bool(COMMANDS[args.command]())
        return 0 if success else 1
    except KeyboardInterrupt:
        emit_warn("Operacao interrompida pelo operador.")
        return 130


if __name__ == "__main__":
    sys.exit(main())
