#!/usr/bin/env python3
"""
LYRA METACARE — Orquestrador Local (WSL2 Ubuntu)
=================================================
Script de gerenciamento completo para ambiente de desenvolvimento local.
Gerencia Docker, MySQL, dependências Node.js e a aplicação Next.js.

Versão: 2026.03.16
Ambiente: WSL2 Ubuntu exclusivamente
TUI: Rich (Python)
"""

from __future__ import annotations

import hashlib
import os
import re
import shutil
import signal
import subprocess
import sys
import textwrap
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

try:
    from rich.align import Align
    from rich.columns import Columns
    from rich.console import Console, Group
    from rich.live import Live
    from rich.markup import escape
    from rich.panel import Panel
    from rich.progress import (
        BarColumn,
        MofNCompleteColumn,
        Progress,
        SpinnerColumn,
        TaskProgressColumn,
        TextColumn,
        TimeElapsedColumn,
    )
    from rich.prompt import Confirm, Prompt
    from rich.rule import Rule
    from rich.table import Table
    from rich.text import Text
    from rich.theme import Theme
except ImportError:
    print("Dependencia 'rich' nao encontrada. Instalando...")
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "rich", "--break-system-packages", "-q"]
    )
    print("Rich instalado. Reiniciando o script...")
    os.execv(sys.executable, [sys.executable, *sys.argv])

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTES GLOBAIS
# ═══════════════════════════════════════════════════════════════════════════════

SCRIPT_VERSION = "2026.03.16"
ROOT_DIR = Path(__file__).resolve().parent
STATE_DIR = ROOT_DIR / ".lyra-run"
ENV_FILE = ROOT_DIR / ".env.local"
BACKUP_DIR = ROOT_DIR / "backups" / "mysql"
PACKAGE_FILE = ROOT_DIR / "package.json"
MIGRATE_SCRIPT = ROOT_DIR / "scripts" / "mysql-migrate.mjs"
APP_PID_FILE = STATE_DIR / "app.pid"
APP_META_FILE = STATE_DIR / "app.meta"
INSTALL_HASH_FILE = STATE_DIR / "install.hash"

DOCKER_IMAGE = "mysql:8.0"
DOCKER_CONTAINER = "lyra_metacare"
DOCKER_MYSQL_PORT = "3306"

DEFAULT_ENV: dict[str, str] = {
    "MYSQL_HOST": "127.0.0.1",
    "MYSQL_LOCAL_RUNTIME": "native",
    "MYSQL_HOST_PORT": "3306",
    "MYSQL_PORT": "3306",
    "MYSQL_DATABASE": "lyra_metacare",
    "MYSQL_USER": "lyra",
    "MYSQL_PASSWORD": "Lyra123#",
    "MYSQL_ROOT_PASSWORD": "",
    "MYSQL_ADMIN_USER": "root",
    "MYSQL_ADMIN_PASSWORD": "",
    "AUTH_SECRET": "",
    "ADMIN_BOOTSTRAP_EMAIL": "douglas@ilyra.com.br",
    "ADMIN_BOOTSTRAP_PASSWORD": "Lyra123#",
    "ADMIN_BOOTSTRAP_FIRST_NAME": "Douglas",
    "ADMIN_BOOTSTRAP_LAST_NAME": "Mosken",
    "PORT": "3000",
}

# ═══════════════════════════════════════════════════════════════════════════════
# TEMA RICH — Estilo Minimalista Claro Moderno 2026
# ═══════════════════════════════════════════════════════════════════════════════

LYRA_THEME = Theme(
    {
        "lyra.title": "bold cyan",
        "lyra.subtitle": "dim white",
        "lyra.ok": "bold green",
        "lyra.warn": "bold yellow",
        "lyra.err": "bold red",
        "lyra.info": "bold cyan",
        "lyra.dim": "dim",
        "lyra.key": "bold magenta",
        "lyra.value": "white",
        "lyra.menu.selected": "bold cyan on grey15",
        "lyra.menu.normal": "white",
        "lyra.menu.icon": "bold",
        "lyra.menu.desc": "dim white",
        "lyra.progress.bar": "cyan",
        "lyra.progress.text": "bold white",
        "lyra.output": "white",
        "lyra.section": "bold cyan",
        "lyra.separator": "dim cyan",
    }
)

console = Console(theme=LYRA_THEME, highlight=False)

# ═══════════════════════════════════════════════════════════════════════════════
# UTILITÁRIOS GERAIS
# ═══════════════════════════════════════════════════════════════════════════════


def have(cmd: str) -> bool:
    """Verifica se um comando está disponível no PATH."""
    return shutil.which(cmd) is not None


def generate_hex(length: int = 32) -> str:
    """Gera string hexadecimal segura."""
    return os.urandom(length).hex()


def mask_secret(value: str) -> str:
    """Mascara um segredo para exibição segura."""
    if not value:
        return "(vazio)"
    if len(value) <= 4:
        return "****"
    return f"{value[:2]}****{value[-2:]}"


def hash_files(*paths: Path) -> str:
    """Calcula hash SHA256 combinado de múltiplos arquivos."""
    hasher = hashlib.sha256()
    for p in paths:
        if p.exists():
            hasher.update(p.read_bytes())
    return hasher.hexdigest()


def run_cmd(
    cmd: str | list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    capture: bool = False,
    check: bool = True,
    timeout: int | None = None,
    shell: bool = False,
) -> subprocess.CompletedProcess[str]:
    """Executa um comando com tratamento robusto."""
    merged_env = {**os.environ}
    if env:
        merged_env.update(env)
    kwargs: dict[str, Any] = {
        "cwd": cwd or ROOT_DIR,
        "env": merged_env,
        "text": True,
        "timeout": timeout,
    }
    if capture:
        kwargs["stdout"] = subprocess.PIPE
        kwargs["stderr"] = subprocess.PIPE
    if shell:
        kwargs["shell"] = True
    if isinstance(cmd, str) and not shell:
        cmd_list = cmd.split()
    elif isinstance(cmd, str):
        cmd_list = cmd
    else:
        cmd_list = cmd
    return subprocess.run(cmd_list, check=check, **kwargs)


def run_cmd_live(
    cmd: str | list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    on_line: Callable[[str], None] | None = None,
    shell: bool = False,
) -> int:
    """Executa um comando com saída em tempo real (streaming)."""
    merged_env = {**os.environ}
    if env:
        merged_env.update(env)
    if isinstance(cmd, str) and not shell:
        cmd_parts = cmd.split()
    else:
        cmd_parts = cmd

    proc = subprocess.Popen(
        cmd_parts,
        cwd=cwd or ROOT_DIR,
        env=merged_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=shell,
    )
    assert proc.stdout is not None
    for line in proc.stdout:
        stripped = line.rstrip("\n\r")
        if on_line:
            on_line(stripped)
    proc.wait()
    return proc.returncode


def sudo_run(cmd: list[str], **kwargs: Any) -> subprocess.CompletedProcess[str]:
    """Executa comando com sudo se não for root."""
    if os.geteuid() == 0:
        return run_cmd(cmd, **kwargs)
    return run_cmd(["sudo", "-n", *cmd], **kwargs)


# ═══════════════════════════════════════════════════════════════════════════════
# GERENCIADOR DE .env.local
# ═══════════════════════════════════════════════════════════════════════════════


class EnvManager:
    """Gerencia leitura e escrita do arquivo .env.local."""

    def __init__(self, path: Path = ENV_FILE) -> None:
        self.path = path
        self._cache: dict[str, str] = {}

    def load(self) -> dict[str, str]:
        """Carrega o .env.local em memória."""
        self._cache.clear()
        if not self.path.exists():
            return self._cache
        for line in self.path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip()
            if (value.startswith('"') and value.endswith('"')) or (
                value.startswith("'") and value.endswith("'")
            ):
                value = value[1:-1]
            self._cache[key] = value
        return self._cache

    def get(self, key: str, fallback: str = "") -> str:
        """Obtém valor do cache ou fallback."""
        if not self._cache:
            self.load()
        return self._cache.get(key, fallback)

    def upsert(self, key: str, value: str) -> None:
        """Insere ou atualiza uma chave no .env.local."""
        needs_quote = not re.match(r"^[A-Za-z0-9_./:@+\-]+$", value) if value else False
        encoded = f'"{value}"' if needs_quote else value
        lines: list[str] = []
        replaced = False
        if self.path.exists():
            for raw_line in self.path.read_text(encoding="utf-8").splitlines():
                if re.match(rf"^\s*{re.escape(key)}\s*=", raw_line):
                    lines.append(f"{key}={encoded}")
                    replaced = True
                else:
                    lines.append(raw_line)
        if not replaced:
            lines.append(f"{key}={encoded}")
        self.path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        self._cache[key] = value

    def write_full(self, data: dict[str, str]) -> None:
        """Escreve todas as chaves no .env.local preservando existentes."""
        self.load()
        for k, v in data.items():
            self.upsert(k, v)

    def ensure_auth_secret(self) -> None:
        """Garante que AUTH_SECRET tenha um valor gerado."""
        self.load()
        if not self.get("AUTH_SECRET"):
            self.upsert("AUTH_SECRET", generate_hex())

    def export_to_env(self) -> dict[str, str]:
        """Exporta variáveis carregadas como dict para uso em subprocessos."""
        self.load()
        result: dict[str, str] = {}
        for k, v in self._cache.items():
            result[k] = v
            os.environ[k] = v
        return result


