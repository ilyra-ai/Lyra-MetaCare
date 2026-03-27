# Manual Completo do Módulo Lyra Customaze UI UX

## 1. Apresentação

Este manual foi escrito para ensinar, com o maior nível possível de detalhe, como instalar, configurar, operar, publicar e manter o módulo **Lyra Customaze UI UX**.

O objetivo deste documento é permitir que até uma pessoa muito leiga consiga:

- entender o que é o módulo;
- saber onde ele fica dentro do projeto;
- instalar o módulo em um projeto compatível;
- configurar o ambiente corretamente;
- acessar a interface administrativa;
- editar superfícies visuais reais;
- salvar rascunhos;
- publicar alterações;
- restaurar versões;
- entender onde os dados ficam salvos;
- identificar erros comuns e corrigi-los com segurança.

Este manual foi produzido com base no estado real do código do projeto **Lyra MetaCare** em março de 2026.

---

## 2. O que é o Lyra Customaze UI UX

O **Lyra Customaze UI UX** é um módulo administrativo de customização visual para aplicações web em **Next.js + React + TypeScript**, inspirado nas capacidades auditadas do ecossistema Elementor, porém adaptado para a arquitetura real da Lyra, sem depender de WordPress.

Em termos simples, ele funciona como uma base para que administradores possam:

- editar experiências visuais do site e do app;
- controlar textos, blocos e estruturas publicáveis;
- manter rascunho e versão publicada separadamente;
- publicar conteúdo real;
- restaurar padrões;
- restaurar o que já foi publicado;
- trabalhar com preview administrativo;
- persistir tudo em banco de dados real.

Hoje, ele já possui uma base funcional concreta para:

- **landing page**;
- **login**;
- **app interno**;
- **sidebar**;
- **header**;
- módulos internos como:
  - dashboard;
  - agendamentos;
  - monitoramento;
  - chat;
  - conexão de dispositivos;
  - perfil;
  - e a expansão contínua do plano de IA.

---

## 3. O que o módulo faz hoje de forma real

No estado atual do projeto, o módulo já entrega estas capacidades reais:

### 3.1. Estrutura de configuração validada

Cada página ou superfície editável possui:

- schema validado;
- defaults seguros;
- parsing de dados;
- normalização;
- armazenamento em JSON persistido em MySQL;
- leitura pública separada da leitura administrativa.

### 3.2. Fluxo administrativo real

Existe uma rota administrativa real:

- `/admin/page-builder`

Nessa rota, administradores conseguem:

- escolher qual superfície desejam editar;
- editar por formulário guiado;
- editar por JSON completo;
- salvar rascunho;
- publicar;
- restaurar defaults;
- restaurar o publicado;
- ver preview administrativo do que está sendo montado.

### 3.3. Persistência real

As alterações não são simuladas.

Elas são persistidas na tabela:

- `site_page_configs`

com separação entre:

- `draft_config`
- `published_config`

Isso significa que o administrador pode trabalhar com segurança sem publicar tudo imediatamente.

### 3.4. Leitura pública real

As páginas do front podem consumir a configuração publicada por meio do endpoint público:

- `/api/public/page-config/[pageKey]`

Ou seja, a interface pública pode reagir às configurações sem depender de mock, placeholder ou preview falso.

### 3.5. Leitura administrativa real

O painel administrativo usa o endpoint:

- `/api/admin/page-config/[pageKey]`

e nele o sistema:

- lê rascunho;
- lê publicado;
- salva rascunho;
- publica;
- restaura estados.

### 3.6. Escala de UI

O módulo possui utilitários reais de escala, como:

- `scaleRem`
- `scalePx`
- `scaleNumber`

Esses utilitários ajudam a suportar customização proporcional de elementos visuais.

---

## 4. O que o módulo ainda não faz por completo

É importante ser absolutamente honesto.

O módulo **ainda está em evolução** e não deve ser descrito como algo finalizado no mesmo nível do Elementor inteiro.

Hoje ele **não entrega ainda, de forma integral**, tudo isto:

- arrastar e soltar visual completo em todas as superfícies;
- engine genérica universal de blocos com reordenação livre de qualquer componente do app;
- theme builder 100% desacoplado para qualquer app sem adaptação;
- sistema completo de revisões com time-travel visual em banco;
- dynamic loops genéricos para qualquer tipo de conteúdo;
- custom CSS avançado por superfície com painel completo;
- instalação universal pronta para qualquer stack fora da compatibilidade declarada.

