# TASK 07 — Dynamic Props

## Objetivo

- Derivar props reais com resolveData.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Status real da etapa

- Estado atual: `concluída`
- Data de fechamento técnico: `2026-03-31`
- Resultado: `dynamic props` reais funcionando no editor administrativo, no preview do canvas, na persistência de rascunho/publicação e no consumo público do documento.

## Fonte oficial

- [Dynamic Props](https://puckeditor.com/docs/integrating-puck/dynamic-props)

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
git commit -m "feat(puck): conclui task 07 dynamic props"
git push origin main
```

## Comandos realmente executados nesta etapa

```bash
cd /home/ilyra/Lyra-MetaCare && pnpm run fix:format
cd /home/ilyra/Lyra-MetaCare && pnpm run fix:lint
cd /home/ilyra/Lyra-MetaCare && pnpm run check:lint
cd /home/ilyra/Lyra-MetaCare && pnpm run check:format
cd /home/ilyra/Lyra-MetaCare && pnpm run check:types
cd /home/ilyra/Lyra-MetaCare && pnpm run test
cd /home/ilyra/Lyra-MetaCare && pnpm run build
cd /home/ilyra/Lyra-MetaCare && curl -s http://127.0.0.1:3000/api/public/puck/documents/landing-home
```

## Modo de execução

1. Ler a doc oficial inteira antes de editar código.
2. Aplicar a implementação somente dentro do escopo desta etapa.
3. Integrar com a Lyra Customaze UI UX e não com uma sandbox paralela.
4. Validar no navegador o reflexo real da etapa.
5. Atualizar a task mestra ao concluir.

## Arquivos implementados de verdade nesta etapa

- `src/lib/puck/types.ts`
- `src/lib/puck/config/components/hero.tsx`
- `src/lib/puck/config/components/metric-card.tsx`
- `src/lib/puck/config/root/shared.tsx`
- `src/components/admin/puck/PuckEditorShell.tsx`
- `src/lib/puck/data-utils.ts`
- `src/lib/puck/dynamic/cache.ts`
- `src/lib/puck/dynamic/profile.ts`
- `src/lib/puck/dynamic/metrics.ts`
- `src/lib/puck/dynamic/resolve-data.ts`

## O que foi implementado de forma real

1. Tipos dinâmicos reais para `Hero`, `MetricCard` e `Root`.
2. Resolução dinâmica baseada em sessão autenticada e assinatura real.
3. Cache curto para evitar recomputação desnecessária.
4. Aplicação automática de `resolveData` no carregamento, no salvar rascunho e no publicar.
5. Correção da persistência do `root`, preservando `dynamicSource` e `resolvedContextSummary`.
6. Sincronização adicional do estado externo do editor via `onAction`, corrigindo a perda de mudanças do `root`.

## Fontes de dados reais desta etapa

- `/api/auth/session`
- `/api/account/subscription`

## Validação funcional real executada

1. Login administrativo real com `admin@admin.com`.
2. Acesso real à rota `http://127.0.0.1:3000/admin/puck?documentKey=landing-home`.
3. Alteração real de `dynamicSource`:
   - `Hero` → `session-profile`
   - `MetricCard` → `subscription-summary`
   - `Root` → `session-context`
4. Salvamento real via `PUT /api/admin/puck/documents/landing-home` com resposta `200`.
5. Publicação real via `POST /api/admin/puck/documents/landing-home` com resposta `200`.
6. Conferência real na API pública via `GET /api/public/puck/documents/landing-home`.
7. Conferência visual real no canvas com os textos derivados da sessão e do plano.

## Evidências reais observadas

- `Hero` passou a refletir:
  - `Sessão administrativa ativa`
  - `Boa noite, Admin. O editor visual da Lyra está pronto para você.`
  - `Usuária admin@admin.com • iniciais AP`
- `MetricCard` passou a refletir:
  - `Plano Care`
  - `13`
  - `recursos`
  - `Status active no ciclo mensal • 31 dia(s) restantes`
- `Root` passou a refletir:
  - `fonte: session-context`
  - `Sessão admin@admin.com • perfil admin • plano Care • Status active no ciclo mensal • 31 dia(s) restantes.`

## Causa raiz corrigida nesta etapa

### Problema 1

- Sintoma: alterações dinâmicas do `root` apareciam no preview interno do Puck, mas não persistiam no documento salvo/publicado.
- Causa raiz real: `normalizarDadosPuck` descartava `dynamicSource` e `resolvedContextSummary` do `root`.
- Correção aplicada: preservação explícita dessas propriedades no normalizador em `src/lib/puck/data-utils.ts`.

### Problema 2

- Sintoma: alterações do `root` nem sempre chegavam ao `draftData` externo.
- Causa raiz real: ações como `replaceRoot` não eram capturadas apenas com `onChange`.
- Correção aplicada: sincronização adicional do estado externo via `onAction` em `src/components/admin/puck/PuckEditorShell.tsx`.

### Problema 3

- Sintoma: o editor carregava com `404` de CSS/chunks durante a validação.
- Causa raiz real: instância anterior do `next dev` estava com assets desalinhados.
- Correção aplicada: encerramento do processo antigo e restart limpo do `pnpm dev`.

## Resultado do gate de qualidade

- `pnpm run fix:format` → `OK`
- `pnpm run fix:lint` → `OK`
- `pnpm run check:lint` → `OK`
- `pnpm run check:format` → `OK`
- `pnpm run check:types` → `OK`
- `pnpm run test` → `OK` com `55` testes aprovados
- `pnpm run build` → `OK`

## Limitações honestas desta etapa

- Esta task entrega `dynamic props` reais e persistidas, mas não declara paridade total com Elementor.
- Os warnings de depreciação de `DropZones` continuam vindos do `@puckeditor/core@0.21.1` e não foram introduzidos pelo código desta etapa.

## Checklist de pronto

- [x] Implementação concluída
- [x] Validação técnica concluída
- [x] Validação visual concluída
- [x] Task mestra atualizada
- [ ] Commit e push concluídos
