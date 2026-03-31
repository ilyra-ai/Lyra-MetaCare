# TASK 06 — Rich Text Editing

## Objetivo

- Habilitar rich text inline e persistente.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Fonte oficial

- [Rich Text Editing](https://puckeditor.com/docs/integrating-puck/rich-text-editing)

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
git commit -m "feat(puck): conclui task 06 rich text editing"
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
- [x] Commit e push concluídos

## O que foi implementado de verdade

- Campo reutilizável de rich text em `src/lib/puck/config/fields/rich-text.tsx`.
- Renderização segura e tipada em `src/lib/puck/render/rich-text-renderer.tsx`.
- Sanitização explícita de HTML em `src/lib/puck/sanitization/rich-text.ts`.
- Migração real dos blocos:
  - `LyraBodyTextBlock`
  - `LyraFaqItemBlock`
- Atualização de tipos em `src/lib/puck/types.ts`.

## Validação real executada

### Navegador

- Rota validada: `http://127.0.0.1:3000/admin/puck?documentKey=landing-home`
- Sessão validada com usuário administrador real.
- Persistência real executada via browser autenticado:
  - `PUT /api/admin/puck/documents/landing-home` → `200`
  - `POST /api/admin/puck/documents/landing-home` → `200`
- Conteúdo rico confirmado dentro do `iframe` do canvas:
  - `Este texto rico valida a TASK 06 com ênfase real e uma lista editorial.`
  - `Primeiro item validado`
  - `Segundo item com realce`
  - `A resposta do FAQ agora aceita texto rico, listas e formatação real.`
  - `Publicação e preview renderizam o HTML sanitizado com segurança.`
- Toolbar real confirmada após seleção do bloco textual:
  - `Bold`
  - `Italic`
  - `Underline`
  - `Strikethrough`

### Gate técnico

```bash
pnpm run fix:format
pnpm run fix:lint
pnpm run check:lint
pnpm run check:format
pnpm run check:types
pnpm run test
pnpm run build
```

Todos passaram com sucesso.

## Causa raiz corrigida nesta etapa

- O editor textual da Lyra ainda tratava conteúdo editorial como `textarea` simples.
- Isso impedia inline editing real, impossibilitava toolbar semântica e achatava o conteúdo para string simples.
- Também havia risco de regressão porque os blocos convertiam o valor recebido com `String(...)`, o que destruiria conteúdo rico.
- A correção real foi:
  - trocar o schema de campo para `richtext`
  - preservar o tipo rico na camada `render`
  - introduzir sanitização explícita para renderização HTML
  - validar persistência e publicação reais no documento `landing-home`

## Limitação honesta

- Permanecem warnings de `DropZones have been deprecated...`, mas a causa raiz está no `@puckeditor/core@0.21.1` e não no código local alterado nesta task.
