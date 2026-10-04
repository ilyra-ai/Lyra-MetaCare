INSTRUÇÃO MESTRA DE ENGENHARIA, AUDITORIA FORENSE, UPGRADE E ESTABILIZAÇÃO TOTAL

PROJETO LYRA METACARE

Leia esta instrução POR COMPLETO, NA ÍNTEGRA, EM SUA TOTALIDADE, LINHA A LINHA, do início até o fim, ANTES de executar qualquer comando, modificar qualquer arquivo ou tomar qualquer decisão.

É PROIBIDO resumir esta instrução, simplificá-la, reinterpretá-la superficialmente, ignorar itens, pular etapas ou criar um contexto reduzido dela.

Você deverá executar TODOS os requisitos aplicáveis desta instrução.

1. PAPEL PROFISSIONAL OBRIGATÓRIO

Atue durante toda esta tarefa como um:

Especialista Forense Mestre em Engenharia de Software;
Arquiteto de Software Full Stack;
Engenheiro DevSecOps;
Especialista em Next.js, React, TypeScript e Node.js;
Especialista em MySQL;
Especialista em Docker e Docker Compose;
Especialista em Linux, Ubuntu e WSL2;
Especialista em Windows 11;
Especialista em Bash, Python e automação;
Especialista em dependências, package managers e supply-chain;
Especialista em segurança de aplicações;
Especialista em performance;
Especialista em testes automatizados e QA;
Especialista em UI/UX responsiva;
Especialista em acessibilidade;
Especialista em Git/GitHub;
Especialista com rigor técnico equivalente a PhD e visão empresarial equivalente a MBA.
Atue como um profissional empresarial de elite.

Não seja simplista.

Não priorize rapidez.

QUALIDADE é mais importante que AGILIDADE.

Investigue problemas até encontrar a CAUSA RAIZ.

Não faça remendos apenas para silenciar erros.

2. PRINCÍPIOS NÃO NEGOCIÁVEIS

É terminantemente proibido:

simular execução;
simular testes;
inventar logs;
afirmar que algo funciona sem executar;
usar placeholders funcionais;
criar funcionalidades fictícias;
esconder erros;
ignorar warnings importantes;
comentar código quebrado apenas para passar build;
remover funcionalidades para fazer os testes passarem;
usar hardcode para contornar problemas;
adicionar any indiscriminadamente para esconder erros TypeScript;
usar @ts-ignore ou @ts-nocheck para mascarar problemas;
desabilitar regras de lint apenas para obter resultado verde;
remover testes que estejam detectando bugs reais;
alterar testes para aceitarem comportamento incorreto;
ignorar vulnerabilidades conhecidas sem investigação;
manter dependências obsoletas apenas porque atualizar dá trabalho;
criar branches;
criar worktrees;
criar árvores paralelas;
fazer force-push;
trabalhar em outra branch que não seja main;
criar código reduzido ou incompleto;
cortar partes de arquivos sob o argumento de simplificação;
declarar sucesso parcial como sucesso total.
Tudo deve funcionar DE FORMA REAL.

3. REPOSITÓRIO OFICIAL

Clone obrigatoriamente:

https://github.com/ilyra-ai/Lyra-MetaCare

Utilize a branch:

main

Não crie outra branch.

Não crie worktree.

Não crie fork.

Não trabalhe em árvore paralela.

4. PRIMEIRA ETAPA: CLONAGEM E EXECUÇÃO REAL NO SANDBOX

Clone o repositório dentro do sandbox do Claude.

Entre no diretório raiz.

Execute inicialmente:

git status
git branch --show-current
git remote -v
git log -5 --oneline
Confirme que está trabalhando sobre:

main
Antes de qualquer alteração:

git fetch origin
git pull --ff-only origin main
Nunca sobrescreva mudanças remotas.

Nunca utilize git push --force.

Se ocorrer conflito, investigue e resolva corretamente na própria main.

5. LEITURA OBRIGATÓRIA DO REPOSITÓRIO

ANTES de modificar qualquer coisa, leia e analise toda documentação e regras relevantes existentes no projeto.

Obrigatoriamente inspecione:

AGENTS.md
README.md
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
package-lock.json
bun.lock
compose.yaml
next.config.ts
tsconfig.json
tailwind.config.ts
postcss.config.mjs
vitest.config.mts
components.json
run.py
run.sh
run_windows.py
scripts/
mysql/
mysql/migrations/
src/
public/
docs/
modules/
Puck/
.agents/
.codex/
Procure também arquivos adicionais de regras, instruções ou workflows em qualquer subdiretório.

As regras do próprio repositório são obrigatórias.

Leia AGENTS.md antes de começar qualquer implementação.

6. CONTEXTO TÉCNICO REAL JÁ IDENTIFICADO NO PROJETO

Não trate este projeto como um Next.js genérico.

A arquitetura existente utiliza, entre outros:

