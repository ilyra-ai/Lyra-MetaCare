#!/usr/bin/env python3
"""
Lyra MetaCare · launcher oficial para WSL2 Ubuntu (ou Linux equivalente).

Uso:
  python3 run.py                         menu interativo (com terminal) ou ajuda
  python3 run.py up [--prod]             ambiente → dependências → MySQL →
                                         migrations → aplicação → verificação
  python3 run.py app [--prod]            somente a aplicação (banco já saudável)
  python3 run.py db                      MySQL (Docker Compose) + migrations
  python3 run.py migrate                 somente as migrations
  python3 run.py doctor                  diagnóstico completo, somente leitura
  python3 run.py fix                     correções seguras e idempotentes
  python3 run.py repair [--sim]          recria artefatos (.next, node_modules,
                                         container) preservando os dados
  python3 run.py purge --confirmar-purge APAGA o banco local (com backup antes)
  python3 run.py status                  estado consolidado
  python3 run.py logs [app|db] [--seguir]
  python3 run.py stop [app|db]           para aplicação e banco (padrão: ambos)
  python3 run.py help

Princípios:
- Configuração única: `.env.local`, criado ou completado por
  `scripts/env-init.mjs` a partir do `.env.example`; o MySQL roda pelo
  `compose.yaml` com `docker compose --env-file .env.local`.
- Nenhuma operação destrutiva automática: nada de `apt`, `sudo`, remoção de
  pacotes ou de diretórios do sistema; processos de terceiros nunca são
  encerrados. Apagar dados exige `purge --confirmar-purge` e é precedido de
  backup verificado do volume.
- Dependências Python (Rich) em ambiente virtual próprio (.lyra-run/venv),
  instaladas a partir de `requirements-run.txt` com hashes. Sem o Rich, a
  linha de comando funciona em modo texto.
- Todo comando executado é registrado (comando, saída integral e exit code)
  em `.logs/`, e falhas mostram a causa provável e o caminho do log.
"""

from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import os
import platform
import pwd
import re
import shlex
import shutil
import signal
import socket
import subprocess
import sys
import time
import traceback
import urllib.error
import urllib.request
from collections.abc import Callable, Iterator
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, TextIO

# Objeto JSON decodificado (package.json, app.json, saída do Compose).
JsonObjeto = dict[str, Any]


def agora() -> datetime:
    """Hora local com fuso explícito (registrada com offset, ex.: -03:00)."""
    return datetime.now(timezone.utc).astimezone()


PYTHON_MINIMO = (3, 10)

if sys.version_info < PYTHON_MINIMO:
    sys.stderr.write(
        "[ERRO] O run.py requer Python 3.10 ou superior "
        f"(encontrado {platform.python_version()}).\n"
    )
    sys.exit(2)

# ═════════════════════════════════════════════════════════════════════════════
# Caminhos e constantes
# ═════════════════════════════════════════════════════════════════════════════

RAIZ = Path(__file__).resolve().parent
ESTADO = RAIZ / ".lyra-run"
LOGS = RAIZ / ".logs"
VENV = ESTADO / "venv"
REQUISITOS = RAIZ / "requirements-run.txt"
ENV_LOCAL = RAIZ / ".env.local"
ENV_EXEMPLO = RAIZ / ".env.example"
ENV_INIT = RAIZ / "scripts" / "env-init.mjs"
MIGRATE = RAIZ / "scripts" / "mysql-migrate.mjs"
MYSQL_VOLUME = RAIZ / "scripts" / "mysql-upgrade.mjs"
COMPOSE_FILE = RAIZ / "compose.yaml"
NVMRC = RAIZ / ".nvmrc"
PACKAGE_JSON = RAIZ / "package.json"
LOCKFILE = RAIZ / "pnpm-lock.yaml"
LOCK_INSTALADO = RAIZ / "node_modules" / ".pnpm" / "lock.yaml"
MIGRATIONS_DIR = RAIZ / "mysql" / "migrations"
APP_PID = ESTADO / "app.pid"
APP_META = ESTADO / "app.json"

SERVICO_DB = "mysql"
# container_name do serviço no compose.yaml (consultável mesmo sem .env.local).
CONTAINER_DB = "lyra-metacare-mysql"
PORTA_APP_PADRAO = 3000
PORTA_DB_PADRAO = 3307
FAIXA_BUSCA_PORTA = 50
TEMPO_MAX_APP = 240
TEMPO_PARADA_APP = 20
LOGS_MANTIDOS = 40
COMPOSE_MINIMO = (2, 20)
DOCKER_MINIMO = (25, 0)
UBUNTU_MINIMO = (22, 4)

SEGREDOS = (
    "MYSQL_PASSWORD",
    "MYSQL_ROOT_PASSWORD",
    "AUTH_SECRET",
    "ADMIN_BOOTSTRAP_PASSWORD",
)

# Causas prováveis reconhecidas na saída de comandos que falharam.
CAUSAS_CONHECIDAS: tuple[tuple[str, str], ...] = (
    (
        r"permission denied.*docker\.sock",
        (
            "seu usuário não tem acesso ao socket do Docker. Com Docker Engine: "
            "`sudo usermod -aG docker $USER` e reabra o terminal; com Docker "
            "Desktop: ative a integração WSL desta distribuição."
        ),
    ),
    (
        # Docker 29+: "failed to connect to the docker API at ...; check if the
        # path is correct and if the daemon is running".
        (
            r"Cannot connect to the Docker daemon|Is the docker daemon running|"
            r"failed to connect to the docker API|if the daemon is running"
        ),
        (
            "o daemon do Docker não está em execução. Abra o Docker Desktop (com "
            "integração WSL) ou inicie o Docker Engine (`sudo service docker start`)."
        ),
    ),
    (
        r"ERR_PNPM_UNSUPPORTED_ENGINE",
        (
            "versão do Node.js fora do intervalo do package.json. Use a versão do "
            ".nvmrc: `nvm install && nvm use`."
        ),
    ),
    (
        r"ERR_PNPM_OUTDATED_LOCKFILE|frozen-lockfile",
        (
            "o pnpm-lock.yaml não corresponde ao package.json; atualize o "
            "repositório (`git pull`) antes de instalar."
        ),
    ),
    (
        r"MY-014060|Cannot upgrade from \d+ to \d+",
        "o volume do MySQL foi criado por uma versão antiga; rode `pnpm db:upgrade`.",
    ),
    (
        r"required variable \w+ is missing",
        "o .env.local está incompleto; rode `pnpm env:init`.",
    ),
    (
        r"Access denied for user",
        (
            "as senhas do .env.local não correspondem às do volume do MySQL (o "
            "MySQL só aplica as senhas na criação do volume)."
        ),
    ),
    (
        r"ECONNREFUSED|connect ETIMEDOUT|Can't connect to MySQL",
        "o MySQL não está acessível na porta configurada; rode `python3 run.py db`.",
    ),
    (
        r"EADDRINUSE|address already in use|port is already allocated",
        "a porta já está em uso por outro processo; veja `python3 run.py doctor`.",
    ),
    (
        r"ENOSPC|no space left on device",
        "sem espaço em disco.",
    ),
    (
        r"getaddrinfo|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|TLS handshake timeout",
        "falha de rede ou DNS ao baixar dependências ou imagens.",
    ),
    (
        r"429 Too Many Requests|toomanyrequests",
        (
            "limite de downloads do Docker Hub atingido; aguarde alguns minutos "
            "ou faça `docker login`."
        ),
    ),
    (
        # Next.js 16 ("error TS2322", "Failed to type check") e anteriores.
        (
            r"error TS\d+|Failed to type check|Type error:|Failed to compile|"
            r"Build error occurred|Module not found"
        ),
        (
            "erro de compilação ou de tipos no código da aplicação; rode "
            "`pnpm check:types` e veja o arquivo e a linha no log."
        ),
    ),
)


class FalhaEtapa(Exception):
    """Falha esperada de uma etapa, com mensagem pronta para o operador."""


class Cancelado(Exception):
    """Operação recusada ou cancelada pelo operador."""


# ═════════════════════════════════════════════════════════════════════════════
# Bootstrap da interface (ambiente virtual próprio com Rich)
# ═════════════════════════════════════════════════════════════════════════════


def _hash_arquivo(caminho: Path) -> str:
    return hashlib.sha256(caminho.read_bytes()).hexdigest()


def preparar_interface(argv: list[str]) -> None:
    """Garante o Rich no venv do launcher e reexecuta dentro dele.

    Nunca instala nada no Python do sistema. Em qualquer falha, segue em modo
    texto (a linha de comando continua completa; só o menu fica indisponível).
    """
    if os.environ.get("LYRA_RUN_MODO_TEXTO") == "1":
        return

    python_venv = VENV / "bin" / "python"
    marcador = VENV / ".requirements.sha256"
    esperado = _hash_arquivo(REQUISITOS) if REQUISITOS.exists() else ""
    dentro_do_venv = Path(sys.prefix).resolve() == VENV.resolve()

    if dentro_do_venv:
        return

    venv_valido = (
        python_venv.exists()
        and marcador.exists()
        and marcador.read_text(encoding="utf-8").strip() == esperado
    )

    if not venv_valido:
        if not esperado:
            return
        sys.stdout.write(
            "[INFO] Preparando o ambiente Python do launcher (.lyra-run/venv)...\n"
        )
        sys.stdout.flush()
        ESTADO.mkdir(parents=True, exist_ok=True)
        criacao = subprocess.run(
            [sys.executable, "-m", "venv", "--clear", str(VENV)],
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            check=False,
        )
        if criacao.returncode != 0:
            versao = f"{sys.version_info.major}.{sys.version_info.minor}"
            sys.stdout.write(
                "[AVISO] Não foi possível criar o ambiente virtual do launcher "
                f"({criacao.stderr.strip().splitlines()[-1] if criacao.stderr.strip() else 'sem detalhes'}).\n"
                f"        No Ubuntu, instale o módulo venv: sudo apt install python{versao}-venv\n"
                "        Continuando em modo texto.\n"
            )
            return
        instalacao = subprocess.run(
            [
                str(python_venv),
                "-m",
                "pip",
                "install",
                "--disable-pip-version-check",
                "--quiet",
                "--require-hashes",
                "--only-binary=:all:",
                "-r",
                str(REQUISITOS),
            ],
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            check=False,
        )
        if instalacao.returncode != 0:
            ultima = (instalacao.stderr or instalacao.stdout).strip().splitlines()
            sys.stdout.write(
                "[AVISO] Falha ao instalar as dependências do launcher "
                f"({ultima[-1] if ultima else 'sem detalhes'}). Continuando em modo texto.\n"
            )
            return
        marcador.write_text(esperado + "\n", encoding="utf-8")

    os.execv(str(python_venv), [str(python_venv), str(Path(__file__).resolve()), *argv])


