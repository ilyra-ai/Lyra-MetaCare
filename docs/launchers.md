# Launchers da Lyra MetaCare

Três pontos de entrada sobem o ambiente local. Todos usam a mesma configuração (`.env.local`, criado por `pnpm env:init` a partir do `.env.example`), o mesmo banco (serviço `mysql` do `compose.yaml`, via `docker compose --env-file .env.local`) e os mesmos scripts (`scripts/mysql-migrate.mjs` e `scripts/mysql-upgrade.mjs`).

| Launcher         | Ambiente suportado                       | Situação                                             |
| ---------------- | ---------------------------------------- | ---------------------------------------------------- |
| `run.py`         | WSL2 Ubuntu 22.04+ (e Linux equivalente) | Oficial, reescrito e validado (tarefa 13)            |
| `run.sh`         | Windows 11 com Git Bash (MINGW/MSYS)     | Reescrito (tarefa 14); validado em Linux             |
| `run_windows.py` | Windows 11 em PowerShell/CMD             | Em revisão de redundância com o `run.sh` (tarefa 15) |

## `run.py` (WSL2 Ubuntu / Linux)

### Requisitos

- Python 3.10+ (o Ubuntu 22.04 traz 3.10; o 24.04 traz 3.12).
- Node.js da versão do `.nvmrc` (24 LTS), com o Corepack incluído.
- Docker Engine 25+ com Docker Compose 2.20+ (Docker Desktop com integração WSL ou Docker Engine no Linux).

Na primeira execução, o `run.py` cria `.lyra-run/venv` e instala o `requirements-run.txt` com `pip --require-hashes --only-binary=:all:`. Nada é instalado no Python do sistema. Se o módulo `venv` não existir (`sudo apt install python3.X-venv`) ou a instalação falhar, o launcher continua em modo texto: a linha de comando fica completa e só o menu interativo deixa de estar disponível. Para forçar o modo texto: `LYRA_RUN_MODO_TEXTO=1`.

### Comandos

| Comando                     | O que faz                                                                                                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `python3 run.py`            | Menu interativo (com terminal); sem terminal, mostra a ajuda.                                                                                                                                                                               |
| `up [--prod]`               | Pré-requisitos → `.env.local` → dependências → MySQL → migrations → aplicação → verificação (`/api/health`, `/`, `/login`, login do admin). `--prod` faz `next build` e `next start`.                                                       |
| `app [--prod]`              | Só a aplicação (exige o MySQL saudável).                                                                                                                                                                                                    |
| `db`                        | MySQL + migrations.                                                                                                                                                                                                                         |
| `migrate`                   | Só as migrations.                                                                                                                                                                                                                           |
| `doctor`                    | Diagnóstico somente leitura: plataforma, Ubuntu, Python, Node (contra `.nvmrc`/`engines`), Corepack/pnpm, Docker, Compose, `.env.local`, dependências, portas com dono, MySQL, migrations e aplicação. Exit 1 se houver erro.               |
| `fix`                       | Correções seguras e idempotentes: `.env.local`, dependências, MySQL e migrations. Não usa `sudo` nem inicia a aplicação.                                                                                                                    |
| `repair [--sim]`            | Reparo preservando os dados: para a aplicação, remove `.next` e `node_modules` (artefatos recriáveis), reinstala, recria o container do MySQL (o volume é mantido) e reaplica as migrations. Pede confirmação; sem terminal, exige `--sim`. |
| `purge --confirmar-purge`   | **Apaga o banco local** do projeto: backup a frio verificado do volume, depois remoção do container, da rede e do volume, além do `.next`. Com terminal, também pede que se digite `APAGAR`. Informa o comando de restauração.              |
| `status`                    | Estado da aplicação (PID, modo, porta, saúde) e do MySQL (porta, versão, migrations).                                                                                                                                                       |
| `logs [app\|db] [--seguir]` | Últimas linhas do log da aplicação (`.logs/app-<modo>.log`) e do MySQL; `--seguir` acompanha em tempo real.                                                                                                                                 |
| `stop [app\|db]`            | Para a aplicação e/ou o MySQL (padrão: ambos). O volume é preservado.                                                                                                                                                                       |
| `help`                      | Ajuda.                                                                                                                                                                                                                                      |

Códigos de saída: `0` sucesso, `1` falha (com causa provável), `2` uso incorreto ou confirmação ausente no `purge`, `130` interrupção (Ctrl+C).

### Garantias de segurança