env_mgr = EnvManager()


# ═══════════════════════════════════════════════════════════════════════════════
# GERENCIADOR DE DOCKER
# ═══════════════════════════════════════════════════════════════════════════════


class DockerManager:
    """Gerencia instalação, configuração e ciclo de vida do Docker e container MySQL."""

    @staticmethod
    def is_installed() -> bool:
        return have("docker")

    @staticmethod
    def is_daemon_running() -> bool:
        try:
            result = run_cmd(
                ["docker", "info"], capture=True, check=False, timeout=10
            )
            return result.returncode == 0
        except Exception:
            return False

    @staticmethod
    def install(on_line: Callable[[str], None] | None = None) -> bool:
        """Instala o Docker no WSL2 Ubuntu via repositório oficial."""
        emit = on_line or (lambda s: None)

        emit("[INFO] Atualizando pacotes do sistema...")
        rc = run_cmd_live(
            ["sudo", "-n", "apt-get", "update", "-y"], on_line=on_line
        )
        if rc != 0:
            emit("[ERRO] Falha ao atualizar pacotes.")
            return False

        emit("[INFO] Instalando pré-requisitos do Docker...")
        rc = run_cmd_live(
            [
                "sudo", "-n", "apt-get", "install", "-y",
                "ca-certificates", "curl", "gnupg", "lsb-release",
                "apt-transport-https", "software-properties-common",
            ],
            on_line=on_line,
        )
        if rc != 0:
            emit("[ERRO] Falha ao instalar pré-requisitos.")
            return False

        emit("[INFO] Adicionando chave GPG oficial do Docker...")
        keyrings_dir = Path("/etc/apt/keyrings")
        if not keyrings_dir.exists():
            run_cmd(["sudo", "-n", "mkdir", "-p", str(keyrings_dir)], check=False)

        rc = run_cmd_live(
            "sudo -n bash -c 'curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg && chmod a+r /etc/apt/keyrings/docker.gpg'",
            on_line=on_line,
            shell=True,
        )
        if rc != 0:
            emit("[ERRO] Falha ao adicionar chave GPG do Docker.")
            return False

        emit("[INFO] Adicionando repositório Docker...")
        codename_result = run_cmd(
            ["lsb_release", "-cs"], capture=True, check=False
        )
        codename = codename_result.stdout.strip() if codename_result.returncode == 0 else "jammy"

        repo_line = (
            f"deb [arch=$(dpkg --print-architecture) "
            f"signed-by=/etc/apt/keyrings/docker.gpg] "
            f"https://download.docker.com/linux/ubuntu {codename} stable"
        )
        rc = run_cmd_live(
            f"sudo -n bash -c 'echo \"{repo_line}\" > /etc/apt/sources.list.d/docker.list'",
            on_line=on_line,
            shell=True,
        )

        emit("[INFO] Atualizando índice de pacotes com Docker...")
        run_cmd_live(["sudo", "-n", "apt-get", "update", "-y"], on_line=on_line)

        emit("[INFO] Instalando Docker Engine, CLI e plugins...")
        rc = run_cmd_live(
            [
                "sudo", "-n", "apt-get", "install", "-y",
                "docker-ce", "docker-ce-cli", "containerd.io",
                "docker-buildx-plugin", "docker-compose-plugin",
            ],
            on_line=on_line,
        )
        if rc != 0:
            emit("[ERRO] Falha ao instalar Docker.")
            return False

        current_user = os.environ.get("USER", "root")
        if current_user != "root":
            emit(f"[INFO] Adicionando usuario '{current_user}' ao grupo docker...")
            run_cmd(
                ["sudo", "-n", "usermod", "-aG", "docker", current_user], check=False
            )

        emit("[INFO] Docker instalado com sucesso.")
        return True

    @staticmethod
    def start_daemon(on_line: Callable[[str], None] | None = None) -> bool:
        """Inicia o daemon do Docker no WSL2."""
        emit = on_line or (lambda s: None)

        if DockerManager.is_daemon_running():
            emit("[OK] Docker daemon já está em execução.")
            return True

        emit("[INFO] Iniciando Docker daemon via sudo service...")
        run_cmd(["sudo", "-n", "service", "docker", "start"], check=False)
        for attempt in range(1, 16):
            time.sleep(1)
            if DockerManager.is_daemon_running():
                emit(f"[OK] Docker daemon iniciou após {attempt}s.")
                return True
            emit(f"[INFO] Aguardando Docker daemon... ({attempt}/15)")

        emit("[WARN] Tentando iniciar dockerd diretamente...")
        subprocess.Popen(
            ["sudo", "-n", "dockerd"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        for attempt in range(1, 16):
            time.sleep(1)
            if DockerManager.is_daemon_running():
                emit(f"[OK] Docker daemon iniciou via dockerd após {attempt}s.")
                return True

        emit("[ERRO] Não foi possível iniciar o Docker daemon.")
        return False

    @staticmethod
    def fix_docker(on_line: Callable[[str], None] | None = None) -> bool:
        """Tenta reparar problemas comuns do Docker no WSL2."""
        emit = on_line or (lambda s: None)

        emit("[INFO] Diagnosticando problemas do Docker...")

        emit("[INFO] Verificando iptables (nftables vs legacy)...")
        run_cmd_live(
            "sudo -n update-alternatives --set iptables /usr/sbin/iptables-legacy 2>/dev/null || true",
            on_line=on_line,
            shell=True,
        )
        run_cmd_live(
            "sudo -n update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy 2>/dev/null || true",
            on_line=on_line,
            shell=True,
        )

        emit("[INFO] Reiniciando containerd...")
        run_cmd(["sudo", "-n", "service", "containerd", "restart"], check=False)
        time.sleep(2)

        emit("[INFO] Reiniciando Docker...")
        run_cmd(["sudo", "-n", "service", "docker", "restart"], check=False)
        time.sleep(3)

        if DockerManager.is_daemon_running():
            emit("[OK] Docker reparado e funcionando.")
            return True

        emit("[INFO] Tentando limpeza de dados corrompidos do Docker...")
        run_cmd(["sudo", "-n", "service", "docker", "stop"], check=False)
        run_cmd(
            ["sudo", "-n", "rm", "-rf", "/var/run/docker.sock"], check=False
        )
        run_cmd(["sudo", "-n", "service", "docker", "start"], check=False)
        time.sleep(5)

        if DockerManager.is_daemon_running():
            emit("[OK] Docker reparado após limpeza de socket.")
            return True

        emit("[ERRO] Não foi possível reparar o Docker automaticamente.")
        return False

    @staticmethod
    def container_exists() -> bool:
        try:
            result = run_cmd(
                ["docker", "ps", "-a", "--filter", f"name=^{DOCKER_CONTAINER}$", "--format", "{{.Names}}"],
                capture=True,
                check=False,
                timeout=10,
            )
            return DOCKER_CONTAINER in result.stdout.strip()
        except Exception:
            return False

    @staticmethod
    def container_running() -> bool:
        try:
            result = run_cmd(
                ["docker", "ps", "--filter", f"name=^{DOCKER_CONTAINER}$", "--filter", "status=running", "--format", "{{.Names}}"],
                capture=True,
                check=False,
                timeout=10,
            )
            return DOCKER_CONTAINER in result.stdout.strip()
        except Exception:
            return False

    @staticmethod
    def image_exists() -> bool:
        try:
            result = run_cmd(
                ["docker", "images", DOCKER_IMAGE, "--format", "{{.Repository}}:{{.Tag}}"],
                capture=True,
                check=False,
                timeout=10,
            )
            return DOCKER_IMAGE in result.stdout.strip()
        except Exception:
            return False

    @staticmethod
    def mysql_port_responding() -> bool:
        """Verifica se o MySQL está respondendo na porta configurada."""
        try:
            import socket

            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            result = sock.connect_ex(("127.0.0.1", int(DOCKER_MYSQL_PORT)))
            sock.close()
            return result == 0
        except Exception:
            return False

    @staticmethod
    def ensure_mysql_container(on_line: Callable[[str], None] | None = None) -> bool:
        """Garante que o container MySQL lyra_metacare exista e esteja rodando."""
        emit = on_line or (lambda s: None)

        env_mgr.load()
        mysql_root_pw = env_mgr.get("MYSQL_ROOT_PASSWORD", "")
        mysql_db = env_mgr.get("MYSQL_DATABASE", "lyra_metacare")

        if DockerManager.container_running():
            emit("[OK] Container MySQL 'lyra_metacare' já está em execução.")
            if DockerManager.mysql_port_responding():
                emit("[OK] MySQL respondendo em 127.0.0.1:3306.")
                return True
            emit("[WARN] Container rodando mas porta 3306 não responde. Aguardando...")
            for i in range(1, 31):
                time.sleep(2)
                if DockerManager.mysql_port_responding():
                    emit(f"[OK] MySQL respondeu após {i * 2}s.")
                    return True
                emit(f"[INFO] Aguardando MySQL inicializar... ({i * 2}/60s)")
            emit("[ERRO] MySQL não respondeu dentro do tempo limite.")
            return False

        if DockerManager.container_exists():
            emit("[INFO] Container 'lyra_metacare' existe mas está parado. Iniciando...")
            rc = run_cmd_live(
                ["docker", "start", DOCKER_CONTAINER], on_line=on_line
            )
            if rc != 0:
                emit("[ERRO] Falha ao iniciar container existente.")
                return False
            for i in range(1, 31):
                time.sleep(2)
                if DockerManager.mysql_port_responding():
                    emit(f"[OK] MySQL respondeu após {i * 2}s.")
                    return True
                emit(f"[INFO] Aguardando MySQL inicializar... ({i * 2}/60s)")
            return DockerManager.mysql_port_responding()

        emit("[INFO] Container 'lyra_metacare' não encontrado. Criando...")

        if not DockerManager.image_exists():
            emit("[INFO] Baixando imagem MySQL 8.0...")
            rc = run_cmd_live(
                ["docker", "pull", DOCKER_IMAGE], on_line=on_line
            )
            if rc != 0:
                emit("[ERRO] Falha ao baixar imagem MySQL.")
                return False

        docker_run_cmd = [
            "docker", "run", "-d",
            "--name", DOCKER_CONTAINER,
            "-p", f"127.0.0.1:{DOCKER_MYSQL_PORT}:3306",
            "-e", f"MYSQL_DATABASE={mysql_db}",
            "-e", f"MYSQL_ROOT_PASSWORD={mysql_root_pw}" if mysql_root_pw else "MYSQL_ALLOW_EMPTY_PASSWORD=yes",
            "--restart", "unless-stopped",
            "--health-cmd", "mysqladmin ping -h localhost || exit 1",
            "--health-interval", "10s",
            "--health-timeout", "5s",
            "--health-retries", "5",
            DOCKER_IMAGE,
            "--default-authentication-plugin=mysql_native_password",
            "--character-set-server=utf8mb4",
            "--collation-server=utf8mb4_unicode_ci",
            "--bind-address=0.0.0.0",
        ]

        emit("[INFO] Criando e iniciando container MySQL...")
        rc = run_cmd_live(docker_run_cmd, on_line=on_line)
        if rc != 0:
            emit("[ERRO] Falha ao criar container MySQL.")
            return False

        emit("[INFO] Aguardando MySQL ficar pronto (primeira inicialização pode levar 30-60s)...")
        for i in range(1, 61):
            time.sleep(2)
            if DockerManager.mysql_port_responding():
                emit(f"[OK] MySQL pronto e respondendo após {i * 2}s.")
                return True
            emit(f"[INFO] Aguardando MySQL inicializar... ({i * 2}/120s)")

        emit("[ERRO] MySQL não ficou pronto no tempo esperado.")
        return False

    @staticmethod
    def inspect_mysql(on_line: Callable[[str], None] | None = None) -> bool:
        """Inspeciona o estado do container e imagem MySQL."""
        emit = on_line or (lambda s: None)

        emit(f"[INFO] Verificando imagem Docker: {DOCKER_IMAGE}")
        if DockerManager.image_exists():
            emit(f"[OK] Imagem '{DOCKER_IMAGE}' presente no sistema.")
        else:
            emit(f"[WARN] Imagem '{DOCKER_IMAGE}' não encontrada.")

        emit(f"[INFO] Verificando container: {DOCKER_CONTAINER}")
        if not DockerManager.container_exists():
            emit("[WARN] Container 'lyra_metacare' não existe.")
            return False

        result = run_cmd(
            ["docker", "inspect", "--format",
             "{{.State.Status}} | Porta: {{range $p, $conf := .NetworkSettings.Ports}}{{$p}}->{{(index $conf 0).HostPort}} {{end}}| Health: {{.State.Health.Status}}",
             DOCKER_CONTAINER],
            capture=True, check=False, timeout=10,
        )
        if result.returncode == 0:
            emit(f"[INFO] Estado: {result.stdout.strip()}")

        if DockerManager.container_running():
            emit("[OK] Container está em execução.")
        else:
            emit("[WARN] Container existe mas não está rodando.")

        if DockerManager.mysql_port_responding():
            emit("[OK] MySQL respondendo em 127.0.0.1:3306.")
            return True
        else:
            emit("[WARN] MySQL não responde em 127.0.0.1:3306.")
            return False


# ═══════════════════════════════════════════════════════════════════════════════
# GERENCIADOR DE MySQL (USER, GRANTS, MIGRATION, VERIFY)
# ═══════════════════════════════════════════════════════════════════════════════


class MySQLManager:
    """Gerencia operações de banco de dados MySQL via Docker."""

    @staticmethod
    def _docker_exec_sql(sql: str, *, use_db: str = "", as_root: bool = True) -> tuple[int, str]:
        """Executa SQL no container MySQL via docker exec."""
        env_mgr.load()
        user = "root" if as_root else env_mgr.get("MYSQL_USER", "lyra")
        password = env_mgr.get("MYSQL_ROOT_PASSWORD", "") if as_root else env_mgr.get("MYSQL_PASSWORD", "Lyra123#")

        cmd = ["docker", "exec", "-i", DOCKER_CONTAINER, "mysql"]
        if user:
            cmd.extend([f"-u{user}"])
        if password:
            cmd.extend([f"-p{password}"])
        if use_db:
            cmd.extend([use_db])
        cmd.extend(["-N", "-B", "-e", sql])

        result = run_cmd(cmd, capture=True, check=False, timeout=30)
        return result.returncode, result.stdout.strip()

    @staticmethod
    def _wait_mysql_ready(on_line: Callable[[str], None] | None = None, max_wait: int = 60) -> bool:
        """Aguarda MySQL aceitar conexões."""
        emit = on_line or (lambda s: None)
        for i in range(1, max_wait + 1):
            rc, _ = MySQLManager._docker_exec_sql("SELECT 1")
            if rc == 0:
                return True
            if i % 5 == 0:
                emit(f"[INFO] MySQL ainda inicializando... ({i}/{max_wait}s)")
            time.sleep(1)
        return False

    @staticmethod
    def ensure_user_and_grants(on_line: Callable[[str], None] | None = None) -> bool:
        """Cria o usuário 'lyra' e configura permissões no banco."""
        emit = on_line or (lambda s: None)
        env_mgr.load()

        db_name = env_mgr.get("MYSQL_DATABASE", "lyra_metacare")
        db_user = env_mgr.get("MYSQL_USER", "lyra")
        db_pass = env_mgr.get("MYSQL_PASSWORD", "Lyra123#")

        emit(f"[INFO] Garantindo banco de dados '{db_name}'...")
        sql_db = f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        rc, out = MySQLManager._docker_exec_sql(sql_db)
        if rc != 0:
            emit(f"[ERRO] Falha ao criar banco: {out}")
            return False
        emit(f"[OK] Banco '{db_name}' garantido.")

        emit(f"[INFO] Criando/atualizando usuario '{db_user}'...")
        sql_user = f"""
            CREATE USER IF NOT EXISTS '{db_user}'@'%' IDENTIFIED BY '{db_pass}';
            CREATE USER IF NOT EXISTS '{db_user}'@'localhost' IDENTIFIED BY '{db_pass}';
            ALTER USER '{db_user}'@'%' IDENTIFIED BY '{db_pass}';
            ALTER USER '{db_user}'@'localhost' IDENTIFIED BY '{db_pass}';
            GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{db_user}'@'%';
            GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{db_user}'@'localhost';
            FLUSH PRIVILEGES;
        """
        rc, out = MySQLManager._docker_exec_sql(sql_user)
        if rc != 0:
            emit(f"[ERRO] Falha ao configurar usuario: {out}")
            return False
        emit(f"[OK] Usuario '{db_user}' configurado com permissões completas.")
        return True

    @staticmethod
    def verify_database(on_line: Callable[[str], None] | None = None) -> bool:
        """Verifica integridade do banco, tabelas e tabela de migrações."""
        emit = on_line or (lambda s: None)
        env_mgr.load()
        db_name = env_mgr.get("MYSQL_DATABASE", "lyra_metacare")

        emit(f"[INFO] Verificando banco '{db_name}'...")

        rc, out = MySQLManager._docker_exec_sql(
            f"SELECT SCHEMA_NAME FROM information_schema.schemata WHERE SCHEMA_NAME = '{db_name}'"
        )
        if rc != 0 or db_name not in out:
            emit(f"[WARN] Banco '{db_name}' não encontrado.")
            return False
        emit(f"[OK] Banco '{db_name}' existe.")

        rc, count = MySQLManager._docker_exec_sql(
            f"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '{db_name}'"
        )
        if rc == 0:
            emit(f"[INFO] Tabelas no schema: {count}")
        else:
            emit(f"[WARN] Não foi possível contar tabelas: {count}")

        rc, migration_check = MySQLManager._docker_exec_sql(
            f"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '{db_name}' AND table_name = '_lyra_schema_migrations'"
        )
        if rc == 0 and migration_check.strip() != "0":
            emit("[OK] Tabela de migracoes '_lyra_schema_migrations' presente.")
            rc, migration_count = MySQLManager._docker_exec_sql(
                f"SELECT COUNT(*) FROM `{db_name}`.`_lyra_schema_migrations`"
            )
            if rc == 0:
                emit(f"[INFO] Migracoes aplicadas: {migration_count}")
        else:
            emit("[INFO] Tabela de migracoes ainda nao existe (migracao pendente).")

        rc, user_check = MySQLManager._docker_exec_sql(
            "SELECT User, Host FROM mysql.user WHERE User = 'lyra'"
        )
        if rc == 0 and "lyra" in user_check:
            emit("[OK] Usuario 'lyra' encontrado no MySQL.")
        else:
            emit("[WARN] Usuario 'lyra' nao encontrado.")

        return True

    @staticmethod
    def run_migration(on_line: Callable[[str], None] | None = None) -> bool:
        """Executa o script de migração do projeto (scripts/mysql-migrate.mjs)."""
        emit = on_line or (lambda s: None)

        if not MIGRATE_SCRIPT.exists():
            emit(f"[ERRO] Script de migracao nao encontrado: {MIGRATE_SCRIPT}")
            return False

        if not (ROOT_DIR / "node_modules").exists():
            emit("[ERRO] Dependencias do projeto ausentes. Execute 'Instalar dependencias' primeiro.")
            return False

        env_vars = env_mgr.export_to_env()

        emit("[INFO] Executando migracoes MySQL...")
        node_cmd = shutil.which("node")
        if not node_cmd:
            emit("[ERRO] Node.js nao encontrado no PATH.")
            return False

        rc = run_cmd_live(
            [node_cmd, str(MIGRATE_SCRIPT)],
            cwd=ROOT_DIR,
            env=env_vars,
            on_line=on_line,
        )
        if rc != 0:
            emit(f"[ERRO] Migracao falhou com codigo {rc}.")
            return False
        emit("[OK] Migracoes aplicadas com sucesso.")
        return True

    @staticmethod
    def backup_database(on_line: Callable[[str], None] | None = None) -> bool:
        """Gera backup completo do banco via mysqldump no container."""
        emit = on_line or (lambda s: None)
        env_mgr.load()
        db_name = env_mgr.get("MYSQL_DATABASE", "lyra_metacare")

        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        backup_file = BACKUP_DIR / f"{db_name}_{timestamp}.sql.gz"

        emit(f"[INFO] Gerando backup do banco '{db_name}'...")
        cmd = (
            f"docker exec {DOCKER_CONTAINER} mysqldump -uroot "
            f"--single-transaction --routines --triggers --events "
            f"--hex-blob --set-gtid-purged=OFF --no-tablespaces {db_name} "
            f"| gzip > {backup_file}"
        )
        rc = run_cmd_live(cmd, on_line=on_line, shell=True)
        if rc != 0:
            emit("[ERRO] Falha ao gerar backup.")
            return False
        emit(f"[OK] Backup gerado: {backup_file}")
        return True


# ═══════════════════════════════════════════════════════════════════════════════
# GERENCIADOR DE NODE.JS E DEPENDÊNCIAS
# ═══════════════════════════════════════════════════════════════════════════════


class NodeManager:
    """Gerencia Node.js, pnpm/npm e dependências do projeto."""

    @staticmethod
    def detect_package_manager() -> str:
        if (ROOT_DIR / "pnpm-lock.yaml").exists() and have("pnpm"):
            return "pnpm"
        return "npm"

    @staticmethod
    def get_run_cmd() -> list[str]:
        pm = NodeManager.detect_package_manager()
        cmd = shutil.which(pm)
        return [cmd] if cmd else [pm]

    @staticmethod
    def doctor(on_line: Callable[[str], None] | None = None) -> bool:
        """Valida requisitos do sistema para desenvolvimento."""
        emit = on_line or (lambda s: None)
        all_ok = True

        emit("[INFO] Validando requisitos do sistema (WSL2 Ubuntu)...")

        if have("git"):
            result = run_cmd(["git", "--version"], capture=True, check=False)
            emit(f"[OK] Git: {result.stdout.strip()}")
        else:
            emit("[ERRO] Git nao encontrado.")
            all_ok = False

        node_cmd = shutil.which("node")
        if node_cmd:
            result = run_cmd([node_cmd, "--version"], capture=True, check=False)
            emit(f"[OK] Node.js: {result.stdout.strip()}")
        else:
            emit("[ERRO] Node.js nao encontrado.")
            all_ok = False

        npm_cmd = shutil.which("npm")
        if npm_cmd:
            result = run_cmd([npm_cmd, "--version"], capture=True, check=False)
            emit(f"[OK] npm: {result.stdout.strip()}")
        else:
            emit("[ERRO] npm nao encontrado.")
            all_ok = False

        pm = NodeManager.detect_package_manager()
        emit(f"[OK] Gerenciador do projeto: {pm}")

        if pm == "pnpm":
            pnpm_cmd = shutil.which("pnpm")
            if pnpm_cmd:
                result = run_cmd([pnpm_cmd, "--version"], capture=True, check=False)
                emit(f"[OK] pnpm: {result.stdout.strip()}")
            else:
                emit("[WARN] pnpm ausente. Tentando ativar via corepack...")
                if have("corepack"):
                    run_cmd(["corepack", "enable"], check=False)
                    run_cmd(["corepack", "prepare", "pnpm@latest", "--activate"], check=False)
                    emit("[OK] pnpm ativado via corepack.")
                else:
                    emit("[WARN] corepack indisponivel. Usando npm como fallback.")

        if DockerManager.is_installed():
            emit("[OK] Docker instalado.")
            if DockerManager.is_daemon_running():
                emit("[OK] Docker daemon ativo.")
            else:
                emit("[WARN] Docker daemon nao esta rodando.")
        else:
            emit("[WARN] Docker nao instalado.")

        if PACKAGE_FILE.exists():
            emit("[OK] package.json encontrado.")
        else:
            emit("[ERRO] package.json ausente na raiz do projeto.")
            all_ok = False

        if MIGRATE_SCRIPT.exists():
            emit("[OK] scripts/mysql-migrate.mjs encontrado.")
        else:
            emit("[WARN] scripts/mysql-migrate.mjs ausente.")

        if DockerManager.container_running() and DockerManager.mysql_port_responding():
            emit("[OK] MySQL respondendo via Docker em 127.0.0.1:3306.")
        else:
            emit("[WARN] MySQL nao esta acessivel.")

        if all_ok:
            emit("[OK] Todos os requisitos essenciais atendidos.")
        else:
            emit("[WARN] Alguns requisitos nao foram atendidos.")
        return all_ok

    @staticmethod
    def install_deps(on_line: Callable[[str], None] | None = None) -> bool:
        """Instala dependências do projeto se necessário."""
        emit = on_line or (lambda s: None)

        if not PACKAGE_FILE.exists():
            emit("[ERRO] package.json nao encontrado.")
            return False

        files_to_hash = [PACKAGE_FILE]
        for lock in ["pnpm-lock.yaml", "package-lock.json"]:
            lock_path = ROOT_DIR / lock
            if lock_path.exists():
                files_to_hash.append(lock_path)

        current_hash = hash_files(*files_to_hash)
        saved_hash = ""
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        if INSTALL_HASH_FILE.exists():
            saved_hash = INSTALL_HASH_FILE.read_text().strip()

        if (ROOT_DIR / "node_modules").exists() and current_hash == saved_hash:
            emit("[OK] Dependencias ja instaladas e alinhadas.")
            return True

        pm = NodeManager.detect_package_manager()
        pm_cmd = shutil.which(pm) or pm

        emit(f"[INFO] Instalando dependencias via {pm}...")
        if pm == "pnpm":
            install_cmd = [pm_cmd, "install", "--frozen-lockfile"]
        else:
            install_cmd = [pm_cmd, "install"]

        extra_env = {"CI": "true"}
        rc = run_cmd_live(install_cmd, cwd=ROOT_DIR, env=extra_env, on_line=on_line)
        if rc != 0:
            emit(f"[ERRO] Falha na instalacao de dependencias (codigo {rc}).")
            return False

        INSTALL_HASH_FILE.write_text(current_hash)
        emit("[OK] Dependencias instaladas com sucesso.")
        return True

    @staticmethod
    def ensure_pnpm(on_line: Callable[[str], None] | None = None) -> bool:
        """Garante que o pnpm esteja disponível se necessário."""
        emit = on_line or (lambda s: None)
        pm = NodeManager.detect_package_manager()
        if pm != "pnpm":
            return True
        if have("pnpm"):
            return True
        if have("corepack"):
            emit("[INFO] Ativando pnpm via corepack...")
            run_cmd(["corepack", "enable"], check=False)
            run_cmd(["corepack", "prepare", "pnpm@latest", "--activate"], check=False)
            return have("pnpm")
        emit("[ERRO] pnpm necessario mas corepack indisponivel.")
        return False


# ═══════════════════════════════════════════════════════════════════════════════
# GERENCIADOR DA APLICAÇÃO
# ═══════════════════════════════════════════════════════════════════════════════


class AppManager:
    """Gerencia o ciclo de vida da aplicação Next.js."""

    @staticmethod
    def _read_pid() -> int | None:
        if APP_PID_FILE.exists():
            try:
                return int(APP_PID_FILE.read_text().strip())
            except (ValueError, OSError):
                return None
        return None

    @staticmethod
    def _pid_running(pid: int) -> bool:
        try:
            os.kill(pid, 0)
            return True
        except (OSError, ProcessLookupError):
            return False

    @staticmethod
    def _read_meta(key: str) -> str:
        if not APP_META_FILE.exists():
            return ""
        for line in APP_META_FILE.read_text().splitlines():
            if line.startswith(f"{key}="):
                return line.split("=", 1)[1]
        return ""

    @staticmethod
    def stop(on_line: Callable[[str], None] | None = None) -> bool:
        """Encerra a aplicação gerenciada pelo orquestrador."""
        emit = on_line or (lambda s: None)
        pid = AppManager._read_pid()
        if pid is None or not AppManager._pid_running(pid):
            emit("[WARN] Nenhuma aplicacao ativa gerenciada pelo run.py.")
            APP_PID_FILE.unlink(missing_ok=True)
            APP_META_FILE.unlink(missing_ok=True)
            return True

        emit(f"[INFO] Encerrando aplicacao (PID: {pid})...")
        try:
            os.kill(pid, signal.SIGTERM)
        except OSError:
            pass

        for _ in range(15):
            if not AppManager._pid_running(pid):
                break
            time.sleep(1)

        if AppManager._pid_running(pid):
            emit("[WARN] Forcando encerramento (SIGKILL)...")
            try:
                os.kill(pid, signal.SIGKILL)
            except OSError:
                pass

        APP_PID_FILE.unlink(missing_ok=True)
        APP_META_FILE.unlink(missing_ok=True)
        emit("[OK] Aplicacao encerrada.")
        return True

    @staticmethod
    def _start(mode: str, cmd: list[str], on_line: Callable[[str], None] | None = None) -> bool:
        """Inicia a aplicação em background."""
        emit = on_line or (lambda s: None)
        AppManager.stop(on_line=on_line)

        if not (ROOT_DIR / "node_modules").exists():
            emit("[ERRO] Dependencias ausentes. Execute 'Instalar dependencias' primeiro.")
            return False

        env_vars = env_mgr.export_to_env()
        port = env_mgr.get("PORT", "3000")
        env_vars["PORT"] = port

        emit(f"[INFO] Iniciando aplicacao em modo '{mode}'...")
        proc = subprocess.Popen(
            cmd,
            cwd=ROOT_DIR,
            env={**os.environ, **env_vars},
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )

        STATE_DIR.mkdir(parents=True, exist_ok=True)
        APP_PID_FILE.write_text(str(proc.pid))
        APP_META_FILE.write_text(
            f"mode={mode}\n"
            f"port={port}\n"
            f"started_at={time.strftime('%Y-%m-%d %H:%M:%S')}\n"
        )

        emit(f"[INFO] Aplicacao iniciada (PID: {proc.pid}). Aguardando resposta HTTP...")
        url = f"http://127.0.0.1:{port}"
        for attempt in range(1, 91):
            time.sleep(2)
            try:
                import urllib.request

                req = urllib.request.Request(url, method="GET")
                with urllib.request.urlopen(req, timeout=3) as resp:
                    if resp.status < 500:
                        emit(f"[OK] Aplicacao respondendo em {url}")
                        return True
            except Exception:
                pass
            if attempt % 10 == 0:
                emit(f"[INFO] Aguardando aplicacao... ({attempt * 2}s)")

        emit(f"[ERRO] Aplicacao nao respondeu em {url} dentro do tempo esperado.")
        return False

    @staticmethod
    def dev_mode(on_line: Callable[[str], None] | None = None) -> bool:
        run_cmd_parts = NodeManager.get_run_cmd()
        return AppManager._start("dev", [*run_cmd_parts, "run", "dev"], on_line=on_line)

    @staticmethod
    def fast_dev_mode(on_line: Callable[[str], None] | None = None) -> bool:
        run_cmd_parts = NodeManager.get_run_cmd()
        return AppManager._start("dev", [*run_cmd_parts, "run", "dev"], on_line=on_line)

    @staticmethod
    def prod_build(on_line: Callable[[str], None] | None = None) -> bool:
        emit = on_line or (lambda s: None)
        env_vars = env_mgr.export_to_env()
        run_cmd_parts = NodeManager.get_run_cmd()
        emit("[INFO] Gerando build de producao...")
        rc = run_cmd_live(
            [*run_cmd_parts, "run", "build"], cwd=ROOT_DIR, env=env_vars, on_line=on_line
        )
        if rc != 0:
            emit("[ERRO] Build de producao falhou.")
            return False
        emit("[OK] Build de producao concluido.")
        return True

    @staticmethod
    def prod_mode(on_line: Callable[[str], None] | None = None) -> bool:
        run_cmd_parts = NodeManager.get_run_cmd()
        return AppManager._start("prod", [*run_cmd_parts, "run", "start"], on_line=on_line)

    @staticmethod
    def fast_prod_mode(on_line: Callable[[str], None] | None = None) -> bool:
        emit = on_line or (lambda s: None)
        build_id = ROOT_DIR / ".next" / "BUILD_ID"
        if not build_id.exists():
            emit("[ERRO] Build inexistente. Execute 'Subir stack completa em producao' primeiro.")
            return False
        run_cmd_parts = NodeManager.get_run_cmd()
        return AppManager._start("prod", [*run_cmd_parts, "run", "start"], on_line=on_line)

    @staticmethod
    def status(on_line: Callable[[str], None] | None = None) -> bool:
        """Exibe status consolidado do ambiente."""
        emit = on_line or (lambda s: None)
        env_mgr.load()

        emit("[INFO] === STATUS GERAL ===")

        if ENV_FILE.exists():
            emit("[OK] .env.local presente.")
        else:
            emit("[WARN] .env.local ausente.")

        if (ROOT_DIR / "node_modules").exists():
            emit("[OK] Dependencias do projeto instaladas.")
        else:
            emit("[WARN] Dependencias ausentes.")

        if DockerManager.is_installed():
            emit("[OK] Docker instalado.")
            if DockerManager.is_daemon_running():
                emit("[OK] Docker daemon ativo.")
            else:
                emit("[WARN] Docker daemon inativo.")
        else:
            emit("[WARN] Docker nao instalado.")

        if DockerManager.container_running():
            emit("[OK] Container MySQL 'lyra_metacare' rodando.")
            if DockerManager.mysql_port_responding():
                emit("[OK] MySQL respondendo em 127.0.0.1:3306.")
            else:
                emit("[WARN] MySQL nao responde na porta 3306.")
        else:
            emit("[WARN] Container MySQL parado ou inexistente.")

        pid = AppManager._read_pid()
        if pid and AppManager._pid_running(pid):
            mode = AppManager._read_meta("mode") or "desconhecido"
            port = AppManager._read_meta("port") or "3000"
            emit(f"[OK] Aplicacao ativa — PID: {pid} | Modo: {mode} | Porta: {port}")
        else:
            emit("[WARN] Aplicacao local parada.")

        return True

    @staticmethod
    def health(on_line: Callable[[str], None] | None = None) -> bool:
        """Verifica saúde operacional completa."""
        emit = on_line or (lambda s: None)
        NodeManager.doctor(on_line=on_line)
        emit("")
        emit("[INFO] === SAUDE OPERACIONAL ===")

        if ENV_FILE.exists():
            env_mgr.load()
            required = ["MYSQL_HOST", "MYSQL_PORT", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD", "AUTH_SECRET", "PORT"]
            missing = [k for k in required if not env_mgr.get(k)]
            if missing:
                emit(f"[WARN] Variaveis ausentes em .env.local: {', '.join(missing)}")
            else:
                emit("[OK] .env.local completo e valido.")
        else:
            emit("[WARN] .env.local nao existe.")

        if DockerManager.container_running() and DockerManager.mysql_port_responding():
            emit("[OK] MySQL Docker acessivel.")
        else:
            emit("[WARN] MySQL Docker nao acessivel.")

        pid = AppManager._read_pid()
        if pid and AppManager._pid_running(pid):
            emit("[OK] Aplicacao local em execucao.")
        else:
            emit("[WARN] Aplicacao local nao ativa.")

        return True


# ═══════════════════════════════════════════════════════════════════════════════
# AÇÕES COMPOSTAS (ORQUESTRAÇÃO)
# ═══════════════════════════════════════════════════════════════════════════════


def action_setup_env(on_line: Callable[[str], None] | None = None) -> bool:
    """Configura o .env.local com os valores padrão especificados."""
    emit = on_line or (lambda s: None)
    env_mgr.load()

    emit("[INFO] Configurando .env.local...")
    for key, default in DEFAULT_ENV.items():
        current = env_mgr.get(key)
        if not current and default:
            env_mgr.upsert(key, default)
            emit(f"  [+] {key} = {mask_secret(default) if 'PASSWORD' in key or 'SECRET' in key else default}")
        elif current:
            emit(f"  [=] {key} (mantido valor existente)")
        else:
            emit(f"  [-] {key} (sem valor padrao)")

    env_mgr.ensure_auth_secret()
    emit("[OK] .env.local configurado.")
    return True


def action_show_config(on_line: Callable[[str], None] | None = None) -> bool:
    """Mostra a configuração efetiva com segredos mascarados."""
    emit = on_line or (lambda s: None)
    env_mgr.load()
    emit("[INFO] === CONFIGURACAO EFETIVA ===")
    emit(f"  Ambiente: WSL2 Ubuntu")
    emit(f"  Gerenciador Node: {NodeManager.detect_package_manager()}")
    emit(f"  App: http://127.0.0.1:{env_mgr.get('PORT', '3000')}")
    emit(f"  MySQL host: {env_mgr.get('MYSQL_HOST', '127.0.0.1')}:{env_mgr.get('MYSQL_PORT', '3306')}")
    emit(f"  MySQL schema: {env_mgr.get('MYSQL_DATABASE', 'lyra_metacare')}")
    emit(f"  MySQL usuario app: {env_mgr.get('MYSQL_USER', 'lyra')}")
    emit(f"  MySQL senha app: {mask_secret(env_mgr.get('MYSQL_PASSWORD'))}")
    emit(f"  MySQL usuario admin: {env_mgr.get('MYSQL_ADMIN_USER', 'root')}")
    emit(f"  MySQL senha admin: {mask_secret(env_mgr.get('MYSQL_ADMIN_PASSWORD'))}")
    emit(f"  AUTH_SECRET: {mask_secret(env_mgr.get('AUTH_SECRET'))}")
    email = env_mgr.get("ADMIN_BOOTSTRAP_EMAIL")
    if email:
        emit(f"  Bootstrap admin: habilitado ({email})")
    else:
        emit("  Bootstrap admin: desabilitado")
    emit(f"  Docker container: {DOCKER_CONTAINER}")
    emit(f"  Docker imagem: {DOCKER_IMAGE}")
    return True


def action_full_docker_setup(on_line: Callable[[str], None] | None = None) -> bool:
    """Instala Docker se necessário, inicia daemon, cria container MySQL."""
    emit = on_line or (lambda s: None)

    if not DockerManager.is_installed():
        emit("[INFO] Docker nao instalado. Iniciando instalacao...")
        if not DockerManager.install(on_line=on_line):
            return False
    else:
        emit("[OK] Docker ja instalado.")

    if not DockerManager.is_daemon_running():
        emit("[INFO] Docker daemon inativo. Iniciando...")
        if not DockerManager.start_daemon(on_line=on_line):
            emit("[WARN] Tentando reparar Docker...")
            if not DockerManager.fix_docker(on_line=on_line):
                return False
    else:
        emit("[OK] Docker daemon ativo.")

    action_setup_env(on_line=on_line)

    if not DockerManager.ensure_mysql_container(on_line=on_line):
        return False

    if not MySQLManager._wait_mysql_ready(on_line=on_line, max_wait=30):
        emit("[ERRO] MySQL nao ficou pronto para conexoes.")
        return False

    if not MySQLManager.ensure_user_and_grants(on_line=on_line):
        return False

    emit("[OK] Docker + MySQL totalmente configurados e operacionais.")
    return True


def action_full_migration(on_line: Callable[[str], None] | None = None) -> bool:
    """Executa migração completa com verificação inteligente."""
    emit = on_line or (lambda s: None)

    emit("[INFO] Verificando estado atual do banco...")
    env_mgr.load()
    db_name = env_mgr.get("MYSQL_DATABASE", "lyra_metacare")

    rc, count_str = MySQLManager._docker_exec_sql(
        f"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '{db_name}'"
    )
    table_count = int(count_str.strip()) if rc == 0 and count_str.strip().isdigit() else 0

    rc, migration_exists = MySQLManager._docker_exec_sql(
        f"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '{db_name}' AND table_name = '_lyra_schema_migrations'"
    )
    has_migration_table = rc == 0 and migration_exists.strip() != "0"

    if table_count == 0:
        emit("[INFO] Banco vazio. Executando migracao completa...")
        return MySQLManager.run_migration(on_line=on_line)

    if has_migration_table:
        emit(f"[INFO] Banco possui {table_count} tabelas e tabela de migracoes.")
        emit("[INFO] Executando migracao incremental (somente pendentes)...")
        return MySQLManager.run_migration(on_line=on_line)

    emit(f"[INFO] Banco possui {table_count} tabelas mas SEM tabela de migracoes.")
    emit("[INFO] Executando migracao para sincronizar estado...")
    return MySQLManager.run_migration(on_line=on_line)


def action_dev_full(on_line: Callable[[str], None] | None = None) -> bool:
    """Stack completa de desenvolvimento: deps + docker + migration + app."""
    emit = on_line or (lambda s: None)

    emit("[INFO] === SUBINDO STACK COMPLETA DE DESENVOLVIMENTO ===")

    if not NodeManager.install_deps(on_line=on_line):
        return False

    if not action_full_docker_setup(on_line=on_line):
        return False

    if not action_full_migration(on_line=on_line):
        return False

    if not AppManager.dev_mode(on_line=on_line):
        return False

    emit("[OK] Stack de desenvolvimento completa e ativa.")
    return True


def action_dev_fast(on_line: Callable[[str], None] | None = None) -> bool:
    """Modo dev rápido: Docker + app sem reinstalar."""
    emit = on_line or (lambda s: None)

    if not (ROOT_DIR / "node_modules").exists():
        emit("[ERRO] Dependencias ausentes. Use 'Subir stack completa' primeiro.")
        return False

    if not DockerManager.container_running():
        action_full_docker_setup(on_line=on_line)

    if not AppManager.fast_dev_mode(on_line=on_line):
        return False

    emit("[OK] Modo desenvolvimento rapido ativo.")
    return True


def action_prod_full(on_line: Callable[[str], None] | None = None) -> bool:
    """Stack completa de produção."""
    emit = on_line or (lambda s: None)

    if not NodeManager.install_deps(on_line=on_line):
        return False
    if not action_full_docker_setup(on_line=on_line):
        return False
    if not action_full_migration(on_line=on_line):
        return False
    if not AppManager.prod_build(on_line=on_line):
        return False
    if not AppManager.prod_mode(on_line=on_line):
        return False

    emit("[OK] Stack de producao completa e ativa.")
    return True


def action_prod_fast(on_line: Callable[[str], None] | None = None) -> bool:
    """Modo produção rápido."""
    emit = on_line or (lambda s: None)

    if not DockerManager.container_running():
        action_full_docker_setup(on_line=on_line)

    if not AppManager.fast_prod_mode(on_line=on_line):
        return False

    emit("[OK] Modo producao rapido ativo.")
    return True


def action_stop_all(on_line: Callable[[str], None] | None = None) -> bool:
    """Encerra aplicação e container Docker."""
    emit = on_line or (lambda s: None)
    AppManager.stop(on_line=on_line)
    emit("[INFO] Container MySQL permanece ativo (gerenciado pelo Docker).")
    return True


def action_mysql_logs(on_line: Callable[[str], None] | None = None) -> bool:
    """Acompanha os logs do MySQL no container Docker."""
    emit = on_line or (lambda s: None)

    if not DockerManager.container_exists():
        emit("[ERRO] Container 'lyra_metacare' nao existe.")
        return False

    emit("[INFO] Exibindo ultimas 100 linhas de log do MySQL (Ctrl+C para sair)...")
    rc = run_cmd_live(
        ["docker", "logs", "--tail", "100", "-f", DOCKER_CONTAINER],
        on_line=on_line,
    )
    return rc == 0


def action_help_cli(on_line: Callable[[str], None] | None = None) -> bool:
    """Mostra ajuda dos comandos CLI."""
    emit = on_line or (lambda s: None)
    help_lines = [
        "Uso:",
        "  python3 run.py              abre o menu interativo",
        "  python3 run.py doctor       valida requisitos do sistema",
        "  python3 run.py install      instala dependencias",
        "  python3 run.py config       cria/atualiza .env.local",
        "  python3 run.py show-config  mostra configuracao efetiva",
        "  python3 run.py docker-setup instala Docker + MySQL",
        "  python3 run.py migrate      aplica migracoes MySQL",
        "  python3 run.py verify-db    verifica schema e tabelas",
        "  python3 run.py backup       gera backup do banco",
        "  python3 run.py dev          stack completa dev",
        "  python3 run.py fast-dev     dev rapido",
        "  python3 run.py prod         stack completa producao",
        "  python3 run.py fast-prod    producao rapida",
        "  python3 run.py status       status consolidado",
        "  python3 run.py health       check de saude",
        "  python3 run.py stop-app     encerra aplicacao",
        "  python3 run.py stop-all     encerra tudo",
        "  python3 run.py logs         logs do MySQL",
        "  python3 run.py help         mostra esta ajuda",
    ]
    for line in help_lines:
        emit(line)
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# DEFINIÇÃO DE MENUS (SISTEMA EXTENSÍVEL)
# ═══════════════════════════════════════════════════════════════════════════════
#
# Para adicionar um novo menu ou item:
# 1. Defina a função de ação: def minha_acao(on_line=None) -> bool
# 2. Adicione ao dicionário MENUS com type="action" e action=minha_acao
# 3. Ou crie um submenu com type="submenu" e target="nome_do_submenu"
#
# Estrutura: MENUS[nome_menu] = { "title": str, "items": [MenuItem, ...] }
# MenuItem = { "icon": str, "label": str, "desc": str, "type": str, ... }
# type="submenu" → "target": nome_do_submenu
# type="action"  → "action": callable(on_line) -> bool
# type="back"    → volta ao menu_pai (target)
# type="exit"    → encerra a TUI

@dataclass
class MenuItem:
    icon: str
    label: str
    desc: str
    item_type: str  # "submenu", "action", "back", "exit"
    action: Callable[[Callable[[str], None] | None], bool] | None = None
    target: str = ""


MENUS: dict[str, dict[str, Any]] = {
    "main": {
        "title": "Menu Principal",
        "items": [
            MenuItem("🔧", "Preparação e Diagnóstico", "Validações, dependências, configuração e saúde", "submenu", target="environment"),
            MenuItem("🐳", "Docker e MySQL", "Instalação, container, schema, grants e migrações", "submenu", target="database"),
            MenuItem("💾", "Backup e Restore", "Backup do banco e restore seguro", "submenu", target="backup"),
            MenuItem("🚀", "Aplicação Web", "Dev/Prod e controle do processo local", "submenu", target="application"),
            MenuItem("📋", "Ajuda CLI", "Comandos disponíveis via terminal", "action", action=action_help_cli),
            MenuItem("🚪", "Sair", "Encerra a interface interativa", "exit"),
        ],
    },
    "environment": {
        "title": "Preparação e Diagnóstico",
        "items": [
            MenuItem("🩺", "Validar requisitos", "Checa Node, npm, Git, Docker e ferramentas", "action", action=NodeManager.doctor),
            MenuItem("📦", "Instalar dependências", "Instala somente se necessário", "action", action=NodeManager.install_deps),
            MenuItem("⚙️", "Configurar .env.local", "Cria/atualiza com valores padrão", "action", action=action_setup_env),
            MenuItem("🔍", "Mostrar configuração", "Exibe config ativa com segredos mascarados", "action", action=action_show_config),
            MenuItem("📊", "Status consolidado", "Resume app, Docker, MySQL e ambiente", "action", action=AppManager.status),
            MenuItem("💓", "Check de saúde", "Valida ambiente e prontidão operacional", "action", action=AppManager.health),
            MenuItem("↩️", "Voltar", "Retorna ao menu principal", "back", target="main"),
        ],
    },
    "database": {
        "title": "Docker e MySQL",
        "items": [
            MenuItem("🐳", "Setup Docker + MySQL", "Instala Docker, cria container e configura tudo", "action", action=action_full_docker_setup),
            MenuItem("🔎", "Inspecionar container", "Verifica imagem, container e porta MySQL", "action", action=DockerManager.inspect_mysql),
            MenuItem("👤", "Criar usuário e grants", "Cria 'lyra' e configura permissões", "action", action=MySQLManager.ensure_user_and_grants),
            MenuItem("📐", "Aplicar migrações", "Executa o motor de migração do projeto", "action", action=action_full_migration),
            MenuItem("✅", "Verificar schema", "Confere banco, tabelas e migrações", "action", action=MySQLManager.verify_database),
            MenuItem("📜", "Logs do MySQL", "Acompanha logs do container Docker", "action", action=action_mysql_logs),
            MenuItem("↩️", "Voltar", "Retorna ao menu principal", "back", target="main"),
        ],
    },
    "backup": {
        "title": "Backup e Restore",
        "items": [
            MenuItem("💾", "Gerar backup completo", "Dump full do schema do app via Docker", "action", action=MySQLManager.backup_database),
            MenuItem("↩️", "Voltar", "Retorna ao menu principal", "back", target="main"),
        ],
    },
    "application": {
        "title": "Aplicação Web",
        "items": [
            MenuItem("🟢", "Stack completa DEV", "Deps + Docker + Migração + App dev", "action", action=action_dev_full),
            MenuItem("🔵", "Stack completa PROD", "Deps + Docker + Migração + Build + App prod", "action", action=action_prod_full),
            MenuItem("⚡", "Dev rápido", "Usa deps existentes e sobe direto", "action", action=action_dev_fast),
            MenuItem("⚡", "Prod rápido", "Usa build existente e sobe direto", "action", action=action_prod_fast),
            MenuItem("🛑", "Encerrar aplicação", "Finaliza processo do app", "action", action=AppManager.stop),
            MenuItem("⏹️", "Encerrar tudo", "Encerra app (Docker permanece)", "action", action=action_stop_all),
            MenuItem("↩️", "Voltar", "Retorna ao menu principal", "back", target="main"),
        ],
    },
}


# ═══════════════════════════════════════════════════════════════════════════════
# ENGINE TUI COM RICH
# ═══════════════════════════════════════════════════════════════════════════════


class TUIEngine:
    """Motor da interface TUI interativa baseada em Rich."""

    def __init__(self) -> None:
        self.current_menu = "main"
        self.selected_index = 0
        self.output_lines: list[str] = ["Aguardando uma ação do operador."]
        self.status_kind = "info"
        self.status_message = "Pronto. Use ↑↓ para navegar, Enter para executar, Q para sair."
        self.running = True
        self.started_at = time.time()

    def _items(self) -> list[MenuItem]:
        return MENUS[self.current_menu]["items"]

    def _title(self) -> str:
        return MENUS[self.current_menu]["title"]

    def _clamp_index(self) -> None:
        items = self._items()
        if self.selected_index < 0:
            self.selected_index = 0
        if self.selected_index >= len(items):
            self.selected_index = len(items) - 1

    def _elapsed(self) -> str:
        e = int(time.time() - self.started_at)
        return f"{e // 3600:02d}:{(e % 3600) // 60:02d}:{e % 60:02d}"

    def _render_header(self) -> Panel:
        env_mgr.load()
        pm = NodeManager.detect_package_manager()
        port = env_mgr.get("PORT", "3000")
        mysql_host = env_mgr.get("MYSQL_HOST", "127.0.0.1")
        mysql_port = env_mgr.get("MYSQL_PORT", "3306")

        header_text = Text()
        header_text.append("LYRA METACARE ", style="bold cyan")
        header_text.append(f"v{SCRIPT_VERSION} ", style="bold white")
        header_text.append(f"— {self._elapsed()} ", style="dim")
        header_text.append("│ ", style="dim cyan")
        header_text.append("WSL2 ", style="white")
        header_text.append("│ ", style="dim cyan")
        header_text.append(f"{pm} ", style="white")
        header_text.append("│ ", style="dim cyan")
        header_text.append(f"app:{port} ", style="white")
        header_text.append("│ ", style="dim cyan")
        header_text.append(f"mysql:{mysql_host}:{mysql_port}", style="white")

        return Panel(
            header_text,
            border_style="cyan",
            padding=(0, 1),
        )

    def _render_menu(self) -> Table:
        table = Table(
            show_header=False,
            show_edge=False,
            show_lines=False,
            box=None,
            padding=(0, 1),
            expand=True,
        )
        table.add_column("", width=3, no_wrap=True)
        table.add_column("", min_width=30, no_wrap=True)
        table.add_column("", ratio=1)

        items = self._items()
        for i, item in enumerate(items):
            is_selected = i == self.selected_index
            pointer = "▸ " if is_selected else "  "

            if is_selected:
                icon_style = "bold cyan"
                label_style = "bold cyan"
                desc_style = "white"
            else:
                icon_style = "dim"
                label_style = "white"
                desc_style = "dim"

            table.add_row(
                Text(f"{pointer}{item.icon}", style=icon_style),
                Text(item.label, style=label_style),
                Text(item.desc, style=desc_style),
            )
        return table

    def _render_output(self) -> Panel:
        max_lines = max(8, (os.get_terminal_size().lines - 22))
        visible = self.output_lines[-max_lines:]
        output_text = Text()
        for line in visible:
            if line.startswith("[OK]"):
                output_text.append("✔ ", style="green")
                output_text.append(line[4:].strip() + "\n", style="green")
            elif line.startswith("[ERRO]"):
                output_text.append("✖ ", style="red")
                output_text.append(line[6:].strip() + "\n", style="red")
            elif line.startswith("[WARN]"):
                output_text.append("⚠ ", style="yellow")
                output_text.append(line[6:].strip() + "\n", style="yellow")
            elif line.startswith("[INFO]"):
                output_text.append("• ", style="cyan")
                output_text.append(line[6:].strip() + "\n", style="white")
            else:
                output_text.append(f"  {line}\n", style="dim white")

        return Panel(
            output_text,
            title="[bold]Saída ao Vivo[/bold]",
            border_style="dim cyan",
            padding=(0, 1),
        )

    def _render_status_bar(self) -> Text:
        status_text = Text()
        if self.status_kind == "ok":
            status_text.append(" ✔ ", style="bold green")
        elif self.status_kind == "err":
            status_text.append(" ✖ ", style="bold red")
        elif self.status_kind == "warn":
            status_text.append(" ⚠ ", style="bold yellow")
        else:
            status_text.append(" • ", style="bold cyan")
        status_text.append(self.status_message, style="white")
        return status_text

    def _render_footer(self) -> Text:
        footer = Text()
        footer.append("  ↑↓", style="bold cyan")
        footer.append(" navegar  ", style="dim")
        footer.append("Enter", style="bold cyan")
        footer.append(" executar  ", style="dim")
        footer.append("B", style="bold cyan")
        footer.append(" voltar  ", style="dim")
        footer.append("Q", style="bold cyan")
        footer.append(" sair", style="dim")
        return footer

    def _render_full(self) -> Group:
        return Group(
            self._render_header(),
            Text(f"  {self._title()}", style="bold white"),
            Text(),
            self._render_menu(),
            Text(),
            self._render_output(),
            self._render_status_bar(),
            self._render_footer(),
        )

    def _on_line(self, line: str) -> None:
        """Callback para adicionar linhas na saída ao vivo."""
        self.output_lines.append(line)
        if len(self.output_lines) > 500:
            self.output_lines = self.output_lines[-500:]

    def _execute_action(self, item: MenuItem) -> None:
        """Executa uma ação com saída ao vivo no terminal."""
        if not item.action:
            return

        self.output_lines.clear()
        self.output_lines.append(f"[INFO] Iniciando: {item.label}")
        self.status_kind = "info"
        self.status_message = f"Executando: {item.label}..."

        console.clear()

        header_panel = Panel(
            Text(f"LYRA METACARE — Executando: {item.label}", style="bold cyan"),
            border_style="cyan",
            padding=(0, 1),
        )
        console.print(header_panel)

        progress = Progress(
            SpinnerColumn("dots"),
            TextColumn("[lyra.progress.text]{task.description}"),
            BarColumn(bar_width=None, style="dim cyan", complete_style="cyan"),
            TaskProgressColumn(),
            TimeElapsedColumn(),
            console=console,
            expand=True,
        )

        task = progress.add_task(f"{item.icon} {item.label}", total=None)
        progress.start()

        success = False
        try:
            def emit(line: str) -> None:
                self._on_line(line)
                if line.startswith("[OK]"):
                    console.print(f"  [green]✔[/green] {line[4:].strip()}")
                elif line.startswith("[ERRO]"):
                    console.print(f"  [red]✖[/red] {line[6:].strip()}")
                elif line.startswith("[WARN]"):
                    console.print(f"  [yellow]⚠[/yellow] {line[6:].strip()}")
                elif line.startswith("[INFO]"):
                    console.print(f"  [cyan]•[/cyan] {line[6:].strip()}")
                else:
                    console.print(f"    [dim]{escape(line)}[/dim]")

            success = item.action(on_line=emit)
        except KeyboardInterrupt:
            self._on_line("[WARN] Operação interrompida pelo operador.")
            success = False
        except Exception as exc:
            self._on_line(f"[ERRO] Exceção: {exc}")
            success = False
        finally:
            progress.stop()

        if success:
            self.status_kind = "ok"
            self.status_message = f"{item.label} concluído com sucesso."
            self._on_line(f"[OK] Concluído: {item.label}")
            console.print(f"\n  [green bold]✔ {item.label} concluído com sucesso.[/green bold]")
        else:
            self.status_kind = "err"
            self.status_message = f"{item.label} falhou."
            self._on_line(f"[ERRO] Falhou: {item.label}")
            console.print(f"\n  [red bold]✖ {item.label} falhou.[/red bold]")

        console.print("\n  [dim]Pressione Enter para voltar ao menu...[/dim]")
        try:
            input()
        except (EOFError, KeyboardInterrupt):
            pass

    def _read_key(self) -> str:
        """Lê uma tecla do terminal (raw mode)."""
        import termios
        import tty

        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setraw(fd)
            ch = sys.stdin.read(1)
            if ch == "\x1b":
                ch2 = sys.stdin.read(1)
                if ch2 == "[":
                    ch3 = sys.stdin.read(1)
                    if ch3 == "A":
                        return "UP"
                    elif ch3 == "B":
                        return "DOWN"
                    elif ch3 == "D":
                        return "LEFT"
                return "ESC"
            elif ch in ("\r", "\n"):
                return "ENTER"
            elif ch.lower() == "q":
                return "QUIT"
            elif ch.lower() == "b":
                return "BACK"
            elif ch.lower() == "k":
                return "UP"
            elif ch.lower() == "j":
                return "DOWN"
            return ch
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)

    def _boot_animation(self) -> None:
        """Animação de boot minimalista."""
        console.clear()
        frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
        for i in range(12):
            console.clear()
            frame = frames[i % len(frames)]
            lines = os.get_terminal_size().lines
            cols = os.get_terminal_size().columns
            pad_v = lines // 2 - 2
            for _ in range(pad_v):
                console.print()
            console.print(
                Align.center(f"[dim]•[/dim] [bold]LYRA METACARE[/bold] [bold]v{SCRIPT_VERSION}[/bold]")
            )
            console.print(
                Align.center(f"[bold cyan]Carregando interface operacional local[/bold cyan]")
            )
            console.print(
                Align.center(f"[green]{frame}[/green] [dim]preparando TUI com Docker MySQL e app local[/dim]")
            )
            time.sleep(0.06)

    def run(self) -> None:
        """Loop principal da TUI."""
        self._boot_animation()

        while self.running:
            self._clamp_index()
            console.clear()
            console.print(self._render_full())

            try:
                key = self._read_key()
            except (EOFError, KeyboardInterrupt):
                break

            items = self._items()

            if key == "UP":
                self.selected_index = max(0, self.selected_index - 1)
            elif key == "DOWN":
                self.selected_index = min(len(items) - 1, self.selected_index + 1)
            elif key == "BACK" or key == "LEFT":
                self.current_menu = "main"
                self.selected_index = 0
                self.status_kind = "info"
                self.status_message = "Retornado ao menu principal."
            elif key == "QUIT":
                break
            elif key == "ENTER":
                item = items[self.selected_index]
                if item.item_type == "submenu":
                    self.current_menu = item.target
                    self.selected_index = 0
                    self.status_kind = "info"
                    self.status_message = f"{item.label} aberto."
                elif item.item_type == "back":
                    self.current_menu = item.target
                    self.selected_index = 0
                    self.status_kind = "info"
                    self.status_message = "Retornado ao menu principal."
                elif item.item_type == "exit":
                    break
                elif item.item_type == "action":
                    self._execute_action(item)

        console.clear()
        console.print("[bold cyan]LYRA METACARE[/bold cyan] — Sessão encerrada.\n")


# ═══════════════════════════════════════════════════════════════════════════════
# CLI (COMANDOS DIRETOS)
# ═══════════════════════════════════════════════════════════════════════════════

CLI_COMMANDS: dict[str, Callable[[Callable[[str], None] | None], bool]] = {
    "doctor": NodeManager.doctor,
    "install": NodeManager.install_deps,
    "config": action_setup_env,
    "configure": action_setup_env,
    "show-config": action_show_config,
    "docker-setup": action_full_docker_setup,
    "migrate": action_full_migration,
    "verify-db": MySQLManager.verify_database,
    "backup": MySQLManager.backup_database,
    "dev": action_dev_full,
    "fast-dev": action_dev_fast,
    "prod": action_prod_full,
    "fast-prod": action_prod_fast,
    "status": AppManager.status,
    "health": AppManager.health,
    "stop-app": AppManager.stop,
    "stop-all": action_stop_all,
    "logs": action_mysql_logs,
    "help": action_help_cli,
}


def cli_emit(line: str) -> None:
    """Emissão formatada para modo CLI (sem TUI)."""
    if line.startswith("[OK]"):
        console.print(f"  [green]✔[/green] {line[4:].strip()}")
    elif line.startswith("[ERRO]"):
        console.print(f"  [red]✖[/red] {line[6:].strip()}")
    elif line.startswith("[WARN]"):
        console.print(f"  [yellow]⚠[/yellow] {line[6:].strip()}")
    elif line.startswith("[INFO]"):
        console.print(f"  [cyan]•[/cyan] {line[6:].strip()}")
    else:
        console.print(f"    [dim]{escape(line)}[/dim]")


def main() -> None:
    """Ponto de entrada principal."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    if len(sys.argv) < 2 or sys.argv[1] == "menu":
        if not sys.stdin.isatty() or not sys.stdout.isatty():
            action_help_cli(on_line=cli_emit)
            return
        tui = TUIEngine()
        tui.run()
        return

    command = sys.argv[1]
    if command in ("-h", "--help"):
        command = "help"

    handler = CLI_COMMANDS.get(command)
    if not handler:
        console.print(f"[red]Comando desconhecido: {command}[/red]")
        console.print("[dim]Use 'python3 run.py help' para ver os comandos disponiveis.[/dim]")
        sys.exit(1)

    console.print(f"\n[bold cyan]LYRA METACARE[/bold cyan] v{SCRIPT_VERSION} — {command}\n")
    success = handler(on_line=cli_emit)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