# ═════════════════════════════════════════════════════════════════════════════
# Saída no terminal e registro em log
# ═════════════════════════════════════════════════════════════════════════════


class Saida:
    """Mensagens padronizadas no terminal, com Rich quando disponível."""

    def __init__(self) -> None:
        self.cores = sys.stdout.isatty() and not os.environ.get("NO_COLOR")
        self.console = None
        try:
            from rich.console import Console

            self.console = Console(
                highlight=False, no_color=not self.cores, soft_wrap=True
            )
        except ImportError:
            self.console = None
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(errors="replace")
        self.registro: TextIO | None = None
        self.caminho_registro: Path | None = None

    @property
    def tem_rich(self) -> bool:
        return self.console is not None

    def abrir_registro(self, comando: str) -> None:
        LOGS.mkdir(parents=True, exist_ok=True)
        momento = agora()
        carimbo = momento.strftime("%Y%m%d-%H%M%S")
        self.caminho_registro = LOGS / f"run-py-{carimbo}-{comando}.log"
        self.registro = self.caminho_registro.open("a", encoding="utf-8")
        self.registrar(f"# run.py {comando} · {momento.isoformat(timespec='seconds')}")
        antigos = sorted(LOGS.glob("run-py-*.log"))[:-LOGS_MANTIDOS]
        for antigo in antigos:
            antigo.unlink(missing_ok=True)

    def registrar(self, texto: str) -> None:
        if self.registro:
            self.registro.write(texto + "\n")
            self.registro.flush()

    def _imprimir(self, marcacao: str, texto: str, simples: str) -> None:
        self.registrar(simples)
        if self.console:
            from rich.markup import escape

            self.console.print(marcacao.format(escape(texto)))
        else:
            print(simples, flush=True)

    def titulo(self, texto: str) -> None:
        self._imprimir("\n[bold #2dd4bf]━━ {} ━━[/]", texto, f"\n== {texto} ==")

    def etapa(self, texto: str) -> None:
        self._imprimir("[bold cyan]▶[/] [bold]{}[/]", texto, f"▶ {texto}")

    def ok(self, texto: str) -> None:
        self._imprimir("  [green]✔[/] {}", texto, f"  [OK] {texto}")

    def info(self, texto: str) -> None:
        self._imprimir("  [cyan]•[/] {}", texto, f"  [INFO] {texto}")

    def aviso(self, texto: str) -> None:
        self._imprimir("  [yellow]⚠[/] {}", texto, f"  [AVISO] {texto}")

    def erro(self, texto: str) -> None:
        self._imprimir("  [bold red]✖[/] {}", texto, f"  [ERRO] {texto}")

    def comando(self, texto: str) -> None:
        self._imprimir("  [dim]$ {}[/]", texto, f"  $ {texto}")

    def detalhe(self, texto: str) -> None:
        self._imprimir("    [dim]{}[/]", texto, f"    {texto}")

    def tabela(self, titulo: str, colunas: list[str], linhas: list[list[str]]) -> None:
        self.registrar(f"[{titulo}]")
        for linha in linhas:
            self.registrar(" | ".join(linha))
        if self.console:
            from rich.table import Table

            tabela = Table(title=titulo, title_style="bold", expand=False)
            for coluna in colunas:
                tabela.add_column(coluna, overflow="fold")
            for linha in linhas:
                tabela.add_row(*linha)
            self.console.print(tabela)
            return
        larguras = [
            max(len(coluna), *(len(linha[i]) for linha in linhas))
            if linhas
            else len(coluna)
            for i, coluna in enumerate(colunas)
        ]
        print(f"\n{titulo}")
        print("  ".join(c.ljust(larguras[i]) for i, c in enumerate(colunas)))
        print("  ".join("-" * largura for largura in larguras))
        for linha in linhas:
            print("  ".join(v.ljust(larguras[i]) for i, v in enumerate(linha)))


saida = Saida()


def diagnosticar(texto: str) -> str | None:
    for padrao, causa in CAUSAS_CONHECIDAS:
        if re.search(padrao, texto, re.IGNORECASE):
            return causa
    return None


# ═════════════════════════════════════════════════════════════════════════════
# Execução de comandos externos
# ═════════════════════════════════════════════════════════════════════════════


@dataclass
class Resultado:
    codigo: int
    saida: str


def ambiente_processos(extra: dict[str, str] | None = None) -> dict[str, str]:
    env = dict(os.environ)
    # O Corepack não deve pedir confirmação interativa para baixar o pnpm
    # fixado no package.json.
    env["COREPACK_ENABLE_DOWNLOAD_PROMPT"] = "0"
    env.setdefault("NEXT_TELEMETRY_DISABLED", "1")
    if extra:
        env.update(extra)
    return env


def executar(
    cmd: list[str],
    *,
    descricao: str,
    env: dict[str, str] | None = None,
    ecoar: bool = True,
    permitir_falha: bool = False,
) -> Resultado:
    """Executa mostrando o comando e a saída integral (stdout e stderr)."""
    texto_cmd = " ".join(shlex.quote(parte) for parte in cmd)
    saida.comando(texto_cmd)
    linhas: list[str] = []
    try:
        processo = subprocess.Popen(
            cmd,
            cwd=RAIZ,
            env=ambiente_processos(env),
            # Nenhum comando do launcher lê do terminal: sem stdin herdado, o
            # processo filho não consome o que o operador digita no menu.
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )
    except FileNotFoundError as erro:
        raise FalhaEtapa(
            f"{descricao}: comando não encontrado ({erro.filename})."
        ) from erro

    assert processo.stdout is not None
    for bruta in processo.stdout:
        linha = bruta.rstrip("\n")
        linhas.append(linha)
        if len(linhas) > 600:
            del linhas[:200]
        if ecoar:
            saida.detalhe(linha)
        else:
            saida.registrar(f"    {linha}")
    codigo = processo.wait()
    saida.registrar(f"  (exit {codigo})")
    resultado = Resultado(codigo, "\n".join(linhas))

    if codigo != 0 and not permitir_falha:
        mensagem = f"{descricao} falhou (exit {codigo})."
        causa = diagnosticar(resultado.saida)
        if causa:
            mensagem += f" Causa provável: {causa}"
        if not ecoar and linhas:
            for linha in linhas[-15:]:
                saida.detalhe(linha)
        raise FalhaEtapa(mensagem)
    return resultado


def consultar(
    cmd: list[str], *, env: dict[str, str] | None = None, timeout: float = 30
) -> Resultado:
    """Executa sem ecoar (consultas rápidas); registra no log."""
    saida.registrar(f"  $ {' '.join(shlex.quote(p) for p in cmd)}")
    try:
        concluido = subprocess.run(
            cmd,
            cwd=RAIZ,
            env=ambiente_processos(env),
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            check=False,
        )
    except FileNotFoundError:
        return Resultado(127, f"comando não encontrado: {cmd[0]}")
    except subprocess.TimeoutExpired:
        return Resultado(124, f"tempo esgotado após {timeout:.0f}s")
    texto = (concluido.stdout + concluido.stderr).strip()
    saida.registrar(f"    exit {concluido.returncode}: {texto[:2000]}")
    return Resultado(concluido.returncode, texto)


# ═════════════════════════════════════════════════════════════════════════════
# Configuração (.env.local, package.json, .nvmrc)
# ═════════════════════════════════════════════════════════════════════════════


def _remover_aspas(valor: str) -> str:
    if len(valor) >= 2 and valor[0] == valor[-1] and valor[0] in "\"'":
        return valor[1:-1]
    return valor


def ler_env(caminho: Path = ENV_LOCAL) -> dict[str, str]:
    """Mesma semântica do parser de scripts/lib/env-file.mjs."""
    valores: dict[str, str] = {}
    if not caminho.exists():
        return valores
    for bruta in caminho.read_text(encoding="utf-8").splitlines():
        linha = bruta.strip()
        if not linha or linha.startswith("#") or "=" not in linha:
            continue
        chave, valor = linha.split("=", 1)
        if chave.strip():
            valores[chave.strip()] = _remover_aspas(valor.strip())
    return valores


def definir_env(alteracoes: dict[str, str]) -> None:
    """Atualiza chaves do .env.local preservando o restante (permissão 0600)."""
    linhas = ENV_LOCAL.read_text(encoding="utf-8").splitlines()
    pendentes = dict(alteracoes)
    for indice, bruta in enumerate(linhas):
        linha = bruta.strip()
        if linha.startswith("#") or "=" not in linha:
            continue
        chave = linha.split("=", 1)[0].strip()
        if chave in pendentes:
            linhas[indice] = f"{chave}={pendentes.pop(chave)}"
    linhas.extend(f"{chave}={valor}" for chave, valor in pendentes.items())
    temporario = ENV_LOCAL.parent / f"{ENV_LOCAL.name}.tmp"
    temporario.write_text("\n".join(linhas) + "\n", encoding="utf-8")
    os.chmod(temporario, 0o600)
    temporario.replace(ENV_LOCAL)


