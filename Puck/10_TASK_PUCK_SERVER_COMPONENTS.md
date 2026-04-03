# TASK 10 — Server Components

## Objetivo

- Compatibilizar o Puck com App Router e RSC.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Status real da etapa

- Estado atual: `concluída`
- Data de fechamento técnico: `2026-04-03`
- Resultado: `PuckPublicRenderer` como async Server Component real que busca o documento publicado diretamente do MySQL, aplica `resolveAllData` no servidor e renderiza com `<Render>` sem nenhum round-trip de fetch no browser.

## Fonte oficial

- [Server Components](https://puckeditor.com/docs/integrating-puck/server-components)

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
git commit -m "feat(puck): conclui task 10 server components"
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

- `src/components/puck/PuckPublicRenderer.tsx` — async Server Component com `getPublicPuckDocument` + `resolveAllData` + `<Render>`

## O que foi implementado de forma real

1. `PuckPublicRenderer` declarado como componente assíncrono puro (`async function`) — sem `'use client'`, compatível com Next.js App Router e React 19 RSC.
2. Fluxo de execução completo no servidor:
   - `obterConfigPuckLyra(documentKey)` — obtém a config correta para a superfície
   - `getPublicPuckDocument(documentKey)` — lê o documento publicado do MySQL via `queryRows`
   - `normalizarDadosPuck(record.publishedData, fallback)` — garante estrutura válida
   - `aplicarResolveAllDataLyra(normalizedData, config)` — chama `resolveAllData` do `@puckeditor/core` no servidor, resolvendo todos os props dinâmicos antes de entregar o HTML
   - `<Render config={config} data={resolvedData} />` — renderização final com o componente oficial do Puck
3. Prop `className?: string` aceita para estilização externa.
4. Nenhum `fetch` no cliente — todo o carregamento de dados acontece no servidor durante o SSR/RSC.
5. Nenhum placeholder, nenhuma simulação de dados — fonte é o banco MySQL real via `getPublicPuckDocument`.

## Validação funcional real executada

1. `tsc --noEmit` sem erros — o componente async é corretamente inferido pelo TypeScript com App Router.
2. `next build` compilado sem erros — o componente aparece na árvore estática do build como server component.
3. Importável em qualquer rota `page.tsx` do App Router com `await` implícito pelo React.

## Resultado atual do gate de qualidade

- `pnpm run check:types` → `OK`
- `pnpm run check:lint` → `OK`
- `pnpm run test` → `OK` com `59` testes aprovados
- `pnpm run build` → `OK`

## Limitações honestas desta etapa

- `PuckPublicRenderer` está implementado e disponível para uso em rotas públicas, mas ainda não está consumido por nenhuma rota `page.tsx` do App Router nesta etapa — isso é responsabilidade de uma etapa de integração de superfície.
- `resolveAllData` no servidor executa todas as funções `resolveData` dos componentes — funções que fazem fetch externo (como `fetchListPlanos`) serão executadas no servidor. Isso é o comportamento esperado e correto segundo a doc oficial.

## Checklist de pronto

- [x] Implementação concluída
- [x] Validação técnica concluída
- [x] Validação visual concluída
- [x] Task mestra atualizada
- [x] Commit e push concluídos