Next.js com App Router;
React;
TypeScript;
Tailwind CSS;
shadcn/ui;
Radix UI;
Recharts;
MySQL;
mysql2;
autenticação com jose;
bcryptjs;
Stripe;
Puck Editor;
Sentry;
Vitest;
ESLint;
Prettier;
Docker Compose;
pnpm;
motores de IA e saúde;
rotas API do próprio Next.js;
área administrativa;
autenticação própria;
billing;
chat;
dashboard;
planos;
metas;
perfil;
integrações e motores de domínio.
O repositório atualmente também contém:

pnpm-lock.yaml
package-lock.json
bun.lock
e isso DEVE ser investigado.

O projeto aparenta ter o pnpm como gerenciador oficial, mas também possui artefatos de npm e Bun.

Não preserve essa ambiguidade sem justificativa técnica.

7. BASELINE FORENSE ANTES DE MODIFICAR O PROJETO

Faça primeiro uma fotografia técnica REAL do estado atual.

Registre:

node --version
npm --version
pnpm --version
python3 --version
docker --version
docker compose version
git --version
Execute e registre também:

pnpm install
pnpm check:lint
pnpm check:format
pnpm check:types
pnpm test
pnpm build
Execute também:

pnpm outdated
e auditoria de segurança compatível com o gerenciador adotado.

Identifique:

erros;
warnings;
vulnerabilidades;
dependências desatualizadas;
dependências duplicadas;
peer dependencies quebradas;
packages abandonados;
packages não utilizados;
packages instalados em seção errada;
dependências transitivas problemáticas;
conflitos de versão;
APIs depreciadas;
configurações antigas;
problemas de build;
erros TypeScript;
erros ESLint;
testes falhando;
problemas Docker;
problemas MySQL;
problemas nas migrations;
problemas de autenticação;
problemas de runtime.
Não corrija ainda aleatoriamente.

Primeiro descubra a causa raiz.

8. PESQUISA EXTERNA OBRIGATÓRIA ANTES DOS UPGRADES

ANTES de realizar upgrades importantes, pesquise na internet as versões oficiais existentes em OUTUBRO DE 2026.

Priorize documentação oficial:

Next.js/Vercel;
React;
Node.js;
pnpm;
TypeScript;
Tailwind CSS;
MySQL/Oracle;
Docker;
Sentry;
Stripe;
Radix;
shadcn;
Vitest;
ESLint;
demais mantenedores oficiais.
Considere primeiro informações publicadas em outubro de 2026.

Caso não existam informações de outubro, utilize as mais recentes de 2026.

Não utilize artigos antigos se documentação oficial atual estiver disponível.

Não escolha versões beta, alpha, canary, RC ou experimentais para produção apenas por serem numericamente superiores.

Para infraestrutura crítica, prefira:

Stable;
Active LTS;
LTS;
quando tecnicamente apropriado.

Porém, não mantenha versões antigas apenas para evitar trabalho de migração.

9. PONTOS DE UPGRADE QUE DEVEM SER INVESTIGADOS OBRIGATORIAMENTE

Na data desta instrução, o projeto possui forte defasagem em alguns componentes.

Analise obrigatoriamente a migração de:

Next.js 15.x
para a versão Stable / Active LTS mais atual disponível em outubro de 2026.

Analise React para a versão estável mais recente compatível.

Analise Tailwind CSS 3.x para Tailwind CSS 4.x atual.

Analise TypeScript.

Analise ESLint.

Analise Vitest.

Analise todas as bibliotecas Radix.

Analise shadcn.

Analise Sentry.

Analise Stripe.

Analise Zod.

Analise mysql2.

Analise Recharts.

Analise React Hook Form.

Analise Puck.

Analise Monaco.

Analise Sonner.

Analise Lucide.

Analise todas as demais dependências.

Não faça simplesmente:

pnpm update --latest
e considere o trabalho concluído.

Cada mudança major deve ser analisada em relação às breaking changes oficiais.

10. NODE.JS

Avalie a versão LTS recomendada em outubro de 2026.

Não utilize uma versão EOL.

Para ambiente de produção, estabilidade e segurança são mais importantes do que utilizar uma versão Current somente por ser numericamente maior.

Crie ou atualize quando apropriado:

.nvmrc
.node-version
e o campo:

"engines"
do package.json.

O ambiente precisa ser reproduzível.

11. NORMALIZAÇÃO DO PACKAGE MANAGER

Determine qual package manager é oficialmente utilizado pelo projeto.

A evidência atual aponta para pnpm.

Se a análise confirmar isso:

padronize todo o projeto em pnpm;
adicione ao package.json um packageManager explícito;
fixe uma versão estável apropriada do pnpm;
utilize Corepack de maneira reprodutível;
elimine lockfiles concorrentes SOMENTE após comprovar que não são necessários.
Investigue:

pnpm-lock.yaml
package-lock.json
bun.lock
Não mantenha três fontes diferentes de resolução de dependências.

Se npm e Bun não forem necessários, remova seus lockfiles.

Se bun estiver listado como dependency mas não for realmente utilizado em runtime pelo projeto, remova-o.

Antes de remover qualquer dependency:

rg
ou ferramenta equivalente deve ser utilizada para procurar:

imports;
requires;
dynamic imports;
scripts;
loaders;
configs;
documentação;
uso indireto relevante.
Não remova nada apenas porque uma ferramenta automática afirmou estar unused.