def versao_tupla(texto: str) -> tuple[int, ...]:
    numeros = re.findall(r"\d+", texto)
    return tuple(int(n) for n in numeros[:3])


def node_alvo() -> str:
    return NVMRC.read_text(encoding="utf-8").strip() if NVMRC.exists() else ""


def package_json() -> JsonObjeto:
    dados: JsonObjeto = json.loads(PACKAGE_JSON.read_text(encoding="utf-8"))
    return dados


def node_minimo() -> tuple[int, ...]:
    """Lê o mínimo do engines.node no formato `^X.Y.Z`."""
    faixa = package_json().get("engines", {}).get("node", "")
    return versao_tupla(faixa)


def pnpm_fixado() -> str:
    gerenciador = package_json().get("packageManager", "")
    combinacao = re.match(r"pnpm@(\d+\.\d+\.\d+)", gerenciador)
    return combinacao.group(1) if combinacao else ""


def compose(*args: str) -> list[str]:
    return ["docker", "compose", "--env-file", str(ENV_LOCAL), *args]


def pnpm(*args: str) -> list[str]:
    corepack = shutil.which("corepack")
    if not corepack:
        raise FalhaEtapa(
            "Corepack não encontrado. Ele acompanha o Node.js 24 LTS: instale a "
            "versão do .nvmrc (`nvm install && nvm use`)."
        )
    return [corepack, "pnpm", *args]


# ═════════════════════════════════════════════════════════════════════════════
# Diagnóstico
# ═════════════════════════════════════════════════════════════════════════════


@dataclass
class Verificacao:
    nome: str
    estado: str  # "ok" | "aviso" | "erro"
    detalhe: str
    correcao: str = ""


def verificar_plataforma() -> list[Verificacao]:
    itens: list[Verificacao] = []
    sistema = platform.system()
    if sistema != "Linux":
        itens.append(
            Verificacao(
                "Plataforma",
                "erro",
                f"{sistema}: o run.py é o launcher do WSL2 Ubuntu e de Linux.",
                "No Windows use o Git Bash (`./run.sh`); veja o README.",
            )
        )
        return itens

    versao_kernel = (
        Path("/proc/version").read_text(encoding="utf-8", errors="replace").lower()
    )
    if "microsoft" in versao_kernel:
        if "wsl2" in versao_kernel or "microsoft-standard" in versao_kernel:
            itens.append(Verificacao("Plataforma", "ok", "WSL2"))
        else:
            itens.append(
                Verificacao(
                    "Plataforma",
                    "erro",
                    "WSL1 (sem suporte ao Docker).",
                    "Converta a distribuição: `wsl --set-version <distro> 2` no PowerShell.",
                )
            )
    else:
        itens.append(
            Verificacao("Plataforma", "ok", "Linux nativo (equivalente ao WSL2)")
        )

    os_release: dict[str, str] = {}
    caminho = Path("/etc/os-release")
    if caminho.exists():
        for linha in caminho.read_text(encoding="utf-8").splitlines():
            if "=" in linha:
                chave, valor = linha.split("=", 1)
                os_release[chave] = _remover_aspas(valor)
    nome = os_release.get("PRETTY_NAME", "desconhecida")
    if os_release.get("ID") == "ubuntu":
        if versao_tupla(os_release.get("VERSION_ID", "0")) >= UBUNTU_MINIMO:
            itens.append(Verificacao("Distribuição", "ok", nome))
        else:
            itens.append(
                Verificacao(
                    "Distribuição",
                    "aviso",
                    f"{nome} (abaixo do Ubuntu 22.04 LTS testado)",
                    "Use Ubuntu 22.04 LTS ou superior.",
                )
            )
    else:
        itens.append(
            Verificacao(
                "Distribuição",
                "aviso",
                f"{nome} (o ambiente de referência é Ubuntu 22.04+ no WSL2)",
            )
        )
    return itens


def verificar_python() -> Verificacao:
    versao = platform.python_version()
    interface = (
        "interface Rich no venv do launcher"
        if saida.tem_rich
        else "modo texto (sem Rich)"
    )
    return Verificacao("Python", "ok", f"{versao} · {interface}")


def verificar_node() -> list[Verificacao]:
    itens: list[Verificacao] = []
    node = shutil.which("node")
    alvo = node_alvo()
    if not node:
        return [
            Verificacao(
                "Node.js",
                "erro",
                "não encontrado no PATH",
                f"Instale o Node.js {alvo or '24 LTS'} (`nvm install && nvm use`).",
            )
        ]
    versao = consultar([node, "--version"]).saida.lstrip("v")
    minimo = node_minimo()
    atual = versao_tupla(versao)
    if minimo and (atual[:1] != minimo[:1] or atual < minimo):
        itens.append(
            Verificacao(
                "Node.js",
                "erro",
                f"{versao} fora de ^{'.'.join(map(str, minimo))} (package.json)",
                f"Use o Node.js {alvo} do .nvmrc: `nvm install && nvm use`.",
            )
        )
    elif alvo and versao != alvo:
        itens.append(
            Verificacao(
                "Node.js",
                "aviso",
                f"{versao} (compatível; o .nvmrc fixa {alvo})",
                "Para reproduzir exatamente o ambiente: `nvm install && nvm use`.",
            )
        )
    else:
        itens.append(Verificacao("Node.js", "ok", versao))

    corepack = shutil.which("corepack")
    fixado = pnpm_fixado()
    if not corepack:
        itens.append(
            Verificacao(
                "Corepack/pnpm",
                "erro",
                "Corepack ausente",
                "Instale o Node.js 24 LTS do .nvmrc (inclui o Corepack).",
            )
        )
        return itens
    resultado = consultar([corepack, "pnpm", "--version"], timeout=180)
    if resultado.codigo != 0:
        itens.append(
            Verificacao(
                "Corepack/pnpm",
                "erro",
                f"falha ao ativar o pnpm {fixado}: {resultado.saida.splitlines()[-1] if resultado.saida else ''}",
                "Verifique a conexão; o Corepack baixa o pnpm do campo packageManager.",
            )
        )
    elif resultado.saida.strip().splitlines()[-1] != fixado:
        itens.append(
            Verificacao(
                "Corepack/pnpm",
                "erro",
                f"pnpm {resultado.saida.strip()} diferente do fixado ({fixado})",
                "Remova instalações globais do pnpm que sobrepõem o Corepack.",
            )
        )
    else:
        itens.append(Verificacao("Corepack/pnpm", "ok", f"pnpm {fixado} via Corepack"))
    return itens


def verificar_docker() -> list[Verificacao]:
    if not shutil.which("docker"):
        return [
            Verificacao(
                "Docker",
                "erro",
                "CLI do Docker não encontrada",
                "Instale o Docker Desktop com integração WSL (ou o Docker Engine no Linux).",
            )
        ]
    itens: list[Verificacao] = []
    info = consultar(["docker", "info", "--format", "{{.ServerVersion}}"], timeout=25)
    if info.codigo != 0:
        causa = diagnosticar(info.saida) or info.saida.splitlines()[-1:]
        itens.append(
            Verificacao(
                "Docker",
                "erro",
                "daemon inacessível",
                causa if isinstance(causa, str) else " ".join(causa),
            )
        )
        return itens
    versao_engine = info.saida.strip().splitlines()[-1]
    if versao_tupla(versao_engine) < DOCKER_MINIMO:
        itens.append(
            Verificacao(
                "Docker",
                "aviso",
                f"Engine {versao_engine} (o healthcheck usa recursos do Engine 25+)",
                "Atualize o Docker.",
            )
        )
    else:
        itens.append(Verificacao("Docker", "ok", f"Engine {versao_engine}"))

    versao_compose = consultar(["docker", "compose", "version", "--short"])
    if versao_compose.codigo != 0:
        itens.append(
            Verificacao(
                "Docker Compose",
                "erro",
                "plugin `docker compose` (v2) ausente",
                "Instale o Docker Compose v2.",
            )
        )
    elif versao_tupla(versao_compose.saida) < COMPOSE_MINIMO:
        itens.append(
            Verificacao(
                "Docker Compose",
                "erro",
                f"{versao_compose.saida} (mínimo 2.20)",
                "Atualize o Docker Compose.",
            )
        )
    else:
        itens.append(Verificacao("Docker Compose", "ok", versao_compose.saida))
    return itens


def verificar_env() -> Verificacao:
    if not ENV_LOCAL.exists():
        return Verificacao(
            ".env.local",
            "aviso",
            "ausente",
            "`python3 run.py fix` (ou `pnpm env:init`) cria com segredos gerados.",
        )
    atuais = ler_env()
    faltando = [chave for chave in ler_env(ENV_EXEMPLO) if chave not in atuais]
    vazios = [chave for chave in SEGREDOS if not atuais.get(chave)]
    if faltando or vazios:
        return Verificacao(
            ".env.local",
            "aviso",
            "incompleto: " + ", ".join(faltando + vazios),
            "`python3 run.py fix` (ou `pnpm env:init`) completa sem alterar valores.",
        )
    modo = ENV_LOCAL.stat().st_mode & 0o777
    if modo & 0o077:
        return Verificacao(
            ".env.local",
            "aviso",
            f"completo, mas legível por outros usuários (permissão {modo:o})",
            "`chmod 600 .env.local` (o `pnpm env:init` também corrige).",
        )
    return Verificacao(".env.local", "ok", "completo (permissão 600)")


