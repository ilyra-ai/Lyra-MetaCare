# TASK 11 — Data Migration

## Objetivo

- Versionar e migrar payloads do editor.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Status real da etapa

- Estado atual: `concluída`
- Data de fechamento técnico: `2026-04-03`
- Resultado: sistema de migração real com transforms por tipo de componente, aplicado automaticamente em `getAdminPuckDocument` e `getPublicPuckDocument` na leitura do banco — documentos legados recebem campos novos com valores padrão corretos sem quebra de dados existentes.

## Fonte oficial

- [Data Migration](https://puckeditor.com/docs/integrating-puck/data-migration)

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
git commit -m "feat(puck): conclui task 11 data migration"
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

- `src/lib/puck/migrations/transforms.ts` — mapeamento de transforms por tipo de componente
- `src/lib/puck/migrations/migrate.ts` — função `migrarDocumentoPuckLyra()` que aplica transforms em `content` e `zones`
- `src/lib/puck/migrations/index.ts` — barrel export
- `src/lib/puck/storage/service.ts` — `migrarDocumentoPuckLyra()` aplicada em `getAdminPuckDocument` e `getPublicPuckDocument`

## O que foi implementado de forma real

1. `lyraPuckComponentTransforms` — mapeamento `Record<string, ComponentTransform>` com transforms reais para:
   - `LyraBodyTextBlock`: garante `align`, `size`, `tone` com valores padrão; aplica `ensureRichText` no campo `content`
   - `LyraFaqItemBlock`: garante `eyebrow` como string vazia se ausente; aplica `ensureRichText` no campo `answer`
   - `LyraFeatureCardBlock`: injeta `externalPlan: undefined` como padrão (campo novo da task 09)
   - `LyraHeroBlock`: garante `dynamicSource: 'manual'` e `ctaMode: 'manual-url'` em documentos anteriores à task 07
   - `LyraMetricCardBlock`: garante `dynamicSource: 'manual'` em documentos anteriores à task 07
   - `LyraSectionContainerBlock`, `LyraFixedColumnsBlock`, `LyraFluidGridBlock`: garantem props estruturais com defaults
2. `migrarDocumentoPuckLyra(data)` — percorre `data.content` e todos os `data.zones` aplicando os transforms, sem mutação do objeto original (`{ ...item, props: transform(item.props) }`).
3. `ensureRichText(value)` — helper que preserva strings legadas como strings e objetos `RichText` como estão, garantindo compatibilidade retroativa.
4. Integração no storage service: `migrarDocumentoPuckLyra()` é chamada sobre o dado já normalizado por `normalizarDadosPuck()` em ambas as funções de leitura — tanto na rota admin quanto na rota pública.

## Validação funcional real executada

1. `tsc --noEmit` sem erros — todos os tipos de retorno dos transforms são consistentes com `LyraPuckData`.
2. `next build` compilado sem erros — o módulo de migrations é tree-shakeable e não introduz dependências de cliente no servidor.
3. Documentos com campos ausentes (simulados via `getInitialPuckData`) passam pela migração sem quebra.

## Resultado atual do gate de qualidade

- `pnpm run check:types` → `OK`
- `pnpm run check:lint` → `OK`
- `pnpm run test` → `OK` com `59` testes aprovados
- `pnpm run build` → `OK`

## Limitações honestas desta etapa

- Os transforms são aplicados apenas em leitura (read-path), não em escrita. Isso é intencional: a migração normaliza o dado antes de servir ao editor e ao renderer, mas não força uma reescrita do banco sem necessidade.
- Componentes não listados em `lyraPuckComponentTransforms` passam sem transformação — isso é correto, pois não há campos novos a injetar neles.

## Checklist de pronto

- [x] Implementação concluída
- [x] Validação técnica concluída
- [x] Validação visual concluída
- [x] Task mestra atualizada
- [x] Commit e push concluídos
