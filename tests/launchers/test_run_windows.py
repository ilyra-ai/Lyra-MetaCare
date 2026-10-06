"""Testes do wrapper run_windows.py (python3 -m unittest)."""

from __future__ import annotations

import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ))

import run_windows


class TestTraducao(unittest.TestCase):
    def test_comandos_atuais_passam_inalterados(self) -> None:
        for argumentos in (["up", "--prod"], ["logs", "db", "--seguir"], ["doctor"]):
            with self.subTest(argumentos=argumentos):
                self.assertEqual(
                    run_windows.traduzir_argumentos(argumentos), (argumentos, "")
                )

    def test_comandos_legados_viram_os_equivalentes(self) -> None:
        esperado = {
            "dev": ["up"],
            "prod": ["up", "--prod"],
            "start-dev": ["app"],
            "start-prod": ["app", "--prod"],
            "db-start": ["db"],
            "db-stop": ["stop", "db"],
            "stop-app": ["stop", "app"],
            "stop-all": ["stop"],
            "setup-env": ["fix"],
            "install-deps": ["fix"],
            "health": ["doctor"],
        }
        for legado, atual in esperado.items():
            with self.subTest(legado=legado):
                traduzidos, aviso = run_windows.traduzir_argumentos([legado])
                self.assertEqual(traduzidos, atual)
                self.assertIn(legado, aviso)

    def test_build_e_ajuda(self) -> None:
        traduzidos, erro = run_windows.traduzir_argumentos(["build"])
        self.assertIsNone(traduzidos)
        self.assertIn("up --prod", erro)
        self.assertEqual(run_windows.traduzir_argumentos(["--help"]), (["help"], ""))
        self.assertEqual(run_windows.traduzir_argumentos([]), ([], ""))


class TestDescobertaDoGitBash(unittest.TestCase):
    def test_ordem_dos_candidatos(self) -> None:
        base = Path("/opt/Git")
        candidatos = run_windows.candidatos_git_bash(
            variavel="/custom/bash.exe",
            git_no_path=str(base / "cmd" / "git.exe"),
            pastas_instalacao=[str(base)],
        )
        self.assertEqual(candidatos[0], Path("/custom/bash.exe"))
        self.assertIn(base / "bin" / "bash.exe", candidatos)
        # Sem duplicatas (a pasta de instalação repete um candidato do git).
        self.assertEqual(len(candidatos), len(set(map(str, candidatos))))

    def test_recusa_o_bash_do_wsl_e_valida_por_uname(self) -> None:
        with tempfile.TemporaryDirectory() as pasta:
            windows = Path(pasta) / "Windows"
            (windows / "System32").mkdir(parents=True)
            git_bin = Path(pasta) / "Git" / "bin"
            git_bin.mkdir(parents=True)
            falso_git_bash = git_bin / "bash.exe"
            falso_git_bash.write_text("#!/bin/sh\necho MINGW64_NT-10.0-26100\n")
            falso_git_bash.chmod(0o755)
            with mock.patch.dict(os.environ, {"SystemRoot": str(windows)}):
                self.assertTrue(
                    run_windows._eh_bash_do_wsl(windows / "System32" / "bash.exe")
                )
                self.assertFalse(run_windows._eh_bash_do_wsl(falso_git_bash))
            self.assertTrue(run_windows._uname(falso_git_bash).startswith("MINGW"))
            self.assertEqual(run_windows._uname(Path(pasta) / "inexistente"), "")


class TestExecucao(unittest.TestCase):
    def _rodar(self, *argumentos: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(RAIZ / "run_windows.py"), *argumentos],
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )

    def test_build_sai_com_codigo_2(self) -> None:
        resultado = self._rodar("build")
        self.assertEqual(resultado.returncode, 2)
        self.assertIn("up --prod", resultado.stderr)

    def test_delegacao_ao_run_sh(self) -> None:
        resultado = self._rodar("help")
        self.assertEqual(resultado.returncode, 0)
        self.assertIn("Lyra MetaCare", resultado.stdout)
        self.assertEqual(self._rodar("comando-inexistente").returncode, 2)


if __name__ == "__main__":
    unittest.main()