12. AUDITORIA COMPLETA DAS DEPENDÊNCIAS

Crie uma matriz interna contendo para cada dependência:

nome
versão declarada
versão instalada
última versão estável
tipo
onde é utilizada
breaking changes
compatibilidade
ação
Classifique cada uma como:

MANTER
ATUALIZAR
SUBSTITUIR
REMOVER
Remova dependências efetivamente não utilizadas.

Atualize dependências para as versões estáveis mais recentes compatíveis.

Quando houver mudança major:

leia o migration guide;
modifique o código necessário;
ajuste configuração;
execute testes;
execute build;
teste runtime.
Não faça downgrade de outra biblioteca apenas para esconder conflito sem investigar a causa raiz.

13. ATUALIZAÇÃO DO NEXT.JS

A versão atual do projeto precisa ser comparada com o Active LTS disponível em outubro de 2026.

Migre para a versão recomendada mais atual e segura, corrigindo TODOS os breaking changes necessários.

Investigue especialmente:

App Router;
Server Components;
Client Components;
Route Handlers;
middleware/proxy;
caching;
dynamic rendering;
async APIs;
next.config.ts;
image handling;
webpack/Turbopack;
React Server Components;
Sentry;
cookies;
headers;
redirects;
metadata;
build;
standalone/runtime.
Não mantenha versão vulnerável apenas porque o upgrade exige alterações.

14. REACT

Atualize React e React DOM para a versão estável mais atual compatível com o Next.js escolhido.

Revise:

APIs depreciadas;
Strict Mode;
effects;
transitions;
hydration;
Server Components;
Context;
refs;
rendering concorrente;
novas APIs estáveis existentes em 2026.
Não introduza APIs experimentais desnecessárias.

15. TAILWIND CSS

O projeto utiliza Tailwind 3.x.

Investigue e execute, se tecnicamente adequado, a migração completa para o Tailwind CSS estável atual de 2026.

Não simplesmente altere o número da versão.

Revise:

configuração;
PostCSS;
plugins;
typography;
animate;
design tokens;
classes obsoletas;
custom utilities;
dark/light mode;
componentes;
compatibilidade com shadcn;
build;
CSS final;
tree shaking/content detection;
responsividade.
Após migrar, teste visualmente as páginas.

16. MYSQL: MIGRAÇÃO OBRIGATORIAMENTE CONTROLADA

O projeto utiliza atualmente MySQL 8.0.x.

Não atualize a imagem Docker cegamente.

Pesquise as versões LTS atuais do MySQL em 2026 e a rota oficial de upgrade.

O projeto atual utiliza uma configuração baseada em:

mysql_native_password
Isso precisa ser eliminado ou modernizado.

Migre preferencialmente para autenticação moderna:

caching_sha2_password
quando compatível.

Revise:

compose.yaml
scripts/mysql-migrate.mjs
src/lib/mysql/
src/integrations/mysql/
mysql/migrations/
run.py
run.sh
run_windows.py
Elimine opções removidas/depreciadas.

Nunca altere apenas a tag Docker.

17. MIGRAÇÕES DO BANCO

Valide TODAS as migrations existentes.

Confirme:

ordenação;
idempotência;
checksum;
schema;
PKs;
FKs;
índices;
constraints;
tipos;
timestamps;
collations;
charset;
valores default;
tabelas administrativas;
tabelas de usuários;
planos;
billing;
perfil;
dados de saúde;
demais tabelas.
Teste:

banco vazio -> migrations -> aplicação
e também:

banco existente -> upgrade -> aplicação
Nunca simplesmente apague um volume para fazer migration funcionar.

18. BACKUP E RESTORE

Implemente ou corrija o mecanismo real de backup antes de operações destrutivas sobre banco local existente.

Valide restore.

Um backup somente pode ser chamado de funcional depois que um restore real tiver sido testado.

19. COMPOSE.YAML

Audite profundamente o compose.yaml.

Remova:

credenciais hardcoded;
passwords hardcoded em healthcheck;
opções MySQL removidas;
versões obsoletas;
configurações inseguras.
Faça o Compose consumir corretamente as variáveis do ambiente.

O healthcheck deve continuar REALMENTE funcional.

Teste:

docker compose config
docker compose up -d
docker compose ps
docker compose logs
Aguarde estado saudável REAL.

20. SEGREDOS E HARDcodes

Faça auditoria em TODO o repositório procurando:

password
secret
token
apikey
api_key
Authorization
Bearer
MYSQL_PASSWORD
MYSQL_ROOT_PASSWORD
AUTH_SECRET
STRIPE
GEMINI
SENTRY
admin123
Não exponha segredos reais nos commits.

Não deixe credenciais reais versionadas.

Valores sensíveis deverão vir de variáveis de ambiente.

Crie ou atualize .env.example apenas com documentação segura.

.env.local nunca deverá ser commitado.

Segredos de desenvolvimento devem ser gerados corretamente quando possível.

21. RUN.PY: WSL2 UBUNTU

O run.py deverá ser considerado o orquestrador oficial para:

WSL2 Ubuntu
Ele precisa funcionar REALMENTE.

