# TASK 03 — Puck Root Configuration

## 1. Objetivo executivo

Criar a camada raiz do editor Puck para que cada superfície da Lyra tenha contexto estrutural real, configurável e publicável.

---

## 2. Resultado esperado desta etapa

- `root` configurado no Puck;
- superfícies com metadados estruturais;
- root render funcional;
- separação clara entre contexto de página e blocos internos.

---

## 3. Pré-requisitos

- TASK 01 concluída
- TASK 02 concluída ou com catálogo mínimo estável

### Comandos de preparação

```bash
python run_windows.py health
pnpm run check:types
```

---

## 4. Escopo obrigatório

Aplicar root configuration para superfícies reais:

- landing
- login
- app shell

Cada uma deverá suportar pelo menos:

- `surfaceKey`
- `surfaceTitle`
- `surfaceDescription`
- `themeVariant`
- `visibilityRules`

---

## 5. Arquivos previstos

- `src/lib/puck/config/root/landing-root.tsx`
- `src/lib/puck/config/root/login-root.tsx`
- `src/lib/puck/config/root/app-root.tsx`
- `src/lib/puck/config/root/index.ts`

---

## 6. Comandos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
pnpm run check:format
```

---

## 7. Como executar

1. Criar a configuração de root para cada superfície.
2. Definir root fields claros e reutilizáveis.
3. Ligar esses fields ao render da superfície.
4. Garantir que `children` sejam renderizados corretamente.
5. Validar se a edição do root altera o contexto visual geral.

---

## 8. Validação real

- root aparece no editor;
- fields do root respondem;
- render da superfície muda de verdade;
- `children` continuam íntegros.

### Evidências reais executadas

- Ambiente validado em `WSL2 Ubuntu 22.04.5 LTS`.
- Aplicação reiniciada com `python run.py dev`.
- Causa raiz adicional resolvida no dev:
  - o loader `@dyad-sh/nextjs-webpack-component-tagger` estava quebrando o `next dev`;
  - a ativação agora só ocorre com `ENABLE_DYAD_COMPONENT_TAGGER=true`;
  - após isso, os chunks `_next/static` voltaram a responder `200`.
- Validação real no navegador via Playwright:
  - `landing-home` abriu corretamente em `/admin/puck?documentKey=landing-home`;
  - `login-experience` abriu corretamente em `/admin/puck?documentKey=login-experience`;
  - `app-shell` abriu corretamente em `/admin/puck?documentKey=app-shell`.
- Validação real dos campos de root:
  - `#root_text_title`
  - `#root_text_surfaceTitle`
  - `#root_textarea_surfaceDescription`
  - `#root_textarea_visibilityRules`
- Publicação real confirmada para `landing-home`:
  - `title`: `Landing Home validada task 03`
  - `surfaceTitle`: `Landing pública com raiz validada`
  - `surfaceDescription`: `Superfície pública da Lyra validada na task 03 com root independente, governança estrutural e render contextual real.`
  - `updatedAt`: `2026-03-31 20:42:32`
- Confirmação real via endpoint autenticado:
  - `GET /api/admin/puck/documents/landing-home`
  - `status: 200`
  - `draftData.root.props.title = Landing Home validada task 03`
  - `publishedData.root.props.title = Landing Home validada task 03`
  - `draftData.root.props.surfaceTitle = Landing pública com raiz validada`
  - `publishedData.root.props.surfaceTitle = Landing pública com raiz validada`
- Confirmação real das demais superfícies:
  - `login-experience` carregou `surfaceKey = login` e `themeVariant = serene`
  - `app-shell` carregou `surfaceKey = app-shell` e `themeVariant = shell`

### Gate executado nesta etapa

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
pnpm run test
pnpm run build
```

Todos executados com sucesso nesta etapa.

---

## 9. Definição de pronto

- [x] Root criado
- [x] Root fields criados
- [x] Root render funcional
- [x] Superfícies mapeadas
- [x] Validação concluída
- [x] Checks concluídos
- [ ] Commit e push concluídos
