"""Testes das regras puras e de processos do run.py (python3 -m unittest)."""

from __future__ import annotations

import os
import socket
import stat
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ))

import run


class TestDiagnostico(unittest.TestCase):
    def test_reconhece_causas_conhecidas(self) -> None:
        casos = {
            "failed to connect to the docker API at unix:///var/run/docker.sock; "
            "check if the path is correct and if the daemon is running": "daemon do Docker",
            "Cannot connect to the Docker daemon at unix:///var/run/docker.sock": "daemon do Docker",
            " ERR_PNPM_UNSUPPORTED_ENGINE  Unsupported environment": "versão do Node.js",
            "src/a.ts(1,14): error TS2322: Type 'string' is not assignable": "compilação",
            "Access denied for user 'lyra'@'172.18.0.1'": "senhas do .env.local",
            "Error: listen EADDRINUSE: address already in use :::3000": "porta já está em uso",
            "MY-014060 Invalid MySQL server upgrade": "pnpm db:upgrade",
        }
        for texto, trecho in casos.items():
            with self.subTest(texto=texto):
                causa = run.diagnosticar(texto)
                self.assertIsNotNone(causa)
                self.assertIn(trecho, causa or "")

    def test_sem_causa_conhecida(self) -> None:
        self.assertIsNone(run.diagnosticar("tudo certo, nenhum erro aqui"))


class TestUrlsEVersoes(unittest.TestCase):
    def test_ajusta_somente_urls_locais(self) -> None:
        self.assertEqual(
            run._url_local("http://localhost:3000", 3001), "http://localhost:3001"
        )
        self.assertEqual(
            run._url_local("http://127.0.0.1/login", 3005),
            "http://127.0.0.1:3005/login",
        )
        self.assertEqual(
            run._url_local("https://app.lyra.com.br", 3001),
            "https://app.lyra.com.br",
        )
        self.assertEqual(run._url_local("", 3001), "")

    def test_versao_tupla(self) -> None:
        self.assertEqual(run.versao_tupla("v24.21.0"), (24, 21, 0))
        self.assertEqual(run.versao_tupla("Docker version 29.8.2, build x"), (29, 8, 2))
        self.assertEqual(run.versao_tupla("2.40"), (2, 40))


class TestEnvLocal(unittest.TestCase):
    def test_ler_e_definir_preservam_o_restante_com_permissao_600(self) -> None:
        with tempfile.TemporaryDirectory() as pasta:
            arquivo = Path(pasta) / ".env.local"
            arquivo.write_text(
                "# comentário\nMYSQL_HOST_PORT=3307\nAPP_BASE_URL='http://localhost:3000'\n"
                'AUTH_SECRET="abc=def"\n',
                encoding="utf-8",
            )
            self.assertEqual(
                run.ler_env(arquivo),
                {
                    "MYSQL_HOST_PORT": "3307",
                    "APP_BASE_URL": "http://localhost:3000",
                    "AUTH_SECRET": "abc=def",
                },
            )
            with mock.patch.object(run, "ENV_LOCAL", arquivo):
                run.definir_env({"MYSQL_HOST_PORT": "3308", "MYSQL_PORT": "3308"})
            conteudo = arquivo.read_text(encoding="utf-8")
            self.assertIn("# comentário\n", conteudo)
            self.assertIn("MYSQL_HOST_PORT=3308\n", conteudo)
            self.assertIn("MYSQL_PORT=3308\n", conteudo)
            self.assertIn('AUTH_SECRET="abc=def"\n', conteudo)
            self.assertEqual(stat.S_IMODE(arquivo.stat().st_mode), 0o600)


class TestPortas(unittest.TestCase):
    def test_pula_porta_ocupada_por_terceiro(self) -> None:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as ocupante:
            ocupante.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            ocupante.bind(("127.0.0.1", 0))
            ocupante.listen()
            porta = ocupante.getsockname()[1]
            self.assertTrue(run.porta_em_uso(porta))
            livre = run.porta_livre_a_partir(porta)
            self.assertNotEqual(livre, porta)
            self.assertFalse(run.porta_em_uso(livre))

    def test_respeita_portas_reservadas(self) -> None:
        with socket.socket() as sonda:
            sonda.bind(("127.0.0.1", 0))
            inicio = sonda.getsockname()[1]
        livre = run.porta_livre_a_partir(inicio, reservadas={inicio})
        self.assertNotEqual(livre, inicio)


@unittest.skipUnless(sys.platform.startswith("linux"), "árvore via /proc (Linux)")
class TestArvoreDeProcessos(unittest.TestCase):
    def test_inclui_filhos_em_outra_sessao(self) -> None:
        # Pai que cria um filho em nova sessão (como o `next dev` faz com setsid).
        pai = subprocess.Popen(
            ["sh", "-c", "setsid sleep 30 & sleep 30"],
            stdin=subprocess.DEVNULL,
        )
        try:
            arvore: list[int] = []
            for _ in range(50):
                arvore = run._arvore_de_processos(pai.pid)
                if len(arvore) >= 3:
                    break
                time.sleep(0.05)
            self.assertIn(pai.pid, arvore)
            self.assertGreaterEqual(len(arvore), 3)
            filhos = [pid for pid in arvore if pid != pai.pid]
            sessoes = {os.getsid(pid) for pid in filhos}
            self.assertGreaterEqual(len(sessoes), 2)
        finally:
            for pid in run._arvore_de_processos(pai.pid):
                try:
                    os.kill(pid, 9)
                except ProcessLookupError:
                    pass
            pai.wait(timeout=5)


class TestParser(unittest.TestCase):
    def test_aceita_os_comandos_documentados(self) -> None:
        parser = run.criar_parser()
        self.assertTrue(parser.parse_args(["up", "--prod"]).prod)
        self.assertTrue(parser.parse_args(["repair", "--sim"]).sim)
        self.assertTrue(
            parser.parse_args(["purge", "--confirmar-purge"]).confirmar_purge
        )
        self.assertEqual(parser.parse_args(["logs", "db", "--seguir"]).alvo, "db")
        self.assertEqual(parser.parse_args(["stop"]).alvo, "todos")
        self.assertEqual(
            set(run.COMANDOS),
            {
                "up",
                "app",
                "db",
                "migrate",
                "doctor",
                "fix",
                "repair",
                "purge",
                "status",
                "logs",
                "stop",
                "help",
            },
        )

    def test_comando_invalido_sai_com_codigo_2(self) -> None:
        resultado = subprocess.run(
            [sys.executable, str(RAIZ / "run.py"), "inexistente"],
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            timeout=60,
            env={**os.environ, "LYRA_RUN_MODO_TEXTO": "1"},
            check=False,
        )
        self.assertEqual(resultado.returncode, 2)


if __name__ == "__main__":
    unittest.main()