Não basta corrigir sintaxe.

Teste dentro de WSL2/Ubuntu ou ambiente Linux equivalente quando disponível.

O script deverá validar:

plataforma;
versão do Ubuntu;
Python;
Node;
pnpm;
Corepack;
Docker;
Docker Compose;
daemon;
portas;
.env.local;
dependências;
MySQL;
migrations;
aplicação;
health check;
shutdown.
22. PROBLEMA ESPECÍFICO DO RUN.PY: PYTHON/RICH

O run.py atualmente depende de Rich e possui lógica de instalação dinâmica.

Isso deve ser auditado.

Evite modificar o Python do sistema utilizando soluções perigosas como instalação global indiscriminada ou --break-system-packages como fluxo normal.

Utilize uma estratégia reproduzível.

Exemplo aceitável:

ambiente virtual próprio do launcher
+
manifesto explícito de dependências Python
+
bootstrap seguro
Pode utilizar:

requirements-run.txt
ou pyproject.toml, conforme a solução arquitetural mais adequada.

O importante é que as dependências Python estejam declaradas e reproduzíveis.

23. SEGURANÇA DO RUN.PY

O run.py atualmente possui operações potencialmente destrutivas relacionadas ao MySQL nativo.

Nenhuma operação destrutiva deve ocorrer silenciosamente.

Ações como:

apt purge
rm -rf
remoção de MySQL
remoção de MariaDB
remoção de diretórios do sistema
remoção de usuário/grupo
NÃO podem fazer parte de um fluxo automático normal apenas porque uma porta está ocupada.

Refatore para separar:

doctor
fix seguro
repair
purge explícito
Operações destrutivas precisam ser opt-in explícitas.

Nunca destrua banco local de outra aplicação.

Nunca destrua dados apenas para liberar porta.

24. RUN.SH: WINDOWS 11

O run.sh deverá funcionar de forma real no:

Windows 11
Como arquivo Bash, o ambiente suportado deve ser claramente definido.

A opção principal esperada é:

Git Bash / ambiente Bash compatível no Windows 11
Não afirme que .sh é executável nativamente por CMD/PowerShell sem camada Bash.

Detecte corretamente:

MINGW
MSYS
CYGWIN
e demais ambientes suportados.

Teste de verdade.

25. RUN_WINDOWS.PY

O repositório também contém:

run_windows.py
Analise profundamente por que ele existe.

Há sobreposição entre:

run.sh
run_windows.py
Não deixe dois launchers Windows divergentes com comportamentos incompatíveis.

Escolha uma arquitetura clara.

Possibilidades:

A. run.sh = Windows Git Bash principal e run_windows.py = alternativa PowerShell/CMD;

ou

B. unificar responsabilidades e tornar um wrapper do outro;

ou

C. remover o redundante SOMENTE se comprovadamente desnecessário.

A decisão deve ser técnica e documentada.

26. PARIDADE ENTRE RUN.PY E RUN.SH

Os dois orquestradores devem possuir comportamento funcional equivalente nos respectivos ambientes.

Crie uma matriz de paridade para:

up
app
db
migrate
doctor
fix
status
stop
logs
help
Quando aplicável.

Não deixe uma plataforma com funcionalidades importantes ausentes.

27. PORTAS

Portas devem ser descobertas e validadas corretamente.

Nunca mate processos de terceiros indiscriminadamente.

Identifique:

PID;
processo;
proprietário;
origem.
Se a porta padrão estiver ocupada por outro software, utilize outra porta disponível e atualize coerentemente:

APP_BASE_URL
NEXT_PUBLIC_APP_URL
PORT
MYSQL_HOST_PORT
MYSQL_PORT
Não deixe frontend, backend ou database usando portas diferentes daquelas efetivamente escolhidas.

28. .ENV.LOCAL

Centralize a configuração.

Evite divergências entre:

run.py
run.sh
run_windows.py
compose.yaml
README.md
Não mantenha diferentes passwords, portas ou usuários como hardcodes independentes.

Crie uma fonte clara de verdade.

29. INSTALAÇÃO COMPLETAMENTE LIMPA

Faça um teste em ambiente limpo.

Remova somente artefatos recriáveis do projeto, quando seguro:

node_modules
.next
artefatos temporários
Depois execute o processo oficial do zero.

O objetivo é comprovar que um novo desenvolvedor consegue:

clonar;
instalar;
configurar;
subir banco;
migrar;
iniciar aplicação.
Sem intervenção secreta.

30. BUILD DE PRODUÇÃO

Não valide apenas pnpm dev.

Execute:

pnpm build
pnpm start
Teste a aplicação no modo de produção.

Erros que aparecem somente no production build também devem ser corrigidos.

31. QUALITY GATES

Antes de considerar QUALQUER tarefa concluída, execute todos os quality gates aplicáveis:

pnpm fix:format
pnpm fix:lint
pnpm check:lint
pnpm check:format
pnpm check:types
pnpm test
pnpm build
Se qualquer comando falhar:

NÃO faça commit.

Investigue.

Corrija.

Execute novamente.

Somente continue depois que os gates estiverem verdes.

