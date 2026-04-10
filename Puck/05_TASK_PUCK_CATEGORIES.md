# TASK 05 — Categories

## Objetivo

- Organizar o catálogo do Puck com taxonomia limpa e usável.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Fonte oficial

- [Categories](https://puckeditor.com/docs/integrating-puck/categories)

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
git commit -m "feat(puck): conclui task 05 categories"
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

- Arquivo criado:
  - `src/lib/puck/config/categories.ts`
- Arquivo alterado:
  - `src/lib/puck/config/base.tsx`

## O que foi implementado

As categorias do Puck agora estão agrupadas com títulos em pt-BR e comportamento contextual por superfície:

1. `Fundamentos editoriais`
   - `LyraHeadingBlock`
   - `LyraBodyTextBlock`

2. `Narrativa e contexto`
   - `LyraHeroBlock`
   - `LyraFeatureCardBlock`
   - `LyraFaqItemBlock`

3. `Ação e conversão`
   - `LyraCTAButtonBlock`
   - `LyraFeatureCardBlock`

4. `Estrutura e layout`
   - `LyraSectionContainerBlock`
   - `LyraStackContainerBlock`
   - `LyraFixedColumnsBlock`
   - `LyraFluidGridBlock`

5. `Métricas e mosaicos`
   - `LyraMetricCardBlock`
   - `LyraGridTileBlock`

6. `Outros blocos`
   - Categoria `other` com título customizado

## Regras por superfície

- `landing-home`
  - `Narrativa e contexto` expande por padrão
- `login-experience`
  - `Ação e conversão` expande por padrão
- `app-shell`
  - `Narrativa e contexto` fica oculta para reduzir ruído operacional
  - `Métricas e mosaicos` permanece visível

## Causa raiz corrigida

- Problema encontrado:
  - A primeira modelagem tentou reaproveitar o genérico profundo de `Config` do Puck para tipar `categories`.
- Impacto:
  - O `check:types` falhou com incompatibilidade entre o shape interno do `Config` e o contrato simplificado que precisamos para a Lyra.
- Causa raiz:
  - O genérico do `Config` do Puck é rígido demais para esse reaproveitamento lateral.
- Correção aplicada:
  - As categorias passaram a usar um contrato local serializável e explícito em `categories.ts`.
- Resultado:
  - O TypeScript voltou a aceitar a configuração sem gambiarras.

## Validação técnica real

Comandos executados:

```bash
pnpm run check:types
pnpm run check:lint
```

Resultado:

- `check:types`: passou
- `check:lint`: passou

## Validação visual real no navegador

Validação feita no editor administrativo `http://127.0.0.1:3000/admin/puck`.

### `landing-home`

A inspeção real do DOM do editor confirmou:

- `Fundamentos editoriais`
- `Narrativa e contexto`
- `Ação e conversão`
- `Estrutura e layout`
- `Métricas e mosaicos`

Também foi confirmado que os blocos aparecem agrupados sob essas categorias no painel.

### `app-shell`

A inspeção real do editor confirmou:

- `Fundamentos editoriais`: visível
- `Narrativa e contexto`: oculto
- `Ação e conversão`: visível
- `Estrutura e layout`: visível
- `Métricas e mosaicos`: visível

## Evidência visual gerada

- `task05-categorias-landing-restart.png`