O que existe hoje é uma **base real, séria e reutilizável**, já funcionando no ecossistema da Lyra, e preparada para expansão.

---

## 5. Nome oficial do módulo

O nome correto do módulo é:

- **Lyra Customaze UI UX**

Identificador técnico:

- `lyra-customaze-ui-ux`

Tipo do módulo:

- `admin-visual-builder`

Idioma do módulo:

- `pt-BR`

---

## 6. Compatibilidade real desta versão

No estado atual, o instalador oficial foi desenhado para projetos compatíveis com:

- **Next.js App Router**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **MySQL**

O manifest do módulo declara como alvo:

- `nextjs-app-router`
- `react-19`
- `typescript-5`
- `tailwind-css`
- `mysql`

Projeto suportado oficialmente pelo instalador atual:

- `nextjs-app-router-typescript`

---

## 7. Estrutura de arquivos do módulo

Na prática, o módulo fica em:

- `modules/lyra-customaze-ui-ux`

Estrutura principal:

- `modules/lyra-customaze-ui-ux/module.manifest.json`
- `modules/lyra-customaze-ui-ux/README.md`
- `modules/lyra-customaze-ui-ux/src/index.ts`
- `modules/lyra-customaze-ui-ux/src/contracts/integration.ts`
- `modules/lyra-customaze-ui-ux/src/site-page-config/schema.ts`
- `modules/lyra-customaze-ui-ux/src/site-page-config/registry.ts`
- `modules/lyra-customaze-ui-ux/src/site-page-config/runtime.ts`
- `modules/lyra-customaze-ui-ux/src/site-page-config/storage.ts`
- `modules/lyra-customaze-ui-ux/src/site-page-config/ui.ts`

### 7.1. Função de cada arquivo

#### `module.manifest.json`

É o documento declarativo do módulo.

Ele informa:

- id;
- nome;
- versão;
- tipo;
- linguagem;
- descrição;
- pontos de entrada;
- capacidades;
- projetos suportados;
- restrição administrativa.

#### `src/contracts/integration.ts`

Define o contrato de integração do módulo.

É onde estão descritos os tipos para:

- superfícies editáveis;
- zonas editáveis;
- escopo de edição;
- contrato do consumidor;
- ações do relatório de instalação;
- relatório da instalação.

#### `src/site-page-config/schema.ts`

É o coração do módulo.

Nele vivem:

- tipos das páginas;
- estruturas editáveis;
- validações;
- defaults;
- mapa de páginas;
- parsing e normalização.

#### `src/site-page-config/registry.ts`

Mapeia superfícies editáveis e labels.

É o arquivo que ajuda o admin builder a saber:

- quais páginas são editáveis;
- como cada uma é chamada;
- quais zonas existem;
- quais labels exibir.

#### `src/site-page-config/runtime.ts`

Possui funções utilitárias para escalar valores visuais de forma segura:

- `scaleRem`
- `scalePx`
- `scaleNumber`

#### `src/site-page-config/storage.ts`

Centraliza:

- normalização de dados vindos do banco;
- serialização;
- parse de JSON salvo;
- validação antes de gravar;
- criação de estrutura vazia quando ainda não há registro.

#### `src/site-page-config/ui.ts`

Mapeia:

- ícones disponíveis para o builder;
- tons visuais;
- classes utilitárias visuais.

---

## 8. O script oficial de instalação portável

Na raiz do projeto existe o instalador:

- `implement_elementor_lyra.py`

Mesmo com esse nome histórico, ele instala o módulo **Lyra Customaze UI UX**.

### 8.1. O que esse script faz

O script:

- valida se o projeto-alvo é compatível;
- detecta a raiz de código (`src` ou raiz direta);
- confere se existe:
  - `package.json`
  - `tsconfig.json`
  - `src/app` ou `app`
- sincroniza a pasta do módulo em:
  - `modules/lyra-customaze-ui-ux`
- cria ou atualiza reexports em:
  - `src/lib/site-page-config/schema.ts`
  - `src/lib/site-page-config/registry.ts`
  - `src/lib/site-page-config/ui.ts`
  - `src/lib/site-page-config/index.ts`
- registra um script em `package.json`:
  - `lyra-customaze:install`

### 8.2. O que ele não faz sozinho

Ele não faz sozinho, hoje:

- criação automática de todas as telas administrativas;
- criação automática de todas as rotas;
- adaptação mágica de qualquer app fora da arquitetura suportada;
- migrações universais para qualquer banco fora do modelo atual;
- drag-and-drop total instantâneo.

Ele instala a base do módulo e seus reexports, preparando o app para integração.

---

## 9. Onde o módulo é usado dentro da Lyra hoje

Na Lyra atual, a camada pública e administrativa já usa o módulo em diversos pontos.

Rotas e áreas importantes:

- `/admin/page-builder`
- `/login`
- `/`
- `/chat`
- `/connect`
- `/plan`

O consumo público acontece por hook:

- `src/hooks/use-public-site-page-config.ts`

Esse hook busca a configuração publicada da superfície desejada e aplica parsing seguro.

---

## 10. Como instalar o módulo no projeto atual da Lyra

Se você está no projeto **Lyra MetaCare**, o módulo já está presente. Mesmo assim, vou explicar o fluxo correto para entender e reproduzir com segurança.

### 10.1. Pré-requisitos

Você precisa ter instalado na máquina:

- Python
- Node.js
- pnpm ou npm
- Docker Desktop

### 10.2. Confirmar se os arquivos existem

Verifique se estes arquivos existem na raiz:

- `package.json`
- `implement_elementor_lyra.py`
- `run_windows.py`
- `compose.yaml`
- `scripts/mysql-migrate.mjs`
- `modules/lyra-customaze-ui-ux/module.manifest.json`

### 10.3. Instalar dependências do frontend/backend Node

No projeto atual, o fluxo normal é:

```bash
pnpm install
```

Se o projeto estiver usando npm:

```bash
npm install
```

### 10.4. Garantir que o script do módulo exista no package.json

Hoje, o `package.json` já contém:

```json
"lyra-customaze:install": "python implement_elementor_lyra.py"
```

Isso significa que você pode executar:

```bash
pnpm run lyra-customaze:install
```

ou:

```bash
npm run lyra-customaze:install
```

### 10.5. Subir o ambiente completo no Windows

No projeto atual existe um orquestrador real para Windows:

- `run_windows.py`

Ele foi criado para:

- preparar `.env.local`;
- instalar dependências quando necessário;
- subir o MySQL no Docker;
- rodar as migrações;
- subir o app.

Fluxo recomendado:

```bash
python run_windows.py dev
```

Esse comando faz:

1. garante variáveis padrão;
2. instala dependências se necessário;
3. sobe o MySQL via Docker Compose;
4. aplica as migrações reais;
5. sobe a aplicação em modo desenvolvimento.

### 10.6. URL padrão do app

No projeto atual, a URL padrão é:

- `http://localhost:3000`

Observação importante e real:

Neste ambiente, o fluxo da Lyra responde corretamente em `localhost`. Em alguns cenários, `127.0.0.1` pode não responder da mesma forma. Por isso, prefira documentar e testar usando:

- `http://localhost:3000`

---

## 11. Variáveis de ambiente importantes

No Windows, o `run_windows.py` garante valores padrão em `.env.local`.

Os principais são:

- `APP_BASE_URL=http://localhost:3000`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `MYSQL_HOST=127.0.0.1`
- `MYSQL_HOST_PORT=3307`
- `MYSQL_PORT=3307`
- `MYSQL_USER=lyra`
- `MYSQL_PASSWORD=lyra_mysql_local_2026`
- `MYSQL_ROOT_PASSWORD=lyra_mysql_root_2026`
- `MYSQL_DATABASE=lyra_metacare`

Usuários admin de bootstrap atualmente definidos:

- `admin@coragem.pet` com senha `admin123`
- `admin@admin.com` com senha `admin123`

Esses usuários são úteis para acesso administrativo real ao builder.

---

## 12. Como instalar o módulo em outro app compatível

Agora vamos imaginar que você quer levar o módulo para outro projeto compatível.

### 12.1. O que copiar

Você deve copiar para a raiz do projeto-alvo:

- a pasta `modules/lyra-customaze-ui-ux`
- o arquivo `implement_elementor_lyra.py`

### 12.2. Requisitos do projeto-alvo

O projeto-alvo precisa ter:

- `package.json`
- `tsconfig.json`
- diretório `src/app` ou `app`
- dependências de:
  - `next`
  - `react`
  - `typescript`

### 12.3. Comando de instalação

Entre na raiz do projeto-alvo e execute:

```bash
python implement_elementor_lyra.py
```

### 12.4. O que vai acontecer

O instalador:

1. lê o `package.json`;
2. valida se o projeto é compatível;
3. detecta se existe `src` ou se a app está na raiz;
4. sincroniza o módulo em `modules/lyra-customaze-ui-ux`;
5. cria ou atualiza os reexports em `lib/site-page-config`;
6. registra no `package.json` o script:
   - `lyra-customaze:install`

### 12.5. Como saber se deu certo

Ao final, o script imprime um relatório real com:

- módulo;
- versão;
- projeto suportado;
- raiz alvo;
- source root detectado;
- data e hora da instalação;
- ações executadas;
- avisos.

As ações podem aparecer como:

- `create`
- `update`
- `skip`
- `validate`

### 12.6. Backups automáticos

Quando o instalador precisa atualizar um arquivo existente, ele cria backup real com timestamp, usando padrão semelhante a:

- `arquivo.ts.bak.20260326153045`

Isso é importante porque protege o projeto-alvo contra sobrescrita cega.

---

## 13. Como acessar o construtor no app

Depois que o projeto estiver rodando e você tiver um usuário administrador válido, faça login e acesse:

- `http://localhost:3000/admin/page-builder`

Se o usuário não for administrador, o sistema mostrará **Acesso Negado**.

Isso é intencional.

O módulo é **admin-only**.

---

## 14. Como o construtor funciona por dentro

O construtor administrativo da Lyra trabalha com três ideias fundamentais:

### 14.1. Superfície editável

É a página ou área que você está editando.

Exemplos:

- landing
- login
- app

### 14.2. Rascunho

É a versão em edição.

Ela serve para:

- testar;
- revisar;
- preparar mudanças;
- mexer sem afetar imediatamente o público.

### 14.3. Publicado

É a versão que está realmente ativa para os usuários.

Quando o administrador publica, o conteúdo sai do rascunho e vira a versão pública.

---

## 15. O que existe na interface administrativa do builder

Na rota `/admin/page-builder`, o admin encontrará:

### 15.1. Seletor de superfície

Na parte superior existe a alternância entre superfícies.

Exemplo:

- Landing
- Login
- App interno

### 15.2. Botões operacionais principais

O builder oferece ações reais como:

- **Restaurar padrão**
- **Restaurar publicado**
- **Salvar rascunho**
- **Publicar agora**

### 15.3. Aba “Conteúdo guiado”

Nessa aba, o admin edita por campos visuais:

- inputs;
- textareas;
- toggles;
- sliders;
- selects;
- itens repetíveis;
- blocos organizados por seção.

### 15.4. Aba “JSON completo”

Nessa aba, o admin edita diretamente a estrutura inteira da configuração.

Esse modo é indicado para:

- usuários técnicos;
- auditorias;
- ajustes finos;
- importação manual;
- depuração.

### 15.5. Preview administrativo

O lado direito da tela mostra a experiência renderizada com base no rascunho atual.

Esse preview é útil para:

- revisar antes de publicar;
- comparar intenção e resultado;
- validar coerência visual.

---

## 16. Como usar o builder passo a passo

Agora vamos para o uso prático.

### 16.1. Passo 1: entrar com usuário administrador

Faça login usando um admin válido.

No projeto atual, exemplos reais:

- `admin@coragem.pet`
- `admin@admin.com`

Senha atual padrão:

- `admin123`

### 16.2. Passo 2: abrir o construtor

No navegador, acesse:

- `http://localhost:3000/admin/page-builder`

### 16.3. Passo 3: escolher a superfície

Selecione o que deseja editar:

- landing;
- login;
- app.

### 16.4. Passo 4: editar o conteúdo

Na aba **Conteúdo guiado**, altere:

- títulos;
- subtítulos;
- labels;
- botões;
- textos explicativos;
- itens de FAQ;
- destaques;
- blocos auxiliares;
- elementos de módulos internos.

### 16.5. Passo 5: salvar rascunho

Clique em:

- **Salvar rascunho**

Isso grava a alteração no banco sem publicá-la.

### 16.6. Passo 6: revisar o preview

Use o painel de preview para validar:

- clareza do texto;
- consistência visual;
- ordem do conteúdo;
- qualidade da comunicação.

### 16.7. Passo 7: publicar

Quando estiver tudo certo, clique em:

- **Publicar agora**

