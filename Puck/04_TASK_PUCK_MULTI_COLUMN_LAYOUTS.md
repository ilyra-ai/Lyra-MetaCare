# TASK 04 — Multi-column Layouts

## Objetivo

- Implementar DropZones e composições multi-coluna reais.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Fonte oficial

- [Multi-column Layouts](https://puckeditor.com/docs/integrating-puck/multi-column-layouts)

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
git commit -m "feat(puck): conclui task 04 multi-column layouts"
git push origin main
```

## Modo de execução

1. Ler a doc oficial inteira antes de editar código.
2. Aplicar a implementação somente dentro do escopo desta etapa.
3. Integrar com a Lyra Customaze UI UX e não com uma sandbox paralela.
4. Validar no navegador o reflexo real da etapa.
5. Atualizar a task mestra ao concluir.

## Checklist de pronto

- [x] Implementação concluída
- [x] Validação técnica concluída
- [x] Validação visual concluída
- [x] Task mestra atualizada
- [ ] Commit e push concluídos

## Implementação executada de forma real

- Foram criados blocos reais para layouts multi-coluna na configuração do Puck da Lyra.
- Arquivos criados:
  - `src/lib/puck/config/components/fixed-columns.tsx`
  - `src/lib/puck/config/components/fluid-grid.tsx`
  - `src/lib/puck/config/components/grid-tile.tsx`
- Arquivos alterados:
  - `src/lib/puck/types.ts`
  - `src/lib/puck/config/components/helpers.tsx`
  - `src/lib/puck/config/components/index.ts`
  - `src/lib/puck/config/initial-data.ts`

## O que a task 04 passou a entregar

1. `LyraFixedColumnsBlock`
   - Duas zonas independentes com `slot`
   - Proporções fixas `1-1`, `2-1` e `1-2`
   - Controle de espaçamento
   - Controle de alinhamento vertical
   - Restrição real de componentes por `allow`

2. `LyraFluidGridBlock`
   - Organização por `grid` ou `flex`
   - Colunas específicas para tablet e desktop
   - Slot com `allow` aplicado no render
   - Estrutura própria para mosaico editorial

3. `LyraGridTileBlock`
   - Componente `inline: true`
   - Uso real de `puck.dragRef`
   - `grid-column` e `grid-row` por spans reais
   - Reuso dentro da grade fluida com visual premium claro

## Causa raiz técnica corrigida

- Problema encontrado:
  - Os props de `slot` ainda estavam modelados como `ReactNode`.
- Impacto:
  - O TypeScript rejeitava `defaultProps` com arrays de `ComponentData`, impedindo a implementação correta de slots pré-populados.
- Causa raiz:
  - `defaultProps` do Puck para `slot` não são `ReactNode`; eles são arrays serializáveis de dados de componentes.
- Correção aplicada:
  - O contrato foi corrigido em `src/lib/puck/types.ts` com `LyraPuckSlotItem` e `LyraPuckSlotItems`.
- Resultado:
  - A tipagem voltou a refletir o comportamento real do Puck.

## Validação técnica real

Comandos executados no WSL2:

```bash
pnpm run check:types
pnpm run check:lint
```

Resultado:

- `check:types`: passou após a correção da tipagem dos slots
- `check:lint`: passou com 0 erros

## Validação visual real no navegador

Validação feita em `http://127.0.0.1:3000/admin/puck` com sessão administrativa real `admin@admin.com`.

### Superfície `landing-home`

- `PUT /api/admin/puck/documents/landing-home` retornou `200`
- `POST /api/admin/puck/documents/landing-home` retornou `200`
- O preview do Puck no `iframe#preview-frame` confirmou presença real de:
  - `Colunas reais para combinar narrativa principal e apoio visual.`
  - `Mosaico com tiles inline, spans reais e reorganização por grid.`
  - `Destaque amplo com span horizontal real.`

### Superfície `app-shell`

- `PUT /api/admin/puck/documents/app-shell` retornou `200`
- `POST /api/admin/puck/documents/app-shell` retornou `200`
- O preview do Puck confirmou presença real de:
  - `Área operacional organizada em duas colunas reais.`
  - `Coluna de contexto, regras e narrativa operacional.`

## Evidências visuais geradas

- `task04-landing-home-validada.png`
- `task04-app-shell-validada.png`

## Observação honesta sobre aviso do console

- Durante a validação visual apareceram avisos de console:
  - `DropZones have been deprecated in favor of slot fields...`
- Investigação feita:
  - O código da Lyra não contém `DropZone` nem `renderDropZone`.
  - A string do aviso foi localizada dentro de `node_modules/@puckeditor/core/dist/chunk-EBISZQTK.mjs`.
- Causa raiz identificada:
  - O aviso é emitido internamente pela versão `@puckeditor/core@0.21.1`, mesmo com a integração local já usando `slot`.
- Status:
  - Não bloqueia a funcionalidade entregue da task 04.
  - A origem atual é da biblioteca upstream, não da implementação local da Lyra.
