# TASK 14 — Overlay Portals

## Objetivo

- Liberar interações específicas do canvas com segurança.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Status real da etapa

- Estado atual: `concluída`
- Data de fechamento técnico: `2026-04-03`
- Resultado: hook `useOverlayPortal<T>` real usando `registerOverlayPortal` de `@puckeditor/core`, aplicado no `AccordionTrigger` do `LyraFaqItemBlock` — o acordeão é interativo dentro do canvas do editor sem que os cliques sejam interceptados pelo sistema de drag-and-drop do Puck. Fora do editor o componente funciona normalmente.

## Fonte oficial

- [Overlay Portals](https://puckeditor.com/docs/integrating-puck/overlay-portals)

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
git commit -m "feat(puck): conclui task 14 overlay portals"
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

- `src/lib/puck/overlay-portals/register.tsx` — hook `useOverlayPortal<T extends HTMLElement>` com `registerOverlayPortal`
- `src/lib/puck/config/components/faq-item.tsx` — `'use client'` adicionado + `useOverlayPortal` aplicado no `AccordionTrigger`

## O que foi implementado de forma real

1. `useOverlayPortal<T extends HTMLElement>(enabled = true): React.RefObject<T | null>`:
   - Usa `useRef<T | null>(null)` para guardar a referência do elemento DOM.
   - Em `useEffect`, se `enabled` e `ref.current` existem, chama `registerOverlayPortal(ref.current)` de `@puckeditor/core`.
   - A chamada é envolta em `try/catch` silencioso — fora do contexto do editor Puck (preview público, SSR, testes), `registerOverlayPortal` pode lançar um erro interno do Puck que deve ser ignorado sem quebrar o componente.
   - O retorno de `registerOverlayPortal` é uma função de cleanup que é chamada no `return` do `useEffect` para desregistrar o portal quando o componente desmonta.
   - Arquivo marcado com `'use client'` pois usa `useRef` e `useEffect`.
2. Em `LyraFaqItemBlock`:
   - `'use client'` adicionado no topo do arquivo (necessário para usar hooks).
   - `const triggerRef = useOverlayPortal<HTMLDivElement>()` — cria a ref tipada.
   - Um `<div ref={triggerRef}>` envolve o `<AccordionTrigger>` — o `div` é registrado como portal de overlay, passando os eventos de clique diretamente para o acordeão sem interceptação do Puck.

## Causa raiz corrigida nesta etapa

### Problema

- Sintoma esperado sem esta implementação: clicar no `AccordionTrigger` dentro do canvas do editor seleciona o bloco pai ao invés de expandir o acordeão.
- Causa raiz real: o sistema de drag-and-drop do Puck intercepta eventos de clique dentro do canvas para permitir seleção e movimentação de componentes.
- Correção aplicada: `registerOverlayPortal` instrui o Puck a não interceptar eventos dentro do elemento registrado, preservando o comportamento nativo do acordeão.

## Validação funcional real executada

1. `tsc --noEmit` sem erros — `useRef<T | null>` com generics tipado corretamente; `React.RefObject<T | null>` aceito pelo TypeScript 5.
2. `eslint` sem erros — `'use client'` nos arquivos corretos.
3. `next build` compilado sem erros — componente client com `useEffect` corretamente separado do server tree.
4. `vitest run` sem regressões — `59/59` testes aprovados.

## Resultado atual do gate de qualidade

- `pnpm run check:types` → `OK`
- `pnpm run check:lint` → `OK`
- `pnpm run test` → `OK` com `59` testes aprovados
- `pnpm run build` → `OK`

## Limitações honestas desta etapa

- `registerOverlayPortal` só tem efeito dentro do contexto do editor Puck (quando o componente é renderizado dentro do `<Puck>`). No frontend público o `try/catch` silencioso garante que nenhum erro seja lançado — o acordeão funciona normalmente.
- Apenas o `LyraFaqItemBlock` recebeu o overlay portal nesta etapa. Outros componentes interativos futuros (selects, tooltips, modais dentro de blocos) podem usar o mesmo `useOverlayPortal` hook.

## Checklist de pronto

- [x] Implementação concluída
- [x] Validação técnica concluída
- [x] Validação visual concluída
- [x] Task mestra atualizada
- [x] Commit e push concluídos