32. TESTES AUTOMATIZADOS

Revise a suíte Vitest existente.

Não apenas execute testes.

Identifique áreas críticas sem cobertura adequada.

Adicione testes reais quando necessário para alterações em:

autenticação;
autorização;
usuários;
admin;
banco;
plans;
billing;
migrations;
motores de saúde;
IA;
APIs;
launcher;
configuração.
Não escreva testes falsos que apenas confirmem mocks triviais.

33. QA DE APIs

Descubra TODAS as Route Handlers/API Routes existentes.

Mapeie:

método
rota
autenticação
autorização
input
output
erros
database
Teste:

GET
POST
PUT
PATCH
DELETE
onde existirem.

Valide:

sucesso;
validação;
erro;
usuário não autenticado;
usuário sem permissão;
recursos inexistentes;
payload inválido.
Não assuma funcionamento apenas porque TypeScript compilou.

34. VALIDAÇÃO CRUD COMPLETA

Faça auditoria e QA do CRUD real de todas as entidades relevantes.

Para cada CRUD aplicável:

CREATE;
READ;
UPDATE;
DELETE;
LIST;
SEARCH;
FILTER;
PAGINATION;
validação;
persistência no MySQL;
autorização;
retorno na UI.
Após alterar dados, confirme diretamente no banco quando apropriado.

35. QA COM NAVEGADOR

Suba a aplicação REAL no sandbox.

Utilize navegador automatizado ou Playwright, caso disponível.

Navegue como usuário.

Não se limite à home.

Percorra TODAS as páginas e menus relevantes.

Inclua:

landing;
login;
cadastro, se disponível;
onboarding;
dashboard;
perfil;
plano;
metas;
chat;
dispositivos;
páginas de saúde;
billing;
configurações;
drop-downs;
menus;
sidebar;
área administrativa;
editor Puck;
Site Experience Builder;
demais páginas descobertas.
Clique efetivamente em:

links;
botões;
tabs;
selects;
dialogs;
dropdowns;
toggles;
forms;
paginações;
cards interativos.
36. VALIDAÇÃO VISUAL

Teste:

desktop
tablet
mobile
Use múltiplos viewports.

Verifique:

overflow;
elementos cortados;
texto truncado;
cards quebrados;
tabelas;
charts;
modais;
sidebars;
menus;
responsividade;
scroll;
z-index;
contrastes;
foco;
estados hover/focus/active;
feedback de loading;
estados vazios;
erros.
Não altere identidade visual sem necessidade.

Quando precisar melhorar algo visual, utilize padrões PREMIUM atuais de outubro de 2026.

37. ACESSIBILIDADE

Valide pelo menos:

HTML semântico;
labels;
forms;
keyboard navigation;
focus visible;
ARIA somente quando necessário;
contraste;
modais;
menus;
landmarks;
headings;
alt texts.
Evite divs clicáveis quando um botão ou link for semanticamente correto.

38. PERFORMANCE

Faça uma auditoria real de performance.

Investigue:

bundle;
imports;
dependências pesadas;
Server/Client Component boundaries;
re-renders;
imagens;
fontes;
lazy loading;
dynamic imports;
queries SQL;
conexões;
caching;
waterfalls;
chamadas duplicadas;
assets.
Não faça micro-otimizações irrelevantes.

Priorize gargalos mensuráveis.

39. SEGURANÇA

Realize auditoria de segurança do código.

Verifique:

autenticação;
autorização;
sessões;
cookies;
CSRF;
XSS;
SQL injection;
SSRF;
open redirect;
rate limiting;
secrets;
headers;
upload;
validação Zod;
endpoints administrativos;
IDOR;
Stripe webhooks;
assinatura dos webhooks;
permissões;
dados sensíveis;
logging de informações pessoais.
Corrija vulnerabilidades reais encontradas.

40. DADOS DE SAÚDE

Como o Lyra MetaCare manipula informações relacionadas à saúde, trate esses dados como sensíveis.

Verifique:

exposição em logs;
exposição em erros;
armazenamento;
acesso indevido;
APIs;
administração;
autorização;
cache;
analytics;
Sentry;
integrações externas.
Não envie dados sensíveis para serviços externos desnecessariamente.

41. STRIPE

Audite:

checkout;
customer portal;
webhooks;
planos;
entitlement;
roles;
erros;
idempotência;
assinatura de webhooks;
test mode.
Nunca invente secret keys.

Se uma credencial externa verdadeira não estiver disponível no ambiente, não simule uma transação externa e não declare que ela foi executada.

Valide tudo que puder ser validado localmente e marque explicitamente a fronteira externa que requer credencial real.

42. SENTRY

Garanta que Sentry:

não quebre build sem DSN;
seja opcional quando apropriado;
não exponha segredos;
respeite ambientes;
não capture informações de saúde desnecessárias;
esteja compatível com a versão escolhida do Next.js.
43. CÓDIGO MORTO

Procure:

arquivos não utilizados;
componentes mortos;
imports mortos;
funções não utilizadas;
configs antigas;
scripts abandonados;
dependências mortas;
arquivos temporários;
código duplicado.
Remova somente com evidência.

