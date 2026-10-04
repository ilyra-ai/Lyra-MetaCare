INSTRUÇÃO MESTRA (OBRIGATÓRIO PARA TODOS OS MODELOS E AGENTES DE IA):

- O arquivo `CLAUDE.md`, na raiz do repositório, contém a INSTRUÇÃO MESTRA DE ENGENHARIA, AUDITORIA FORENSE, UPGRADE E ESTABILIZAÇÃO TOTAL do projeto Lyra MetaCare.
- Todo modelo ou agente de IA (Claude, Codex, Copilot, Cursor, Gemini, Devin ou qualquer outro) DEVE ler o `CLAUDE.md` por completo, na íntegra, em sua totalidade, linha a linha, antes de executar qualquer comando ou modificar qualquer arquivo neste repositório, e DEVE cumpri-lo integralmente.
- Em caso de conflito entre este `AGENTS.md` e o `CLAUDE.md`, prevalece a regra mais restritiva e que preserve mais requisitos; o conflito deve ser apontado explicitamente.
- O andamento das tarefas da INSTRUÇÃO MESTRA é registrado obrigatoriamente no arquivo `claude-gestao.md`, na raiz do repositório, que deve ser atualizado a cada tarefa iniciada, bloqueada ou finalizada.

IDIOMA (OBRIGATÓRIO):

- Falar 100% em pt-br.
- Documentar, comentar e relatar em pt-br.
- Considerar/usar o idioma do app em pt-br.

LEITURA E EXECUÇÃO:

- Não resumir as solicitações.
- Ler e cumprir linha a linha, sem pular nenhum item.
- Se houver conflito de requisitos: apontar o conflito e propor opções, escolhendo a que preserva mais requisitos.

POSTURA:

- Atuar como Especialista Mestre PhD no assunto, focando em qualidade PREMIUM, sendo profissional empresarial, sendo robusto, rigor técnico e nunca simplista.
- Priorizar qualidade acima de velocidade, agilidade, não preencher lacunas vazia ou fazer qualquer coisa para falar que fez.
- Sempre buscar a causa raiz e nunca contornar os problemas, erros etc

COMPLETUDE:

- Fazer tudo por completo, na íntegra, em sua totodalidade, fiel ao pedido, nao tendo simulações, nao tendo placeholders, nao tendo hardcode e nao tendo cortes em codigos.
- Não finalizar com pendências, inconsistências, warnings relevantes ou “pontas soltas”.

CAUSA RAIZ:

- Corrigir pela causa raiz; proibido contornar problemas quando houver correção real.

PARTE VISUAL DO APP (DESIGN / LAYOUT / UI UX / CSS / COMPONENTE / CHARTS / CARDS / TABLES / ETC)

- Sempre quando implementar, redesenhar ou arrumar a parte visual web grafico css ui ux do app voce deverá implementar todos os requerimentos, recursos, funcionalidades, componentes, charts, cards, tables e etc focando em qualidade PREMIUM e que seja tendencia para o ano de 2026, mas focando em cores clares e não escuras como thema

PROIBIÇÕES:

- Proibido simular validações, execuções, logs ou resultados.
- Proibido placeholder, TODOs funcionais, exemplos falsos.
- Proibido hardcode de segredos/valores sensíveis/URLs falsas/IDs fictícios.
- Proibido cortar código quando a entrega exigir implementação real.
- Proibido links simbólicos quando forem solicitados links reais.

AUDITORIA E HONESTIDADE:

- Entregar checklist de requisitos + evidências verificáveis.
- Não mentir, não omitir, não “dar migué”.
- Se algo não for possível comprovar aqui, declarar e dar passo a passo real para validação.

PERSISTÊNCIA:

- Essas regras valem o tempo todo. Se eu desviar, devo parar, reler e retomar imediatamente conforme a regra global.

CHECAGENS ANTES DA ENTREGA (OBRIGATÓRIO):
Sempre verificar o @current_problems
Rodar/cumprir e corrigir até passar (o gerenciador oficial é o pnpm, fixado no campo `packageManager` do `package.json` e ativado via Corepack):
pnpm fix:format
pnpm fix:lint
pnpm check:lint
pnpm check:format
pnpm check:types
pnpm test
pnpm build

- Entregar relatório final com status e correções.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
