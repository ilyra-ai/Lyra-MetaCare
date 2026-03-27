# TASK 14 — Overlay Portals

## Objetivo

- Liberar interações específicas do canvas com segurança.
- Esta task existe como etapa operacional vinculada à task mestra ultra detalhada.

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

## Modo de execução

1. Ler a doc oficial inteira antes de editar código.
2. Aplicar a implementação somente dentro do escopo desta etapa.
3. Integrar com a Lyra Customaze UI UX e não com uma sandbox paralela.
4. Validar no navegador o reflexo real da etapa.
5. Atualizar a task mestra ao concluir.

## Checklist de pronto

- [ ] Implementação concluída
- [ ] Validação técnica concluída
- [ ] Validação visual concluída
- [ ] Task mestra atualizada
- [ ] Commit e push concluídos