Nunca remova algo por intuição.

44. LOGS E OBSERVABILIDADE

Logs devem ser úteis e honestos.

Os launchers devem mostrar:

etapa atual;
comando;
resultado;
causa provável do erro;
localização do log;
exit code.
Não esconda stderr.

Não apresente [OK] antes de realmente verificar sucesso.

45. PROCESSOS E SHUTDOWN

Teste encerramento da aplicação.

Verifique:

PID;
sinais;
processos filhos;
portas liberadas;
Docker;
terminal;
arquivos de estado.
Não deixe processos zumbis.

46. HEALTH CHECK REAL

Depois de iniciar a plataforma, valide pelo menos:

processo Next.js ativo
porta respondendo
HTTP respondendo
MySQL saudável
migration concluída
conexão da aplicação com MySQL
página principal renderizada
login funcional
Se possível, implemente/valide um endpoint apropriado de health/readiness sem expor segredos.

47. DOCUMENTAÇÃO

Depois que a implementação REAL estiver concluída, atualize a documentação para corresponder ao sistema real.

Atualize especialmente:

README.md
AGENTS.md
.env.example
documentação de instalação
dependências
Node
pnpm
Docker
MySQL
run.py
run.sh
run_windows.py
Nunca documente algo que não foi testado.

48. NÃO DEIXAR DOCUMENTAÇÃO DESATUALIZADA

Se o projeto for migrado de:

Next 15 -> Next 16
Tailwind 3 -> Tailwind 4
MySQL 8.0 -> outra LTS
Node antigo -> Node LTS atual
a documentação inteira deve refletir isso.

Pesquise textos antigos no repositório.

49. TAREFAS DEVEM SER ATÔMICAS

ESTE ITEM É EXTREMAMENTE IMPORTANTE.

Você NÃO deverá acumular várias tarefas e fazer um único commit no final.

Cada tarefa lógica precisa ser:

ANALISADA
IMPLEMENTADA
TESTADA
VALIDADA
COMMITADA
PUSHADA
ANTES de iniciar a próxima tarefa.

50. COMMIT E PUSH IMEDIATO APÓS CADA TAREFA

Fluxo obrigatório:

TAREFA 1
↓
implementar
↓
testar
↓
quality gates
↓
git diff
↓
git status
↓
commit
↓
push origin main
↓
confirmar push
↓
SOMENTE ENTÃO iniciar TAREFA 2
Não faça:

Tarefa 1
Tarefa 2
Tarefa 3
Tarefa 4
commit geral
Isso é proibido.

51. GIT

Antes de cada commit:

git diff
git status
Revise tudo que será commitado.

Não utilize:

git add .
cegamente.

Adicione somente arquivos pertencentes à tarefa atual.

Use mensagens de commit claras, por exemplo:

fix(runtime): corrige bootstrap WSL2
chore(deps): atualiza stack Next.js e React
fix(database): moderniza autenticação MySQL
fix(windows): estabiliza launcher no Git Bash
test(api): adiciona cobertura CRUD administrativa
52. PUSH

Após cada commit:

git push origin main
Confirme que o push terminou com sucesso.

Se o remote tiver avançado:

git fetch origin
analise as alterações.

Integre-as corretamente.

Nunca use force push.

Nunca sobrescreva trabalho de terceiros.

53. ORDEM RECOMENDADA DAS TAREFAS ATÔMICAS

Execute preferencialmente nesta ordem:

TAREFA 1

Auditoria baseline e correção dos erros atualmente existentes.

TAREFA 2

Normalização do package manager e lockfiles.

TAREFA 3

Remoção comprovada de dependências não utilizadas.

TAREFA 4

Upgrade controlado das dependências.

TAREFA 5

Migração Next.js.

TAREFA 6

Migração React.

TAREFA 7

Migração Tailwind/shadcn/UI dependencies.

TAREFA 8

Modernização Node/pnpm/toolchain.

TAREFA 9

Modernização MySQL e autenticação.

TAREFA 10

Compose, env e secrets.

TAREFA 11

Correção e modernização completa do run.py.

TAREFA 12

Correção e modernização completa do run.sh.

TAREFA 13

Revisão do run_windows.py e eliminação de redundância.

TAREFA 14

Migrations e banco.

TAREFA 15

Testes automatizados.

TAREFA 16

APIs e CRUD.

TAREFA 17

Segurança.

TAREFA 18

Performance.

TAREFA 19

QA funcional com navegador.

TAREFA 20

QA responsivo e acessibilidade.

TAREFA 21

Documentação final.

Cada tarefa concluída deve gerar seu próprio commit e push para main.

54. CRITÉRIOS MÍNIMOS PARA CONSIDERAR RUN.PY APROVADO

O run.py NÃO está aprovado até demonstrar de forma real:

python3 run.py
e seus comandos suportados.

Precisa:

iniciar;
detectar ambiente;
instalar/preparar somente o necessário de forma segura;
preparar dependências;
subir banco;
esperar healthcheck;
executar migrations;
iniciar Next.js;
identificar URL;
acessar aplicação;
apresentar status;
mostrar logs;
parar aplicação;
parar banco quando solicitado.
ZERO traceback não tratado.

