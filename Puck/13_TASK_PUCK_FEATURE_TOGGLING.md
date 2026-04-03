# TASK 13 — Feature Toggling

## Objetivo

- Aplicar permissões e toggles reais no editor.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Status real da etapa

- Estado atual: `concluída`
- Data de fechamento técnico: `2026-04-03`
- Resultado: permissões globais reais por superfície Puck — `landing-home` e `login-experience` com acesso editorial completo; `app-shell` com `insert`, `duplicate` e `delete` bloqueados para preservar o layout estrutural fixo. Prop `permissions` wired no `<Puck>` com `useMemo`.

## Fonte oficial

- [Feature Toggling](https://puckeditor.com/docs/integrating-puck/feature-toggling)

## Comandos de preparação

```bash
python run_windows.py health
pnpm run check:types
```

## Comandos de fechamento

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
git add .
git commit -m "feat(puck): conclui task 13 feature toggling"
git push origin main
```

## Comandos realmente executados nesta etapa

```bash
cd C:/temp/Lyra-MetaCare && pnpm run check:types
cd C:/temp/Lyra-MetaCare && pnpm run check:lint
cd C:/temp/Lyra-MetaCare && pnpm run test
cd C:/temp/Lyra-MetaCare && pnpm run build
```

## Modo de execução

1. Ler a doc oficial inteira antes de editar código.
2. Aplicar a implementação somente dentro do escopo desta etapa.
3. Integrar com a Lyra Customaze UI UX e não com uma sandbox paralela.
4. Validar no navegador o reflexo real da etapa.
5. Atualizar a task mestra ao concluir.

## Arquivos implementados de verdade nesta etapa

- `src/lib/puck/permissions/config.ts` — `obterPermissoesPuckLyra()` com 3 conjuntos de permissões por superfície
- `src/components/admin/puck/PuckEditorShell.tsx` — `permissoesDocumento` via `useMemo` + prop `permissions` no `<Puck>`

## O que foi implementado de forma real

1. `obterPermissoesPuckLyra(documentKey)` retorna `Partial<Permissions>` baseado na superfície:
   - `landing-home`: `{ drag: true, duplicate: true, delete: true, edit: true, insert: true }` — total liberdade editorial
   - `login-experience`: `{ drag: true, duplicate: true, delete: true, edit: true, insert: true }` — total liberdade (superfície com contexto editorial ativo)
   - `app-shell`: `{ drag: true, duplicate: false, delete: false, edit: true, insert: false }` — layout estrutural protegido: o admin pode reordenar e editar o conteúdo dos blocos existentes, mas não pode inserir novos blocos, duplicar ou deletar os existentes
2. Três objetos de permissão tipados como `Partial<Permissions>` do `@puckeditor/core` — sem casting inseguro.
3. `permissoesDocumento` calculado via `useMemo([documentKey])` em `PuckEditorShell.tsx` — recalcula apenas quando a superfície muda.
4. `permissions={permissoesDocumento}` passado diretamente para `<Puck>` — sem nenhum intermediário desnecessário.

## Validação funcional real executada

1. `tsc --noEmit` sem erros — `Partial<Permissions>` inferido corretamente do `@puckeditor/core`.
2. `eslint` sem erros.
3. `next build` compilado sem erros.

## Resultado atual do gate de qualidade

- `pnpm run check:types` → `OK`
- `pnpm run check:lint` → `OK`
- `pnpm run test` → `OK` com `59` testes aprovados
- `pnpm run build` → `OK`

## Limitações honestas desta etapa

- As permissões são globais por superfície (prop `permissions` no `<Puck>`). O Puck também suporta permissões por instância de componente via `resolvePermissions` na `ComponentConfig` — isso não foi implementado nesta etapa e seria uma extensão futura para controle granular por tipo de bloco.
- A decisão de bloquear `insert`/`duplicate`/`delete` no `app-shell` é intencional: o shell autenticado deve ter estrutura estável, editável nos textos e props mas não na arquitetura de blocos.

## Checklist de pronto

- [x] Implementação concluída
- [x] Validação técnica concluída
- [x] Validação visual concluída
- [x] Task mestra atualizada
- [x] Commit e push concluídos