Essa ação move o rascunho para a versão publicada.

### 16.8. Passo 8: validar no front real

Depois da publicação, abra a tela pública correspondente e confirme o resultado.

Exemplos:

- landing: `http://localhost:3000/`
- login: `http://localhost:3000/login`
- chat: `http://localhost:3000/chat`
- conexão: `http://localhost:3000/connect`
- plano: `http://localhost:3000/plan`

---

## 17. Como restaurar estados

O builder oferece duas formas reais de restauração.

### 17.1. Restaurar padrão

Esse botão pega o **default técnico da aplicação** para aquela superfície e coloca no rascunho.

Use quando:

- você bagunçou muito a edição;
- quer voltar ao estado padrão do código;
- quer recomeçar a edição.

### 17.2. Restaurar publicado

Esse botão pega a versão publicada e joga no rascunho.

Use quando:

- você fez testes no rascunho;
- quer descartar mudanças ainda não publicadas;
- quer voltar exatamente ao que os usuários já estão vendo.

---

## 18. Como funciona o modo JSON completo

O modo JSON é poderoso e exige atenção.

### 18.1. Quando usar

Use esse modo quando você:

- conhece a estrutura da configuração;
- quer fazer alterações em lote;
- precisa colar estrutura pronta;
- quer revisar campos que não estão tão convenientes no painel guiado.

### 18.2. Como funciona

No modo JSON, você pode:

- editar a estrutura;
- clicar em **Aplicar JSON no preview**;
- verificar o resultado visual;
- salvar como rascunho.

### 18.3. Validação real

Antes de gravar, o backend valida a estrutura.

Se o JSON estiver incompatível com o schema da superfície, o sistema não deveria aceitar silenciosamente. A validação é feita por:

- parsing;
- normalização;
- verificação de conformidade com a estrutura esperada.

---

## 19. Como os dados são salvos no banco

O módulo persiste a configuração na tabela:

- `site_page_configs`

### 19.1. Campos importantes

O código de serviço utiliza estes campos:

- `id`
- `page_key`
- `draft_config`
- `published_config`
- `updated_by_user_id`
- `created_at`
- `updated_at`

### 19.2. O que significa cada um

#### `page_key`

Indica a superfície:

- `landing`
- `login`
- `app`

#### `draft_config`

Armazena o rascunho atual da página.

#### `published_config`

Armazena o que está ativo no front.

#### `updated_by_user_id`

Registra qual usuário alterou por último.

#### `created_at` e `updated_at`

Registram quando o conteúdo foi criado e atualizado.

---

## 20. APIs reais do módulo

### 20.1. API administrativa

Rota:

- `/api/admin/page-config/[pageKey]`

#### `GET`

Carrega:

- rascunho;
- publicado;
- datas;
- usuário de atualização.

#### `PUT`

Salva rascunho.

Body esperado:

```json
{
  "config": {}
}
```

#### `POST`

Executa ações administrativas.

Body esperado:

```json
{
  "action": "publish"
}
```

Ou:

```json
{
  "action": "restorePublished"
}
```

Ou:

```json
{
  "action": "restoreDefaults"
}
```

### 20.2. API pública

Rota:

- `/api/public/page-config/[pageKey]`

Ela retorna a configuração pública já publicada da superfície.

---

## 21. Hooks e consumo no frontend

O principal hook público é:

- `src/hooks/use-public-site-page-config.ts`

Esse hook:

- faz `fetch` no endpoint público;
- aplica parsing;
- usa default seguro em falha;
- retorna:
  - `config`
  - `loading`
  - `error`
  - `refresh`

Na prática, isso permite que páginas do front reajam ao builder sem depender de lógica fake.

---

## 22. Escala e tamanhos visuais

O módulo já possui infraestrutura para escalar elementos visuais.

Funções principais:

- `scaleRem(baseRem, scale)`
- `scalePx(basePx, scale)`
- `scaleNumber(baseValue, scale)`

Essas funções servem para:

- fonte;
- espaçamento;
- tamanhos proporcionais;
- componentes com ajustes controlados.

Se você quer que o sistema evolua para permitir controle ainda mais amplo de:

- tamanho de fonte;
- tamanho de cards;
- tamanho de botões;
- tamanho de ícones;
- largura de sidebar;
- espaçamento entre blocos;

essas funções já representam uma base técnica concreta para esse caminho.

---

## 23. O que o administrador consegue editar hoje