- **Sem operações destrutivas automáticas.** Nenhum comando usa `apt`, `sudo`, remove pacotes, MySQL/MariaDB nativos ou diretórios fora do projeto. Remoções se limitam a artefatos recriáveis dentro do projeto (`.next`, `node_modules`) e, só no `purge` confirmado, ao volume do banco, sempre depois de um backup verificado.
- **Portas.** A porta em uso é identificada por `docker ps` (container) e `/proc/net/tcp` (PID, linha de comando e usuário). O processo de terceiros **nunca** é encerrado: a aplicação sobe na próxima porta livre, com `PORT`, `APP_BASE_URL` e `NEXT_PUBLIC_APP_URL` ajustados no processo. O MySQL é realocado, com `MYSQL_HOST_PORT` e `MYSQL_PORT` atualizados juntos no `.env.local`.
- **Processos.** A aplicação roda desacoplada, com estado em `.lyra-run/app.json` e `.lyra-run/app.pid`. O `stop` encerra a **árvore** de processos (o `next dev` cria a própria sessão com `setsid`), com SIGTERM e espera de 20 s antes de SIGKILL. Um grupo só recebe sinal se todos os seus membros pertencem à aplicação. Depois, o `stop` confirma que a porta foi liberada.
- **Logs honestos.** Cada execução grava `.logs/run-py-<data>-<comando>.log` com cada comando, a saída integral (stdout e stderr) e o exit code. Falhas mostram a causa provável e o caminho do log. Nenhum traceback chega ao terminal: erros inesperados vão para o log.
- **Segredos.** Senhas nunca aparecem nos argumentos de processos: as consultas ao MySQL usam `MYSQL_PWD` herdado do ambiente.

### Backup e restauração do volume

```bash
node scripts/mysql-upgrade.mjs --backup                       # cópia a frio verificada (BACKUP_VOLUME=<nome>)
node scripts/mysql-upgrade.mjs --restaurar <volume_de_backup> # restaura (recria o volume pelo Compose se necessário)
```

## `run.sh` (Windows 11 com Git Bash)

### Ambiente suportado

- **Windows 11 com Git Bash** (Git for Windows, `uname` MINGW64/MSYS), Docker Desktop e Node.js 24 LTS para Windows. É o ambiente principal do `run.sh`. CMD e PowerShell não executam `.sh`: abra o Git Bash na pasta do projeto.
- **Linux com bash 4+** é aceito como ambiente equivalente (no WSL2 o launcher oficial é o `run.py`).
- **Cygwin é detectado e recusado** (`doctor` e `up` param com erro): o Node.js e o Docker Desktop do Windows esperam caminhos Win32, que o Cygwin não converte de forma confiável.
- macOS é aceito com aviso (fora dos ambientes de referência).
- Requer bash 4+ (o Git Bash traz o 5.x). Todos os caminhos são relativos à raiz do projeto, o que evita a conversão de caminhos `/c/...` ao chamar executáveis nativos do Windows.

### Comandos

Os mesmos do `run.py`, com a mesma semântica e os mesmos códigos de saída: `./run.sh` (menu com terminal; sem terminal, ajuda), `up [--prod]`, `app [--prod]`, `db`, `migrate`, `doctor`, `fix`, `repair [--sim]`, `purge --confirmar-purge`, `status`, `logs [app|db] [--seguir]`, `stop [app|db]` e `help`. Argumentos inválidos terminam com exit `2`.

### Como cada garantia é implementada no Git Bash

| Garantia                  | Windows (Git Bash)                                                                                                                                                                                     | Linux                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Dono de uma porta         | `docker ps` (container); `netstat -ano -p TCP` filtrando o endereço remoto `0.0.0.0:0`/`[::]:0` (independe do idioma do Windows) e `tasklist /V` para nome e usuário                                   | `docker ps`; `ss -ltnp` ou `lsof`, com a linha de comando de `/proc/<pid>/cmdline`                            |
| Processo de terceiros     | Nunca é encerrado: a aplicação usa a próxima porta livre (`PORT`, `APP_BASE_URL` e `NEXT_PUBLIC_APP_URL` ajustados no processo) e o MySQL é realocado (`MYSQL_HOST_PORT`/`MYSQL_PORT` no `.env.local`) | Igual                                                                                                         |
| Aplicação desacoplada     | `nohup`; o `app.json` guarda o PID do MSYS e o PID Windows (`/proc/<pid>/winpid`)                                                                                                                      | `setsid nohup` (sessão própria: o Ctrl+C no terminal não derruba a aplicação)                                 |
| Parada                    | `taskkill /PID <pid Windows> /T /F` (somente a árvore iniciada pelo launcher) e confirmação de que a porta foi liberada                                                                                | SIGTERM para a árvore de processos capturada antes do sinal; SIGKILL após 20 s; confirmação da porta liberada |
| Logs                      | `.logs/run-sh-<data>-<comando>.log` com comandos, saída integral e exit code; `.logs/app-<modo>.log` para a aplicação                                                                                  | Igual                                                                                                         |
| Verificação ponta a ponta | `scripts/verificar-app.mjs <porta>`: `/api/health` com todas as migrations, `/` e `/login` com HTTP 200 e login do administrador inicial                                                               | Igual                                                                                                         |
| Segredos                  | Senhas nunca vão para argumentos de processos (`MYSQL_PWD` herdado pelo `docker compose exec -e MYSQL_PWD`)                                                                                            | Igual                                                                                                         |
| Interrupção (Ctrl+C)      | Exit `130`; a aplicação já iniciada continua registrada e é encerrada por `stop`                                                                                                                       | Igual                                                                                                         |

