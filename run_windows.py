#!/usr/bin/env python3
"""
Lyra MetaCare · ponto de entrada para PowerShell e CMD no Windows 11.

Arquitetura (docs/launchers.md, decisão da tarefa 15): este arquivo é um
wrapper fino, sem lógica de orquestração própria. Ele localiza o Git Bash
(Git for Windows) e delega cada comando ao `run.sh`, que é a única
implementação do launcher no Windows. Assim, PowerShell, CMD e Git Bash têm
exatamente o mesmo comportamento: portas, processos, logs, verificação ponta
a ponta, `repair`, `purge` com backup e estado compartilhado com o `run.py`.

Uso (PowerShell ou CMD, na raiz do projeto):
    py run_windows.py                 menu interativo do run.sh
    py run_windows.py up [--prod]     mesmos comandos do run.sh / run.py
    py run_windows.py help            ajuda completa do run.sh

Os comandos da versão anterior continuam aceitos (com aviso) e são
convertidos para os equivalentes atuais; veja COMANDOS_LEGADOS.

Requisitos: Python 3.9+ (somente biblioteca padrão) e Git for Windows.
Variável opcional: LYRA_GIT_BASH=<caminho do bash.exe do Git for Windows>.
"""

from __future__ import annotations

import os
import platform
import shutil
import subprocess
import sys
from collections.abc import Iterable, Sequence
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
RUN_SH = RAIZ / "run.sh"
ESTADO_LEGADO = RAIZ / ".lyra-run-windows"

# Comandos da versão anterior → comando equivalente do run.sh.
COMANDOS_LEGADOS: dict[str, tuple[str, ...]] = {
    "dev": ("up",),
    "prod": ("up", "--prod"),
    "start-dev": ("app",),
    "start-prod": ("app", "--prod"),
    "db-start": ("db",),
    "db-stop": ("stop", "db"),
    "stop-app": ("stop", "app"),
    "stop-all": ("stop",),
    "setup-env": ("fix",),
    "install-deps": ("fix",),
    "health": ("doctor",),
}

# Sem equivalente direto: orientação em vez de uma conversão imprecisa.
COMANDOS_REMOVIDOS: dict[str, str] = {
    "build": (
        "o build isolado foi incorporado ao `up --prod` (build + start + verificação); "
        "para só compilar, use `corepack pnpm build`."
    ),
}


def mensagem(rotulo: str, texto: str) -> None:
    print(f"[{rotulo}] {texto}", file=sys.stderr if rotulo == "ERRO" else sys.stdout)