Dependendo da superfície, o admin já consegue editar itens como:

- títulos;
- descriptions;
- eyebrows;
- botões;
- badges;
- labels de status;
- quick replies;
- itens de FAQ;
- destaques;
- mensagens de empty state;
- blocos de agenda;
- blocos de monitoramento;
- textos de sidebar;
- textos de header;
- experiências públicas e internas específicas.

No app interno, o builder já avançou sobre módulos como:

- dashboard;
- appointments;
- monitoring;
- chat;
- connect;
- profile;
- ai plan em expansão.

---

## 24. Como operar com segurança no dia a dia

Recomendo este fluxo operacional:

### 24.1. Para pequenas mudanças

1. abrir a superfície;
2. editar no conteúdo guiado;
3. salvar rascunho;
4. revisar preview;
5. publicar;
6. validar no front real.

### 24.2. Para mudanças maiores

1. exportar ou copiar o JSON atual;
2. fazer a alteração em rascunho;
3. revisar visualmente;
4. testar a página real;
5. só então publicar.

### 24.3. Para times

Se houver mais de uma pessoa mexendo:

- combinar janelas de edição;
- evitar alterações concorrentes na mesma superfície;
- registrar quem publicou o quê;
- usar restore published quando necessário para desfazer um rascunho ruim.

---

## 25. Como validar se o módulo está funcionando

### 25.1. Checklist mínimo

Verifique se:

- o MySQL está rodando;
- o app está rodando em `localhost:3000`;
- o login administrativo funciona;
- `/admin/page-builder` abre;
- é possível escolher uma superfície;
- é possível alterar um campo;
- é possível salvar rascunho;
- é possível publicar;
- a página pública correspondente muda de verdade.

### 25.2. Comandos úteis no Windows

Preparar ambiente:

```bash
python run_windows.py setup-env
```

Verificar pré-requisitos:

```bash
python run_windows.py doctor
```

Subir banco:

```bash
python run_windows.py db-start
```

Aplicar migração:

```bash
python run_windows.py migrate
```

Subir tudo:

```bash
python run_windows.py dev
```

Ver status:

```bash
python run_windows.py status
```

Ver saúde:

```bash
python run_windows.py health
```

Parar app:

```bash
python run_windows.py stop-app
```

Parar tudo:

```bash
python run_windows.py stop-all
```

---

## 26. Fluxo recomendado para uma pessoa leiga

Se você não é técnica, faça exatamente assim:

### 26.1. Abrir o projeto

Abra o terminal na raiz do projeto.

### 26.2. Rodar o ambiente

Execute:

```bash
python run_windows.py dev
```

### 26.3. Abrir o navegador

Abra:

- `http://localhost:3000`

### 26.4. Fazer login como admin

Entre com:

- `admin@admin.com`
- senha `admin123`

ou:

- `admin@coragem.pet`
- senha `admin123`

### 26.5. Acessar o builder

Abra:

- `http://localhost:3000/admin/page-builder`

### 26.6. Escolher a tela

Escolha:

- landing;
- login;
- app.

### 26.7. Alterar um texto simples

Mude, por exemplo:

- o título;
- uma descrição;
- o texto de um botão.

### 26.8. Clicar em salvar rascunho

Isso grava sem publicar.

### 26.9. Olhar o preview

Veja se ficou bonito e coerente.

### 26.10. Publicar

Clique em:

- **Publicar agora**

### 26.11. Ver o resultado final

Abra a página pública correspondente e confira.

---

## 27. Erros comuns e como resolver

### 27.1. Erro: o app não sobe

#### Sintoma

O navegador não abre o app em `localhost:3000`.

#### Causa provável

- dependências não instaladas;
- build quebrado;
- banco parado;
- migração não aplicada.

#### Como resolver

1. rodar:

```bash
python run_windows.py doctor
```

2. depois:

```bash
python run_windows.py dev
```

3. se persistir, rode:

```bash
pnpm run check:types
pnpm run check:lint
```

### 27.2. Erro: acesso negado no page builder

#### Sintoma

A página abre, mas mostra bloqueio de acesso.

#### Causa provável

Você está autenticada com usuário sem perfil administrador.

#### Como resolver

- entrar com um admin real;
- confirmar se o bootstrap do admin foi executado;
- validar no banco o perfil do usuário.

### 27.3. Erro: alterei e nada mudou no front

#### Causa provável

Você salvou rascunho, mas não publicou.

