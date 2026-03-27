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

## 10. Definição de pronto

- [ ] Catálogo inicial criado
- [ ] Tipagem criada
- [ ] Fields criados
- [ ] Render dos componentes criado
- [ ] Componentes inseríveis no canvas
- [ ] Validação real concluída
- [ ] Checks concluídos
- [ ] Commit e push concluídos