def dependencias_sincronizadas() -> bool:
    return (
        LOCK_INSTALADO.exists()
        and LOCKFILE.exists()
        and _hash_arquivo(LOCK_INSTALADO) == _hash_arquivo(LOCKFILE)
    )


def verificar_dependencias() -> Verificacao:
    if not (RAIZ / "node_modules").exists():
        return Verificacao(
            "Dependências", "aviso", "node_modules ausente", "`python3 run.py fix`."
        )
    if not dependencias_sincronizadas():
        return Verificacao(
            "Dependências",
            "aviso",
            "node_modules diferente do pnpm-lock.yaml",
            "`python3 run.py fix` (pnpm install --frozen-lockfile).",
        )
    return Verificacao("Dependências", "ok", "instaladas conforme o pnpm-lock.yaml")


# ── Portas ───────────────────────────────────────────────────────────────────


@dataclass
class DonoPorta:
    origem: str
    pid: int | None = None
    processo: str = ""
    usuario: str = ""

    def descrever(self) -> str:
        partes = [self.origem]
        if self.pid:
            partes.append(f"PID {self.pid}")
        if self.processo:
            partes.append(self.processo)
        if self.usuario:
            partes.append(f"usuário {self.usuario}")
        return " · ".join(partes)


def porta_em_uso(porta: int) -> bool:
    for familia, endereco in ((socket.AF_INET, "127.0.0.1"), (socket.AF_INET6, "::1")):
        try:
            with socket.socket(familia, socket.SOCK_STREAM) as conexao:
                conexao.settimeout(0.5)
                if conexao.connect_ex((endereco, porta)) == 0:
                    return True
        except OSError:
            continue
    return _escutas_na_porta(porta) != []


def _escutas_na_porta(porta: int) -> list[tuple[str, int]]:
    """(inode, uid) de sockets TCP em LISTEN na porta, via /proc/net/tcp*."""
    encontrados: list[tuple[str, int]] = []
    for tabela in ("/proc/net/tcp", "/proc/net/tcp6"):
        try:
            linhas = Path(tabela).read_text(encoding="utf-8").splitlines()[1:]
        except OSError:
            continue
        for linha in linhas:
            campos = linha.split()
            if len(campos) < 10 or campos[3] != "0A":
                continue
            if int(campos[1].rsplit(":", 1)[1], 16) == porta:
                encontrados.append((campos[9], int(campos[7])))
    return encontrados


def _pid_do_inode(inode: str) -> int | None:
    alvo = f"socket:[{inode}]"
    for diretorio in Path("/proc").iterdir():
        if not diretorio.name.isdigit():
            continue
        try:
            for descritor in (diretorio / "fd").iterdir():
                if os.readlink(descritor) == alvo:
                    return int(diretorio.name)
        except (PermissionError, FileNotFoundError, NotADirectoryError, OSError):
            continue
    return None


def _linha_de_comando(pid: int) -> str:
    try:
        bruto = Path(f"/proc/{pid}/cmdline").read_bytes()
    except OSError:
        return ""
    return " ".join(
        parte.decode(errors="replace") for parte in bruto.split(b"\0") if parte
    )


def _nome_usuario(uid: int) -> str:
    try:
        return pwd.getpwuid(uid).pw_name
    except KeyError:
        return str(uid)


def _container_publicando(porta: int) -> str | None:
    if not shutil.which("docker"):
        return None
    resultado = consultar(
        ["docker", "ps", "--format", "{{.Names}}\t{{.Ports}}"], timeout=15
    )
    if resultado.codigo != 0:
        return None
    for linha in resultado.saida.splitlines():
        if "\t" not in linha:
            continue
        nome, portas = linha.split("\t", 1)
        if re.search(rf"(?:^|[\s,])(?:[\d.]+|\[::\]|::):{porta}->", portas):
            return nome
    return None


def dono_da_porta(porta: int) -> DonoPorta | None:
    container = _container_publicando(porta)
    if container:
        return DonoPorta(origem=f"container Docker {container}")
    for inode, uid in _escutas_na_porta(porta):
        pid = _pid_do_inode(inode)
        usuario = _nome_usuario(uid)
        if pid:
            return DonoPorta(
                origem="processo local",
                pid=pid,
                processo=_linha_de_comando(pid)[:120],
                usuario=usuario,
            )
        return DonoPorta(
            origem="processo de outro usuário (sem permissão para ver o PID)",
            usuario=usuario,
        )
    if porta_em_uso(porta):
        return DonoPorta(origem="processo não visível deste ambiente (ex.: Windows)")
    return None


def porta_livre_a_partir(inicio: int, reservadas: set[int] | None = None) -> int:
    for porta in range(inicio, inicio + FAIXA_BUSCA_PORTA):
        if reservadas and porta in reservadas:
            continue
        if not porta_em_uso(porta):
            return porta
    raise FalhaEtapa(
        f"Nenhuma porta livre entre {inicio} e {inicio + FAIXA_BUSCA_PORTA - 1}."
    )


# ── Banco de dados ───────────────────────────────────────────────────────────


@dataclass
class EstadoBanco:
    existe: bool = False
    estado: str = "ausente"
    saude: str = ""
    porta: int | None = None
    versao: str = ""
    migrations: int | None = None
    # Motivo quando o estado não pôde ser consultado (ex.: Docker inacessível).
    indisponivel: str = ""


def estado_banco(consultar_sql: bool = True) -> EstadoBanco:
    estado = EstadoBanco()
    if not shutil.which("docker"):
        estado.indisponivel = "CLI do Docker não encontrada"
        return estado
    if not ENV_LOCAL.exists():
        estado.indisponivel = ".env.local ausente"
        return estado
    resultado = consultar(
        compose("ps", "--all", "--format", "json", SERVICO_DB), timeout=20
    )
    if resultado.codigo != 0:
        # Falha da consulta não é "container ausente": informa o motivo real.
        estado.indisponivel = diagnosticar(resultado.saida) or (
            resultado.saida.splitlines()[-1]
            if resultado.saida
            else f"docker compose ps falhou (exit {resultado.codigo})"
        )
        return estado
    if not resultado.saida.strip():
        return estado
    # Compose recente emite um objeto JSON por linha; versões anteriores, um array.
    registros: list[JsonObjeto] = []
    for bruta in resultado.saida.splitlines():
        linha = bruta.strip()
        try:
            if linha.startswith("{"):
                registros.append(json.loads(linha))
            elif linha.startswith("["):
                registros.extend(json.loads(linha))
        except json.JSONDecodeError:
            continue
    for dados in registros:
        estado.existe = True
        estado.estado = dados.get("State", "")
        estado.saude = dados.get("Health", "")
        for publicacao in dados.get("Publishers") or []:
            if publicacao.get("PublishedPort"):
                estado.porta = int(publicacao["PublishedPort"])
    if consultar_sql and estado.saude == "healthy":
        env = ler_env()
        sql = consultar(
            compose(
                "exec",
                "-T",
                "-e",
                "MYSQL_PWD",
                SERVICO_DB,
                "mysql",
                f"-u{env.get('MYSQL_USER', '')}",
                f"-D{env.get('MYSQL_DATABASE', '')}",
                "--batch",
                "--skip-column-names",
                "-e",
                "SELECT VERSION(); SELECT COUNT(*) FROM _lyra_schema_migrations",
            ),
            env={"MYSQL_PWD": env.get("MYSQL_PASSWORD", "")},
        )
        if sql.codigo == 0:
            linhas = [
                linha
                for linha in sql.saida.splitlines()
                if not linha.startswith("mysql:")
            ]
            if linhas:
                estado.versao = linhas[0]
            if len(linhas) > 1 and linhas[1].isdigit():
                estado.migrations = int(linhas[1])
    return estado


def total_migrations() -> int:
    return len(list(MIGRATIONS_DIR.glob("*.sql")))


# ── Aplicação ────────────────────────────────────────────────────────────────


@dataclass
class EstadoApp:
    pid: int | None = None
    porta: int | None = None
    modo: str = ""
    iniciado_em: str = ""
    log: str = ""
    origem: str = ""
    meta: JsonObjeto = field(default_factory=dict)