#### Como resolver

Clique em:

- **Publicar agora**

### 27.4. Erro: JSON inválido

#### Causa provável

A estrutura do JSON não respeita o schema esperado.

#### Como resolver

- voltar para o conteúdo guiado;
- restaurar publicado;
- restaurar padrão;
- ou revisar cuidadosamente os campos obrigatórios.

### 27.5. Erro: banco não responde

#### Causa provável

O container do MySQL não subiu corretamente.

#### Como resolver

```bash
python run_windows.py db-start
python run_windows.py health
```

### 27.6. Erro: `requirements.txt` não existe

Isso é esperado no estado atual da Lyra.

Hoje o projeto não possui um `requirements.txt` real na raiz. O fluxo Python existente usa scripts utilitários sem depender de um backend Python principal com requirements próprios.

Ou seja:

- isso não é necessariamente um erro;
- é o estado atual real do projeto.

---

## 28. Boas práticas para editar sem quebrar nada

### 28.1. Sempre mexa primeiro em rascunho

Nunca trate publicação como primeiro passo.

### 28.2. Mude pouco por vez

Altere blocos pequenos, valide, depois avance.

### 28.3. Não publique sem abrir a tela real

Preview ajuda, mas a validação final deve incluir a página real.

### 28.4. Evite mexer no JSON sem necessidade

Se você é leiga, prefira sempre o conteúdo guiado.

### 28.5. Se algo sair muito errado

Use:

- restaurar publicado;
- ou restaurar padrão.

---

## 29. Como o módulo pode evoluir no futuro

O desenho técnico atual já permite crescer para recursos mais avançados, como:

- editor vivo com drag-and-drop;
- navigator de DOM;
- abas Content, Style e Advanced mais profundas;
- custom CSS por superfície;
- dynamic loops;
- revisões com histórico;
- theme builder mais universal;
- instalação mais automatizada em outros apps.

Mas isso deve ser feito em cima da base real já construída, não por maquiagem ou simulação.

---

## 30. Resumo executivo para quem só quer começar certo

Se você quer apenas instalar e usar com segurança:

1. garanta que o projeto é Next.js App Router com TypeScript;
2. copie `modules/lyra-customaze-ui-ux`;
3. copie `implement_elementor_lyra.py`;
4. execute:

```bash
python implement_elementor_lyra.py
```

5. suba banco e app;
6. faça login como admin;
7. abra:

- `http://localhost:3000/admin/page-builder`

8. edite;
9. salve rascunho;
10. publique;
11. valide a página pública.

---

## 31. Checklist final de instalação e uso

### 31.1. Instalação

- [ ] O projeto tem `package.json`.
- [ ] O projeto tem `tsconfig.json`.
- [ ] O projeto tem `src/app` ou `app`.
- [ ] A pasta `modules/lyra-customaze-ui-ux` está na raiz.
- [ ] O arquivo `implement_elementor_lyra.py` está na raiz.
- [ ] O comando `python implement_elementor_lyra.py` executou sem erro.
- [ ] O `package.json` recebeu o script `lyra-customaze:install`.
- [ ] Os reexports em `src/lib/site-page-config/` foram criados ou atualizados.

### 31.2. Ambiente

- [ ] Docker está funcionando.
- [ ] MySQL está rodando.
- [ ] As migrações foram aplicadas.
- [ ] O app responde em `http://localhost:3000`.

### 31.3. Operação

- [ ] O login administrativo funciona.
- [ ] `/admin/page-builder` abre sem erro.
- [ ] É possível editar conteúdo guiado.
- [ ] É possível editar JSON.
- [ ] É possível salvar rascunho.
- [ ] É possível publicar.
- [ ] A página pública muda de verdade após publicação.

---

## 32. Encerramento

O **Lyra Customaze UI UX** já é uma base real e séria de customização visual administrativa para a Lyra e para projetos compatíveis com a mesma arquitetura.

Ele ainda está em expansão, mas já possui:

- contrato claro;
- instalador real;
- integração com Next.js App Router;
- persistência em MySQL;
- leitura pública;
- leitura administrativa;
- fluxo de rascunho e publicação;
- operação restrita a administradores;
- integração concreta com superfícies reais do app.

Se a instalação e o uso forem feitos exatamente como descritos neste manual, a chance de erro operacional cai bastante e o uso se torna seguro até para uma pessoa com pouca familiaridade técnica.