def _uname(bash: Path) -> str:
    """`uname -s` executado pelo bash candidato ("" se não executar)."""
    try:
        resultado = subprocess.run(
            [str(bash), "-c", "uname -s"],
            capture_output=True,
            encoding="utf-8",
            errors="replace",
            timeout=20,
            check=False,
            stdin=subprocess.DEVNULL,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return resultado.stdout.strip() if resultado.returncode == 0 else ""


def _eh_bash_do_wsl(caminho: Path) -> bool:
    """C:\\Windows\\System32\\bash.exe abre o WSL, não o Git Bash."""
    raiz_windows = Path(os.environ.get("SystemRoot", r"C:\Windows")).resolve()
    try:
        return caminho.resolve().is_relative_to(raiz_windows)
    except OSError:
        return True


def candidatos_git_bash(
    *,
    variavel: str | None,
    git_no_path: str | None,
    pastas_instalacao: Iterable[str],
) -> list[Path]:
    """Caminhos possíveis do bash.exe do Git for Windows, em ordem de preferência.

    Usa `bin/bash.exe` (o lançador do Git for Windows, que monta o PATH do
    MSYS2), nunca `usr/bin/bash.exe` isolado nem o bash.exe do WSL.
    """
    candidatos: list[Path] = []
    if variavel:
        candidatos.append(Path(variavel))
    if git_no_path:
        git = Path(git_no_path)
        # <Git>\cmd\git.exe, <Git>\bin\git.exe ou <Git>\mingw64\bin\git.exe
        for ancestral in list(git.parents)[:3]:
            candidatos.append(ancestral / "bin" / "bash.exe")
    for pasta in pastas_instalacao:
        candidatos.append(Path(pasta) / "bin" / "bash.exe")
    vistos: set[str] = set()
    unicos: list[Path] = []
    for candidato in candidatos:
        chave = str(candidato).lower()
        if chave not in vistos:
            vistos.add(chave)
            unicos.append(candidato)
    return unicos


def _pastas_do_registro() -> list[str]:
    """InstallPath gravado pelo instalador do Git for Windows."""
    if sys.platform != "win32":
        return []
    import winreg

    pastas: list[str] = []
    for raiz in (winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER):
        try:
            with winreg.OpenKey(raiz, r"SOFTWARE\GitForWindows") as chave:
                valor, _tipo = winreg.QueryValueEx(chave, "InstallPath")
        except OSError:
            continue
        if isinstance(valor, str) and valor:
            pastas.append(valor)
    return pastas


def localizar_git_bash() -> tuple[Path | None, list[str]]:
    """Retorna o bash.exe validado (uname MINGW*/MSYS*) e o motivo de cada recusa."""
    pastas = _pastas_do_registro()
    for variavel_ambiente, sufixo in (
        ("ProgramFiles", "Git"),
        ("ProgramW6432", "Git"),
        ("LOCALAPPDATA", r"Programs\Git"),
    ):
        base = os.environ.get(variavel_ambiente)
        if base:
            pastas.append(str(Path(base) / sufixo))
    recusas: list[str] = []
    for candidato in candidatos_git_bash(
        variavel=os.environ.get("LYRA_GIT_BASH"),
        git_no_path=shutil.which("git"),
        pastas_instalacao=pastas,
    ):
        if not candidato.is_file():
            continue
        if _eh_bash_do_wsl(candidato):
            recusas.append(f"{candidato}: é o bash do WSL, não o Git Bash")
            continue
        sistema = _uname(candidato)
        if sistema.startswith(("MINGW", "MSYS")):
            return candidato, recusas
        recusas.append(
            f"{candidato}: uname '{sistema or 'falhou'}' (esperado MINGW/MSYS)"
        )
    return None, recusas


def localizar_bash_posix() -> Path | None:
    """Fora do Windows, o run.sh roda no bash do sistema (Linux/macOS)."""
    caminho = shutil.which("bash")
    return Path(caminho) if caminho else None


def traduzir_argumentos(argumentos: Sequence[str]) -> tuple[list[str] | None, str]:
    """Converte comandos legados. Retorna (argumentos do run.sh, aviso) ou (None, erro)."""
    if not argumentos:
        return [], ""
    comando, *resto = argumentos
    if comando in ("--help", "-h"):
        return ["help"], ""
    if comando in COMANDOS_REMOVIDOS:
        return None, f"`{comando}` não existe mais: {COMANDOS_REMOVIDOS[comando]}"
    if comando in COMANDOS_LEGADOS:
        novo = list(COMANDOS_LEGADOS[comando])
        aviso = (
            f"`{comando}` é um comando da versão anterior; executando o equivalente "
            f"`{' '.join(novo)}`."
        )
        return [*novo, *resto], aviso
    return list(argumentos), ""


def avisar_estado_legado() -> None:
    pid_legado = ESTADO_LEGADO / "app.pid"
    if pid_legado.is_file():
        pid = pid_legado.read_text(encoding="utf-8", errors="replace").strip()
        mensagem(
            "AVISO",
            f"Há estado da versão anterior em {ESTADO_LEGADO.name}/ (PID {pid or '?'}). "
            "Essa aplicação não é gerenciada pelo launcher atual; se ainda estiver "
            f"em execução, encerre-a com `taskkill /PID {pid or '<pid>'} /T /F` e "
            f"depois apague a pasta {ESTADO_LEGADO.name}.",
        )


def executar(bash: Path, argumentos: Sequence[str]) -> int:
    ambiente = dict(os.environ)
    if sys.platform == "win32":
        # A saída do run.sh é UTF-8; sem LANG, o runtime do MSYS2 pode
        # converter os acentos e símbolos para a página de código do console.
        ambiente.setdefault("LANG", "C.UTF-8")
    processo = subprocess.Popen(
        [str(bash), RUN_SH.name, *argumentos], cwd=RAIZ, env=ambiente
    )
    # O Ctrl+C chega ao run.sh pelo próprio console; o wrapper só aguarda o
    # término e devolve o código de saída dele (130 na interrupção).
    while True:
        try:
            return processo.wait()
        except KeyboardInterrupt:
            continue


def main(argumentos: Sequence[str]) -> int:
    if not RUN_SH.is_file():
        mensagem("ERRO", f"{RUN_SH.name} não encontrado em {RAIZ}.")
        return 1

    traduzidos, observacao = traduzir_argumentos(argumentos)
    if traduzidos is None:
        mensagem("ERRO", observacao)
        return 2
    if observacao:
        mensagem("AVISO", observacao)

    if sys.platform == "win32":
        bash, recusas = localizar_git_bash()
        if bash is None:
            mensagem(
                "ERRO",
                "Git Bash (Git for Windows) não encontrado. Instale o Git for Windows "
                "(https://git-scm.com/download/win) ou informe o caminho do bash.exe "
                "em LYRA_GIT_BASH. O bash.exe do WSL não serve: no WSL2, use o run.py.",
            )
            for recusa in recusas:
                mensagem("INFO", f"Recusado: {recusa}")
            return 1
        avisar_estado_legado()
    else:
        bash = localizar_bash_posix()
        if bash is None:
            mensagem("ERRO", "bash não encontrado no PATH.")
            return 1
        mensagem(
            "INFO",
            f"Sistema {platform.system()}: delegando ao run.sh com {bash} "
            "(no WSL2 Ubuntu o launcher oficial é o run.py).",
        )

    return executar(bash, traduzidos)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
