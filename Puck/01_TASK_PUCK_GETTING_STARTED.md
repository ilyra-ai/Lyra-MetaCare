# TASK 01 — Puck Getting Started

## 1. Objetivo executivo

Instalar e integrar a base do **Puck** na Lyra, de forma real, sem fake editor, criando a primeira estrutura funcional de editor visual do `Lyra Customaze UI UX`.

---

## 2. Resultado esperado desta etapa

Ao fim desta etapa, deve existir:

- pacote do Puck instalado;
- CSS do Puck carregado;
- primeira configuração mínima funcional;
- primeira rota administrativa protegida para o editor;
- primeiro render público usando `Render`;
- validação real em navegador.

---

## 3. Pré-requisitos obrigatórios

- ambiente local saudável;
- app rodando;
- MySQL rodando;
- admin funcional;
- rota administrativa protegida existente na Lyra.

### Comandos de preparação

```bash
python run_windows.py doctor
python run_windows.py setup-env
python run_windows.py dev
python run_windows.py health
```

---

## 4. Instalação real

### Comando de instalação

```bash
pnpm add @puckeditor/core
```

### O que verificar após instalar

- o pacote entrou em `package.json`;
- o lockfile foi atualizado;
- o TypeScript reconhece os imports;
- não houve conflito com React 19;
- não houve conflito com Next.js 15.

---

## 5. Arquivos previstos desta etapa

Arquivos previstos se mantivermos a arquitetura atual:

- `src/app/admin/puck/page.tsx`
- `src/components/admin/puck/PuckEditorShell.tsx`
- `src/components/admin/puck/PuckPreviewRenderer.tsx`
- `src/lib/puck/config/base.ts`
- `src/lib/puck/config/initial-data.ts`
- `src/lib/puck/types.ts`

Observação honesta:

- estes caminhos são os mais coerentes com a arquitetura atual da Lyra;
- podem ser ajustados se, durante a implementação real, houver causa raiz técnica que peça outra organização.

---

## 6. Configuração técnica obrigatória

### 6.1. Criar o shell administrativo do editor

Precisamos criar um componente client responsável por:

- montar o `Puck`;
- carregar o config;
- carregar o data inicial;
- preparar callbacks de save/publicação;
- isolar o editor do restante da UI do app.

### 6.2. Criar um render separado

Também precisamos criar um render público mínimo usando:

- `Render`

Isso é obrigatório para não cair no erro de ter editor sem camada pública real.

### 6.3. Importar o CSS do Puck

O CSS do Puck precisa ser importado na camada certa para:

- não contaminar o app inteiro;
- não quebrar o design atual;
- não gerar conflito com o global CSS.

---

## 7. Como executar esta etapa na prática

1. Rodar a preparação do ambiente.
2. Instalar `@puckeditor/core`.
3. Criar o config base mínimo.
4. Criar uma rota admin dedicada ao Puck.
5. Garantir que somente admin autenticado acesse essa rota.
6. Montar o editor com um bloco mínimo.
7. Montar o `Render` usando os mesmos dados.
8. Abrir o navegador e validar a rota.

---

## 8. Comandos de verificação técnica

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
```

---

## 9. Validação real obrigatória

### Validação técnica

- o build não quebra;
- a rota carrega;
- o pacote resolve sem erro;
- o CSS do Puck aparece;
- não há crash de hidratação.

### Validação visual

- a rota abre no navegador;
- o editor aparece de verdade;
- o admin consegue visualizar o canvas;
- um bloco mínimo aparece no preview.

### Validação de segurança

- usuário não admin recebe bloqueio;
- admin autenticado entra normalmente.

---

## 10. Evidências obrigatórias desta etapa

- rota funcionando em navegador;
- checks passando;
- pacote presente no `package.json`;
- log de task atualizado;
- commit e push realizados.

### Evidências coletadas nesta execução

- ambiente validado com `python run_windows.py doctor`, `python run_windows.py dev` e `python run_windows.py health`;
- pacote `@puckeditor/core` instalado em `package.json` e `pnpm-lock.yaml`;
- migração real aplicada: `mysql/migrations/007_add_puck_documents.sql`;
- rota administrativa protegida criada em `src/app/admin/puck/page.tsx`;
- CSS segmentado do Puck carregado por `src/app/admin/puck/layout.tsx`;
- preview real usando `Render` em `src/components/admin/puck/PuckPreviewRenderer.tsx`;
- persistência real confirmada via `GET /api/public/puck/documents/landing-home`;
- validação em navegador concluída com login admin real e abertura de `http://localhost:3000/admin/puck`;
- console do navegador sem erros na rota validada.
- commit desta etapa: `f352f8e`;
- push concluído para `origin/main`.

---

## 11. Riscos e causa raiz

### Risco 1

Conflito entre ambiente client do editor e App Router.

### Risco 2

CSS do Puck interferindo visualmente no restante da aplicação.

### Risco 3

Editor subir, mas o render público não existir, gerando falsa sensação de implementação completa.

---

## 12. Definição de pronto

- [x] Puck instalado
- [x] CSS carregado
- [x] Shell do editor criado
- [x] Render público criado
- [x] Rota administrativa protegida criada
- [x] Validação em navegador concluída
- [x] Checks concluídos
- [x] Commit e push concluídos