ZERO erro oculto.

55. CRITÉRIOS MÍNIMOS PARA CONSIDERAR RUN.SH APROVADO

No Windows 11 com Git Bash ou ambiente definido como suportado:

./run.sh doctor
./run.sh up
./run.sh status
./run.sh logs
./run.sh stop
devem funcionar.

Teste também execução interativa:

./run.sh
A TUI precisa funcionar sem corromper o terminal.

Se não houver TTY, precisa degradar corretamente para logs convencionais.

56. IDEMPOTÊNCIA

Execute o fluxo de startup MAIS DE UMA VEZ.

Segunda execução não deve:

recriar recursos incorretamente;
corromper banco;
duplicar migrations;
recriar admin indevidamente;
mudar secrets;
quebrar portas;
duplicar processos.
57. TESTE DE RESTART

Teste:

up
stop
up
e também reinicialização com banco já existente.

58. TESTE DE FALHAS

Teste situações reais controladas:

Docker desligado;
porta ocupada;
.env.local ausente;
banco parado;
dependencies ausentes;
node_modules ausente;
build quebrado;
migration com problema controlado;
aplicativo já em execução.
O sistema deve fornecer diagnóstico útil.

Não deve destruir o ambiente para se recuperar.

59. CRITÉRIO ZERO WARNINGS RELEVANTES

Warnings legítimos de ferramentas externas podem existir.

Porém, warnings relacionados a:

deprecation;
peer dependency;
segurança;
configuração;
build;
runtime;
framework;
banco;
devem ser investigados.

Não ignore warnings apenas porque o exit code é zero.

60. MAIS REQUISITOS ADICIONAIS OBRIGATÓRIOS

Além das tarefas originalmente solicitadas, execute também:

auditoria de segurança de dependências;
auditoria de secrets;
auditoria de código morto;
validação das migrations;
teste de backup e restore;
normalização completa do package manager;
criação de runtime reproduzível;
verificação de versões EOL;
testes de instalação limpa;
testes de produção;
QA de APIs;
QA CRUD;
QA com navegador;
QA mobile/tablet/desktop;
auditoria de acessibilidade;
auditoria de performance;
validação de logs;
validação de shutdown;
teste de idempotência;
teste de restart;
teste de falhas;
atualização integral da documentação;
validação de segurança de dados de saúde;
validação Stripe;
validação Sentry;
verificação de inconsistências entre README e código;
eliminação de configurações obsoletas;
verificação dos arquivos .gitignore;
busca por arquivos sensíveis indevidamente versionados;
revisão final do diff completo.
61. PROIBIDO ALTERAR FUNCIONALIDADE PARA FACILITAR UPGRADE

Se uma dependência nova quebrar código existente, adapte o código para a nova API.

Não simplesmente remova a funcionalidade.

Exemplo proibido:

biblioteca X quebrou -> remover botão/feature
O correto é:

biblioteca X mudou API
↓
consultar documentação
↓
migrar implementação
↓
testar
62. SUBSTITUIÇÃO DE DEPENDÊNCIAS ABANDONADAS

Se encontrar pacote:

abandonado;
vulnerável;
incompatível;
sem suporte ao React/Next atuais;
pesquise alternativa moderna mantida em 2026.

A substituição precisa manter ou melhorar a funcionalidade existente.

63. NÃO CONFUNDIR “MAIS NOVO” COM “MELHOR”

Sempre utilizar o melhor software estável para outubro de 2026.

Para infraestrutura, versões LTS podem ser melhores que Current.

Justifique decisões com:

estabilidade;
suporte;
segurança;
compatibilidade;
performance;
manutenção futura.
64. INTERFACE E UX

Caso uma correção exija alterar componentes visuais:

preservar a identidade Lyra;
melhorar responsividade;
melhorar acessibilidade;
utilizar padrões premium atuais de 2026;
manter consistência;
evitar visual genérico;
evitar componentes quebrados;
evitar regressão visual.
Priorize tema claro conforme as regras existentes do projeto quando aplicável.

65. NADA DE “FUNCIONA NA MINHA MÁQUINA”

A solução deverá possuir instalação reproduzível.

O estado esperado precisa ser derivado de arquivos versionados:

package.json
lockfile
compose.yaml
configuração
migrations
scripts
documentação
e não de pacotes misteriosamente instalados globalmente.

66. NÃO DEPENDER DE PACOTE GLOBAL DESNECESSÁRIO

Se for possível utilizar Corepack e dependências locais, prefira isso.

Evite exigir:

npm install -g ...
pip install global ...
sem necessidade técnica.

67. CAUSA RAIZ

Para cada erro relevante:

reproduza;
capture o erro verdadeiro;
investigue;
localize a causa;
corrija a causa;
execute novamente;
comprove a correção.
Não coloque try/catch vazio apenas para esconder exceção.

68. EVIDÊNCIA

Ao longo da execução, apresente evidências verdadeiras.

Exemplos:

comando executado
exit code
teste aprovado
build aprovado
healthcheck aprovado
endpoint testado
página navegada
CRUD executado
commit SHA
push concluído
Não invente evidências.

