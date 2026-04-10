# TASK 02 — Puck Component Configuration

## 1. Objetivo executivo

Construir o catálogo real de componentes editáveis do Puck para a Lyra, com tipagem forte, campos claros, render consistente e governança visual de nível 2026.

---

## 2. Resultado esperado desta etapa

- catálogo de blocos editáveis criado;
- componentes reais da Lyra mapeados;
- fields configurados por bloco;
- render consistente no canvas;
- base pronta para expansão do editor.

---

## 3. Pré-requisitos obrigatórios

- TASK 01 concluída;
- rota Puck funcional;
- editor mínimo carregando sem erro.

### Comandos de preparação

```bash
python run_windows.py health
pnpm run check:types
```

---

## 4. Escopo técnico obrigatório

Os primeiros componentes não devem ser arbitrários.

Devem ser componentes úteis, controláveis e compatíveis com a Lyra:

- heading
- body text
- CTA button
- metric card
- feature card
- FAQ item
- section container
- stack container

---

## 5. Arquivos previstos desta etapa

- `src/lib/puck/config/components/heading.tsx`
- `src/lib/puck/config/components/body-text.tsx`
- `src/lib/puck/config/components/cta-button.tsx`
- `src/lib/puck/config/components/metric-card.tsx`
- `src/lib/puck/config/components/feature-card.tsx`
- `src/lib/puck/config/components/faq-item.tsx`
- `src/lib/puck/config/components/section-container.tsx`
- `src/lib/puck/config/components/index.ts`

---

## 6. Comandos desta etapa

```bash
pnpm run check:types
pnpm run check:lint
pnpm run check:format
```

---

## 7. Como executar esta etapa

1. Criar a pasta de componentes Puck.
2. Tipar o schema de props de cada bloco.
3. Definir `fields` de edição de cada componente.
4. Definir `render` com visual coerente com a Lyra.
5. Adicionar os componentes ao `config.components`.
6. Abrir o editor.
7. Inserir cada bloco no canvas.
8. Editar os fields.
9. Validar se o preview responde corretamente.

---

## 8. Qualidade visual obrigatória

Os blocos desta etapa precisam nascer com padrão visual:

- claro;
- elegante;
- limpo;
- premium;
- editorial;
- consistente com a identidade da Lyra;
- sem aparência de demo genérica.

---

## 9. Validação real obrigatória

- todos os blocos aparecem no inseridor;
- todos os blocos podem ser inseridos;
- todos os fields aparecem;
- alterações nos fields afetam o canvas;
- o TypeScript não acusa incompatibilidade.

---

## 10. Evidências reais desta execução

- Inseridor do Puck exibindo os blocos reais:
  - `Hero Lyra`
  - `Título editorial`
  - `Texto de apoio`
  - `Botão CTA`
  - `Card de métrica`
  - `Card de feature`
  - `Item de FAQ`
  - `Seção editorial`
  - `Stack de composição`
- Validação visual em `http://127.0.0.1:3000/admin/puck` com login administrativo real (`admin@admin.com`).
- Persistência real validada pelos botões:
  - `Salvar rascunho`
  - `Publicar agora`
- Evidência funcional observada no browser:
  - `Última atualização` mudou de `2026-03-31 20:11:42` para `2026-03-31 20:11:54` após publicar.
- Evidência técnica autenticada via `fetch('/api/admin/puck/documents/landing-home')`:
  - `status: 200`
  - `documentKey: "landing-home"`
  - `draftData.root.props.title: "Landing Home validada task 02"`
  - `publishedData.root.props.title: "Landing Home validada task 02"`
  - `updatedAt: "2026-03-31 20:11:54"`
- Checks reais executados e aprovados:
  - `pnpm run fix:format`
  - `pnpm run fix:lint`
  - `pnpm run check:lint`
  - `pnpm run check:format`
  - `pnpm run check:types`
  - `pnpm run test`
  - `pnpm run build`

## 11. Definição de pronto

- [x] Catálogo inicial criado
- [x] Tipagem criada
- [x] Fields criados
- [x] Render dos componentes criado
- [x] Componentes inseríveis no canvas
- [x] Validação real concluída
- [x] Checks concluídos
- [ ] Commit e push concluídos
