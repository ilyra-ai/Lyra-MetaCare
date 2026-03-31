# ═══════════════════════════════════════════════════════════════════
# INSTRUÇÕES DO PROJETO — AGENTS.md
# Complementa as instruções globais de ~/.codex/AGENTS.md
# ═══════════════════════════════════════════════════════════════════

## Stack do Projeto
<!-- Preencher conforme o projeto -->
- Runtime: Node.js 20+ / Bun / Deno
- Framework: Next.js 15 / React 19 / etc.
- Linguagem: TypeScript 5.x (strict mode)
- Estilização: Tailwind CSS 4.x / CSS Modules / etc.
- Banco de dados: PostgreSQL + Prisma / etc.
- Testes: Vitest / Jest / Playwright / etc.

## Convenções Específicas do Projeto
<!-- Preencher conforme o projeto -->
- Seguir o padrão de pastas existente
- Componentes em PascalCase, hooks em camelCase com prefixo "use"
- Imports organizados: externos → internos → tipos → estilos
- Mensagens de erro acessíveis e traduzidas em pt-br

## Comandos de Verificação do Projeto
```bash
npm run fix:format
npm run fix:lint
npm run check:lint
npm run check:format
npm run check:types
npm run test
npm run build
```

## Referências de Qualidade
- @current_problems — Verificar SEMPRE antes de começar
- docs/ — Documentação do projeto
- .env.example — Variáveis de ambiente necessárias