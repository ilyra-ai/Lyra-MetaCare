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

---

## 9. Definição de pronto

- [ ] Root criado
- [ ] Root fields criados
- [ ] Root render funcional
- [ ] Superfícies mapeadas
- [ ] Validação concluída
- [ ] Checks concluídos
- [ ] Commit e push concluídos
