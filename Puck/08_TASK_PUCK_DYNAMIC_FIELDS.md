# TASK 08 — Dynamic Fields

## Objetivo

- Criar fields condicionais e contextuais.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

## Status real da etapa

- Estado atual: `concluída`
- Data de fechamento técnico: `2026-03-31`
- Resultado: `dynamic fields` reais funcionando no Hero, no Card de Métrica e no Root, com reação contextual no painel lateral do Puck e persistência sem quebra.

## Fonte oficial

- [Dynamic Fields](https://puckeditor.com/docs/integrating-puck/dynamic-fields)

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
git commit -m "feat(puck): conclui task 08 dynamic fields"
git push origin main
```

## Comandos realmente executados nesta etapa

```bash
cd /home/ilyra/Lyra-MetaCare && pnpm run check:types
cd /home/ilyra/Lyra-MetaCare && pnpm run test
cd /home/ilyra/Lyra-MetaCare && pnpm run fix:format
cd /home/ilyra/Lyra-MetaCare && pnpm run fix:lint
cd /home/ilyra/Lyra-MetaCare && pnpm run check:lint
cd /home/ilyra/Lyra-MetaCare && pnpm run check:format
cd /home/ilyra/Lyra-MetaCare && pnpm run check:types
cd /home/ilyra/Lyra-MetaCare && pnpm run test
cd /home/ilyra/Lyra-MetaCare && pnpm run build
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
- `src/lib/puck/config/initial-data.ts`
- `src/lib/puck/fields/dynamic/shared.ts`
- `src/lib/puck/fields/dynamic/hero.ts`
- `src/lib/puck/fields/dynamic/metric-card.ts`
- `src/lib/puck/fields/dynamic/root.ts`
- `src/lib/puck/fields/dynamic/index.ts`
- `src/lib/puck/fields/dynamic/fields.test.ts`

## O que foi implementado de forma real

1. `Hero` com campos condicionais:
   - campos editoriais manuais escondem quando a fonte dinâmica deixa de ser manual
   - CTA alterna entre `Link manual` e `Tela pública da Lyra`
2. `Card de métrica` com campos condicionais:
   - modo dinâmico de assinatura simplifica o painel e oculta campos manuais irrelevantes
   - opções de ícone mudam conforme a tendência manual
3. `Root` com campos condicionais e assíncronos:
   - rótulos mudam conforme a superfície selecionada
   - opções de tema mudam conforme `surfaceKey`
   - `resolvedContextSummary` aparece apenas quando o contexto vem da sessão
4. Persistência real do Hero melhorada:
   - `ctaDocumentKey` agora é persistido explicitamente quando o CTA usa uma tela pública da Lyra
5. Testes automatizados cobrindo as regras centrais de visibilidade e opções.

## Validação funcional real executada

1. Login administrativo real com `admin@admin.com`.
2. Acesso real à rota `http://localhost:3000/admin/puck?documentKey=landing-home`.
3. Seleção real do `Hero` no `preview-frame`.
4. Verificação visual real:
   - com `dynamicSource = session-profile`, os campos editoriais manuais ficam ocultos
   - ao alternar o CTA para `Tela pública da Lyra`, o campo `Link manual do CTA` desaparece e o campo de destino público aparece
5. Seleção real do `Card de métrica` no `preview-frame`.
6. Verificação visual real:
   - com `dynamicSource = subscription-summary`, o painel mostra apenas o que faz sentido para o modo dinâmico
   - os campos manuais de valor, unidade, tendência e ícone deixam de aparecer
7. Verificação real do `Root`:
   - em `landing`, os rótulos mostram `Título da landing pública`, `Descrição estrutural da landing pública` e `Regras de visibilidade pública`
   - em `app-shell`, os rótulos mudam para `Título da shell autenticado`, `Tema do shell autenticado` e `Regras de visibilidade do shell`
   - o campo `Resumo dinâmico para Admin` aparece quando `dynamicSource = session-context`
8. Salvamento real do rascunho via `PUT /api/admin/puck/documents/landing-home` com resposta `200`.
9. Confirmação real de payload salvo contendo:
   - `ctaMode: "surface-route"`
   - `ctaDocumentKey: "login-experience"`

## Causa raiz corrigida nesta etapa

### Problema 1

- Sintoma: ao usar `Tela pública da Lyra`, o Hero salvava `ctaMode`, mas podia deixar `ctaDocumentKey` implícito no fallback.
- Causa raiz real: o fallback do documento resolvia a rota na renderização, porém não persistia explicitamente a chave do destino no `resolveData`.
- Correção aplicada: `resolverPropsHeroDinamicos` passou a persistir `ctaMode` e `ctaDocumentKey` explicitamente.

### Problema 2

- Sintoma: a primeira implementação de `resolveFields` no `Root` quebrou a tipagem.
- Causa raiz real: sombra de variável entre os parâmetros da fábrica de configuração e os parâmetros do callback `resolveFields`.
- Correção aplicada: separação explícita entre `configParams` e `resolverParams`.

### Problema 3

- Sintoma: campos `select` dinâmicos de `icon` e `themeVariant` falhavam na tipagem.
- Causa raiz real: o TypeScript ainda enxergava o campo genérico como união ampla de tipos de campo.
- Correção aplicada: narrowing explícito por `type === 'select'` antes de sobrescrever `options`.

## Resultado atual do gate de qualidade

- `pnpm run fix:format` → `OK`
- `pnpm run fix:lint` → `OK`
- `pnpm run check:lint` → `OK`
- `pnpm run check:format` → `OK`
- `pnpm run check:types` → `OK`
- `pnpm run test` → `OK` com `59` testes aprovados
- `pnpm run build` → `OK`

## Limitações honestas desta etapa

- Esta task entrega `dynamic fields` reais com comportamento contextual, mas não declara paridade total com Elementor.
- Os warnings de `DropZones have been deprecated...` continuam vindo do `@puckeditor/core@0.21.1` e não foram introduzidos pelo código local da Lyra.

## Checklist de pronto

- [x] Implementação concluída
- [x] Validação técnica concluída
- [x] Validação visual concluída
- [x] Task mestra atualizada
- [x] Commit e push concluídos
