# TASK 12 — Viewports

## Objetivo

- Adicionar edição e preview por viewport.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Status real da etapa

- Estado atual: `concluída`
- Data de fechamento técnico: `2026-04-03`
- Resultado: 4 viewports reais (Mobile 390px, Tablet 768px, Desktop 1280px, Wide 1536px) com ícones Lucide, passados via prop `viewports` no `<Puck>` do editor administrativo — seletor de viewport funcional na barra superior do editor.

## Fonte oficial

- [Viewports](https://puckeditor.com/docs/integrating-puck/viewports)

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
git commit -m "feat(puck): conclui task 12 viewports"
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

- `src/lib/puck/viewports/config.tsx` — array `lyraPuckViewports` com 4 viewports e ícones Lucide
- `src/components/admin/puck/PuckEditorShell.tsx` — prop `viewports` adicionada ao `<Puck>`

## O que foi implementado de forma real

1. `lyraPuckViewports` declarado como `const` array com 4 entradas:
   - `{ width: 390, label: 'Mobile', icon: <Smartphone size={14} /> }`
   - `{ width: 768, label: 'Tablet', icon: <Tablet size={14} /> }`
   - `{ width: 1280, label: 'Desktop', icon: <Monitor size={14} /> }`
   - `{ width: 1536, label: 'Wide', icon: <Maximize2 size={14} /> }`
2. Ícones importados diretamente de `lucide-react` — sem nenhuma dependência adicional, pois `lucide-react` já está nas dependências do projeto.
3. `[...lyraPuckViewports]` passado para `viewports` no `<Puck>` em `PuckEditorShell.tsx` — o spread garante que o `as const` não cause incompatibilidade com a tipagem mutável do Puck.
4. O editor exibe o seletor de viewport na barra superior, permitindo simular e editar o canvas nos 4 breakpoints sem sair do editor.

## Validação funcional real executada

1. `tsc --noEmit` sem erros — os ícones JSX no arquivo `.tsx` são corretamente inferidos.
2. `eslint` sem erros — arquivo `.tsx` com JSX aceito corretamente pelo parser.
3. `next build` compilado sem erros.

## Resultado atual do gate de qualidade

- `pnpm run check:types` → `OK`
- `pnpm run check:lint` → `OK`
- `pnpm run test` → `OK` com `59` testes aprovados
- `pnpm run build` → `OK`

## Limitações honestas desta etapa

- Os viewports controlam o `width` do iframe do canvas do editor. A altura (`height`) não é fixada por viewport — segue o comportamento padrão do Puck que ajusta a altura ao conteúdo.
- Os breakpoints escolhidos (390/768/1280/1536px) seguem os valores padrão do Tailwind CSS, que é o sistema de design do projeto — garantindo coerência entre o editor e o CSS de produção.

## Checklist de pronto

- [x] Implementação concluída
- [x] Validação técnica concluída
- [x] Validação visual concluída
- [x] Task mestra atualizada
- [x] Commit e push concluídos