### Interoperabilidade

O `run.sh` e o `run.py` compartilham o `.lyra-run/app.json` (campo `origem` indica qual launcher iniciou a aplicação, e `iniciado_em` é gravado em hora local com fuso, ex.: `2026-10-06T11:59:46-03:00`). Uma aplicação iniciada por um deles aparece no `status` do outro e é encerrada pelo `stop` do outro.

### O que foi validado

- **Linux (bash 5.2), de forma real:** `help` sem terminal; argumentos inválidos (exit 2); `doctor`; `up` (dev) e segunda execução idempotente; `status`; `logs app`, `logs db`; `stop app`, `stop` (app + banco); restart com banco parado; `up --prod` (build + start); aplicação em outro modo já em execução (aviso, sem duplicar processo); porta 3000 ocupada por terceiro (app sobe na 3001, terceiro intacto); porta 3307 ocupada (MySQL realocado para 3308, terceiro intacto); Docker indisponível (diagnóstico com causa); `.env.local` ausente; `node_modules` ausente (reinstalado); build quebrado (causa de tipos apontada); migration inválida (arquivo e erro do MySQL apontados); `purge` sem e com confirmação, seguido de restauração com contagem de linhas idêntica (27 tabelas, 87 linhas); `repair` sem e com `--sim`; menu em pseudo-terminal (opções, opção inválida, EOF); Ctrl+C no menu, em `logs --seguir` e durante o `up` (exit 130, aplicação recuperável pelo `stop`); interoperabilidade com o `run.py` nos dois sentidos; `shellcheck -S warning` sem achados.
- **Windows 11 / Git Bash:** os ramos específicos do Windows (`netstat`, `tasklist`, `taskkill`, `winpid`, `cmd.exe /c ver`) foram validados estaticamente (`bash -n` e `shellcheck`), porque o sandbox de desenvolvimento não dispõe de Windows. A execução real nesse ambiente permanece necessária e está registrada como limite conhecido no `claude-gestao.md`.

## Contrato comum dos launchers

| Item                | Contrato                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Configuração        | `.env.local` gerado por `node scripts/env-init.mjs` (nunca há valores padrão de senha)     |
| Banco               | `docker compose --env-file .env.local` (serviço `mysql`)                                   |
| Estado da aplicação | `.lyra-run/app.pid` (PID) e `.lyra-run/app.json` (PID, porta, modo, início, log, origem)   |
| Logs                | `.logs/` (ignorado pelo Git)                                                               |
| Saúde da aplicação  | `GET /api/health`: `200` com o número de migrations aplicadas, ou `503` sem expor detalhes |

## Matriz de paridade

| Função                      | `run.py` | `run.sh` | `run_windows.py` (estado atual) |
| --------------------------- | -------- | -------- | ------------------------------- |
| Menu interativo             | ✔        | ✔        | —                               |
| `up` (dev)                  | ✔        | ✔        | `dev`                           |
| `up --prod` (build + start) | ✔        | ✔        | `prod`                          |
| `app [--prod]`              | ✔        | ✔        | `start-dev` / `start-prod`      |
| `db`                        | ✔        | ✔        | `db-start`                      |
| `migrate`                   | ✔        | ✔        | `migrate`                       |
| `doctor`                    | ✔        | ✔        | `doctor`                        |
| `fix`                       | ✔        | ✔        | `setup-env` + `install-deps`    |
| `repair`                    | ✔        | ✔        | —                               |
| `purge` com backup          | ✔        | ✔        | —                               |
| `status`                    | ✔        | ✔        | `status` / `health`             |
| `logs [--seguir]`           | ✔        | ✔        | —                               |
| `stop [app\|db]`            | ✔        | ✔        | `stop-app` / `stop-all`         |
| `help`                      | ✔        | ✔        | `--help`                        |
| Verificação ponta a ponta   | ✔        | ✔        | `health`                        |

A coluna do `run_windows.py` será atualizada na tarefa 15.