def _pid_vivo(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    estado = Path(f"/proc/{pid}/stat")
    if estado.exists():
        try:
            # Processo zumbi não está em execução.
            return estado.read_text().rsplit(")", 1)[1].split()[0] != "Z"
        except (OSError, IndexError):
            return True
    return True


def _eh_processo_da_app(pid: int) -> bool:
    comando = _linha_de_comando(pid)
    return any(trecho in comando for trecho in ("next", "pnpm", "corepack", "node"))


def _porta_escutando(pid: int) -> int | None:
    """Porta HTTP em LISTEN aberta pela árvore de processos do PID."""
    inodes: set[str] = set()
    for membro in _arvore_de_processos(pid):
        try:
            for descritor in Path(f"/proc/{membro}/fd").iterdir():
                alvo = os.readlink(descritor)
                if alvo.startswith("socket:["):
                    inodes.add(alvo[8:-1])
        except OSError:
            continue
    portas: set[int] = set()
    for tabela in ("/proc/net/tcp", "/proc/net/tcp6"):
        try:
            linhas = Path(tabela).read_text(encoding="utf-8").splitlines()[1:]
        except OSError:
            continue
        for linha in linhas:
            campos = linha.split()
            if len(campos) >= 10 and campos[3] == "0A" and campos[9] in inodes:
                portas.add(int(campos[1].rsplit(":", 1)[1], 16))
    # O Next.js pode abrir portas internas; vale a que responde ao /api/health.
    for porta in sorted(portas):
        if consultar_http(f"http://127.0.0.1:{porta}/api/health", timeout=5)[0]:
            return porta
    return min(portas) if portas else None


def estado_app() -> EstadoApp:
    estado = EstadoApp()
    meta: JsonObjeto = {}
    if APP_META.exists():
        try:
            meta = json.loads(APP_META.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            meta = {}
    pid = meta.get("pid")
    if pid is None and APP_PID.exists():
        texto = APP_PID.read_text(encoding="utf-8").strip()
        pid = int(texto) if texto.isdigit() else None
    if not pid or not _pid_vivo(int(pid)) or not _eh_processo_da_app(int(pid)):
        return estado
    estado.pid = int(pid)
    # Sem metadados (só o app.pid, ex.: launcher de versão anterior), a porta é
    # descoberta pelos sockets em LISTEN da árvore de processos da aplicação.
    estado.porta = meta.get("porta") or _porta_escutando(int(pid))
    estado.modo = meta.get("modo", "dev")
    estado.iniciado_em = meta.get("iniciado_em", "")
    estado.log = meta.get("log", "")
    # O app.json registra qual launcher iniciou a aplicação (run.py ou run.sh).
    origem = meta.get("origem")
    estado.origem = (
        f"iniciada pelo {origem}" if origem else "iniciada por outro launcher"
    )
    estado.meta = meta
    return estado


def consultar_http(
    url: str,
    *,
    metodo: str = "GET",
    corpo: JsonObjeto | None = None,
    timeout: float = 10,
) -> tuple[int, str]:
    dados = json.dumps(corpo).encode() if corpo is not None else None
    requisicao = urllib.request.Request(
        url,
        data=dados,
        method=metodo,
        headers={"content-type": "application/json"} if dados else {},
    )
    try:
        with urllib.request.urlopen(requisicao, timeout=timeout) as resposta:
            return resposta.status, resposta.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as erro:
        return erro.code, erro.read().decode("utf-8", "replace")
    except (urllib.error.URLError, TimeoutError, ConnectionError, OSError):
        return 0, ""


# ═════════════════════════════════════════════════════════════════════════════
# Etapas
# ═════════════════════════════════════════════════════════════════════════════


def etapa_preflight() -> None:
    saida.etapa("Verificando pré-requisitos bloqueantes")
    itens = [
        *verificar_plataforma(),
        verificar_python(),
        *verificar_node(),
        *verificar_docker(),
    ]
    erros = [item for item in itens if item.estado == "erro"]
    for item in itens:
        texto = f"{item.nome}: {item.detalhe}"
        if item.estado == "ok":
            saida.ok(texto)
        elif item.estado == "aviso":
            saida.aviso(texto)
        else:
            saida.erro(texto)
            if item.correcao:
                saida.info(f"Correção: {item.correcao}")
    if erros:
        raise FalhaEtapa(f"{len(erros)} pré-requisito(s) exigem ação manual (acima).")


def etapa_env() -> None:
    saida.etapa("Preparando o .env.local (fonte única de configuração)")
    node = shutil.which("node")
    if not node:
        raise FalhaEtapa("Node.js é necessário para gerar o .env.local.")
    executar([node, str(ENV_INIT)], descricao="Preparação do .env.local")
    saida.ok(".env.local pronto.")


def etapa_dependencias(forcar: bool = False) -> None:
    saida.etapa("Dependências do projeto (pnpm, conforme o lockfile)")
    if not forcar and dependencias_sincronizadas():
        saida.ok("node_modules já corresponde ao pnpm-lock.yaml; nada a instalar.")
        return
    executar(
        pnpm("install", "--frozen-lockfile"),
        descricao="Instalação das dependências",
    )
    if not dependencias_sincronizadas():
        raise FalhaEtapa(
            "A instalação terminou, mas node_modules não corresponde ao pnpm-lock.yaml."
        )
    saida.ok("Dependências instaladas conforme o pnpm-lock.yaml.")


def etapa_porta_banco() -> None:
    env = ler_env()
    desejada = int(env.get("MYSQL_HOST_PORT") or PORTA_DB_PADRAO)
    atual = estado_banco(consultar_sql=False)
    if atual.estado == "running" and atual.porta == desejada:
        return
    dono = dono_da_porta(desejada)
    if dono is None:
        if env.get("MYSQL_PORT") != str(desejada):
            definir_env({"MYSQL_PORT": str(desejada)})
            saida.info(
                f"MYSQL_PORT ajustado para {desejada} (igual ao MYSQL_HOST_PORT publicado pelo Compose)."
            )
        return
    if dono.origem.endswith(CONTAINER_DB):
        return
    nova = porta_livre_a_partir(desejada + 1)
    saida.aviso(
        f"Porta {desejada} do MySQL ocupada por {dono.descrever()}; esse processo não será tocado."
    )
    definir_env({"MYSQL_HOST_PORT": str(nova), "MYSQL_PORT": str(nova)})
    saida.ok(
        f"MySQL realocado para a porta {nova} (MYSQL_HOST_PORT e MYSQL_PORT atualizados no .env.local)."
    )


def etapa_banco() -> None:
    saida.etapa("Banco de dados MySQL (Docker Compose)")
    etapa_porta_banco()
    try:
        executar(
            compose("up", "-d", "--wait", SERVICO_DB),
            descricao="Subida do MySQL",
        )
    except FalhaEtapa as erro:
        logs_db = consultar(compose("logs", "--tail", "40", SERVICO_DB))
        if logs_db.saida:
            saida.info("Últimas linhas do log do MySQL:")
            for linha in logs_db.saida.splitlines()[-15:]:
                saida.detalhe(linha)
        causa = diagnosticar(logs_db.saida)
        if causa:
            raise FalhaEtapa(f"{erro} Causa provável (log do MySQL): {causa}") from erro
        raise
    estado = estado_banco()
    if estado.saude != "healthy":
        raise FalhaEtapa(f"MySQL em estado inesperado: {estado.estado}/{estado.saude}.")
    saida.ok(f"MySQL {estado.versao or ''} saudável em 127.0.0.1:{estado.porta}.")


def etapa_migrations() -> None:
    saida.etapa("Migrations e administrador inicial")
    node = shutil.which("node")
    if not node:
        raise FalhaEtapa("Node.js é necessário para aplicar as migrations.")
    executar([node, str(MIGRATE)], descricao="Migrations do MySQL")
    estado = estado_banco()
    esperado = total_migrations()
    if estado.migrations is not None and estado.migrations < esperado:
        raise FalhaEtapa(
            f"Apenas {estado.migrations} de {esperado} migrations registradas no banco."
        )
    saida.ok(f"{esperado} migrations aplicadas e administrador assegurado.")


def _url_local(valor: str, porta: int) -> str:
    """Ajusta URLs locais para a porta efetiva (URLs externas são mantidas)."""
    combinacao = re.match(
        r"^(https?://(?:localhost|127\.0\.0\.1))(?::\d+)?(/.*)?$", valor or ""
    )
    if not combinacao:
        return valor
    return f"{combinacao.group(1)}:{porta}{combinacao.group(2) or ''}"


def etapa_build() -> None:
    saida.etapa("Build de produção (next build)")
    executar(pnpm("build"), descricao="Build de produção")
    saida.ok("Build concluído.")


def etapa_app(modo: str) -> EstadoApp:
    saida.etapa(
        f"Aplicação Next.js ({'produção' if modo == 'prod' else 'desenvolvimento'})"
    )
    atual = estado_app()
    if atual.pid:
        if (
            atual.porta
            and consultar_http(f"http://127.0.0.1:{atual.porta}/api/health")[0] == 200
        ):
            if atual.modo != modo:
                saida.aviso(
                    f"A aplicação já está em execução em modo {atual.modo} (PID {atual.pid}); "
                    f"pare-a (`python3 run.py stop app`) para iniciar em modo {modo}."
                )
            else:
                saida.ok(
                    f"Já em execução (PID {atual.pid}, {atual.origem}) em http://localhost:{atual.porta}; nada a fazer."
                )
            return atual
        raise FalhaEtapa(
            f"Existe um processo da aplicação (PID {atual.pid}, {atual.origem}) que não responde ao /api/health. "
            "Rode `python3 run.py stop app` e tente novamente."
        )

    env = ler_env()
    desejada = int(os.environ.get("LYRA_APP_PORT") or PORTA_APP_PADRAO)
    dono = dono_da_porta(desejada)
    porta = desejada
    if dono is not None:
        db = estado_banco(consultar_sql=False)
        porta = porta_livre_a_partir(desejada + 1, {db.porta} if db.porta else None)
        saida.aviso(
            f"Porta {desejada} ocupada por {dono.descrever()}; esse processo não será tocado. Usando a porta {porta}."
        )

    ESTADO.mkdir(parents=True, exist_ok=True)
    LOGS.mkdir(parents=True, exist_ok=True)
    caminho_log = LOGS / f"app-{modo}.log"
    comando = pnpm(
        "exec", "next", "start" if modo == "prod" else "dev", "-p", str(porta)
    )
    # Só sobrescreve as URLs presentes: um valor vazio no ambiente do processo
    # esconderia o do .env.local.
    extra = {"PORT": str(porta)}
    for chave in ("APP_BASE_URL", "NEXT_PUBLIC_APP_URL"):
        if env.get(chave):
            extra[chave] = _url_local(env[chave], porta)
    saida.comando(" ".join(shlex.quote(parte) for parte in comando))
    with caminho_log.open("w", encoding="utf-8") as arquivo_log:
        processo = subprocess.Popen(
            comando,
            cwd=RAIZ,
            env=ambiente_processos(extra),
            stdout=arquivo_log,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            start_new_session=True,
        )
    meta = {
        "pid": processo.pid,
        "pgid": os.getpgid(processo.pid),
        "porta": porta,
        "modo": modo,
        "iniciado_em": agora().isoformat(timespec="seconds"),
        "log": str(caminho_log),
        "comando": comando,
        "origem": "run.py",
    }
    APP_META.write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    APP_PID.write_text(f"{processo.pid}\n", encoding="utf-8")
    saida.info(f"Processo iniciado (PID {processo.pid}); log em {caminho_log}.")

    limite = time.monotonic() + TEMPO_MAX_APP
    ultimo_status = 0
    while time.monotonic() < limite:
        if processo.poll() is not None:
            conteudo = caminho_log.read_text(encoding="utf-8", errors="replace")
            for linha in conteudo.splitlines()[-20:]:
                saida.detalhe(linha)
            APP_META.unlink(missing_ok=True)
            APP_PID.unlink(missing_ok=True)
            causa = diagnosticar(conteudo)
            raise FalhaEtapa(
                f"A aplicação encerrou durante a inicialização (exit {processo.returncode})."
                + (f" Causa provável: {causa}" if causa else "")
                + f" Log: {caminho_log}"
            )
        ultimo_status, _ = consultar_http(
            f"http://127.0.0.1:{porta}/api/health", timeout=15
        )
        if ultimo_status == 200:
            break
        time.sleep(2)
    else:
        raise FalhaEtapa(
            f"A aplicação não respondeu ao /api/health em {TEMPO_MAX_APP}s "
            f"(último status HTTP: {ultimo_status or 'sem resposta'}). Log: {caminho_log}"
        )
    saida.ok(f"Aplicação no ar em http://localhost:{porta} (PID {processo.pid}).")
    return estado_app()


def etapa_verificacao(porta: int) -> None:
    saida.etapa("Verificação de saúde ponta a ponta")
    base = f"http://127.0.0.1:{porta}"
    falhas: list[str] = []

    status, corpo = consultar_http(f"{base}/api/health")
    try:
        dados = json.loads(corpo) if status == 200 else {}
    except json.JSONDecodeError:
        dados = {}
        status = -1
    if status == 200:
        esperado = total_migrations()
        if dados.get("migrationsApplied") == esperado:
            saida.ok(f"/api/health: banco ok, {esperado} migrations aplicadas.")
        else:
            falhas.append(
                f"/api/health informa {dados.get('migrationsApplied')} migrations (esperado {esperado})"
            )
    elif status == -1:
        falhas.append("/api/health respondeu 200 com conteúdo que não é JSON")
    else:
        falhas.append(f"/api/health respondeu {status or 'sem resposta'}")

    for caminho in ("/", "/login"):
        status, _ = consultar_http(f"{base}{caminho}", timeout=60)
        if status == 200:
            saida.ok(f"Página {caminho} renderizada (HTTP 200).")
        else:
            falhas.append(f"página {caminho} respondeu {status or 'sem resposta'}")

    env = ler_env()
    status, _ = consultar_http(
        f"{base}/api/auth/login",
        metodo="POST",
        corpo={
            "email": env.get("ADMIN_BOOTSTRAP_EMAIL", ""),
            "password": env.get("ADMIN_BOOTSTRAP_PASSWORD", ""),
            "remember": False,
        },
        timeout=30,
    )
    if status == 200:
        saida.ok("Login do administrador inicial funcionando.")
    else:
        falhas.append(f"login do administrador respondeu {status or 'sem resposta'}")

    if falhas:
        raise FalhaEtapa("Verificação falhou: " + "; ".join(falhas) + ".")


def parar_app() -> None:
    saida.etapa("Parando a aplicação")
    estado = estado_app()
    if not estado.pid:
        APP_META.unlink(missing_ok=True)
        APP_PID.unlink(missing_ok=True)
        saida.ok("Nenhuma aplicação em execução.")
        return
    pid = estado.pid
    # A árvore é capturada antes de sinalizar: quando o pai morre, os filhos
    # são adotados pelo init e o vínculo de PPID se perde. O `next dev` cria a
    # própria sessão (setsid), então o grupo do PID registrado não o contém.
    arvore = _arvore_de_processos(pid)
    conjunto = set(arvore)
    grupos: set[int] = set()
    for membro in arvore:
        try:
            grupo = os.getpgid(membro)
        except ProcessLookupError:
            continue
        # Só grupos formados exclusivamente por processos da aplicação.
        if grupo != os.getpgrp() and set(_processos_do_grupo(grupo)) <= conjunto:
            grupos.add(grupo)

    def sinalizar(sinal: signal.Signals) -> None:
        for grupo in grupos:
            with contextlib.suppress(ProcessLookupError):
                os.killpg(grupo, sinal)
        for membro in arvore:
            with contextlib.suppress(ProcessLookupError):
                os.kill(membro, sinal)

    def vivos() -> list[int]:
        return [membro for membro in arvore if _pid_vivo(membro)]

    saida.info(
        f"SIGTERM para {len(arvore)} processo(s) da aplicação (PID {pid}; "
        f"grupos {', '.join(map(str, sorted(grupos))) or '-'})."
    )
    try:
        sinalizar(signal.SIGTERM)
    except PermissionError as erro:
        raise FalhaEtapa(
            f"Sem permissão para encerrar o PID {pid} (pertence a outro usuário)."
        ) from erro

    limite = time.monotonic() + TEMPO_PARADA_APP
    while time.monotonic() < limite and vivos():
        time.sleep(0.5)
    if vivos():
        saida.aviso(
            f"{len(vivos())} processo(s) não encerraram em {TEMPO_PARADA_APP}s; enviando SIGKILL."
        )
        sinalizar(signal.SIGKILL)
        time.sleep(1)
    if vivos():
        raise FalhaEtapa(
            f"Processos da aplicação ainda ativos após SIGKILL: {', '.join(map(str, vivos()))}."
        )
    APP_META.unlink(missing_ok=True)
    APP_PID.unlink(missing_ok=True)
    if estado.porta and porta_em_uso(estado.porta):
        dono = dono_da_porta(estado.porta)
        raise FalhaEtapa(
            f"A porta {estado.porta} continua ocupada ({dono.descrever() if dono else 'dono desconhecido'})."
        )
    saida.ok(f"Aplicação encerrada (PID {pid}); porta {estado.porta or '-'} liberada.")


def _tabela_processos() -> dict[int, tuple[int, int]]:
    """PID -> (PPID, grupo) de todos os processos vivos (sem zumbis)."""
    tabela: dict[int, tuple[int, int]] = {}
    for diretorio in Path("/proc").iterdir():
        if not diretorio.name.isdigit():
            continue
        try:
            campos = (diretorio / "stat").read_text().rsplit(")", 1)[1].split()
        except (OSError, IndexError):
            continue
        # campos[0] = estado, campos[1] = PPID, campos[2] = grupo (pgrp)
        if len(campos) > 2 and campos[0] != "Z":
            tabela[int(diretorio.name)] = (int(campos[1]), int(campos[2]))
    return tabela


def _processos_do_grupo(grupo: int) -> list[int]:
    return [pid for pid, (_, pgrp) in _tabela_processos().items() if pgrp == grupo]


def _arvore_de_processos(raiz: int) -> list[int]:
    """O processo e todos os seus descendentes vivos."""
    filhos: dict[int, list[int]] = {}
    for pid, (ppid, _) in _tabela_processos().items():
        filhos.setdefault(ppid, []).append(pid)
    arvore: list[int] = []
    pendentes = [raiz]
    while pendentes:
        atual = pendentes.pop()
        if atual in arvore:
            continue
        arvore.append(atual)
        pendentes.extend(filhos.get(atual, []))
    return arvore


def parar_banco() -> None:
    saida.etapa("Parando o MySQL (dados preservados no volume)")
    if not ENV_LOCAL.exists():
        # Sem .env.local o Compose não interpola o serviço; o container do
        # projeto ainda é parado diretamente pelo nome (o volume é mantido).
        resultado = consultar(
            ["docker", "inspect", "--format", "{{.State.Status}}", CONTAINER_DB],
            timeout=20,
        )
        if resultado.codigo == 0 and resultado.saida.strip() == "running":
            executar(["docker", "stop", CONTAINER_DB], descricao="Parada do MySQL")
            saida.ok("MySQL parado (sem .env.local; parado pelo nome do container).")
        else:
            saida.ok(
                "Sem .env.local e sem container do MySQL deste projeto em execução."
            )
        return
    estado = estado_banco(consultar_sql=False)
    if estado.estado != "running":
        saida.ok("MySQL já está parado.")
        return
    executar(compose("stop", SERVICO_DB), descricao="Parada do MySQL")
    saida.ok("MySQL parado.")


def confirmar(pergunta: str, *, palavra: str = "sim", opcao: str = "--sim") -> None:
    if not sys.stdin.isatty():
        raise Cancelado(
            f"{pergunta} Sem terminal interativo: repita com {opcao} para confirmar."
        )
    resposta = input(f"  {pergunta} Digite '{palavra}' para continuar: ").strip()
    if resposta != palavra:
        raise Cancelado("Operação cancelada; nada foi alterado.")


def remover_artefato(caminho: Path) -> None:
    alvo = caminho.resolve()
    if RAIZ not in alvo.parents:
        raise FalhaEtapa(f"Recusado: {alvo} está fora do projeto.")
    if alvo.exists():
        shutil.rmtree(alvo)
        saida.ok(f"Removido {alvo.relative_to(RAIZ)} (artefato recriável).")


# ═════════════════════════════════════════════════════════════════════════════
# Comandos
# ═════════════════════════════════════════════════════════════════════════════


def cmd_up(args: argparse.Namespace) -> int:
    saida.titulo(
        f"Lyra MetaCare · up ({'produção' if args.prod else 'desenvolvimento'})"
    )
    etapa_preflight()
    etapa_env()
    etapa_dependencias()
    etapa_banco()
    etapa_migrations()
    if args.prod and not estado_app().pid:
        etapa_build()
    app = etapa_app("prod" if args.prod else "dev")
    etapa_verificacao(app.porta or PORTA_APP_PADRAO)
    env = ler_env()
    saida.titulo("Ambiente pronto")
    saida.ok(f"Aplicação: http://localhost:{app.porta}")
    saida.ok(
        f"MySQL: 127.0.0.1:{env.get('MYSQL_HOST_PORT')} (banco {env.get('MYSQL_DATABASE')})"
    )
    saida.ok(
        f"Admin: {env.get('ADMIN_BOOTSTRAP_EMAIL')} (senha em ADMIN_BOOTSTRAP_PASSWORD no .env.local)"
    )
    saida.info(f"Log da aplicação: {app.log}")
    saida.info("Parar: python3 run.py stop · Estado: python3 run.py status")
    return 0


def cmd_app(args: argparse.Namespace) -> int:
    saida.titulo("Lyra MetaCare · app")
    etapa_env()
    banco = estado_banco()
    if banco.saude != "healthy":
        raise FalhaEtapa(
            "O MySQL não está saudável; rode `python3 run.py db` (ou `up`)."
        )
    etapa_dependencias()
    if args.prod and not estado_app().pid:
        etapa_build()
    app = etapa_app("prod" if args.prod else "dev")
    etapa_verificacao(app.porta or PORTA_APP_PADRAO)
    return 0


def cmd_db(_: argparse.Namespace) -> int:
    saida.titulo("Lyra MetaCare · db")
    for item in verificar_docker():
        if item.estado == "erro":
            raise FalhaEtapa(f"{item.nome}: {item.detalhe}. {item.correcao}")
    etapa_env()
    etapa_dependencias()
    etapa_banco()
    etapa_migrations()
    return 0


def cmd_migrate(_: argparse.Namespace) -> int:
    saida.titulo("Lyra MetaCare · migrate")
    etapa_env()
    if estado_banco(consultar_sql=False).saude != "healthy":
        raise FalhaEtapa("O MySQL não está saudável; rode `python3 run.py db`.")
    etapa_dependencias()
    etapa_migrations()
    return 0


def cmd_doctor(_args: argparse.Namespace) -> int:
    saida.titulo("Lyra MetaCare · doctor (somente leitura)")
    itens: list[Verificacao] = [
        *verificar_plataforma(),
        verificar_python(),
        *verificar_node(),
        *verificar_docker(),
        verificar_env(),
        verificar_dependencias(),
    ]

    env = ler_env()
    app = estado_app()
    porta_app = app.porta or int(os.environ.get("LYRA_APP_PORT") or PORTA_APP_PADRAO)
    if app.pid:
        itens.append(
            Verificacao(
                f"Porta {porta_app} (app)",
                "ok",
                f"em uso pela aplicação (PID {app.pid})",
            )
        )
    else:
        dono = dono_da_porta(porta_app)
        itens.append(
            Verificacao(
                f"Porta {porta_app} (app)",
                "aviso" if dono else "ok",
                dono.descrever() if dono else "livre",
                "O `up` usará a próxima porta livre, sem encerrar esse processo."
                if dono
                else "",
            )
        )

    banco = estado_banco()
    porta_db = int(env.get("MYSQL_HOST_PORT") or PORTA_DB_PADRAO)
    if banco.estado == "running" and banco.porta == porta_db:
        itens.append(
            Verificacao(
                f"Porta {porta_db} (MySQL)", "ok", "em uso pelo MySQL do projeto"
            )
        )
    else:
        dono = dono_da_porta(porta_db)
        itens.append(
            Verificacao(
                f"Porta {porta_db} (MySQL)",
                "aviso" if dono else "ok",
                dono.descrever() if dono else "livre",
                "O `db`/`up` realocará o MySQL para uma porta livre." if dono else "",
            )
        )

    if banco.saude == "healthy":
        esperado = total_migrations()
        itens.append(
            Verificacao(
                "MySQL", "ok", f"{banco.versao} saudável em 127.0.0.1:{banco.porta}"
            )
        )
        if banco.migrations == esperado:
            itens.append(
                Verificacao("Migrations", "ok", f"{esperado}/{esperado} aplicadas")
            )
        else:
            itens.append(
                Verificacao(
                    "Migrations",
                    "aviso",
                    f"{banco.migrations if banco.migrations is not None else '?'}/{esperado} aplicadas",
                    "`python3 run.py migrate`.",
                )
            )
    elif banco.indisponivel:
        itens.append(
            Verificacao(
                "MySQL",
                "aviso",
                f"não consultável: {banco.indisponivel}",
                "Resolva o item do Docker acima e rode `python3 run.py db`.",
            )
        )
    else:
        itens.append(
            Verificacao(
                "MySQL",
                "aviso",
                "container ausente"
                if not banco.existe
                else f"{banco.estado} {banco.saude}".strip(),
                "`python3 run.py db`.",
            )
        )

    if app.pid and app.porta:
        status, _ = consultar_http(f"http://127.0.0.1:{app.porta}/api/health")
        itens.append(
            Verificacao(
                "Aplicação",
                "ok" if status == 200 else "aviso",
                f"PID {app.pid} ({app.modo}) em http://localhost:{app.porta} · /api/health {status or 'sem resposta'}",
            )
        )
    else:
        itens.append(Verificacao("Aplicação", "ok", "parada"))

    simbolos = {"ok": "✔ ok", "aviso": "⚠ aviso", "erro": "✖ erro"}
    saida.tabela(
        "Diagnóstico",
        ["Verificação", "Estado", "Detalhe"],
        [[item.nome, simbolos[item.estado], item.detalhe] for item in itens],
    )
    correcoes = [item for item in itens if item.estado != "ok" and item.correcao]
    for item in correcoes:
        saida.info(f"{item.nome}: {item.correcao}")
    erros = sum(item.estado == "erro" for item in itens)
    avisos = sum(item.estado == "aviso" for item in itens)
    if erros:
        saida.erro(f"{erros} erro(s) e {avisos} aviso(s).")
        return 1
    if avisos:
        saida.aviso(
            f"Sem erros; {avisos} aviso(s) (`python3 run.py fix` resolve os automatizáveis)."
        )
    else:
        saida.ok("Ambiente saudável.")
    return 0


def cmd_fix(_: argparse.Namespace) -> int:
    saida.titulo("Lyra MetaCare · fix (correções seguras)")
    etapa_preflight()
    etapa_env()
    etapa_dependencias()
    etapa_banco()
    etapa_migrations()
    saida.ok(
        "Correções seguras aplicadas. A aplicação não foi iniciada (`python3 run.py up`)."
    )
    return 0


def cmd_repair(args: argparse.Namespace) -> int:
    saida.titulo("Lyra MetaCare · repair (preserva os dados)")
    saida.info(
        "Será feito: parar a aplicação, remover .next e node_modules (recriáveis), "
        "reinstalar as dependências, recriar o container do MySQL (o volume com os "
        "dados é mantido) e reaplicar as migrations."
    )
    if not args.sim:
        confirmar("Confirma o reparo?")
    etapa_preflight()
    etapa_env()
    parar_app()
    remover_artefato(RAIZ / ".next")
    remover_artefato(RAIZ / "node_modules")
    etapa_dependencias(forcar=True)
    saida.etapa("Recriando o container do MySQL (volume preservado)")
    etapa_porta_banco()
    executar(
        compose("up", "-d", "--wait", "--force-recreate", SERVICO_DB),
        descricao="Recriação do MySQL",
    )
    etapa_migrations()
    saida.ok("Reparo concluído.")
    return 0


def cmd_purge(args: argparse.Namespace) -> int:
    saida.titulo("Lyra MetaCare · purge (APAGA o banco local)")
    if not args.confirmar_purge:
        saida.erro(
            "O purge apaga TODOS os dados do MySQL local deste projeto. "
            "Repita com --confirmar-purge."
        )
        return 2
    saida.info(
        "Será feito: parar a aplicação, backup verificado do volume do MySQL, "
        "remoção do container, da rede e do volume do projeto e do cache .next. "
        "Nada fora do projeto é alterado (sem apt, sem pacotes do sistema)."
    )
    if sys.stdin.isatty():
        confirmar(
            "Os dados do banco serão apagados após o backup.",
            palavra="APAGAR",
            opcao="--confirmar-purge",
        )
    etapa_preflight()
    etapa_env()
    parar_app()
    saida.etapa("Backup a frio do volume do MySQL")
    node = shutil.which("node")
    if not node:
        raise FalhaEtapa("Node.js é necessário para o backup.")
    resultado = executar(
        [node, str(MYSQL_VOLUME), "--backup"], descricao="Backup do volume"
    )
    combinacao = re.search(r"BACKUP_VOLUME=(\S+)", resultado.saida)
    if combinacao:
        saida.ok(f"Backup verificado: {combinacao.group(1)}")
    elif "inexistente" not in resultado.saida:
        raise FalhaEtapa("O backup não informou o volume gerado; purge interrompido.")
    saida.etapa("Removendo container, rede e volume do projeto")
    executar(
        compose("down", "--volumes", "--remove-orphans"), descricao="Remoção do banco"
    )
    remover_artefato(RAIZ / ".next")
    saida.ok("Purge concluído.")
    if combinacao:
        saida.info(
            f"Para restaurar: node scripts/mysql-upgrade.mjs --restaurar {combinacao.group(1)}"
        )
    return 0


def cmd_status(_args: argparse.Namespace) -> int:
    saida.titulo("Lyra MetaCare · status")
    app = estado_app()
    banco = estado_banco()
    linhas: list[list[str]] = []
    if app.pid and app.porta:
        status, _ = consultar_http(f"http://127.0.0.1:{app.porta}/api/health")
        linhas.append(
            [
                "Aplicação",
                "em execução" if status == 200 else "sem resposta",
                f"PID {app.pid} · {app.modo} · http://localhost:{app.porta} · desde {app.iniciado_em or '?'} · {app.origem}",
            ]
        )
    else:
        linhas.append(["Aplicação", "parada", "-"])
    if banco.existe:
        detalhe = f"porta {banco.porta or '-'}"
        if banco.versao:
            detalhe += f" · MySQL {banco.versao}"
        if banco.migrations is not None:
            detalhe += f" · {banco.migrations}/{total_migrations()} migrations"
        linhas.append(["MySQL", f"{banco.estado} {banco.saude}".strip(), detalhe])
    elif banco.indisponivel:
        linhas.append(["MySQL", "não consultável", banco.indisponivel])
    else:
        linhas.append(["MySQL", "ausente", "container não criado"])
    saida.tabela("Estado", ["Componente", "Situação", "Detalhe"], linhas)
    return 0


def _seguir_arquivo(caminho: Path) -> Iterator[str]:
    with caminho.open(encoding="utf-8", errors="replace") as arquivo:
        arquivo.seek(0, os.SEEK_END)
        while True:
            linha = arquivo.readline()
            if linha:
                yield linha.rstrip("\n")
            else:
                time.sleep(0.5)


def cmd_logs(args: argparse.Namespace) -> int:
    alvo = args.alvo
    if alvo in ("app", "todos"):
        app = estado_app()
        caminho = Path(app.log) if app.log else None
        if caminho is None or not caminho.exists():
            candidatos = sorted(LOGS.glob("app-*.log"), key=lambda p: p.stat().st_mtime)
            caminho = candidatos[-1] if candidatos else None
        saida.titulo(f"Log da aplicação ({caminho or 'inexistente'})")
        if caminho and caminho.exists():
            for linha in caminho.read_text(
                encoding="utf-8", errors="replace"
            ).splitlines()[-120:]:
                print(linha)
            if args.seguir and alvo == "app":
                for linha in _seguir_arquivo(caminho):
                    print(linha, flush=True)
    if alvo in ("db", "todos"):
        saida.titulo("Log do MySQL")
        if not ENV_LOCAL.exists():
            saida.aviso("Sem .env.local: nenhum banco configurado.")
            return 0
        argumentos = ["logs", "--tail", "80"]
        if args.seguir and alvo == "db":
            argumentos.append("--follow")
        subprocess.run(
            compose(*argumentos, SERVICO_DB),
            cwd=RAIZ,
            stdin=subprocess.DEVNULL,
            check=False,
        )
    return 0


def cmd_stop(args: argparse.Namespace) -> int:
    saida.titulo("Lyra MetaCare · stop")
    if args.alvo in ("app", "todos"):
        parar_app()
    if args.alvo in ("db", "todos"):
        parar_banco()
    return 0


def cmd_help(_: argparse.Namespace | None = None) -> int:
    print(__doc__.strip())
    return 0


# ═════════════════════════════════════════════════════════════════════════════
# Menu interativo
# ═════════════════════════════════════════════════════════════════════════════

OPCOES_MENU: tuple[tuple[str, str, list[str]], ...] = (
    ("1", "Subir tudo (desenvolvimento)", ["up"]),
    ("2", "Subir tudo (produção: build + start)", ["up", "--prod"]),
    ("3", "Somente banco + migrations", ["db"]),
    ("4", "Somente aplicação (desenvolvimento)", ["app"]),
    ("5", "Aplicar migrations", ["migrate"]),
    ("6", "Diagnóstico (doctor)", ["doctor"]),
    ("7", "Correções seguras (fix)", ["fix"]),
    ("8", "Estado (status)", ["status"]),
    ("9", "Logs (aplicação e banco)", ["logs"]),
    ("10", "Parar tudo", ["stop"]),
    ("11", "Reparo preservando dados (repair)", ["repair"]),
    ("0", "Sair", []),
)


def menu() -> int:
    if not saida.tem_rich:
        saida.aviso("Menu indisponível em modo texto; mostrando a ajuda.")
        return cmd_help()
    from rich.panel import Panel
    from rich.prompt import Prompt
    from rich.table import Table

    assert saida.console is not None
    while True:
        app = estado_app()
        banco = estado_banco(consultar_sql=False)
        situacao = (
            f"Aplicação: {'[green]em execução[/] na porta ' + str(app.porta) if app.pid else '[dim]parada[/]'}"
            f"   ·   MySQL: {'[green]' + banco.saude + '[/]' if banco.saude == 'healthy' else '[dim]' + (banco.estado or 'ausente') + '[/]'}"
        )
        tabela = Table.grid(padding=(0, 2))
        for chave, rotulo, _ in OPCOES_MENU:
            tabela.add_row(f"[bold cyan]{chave:>2}[/]", rotulo)
        saida.console.print(
            Panel(
                tabela,
                title="[bold #2dd4bf]Lyra MetaCare · launcher WSL2[/]",
                subtitle=situacao,
                border_style="#2dd4bf",
                expand=False,
            )
        )
        escolha = Prompt.ask(
            "Opção", choices=[chave for chave, _, _ in OPCOES_MENU], show_choices=False
        )
        argumentos = next(args for chave, _, args in OPCOES_MENU if chave == escolha)
        if not argumentos:
            return 0
        executar_comando(argumentos, abrir_log=False)
        Prompt.ask(
            "\n[dim]Enter para voltar ao menu[/]", default="", show_default=False
        )


# ═════════════════════════════════════════════════════════════════════════════
# Entrada
# ═════════════════════════════════════════════════════════════════════════════


def criar_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="run.py",
        description="Launcher da Lyra MetaCare para WSL2 Ubuntu / Linux.",
        add_help=False,
    )
    sub = parser.add_subparsers(dest="comando")
    for nome in ("up", "app"):
        item = sub.add_parser(nome, add_help=False)
        item.add_argument("--prod", action="store_true")
    for nome in ("db", "migrate", "doctor", "fix", "status", "help"):
        sub.add_parser(nome, add_help=False)
    repair = sub.add_parser("repair", add_help=False)
    repair.add_argument("--sim", action="store_true")
    purge = sub.add_parser("purge", add_help=False)
    purge.add_argument("--confirmar-purge", action="store_true")
    logs = sub.add_parser("logs", add_help=False)
    logs.add_argument(
        "alvo", nargs="?", choices=["app", "db", "todos"], default="todos"
    )
    logs.add_argument("--seguir", action="store_true")
    stop = sub.add_parser("stop", add_help=False)
    stop.add_argument(
        "alvo", nargs="?", choices=["app", "db", "todos"], default="todos"
    )
    return parser


COMANDOS: dict[str, Callable[[argparse.Namespace], int]] = {
    "up": cmd_up,
    "app": cmd_app,
    "db": cmd_db,
    "migrate": cmd_migrate,
    "doctor": cmd_doctor,
    "fix": cmd_fix,
    "repair": cmd_repair,
    "purge": cmd_purge,
    "status": cmd_status,
    "logs": cmd_logs,
    "stop": cmd_stop,
    "help": cmd_help,
}


def executar_comando(argv: list[str], *, abrir_log: bool = True) -> int:
    parser = criar_parser()
    if argv and argv[0] in ("-h", "--help"):
        argv = ["help"]
    try:
        args = parser.parse_args(argv)
    except SystemExit as erro:
        return int(erro.code or 2)
    nome = args.comando
    if nome is None:
        if not (sys.stdin.isatty() and sys.stdout.isatty()):
            return cmd_help()
        # O menu recebe a mesma proteção dos comandos: nenhum traceback no
        # terminal (Ctrl+D encerra o menu; Ctrl+C interrompe).
        try:
            return menu()
        except EOFError:
            print()
            saida.info("Menu encerrado.")
            return 0
        except KeyboardInterrupt:
            print()
            saida.aviso("Interrompido pelo operador.")
            return 130
        except Exception as erro:  # noqa: BLE001 — último recurso
            if saida.registro is None:
                saida.abrir_registro("menu")
            saida.registrar(traceback.format_exc())
            saida.erro(f"Erro interno inesperado: {type(erro).__name__}: {erro}")
            return 1
    if abrir_log or saida.registro is None:
        saida.abrir_registro(nome)
    inicio = time.monotonic()
    try:
        codigo = COMANDOS[nome](args)
    except FalhaEtapa as erro:
        saida.erro(str(erro))
        codigo = 1
    except Cancelado as erro:
        saida.aviso(str(erro))
        codigo = 1
    except KeyboardInterrupt:
        saida.aviso("Interrompido pelo operador.")
        codigo = 130
    except Exception as erro:  # noqa: BLE001 — último recurso: sem traceback no terminal
        saida.registrar(traceback.format_exc())
        saida.erro(f"Erro interno inesperado: {type(erro).__name__}: {erro}")
        codigo = 1
    duracao = time.monotonic() - inicio
    saida.registrar(f"# fim: exit {codigo} em {duracao:.1f}s")
    if saida.caminho_registro and nome not in ("help", "logs"):
        saida.info(
            f"Registro desta execução: {saida.caminho_registro} (exit {codigo})."
        )
    return codigo


def main() -> int:
    argv = sys.argv[1:]
    preparar_interface(argv)
    global saida
    saida = Saida()
    return executar_comando(argv)


if __name__ == "__main__":
    sys.exit(main())