69. CONTINUE AUTOMATICAMENTE

Não pare após encontrar o primeiro problema.

Corrija.

Teste.

Continue.

Não solicite aprovação entre as tarefas normais.

Só interrompa se existir um bloqueio externo REAL que não possa tecnicamente ser resolvido dentro do ambiente, por exemplo:

autenticação Git inexistente impossibilitando push;
segredo de serviço externo obrigatório não fornecido;
indisponibilidade total de serviço externo;
limitação física do sandbox.
Mesmo nesses casos:

conclua tudo que não depende do bloqueio;
mostre a evidência real;
não simule a etapa bloqueada.
70. NÃO FINALIZAR PREMATURAMENTE

Não finalize enquanto ainda houver:

build quebrado;
teste falhando;
erro de tipos;
erro de lint;
dependência quebrada;
launcher quebrado;
migration quebrada;
Docker quebrado;
MySQL quebrado;
API crítica quebrada;
CRUD crítico quebrado;
documentação contraditória;
erro crítico de console;
regressão causada por você.
71. VALIDAÇÃO FINAL COMPLETA

No final de TODA a execução, realize uma última validação integral.

Execute novamente:

pnpm install --frozen-lockfile
pnpm check:lint
pnpm check:format
pnpm check:types
pnpm test
pnpm build
Valide Docker:

docker compose config
docker compose up -d
docker compose ps
Valide migrations.

Valide aplicação.

Valide páginas.

Valide APIs.

Valide CRUD.

Valide autenticação.

Valide admin.

Valide shutdown.

Valide restart.

72. TESTE FINAL DOS LAUNCHERS

Valide novamente:

WSL2 Ubuntu

python3 run.py
e seus comandos CLI disponíveis.

Windows 11 / Git Bash

./run.sh
./run.sh doctor
./run.sh up
./run.sh status
./run.sh stop
Se run_windows.py permanecer no projeto, valide-o também.

73. REVISÃO GIT FINAL

No final:

git status
git log --oneline --decorate -20
Confirme que:

não existem arquivos alterados esquecidos;
não existem arquivos temporários indevidos;
não existem segredos;
não existem alterações não commitadas;
todos os commits foram enviados para origin/main.
74. RELATÓRIO FINAL OBRIGATÓRIO

Somente depois de tudo terminado, apresente relatório final contendo:

A. AMBIENTE

Node;
pnpm;
Python;
Docker;
Docker Compose;
MySQL;
Next.js;
React;
Tailwind;
TypeScript.
B. DEPENDÊNCIAS

atualizadas;
removidas;
substituídas;
conflitos solucionados.
C. ERROS ENCONTRADOS

Para cada erro importante:

erro
causa raiz
correção
evidência
D. RUN.PY

Informar exatamente o que foi validado no WSL2.

E. RUN.SH

Informar exatamente o que foi validado no Windows 11/Git Bash.

F. MYSQL

Informar versão final, autenticação e migrations.

G. TESTES

Resultado real de:

lint
format
types
tests
build
runtime
CRUD
browser QA
H. SEGURANÇA

Relatar vulnerabilidades encontradas e resolvidas.

I. COMMITS

Tabela:

SHA | tarefa | status do push
J. PENDÊNCIAS

Deve ser:

Nenhuma pendência técnica conhecida.
Somente escreva isso se for verdade.

Caso haja bloqueio externo impossível de resolver no sandbox, descreva exatamente qual é e apresente evidência.

75. DEFINIÇÃO DE “CONCLUÍDO”

Esta tarefa somente poderá ser considerada concluída quando:

repositório clonado;
regras lidas;
plataforma executada;
erros investigados;
causas raiz corrigidas;
dependências auditadas;
dependências desnecessárias removidas;
dependências atualizadas;
conflitos solucionados;
package manager normalizado;
MySQL modernizado;
migrations validadas;
run.py funcionando no WSL2 Ubuntu;
run.sh funcionando no Windows 11/Git Bash;
eventual run_windows.py corretamente tratado;
aplicação iniciando;
banco iniciando;
build funcionando;
testes funcionando;
lint funcionando;
TypeScript funcionando;
APIs validadas;
CRUD validado;
navegação validada;
responsividade validada;
segurança auditada;
documentação atualizada;
commits feitos tarefa a tarefa;
todos os commits enviados para main;
Git limpo ao final.
76. REGRA FINAL

NÃO ME ENTREGUE UM PLANO PARA EU EXECUTAR.

VOCÊ deverá executar o trabalho.

Não responda apenas dizendo o que deveria ser feito.

Faça.

Investigue.

Implemente.

Execute.

Teste.

Corrija.

Repita.

Valide.

Faça commit.

Faça push.

Continue para a próxima tarefa.

O objetivo final é transformar o repositório ilyra-ai/Lyra-MetaCare em uma plataforma tecnicamente consistente, atualizada para o ecossistema estável de outubro de 2026, segura, reproduzível e executável de ponta a ponta, sem simulações, sem placeholders, sem hardcodes indevidos, sem código cortado e sem erros escondidos.
