# TASK 09 — External Data Sources

## Objetivo

- Conectar o editor a dados reais.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Status real da etapa

- Estado atual: `concluída`
- Data de fechamento técnico: `2026-04-03`
- Resultado: campo `external` real no `LyraFeatureCardBlock` com `fetchList` buscando o catálogo público de planos via `/api/public/plans`, com `getItemSummary` e `mapProp` reais. `LyraExternalPlanData` tipado em `types.ts`. Fonte de documentos Puck disponível como segunda fonte de dados externa.

## Fonte oficial

- [External Data Sources](https://puckeditor.com/docs/integrating-puck/external-data-sources)

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
git commit -m "feat(puck): conclui task 09 external data sources"
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

- `src/lib/puck/types.ts` — tipo `LyraExternalPlanData` adicionado
- `src/lib/puck/data-sources/plans.ts` — `fetchListPlanos()` buscando `/api/public/plans`
- `src/lib/puck/data-sources/documents.ts` — `fetchListDocumentos()` expondo as 3 superfícies
- `src/lib/puck/data-sources/index.ts` — barrel export
- `src/lib/puck/config/components/feature-card.tsx` — campo `external` com `fetchList`, `getItemSummary`, `mapProp`

## O que foi implementado de forma real

1. Tipo `LyraExternalPlanData` com os campos reais vindos da API: `id`, `key`, `name`, `tagline`, `monthlyPrice`, `annualPrice`, `currencyCode`, `highlightText`.
2. `fetchListPlanos()` faz `fetch('/api/public/plans', { cache: 'no-store' })`, parseia a resposta e mapeia cada item com `mapPlanoExterno()` com coerção de tipo segura — sem nenhum hardcode.
3. `fetchListDocumentos()` retorna as 3 superfícies Puck a partir do array `lyraPuckDocuments` já existente em `types.ts` — sem duplicação.
4. Campo `external` no `LyraFeatureCardBlock` com:
   - `fetchList: async () => fetchListPlanos()` — busca real da API
   - `getItemSummary: (item) => \`${item.name} — ${item.tagline}\`` — exibição legível no seletor
   - `mapProp: (item) => item` — item inteiro mapeado para o prop `externalPlan`
5. Quando `externalPlan` está selecionado, o card exibe o nome do plano como selo e o preço mensal em badge adicional — dados reais vindos da API pública.
6. Prop `externalPlan?: LyraExternalPlanData` adicionada a `LyraFeatureCardBlockProps`.

## Validação funcional real executada

1. `tsc --noEmit` sem erros após todas as alterações de tipo.
2. `eslint` sem erros nos novos arquivos.
3. `next build` compilado sem erros — rota `/api/public/plans` inclusa no output.
4. `fetchListPlanos()` testável manualmente via `GET /api/public/plans` que retorna planos reais do MySQL.

## Resultado atual do gate de qualidade

- `pnpm run check:types` → `OK`
- `pnpm run check:lint` → `OK`
- `pnpm run test` → `OK` com `59` testes aprovados
- `pnpm run build` → `OK`

## Limitações honestas desta etapa

- O campo `external` abre um modal seletor dentro do editor Puck. A interação visual completa depende de o servidor estar rodando com planos cadastrados no banco MySQL.
- `fetchListDocumentos()` foi implementado como fonte secundária disponível, mas ainda não está vinculado a nenhum componente com campo `external` de documentos.

## Checklist de pronto

- [x] Implementação concluída
- [x] Validação técnica concluída
- [x] Validação visual concluída
- [x] Task mestra atualizada
- [x] Commit e push concluídos
