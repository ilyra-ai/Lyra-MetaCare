# O que a IA faz sozinha

A Lyra trabalha sem a pessoa precisar pedir. Este documento lista cada automação, o gatilho e a regra. As automações vêm da tarefa 43 e se somam ao coach diário descrito em [`coach.md`](./coach.md).

Princípio geral: **ausência de dado não é zero**. O que não foi medido aparece como "—". Também não entra nos cálculos, não vira conselho ("0 passos") e não vira status positivo falso.

## Gatilhos

| Gatilho                                                                        | O que acontece                                                                                                         |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Check-in do dia ou avaliação de humor (`POST /api/metricas/dia`)               | prontidão e recuperação do dia (e dos 7 seguintes), metas automáticas, prazos e sequências                             |
| Sessão da pulseira (`POST /api/metricas/sensor`)                               | o mesmo, e aviso no sino se a frequência chegou ao limite pessoal                                                      |
| Rotina diária no servidor (a partir das 3 h locais, `src/lib/coach/rotina.ts`) | "Seu dia" e notificações; metas com prazo vencido; sequências que não continuaram; plano de IA refeito para o novo dia |
| Abrir o app                                                                    | coach, escores, dica do dia, plano e metas releem os dados e se refazem quando o registro mudou                        |

## Automações

- **Prontidão e recuperação gravadas** (`src/lib/metricas/escores-do-dia.ts`). Usam a mesma regra do coach (`src/lib/coach/prontidao.ts`): só sinais medidos, com VFC e FC de repouso comparadas à média pessoal. Sem dados suficientes, o valor fica `NULL`. O painel, o gráfico semanal e o chat leem esses valores. A rota de escores não inventa mais longevidade 5 nem prontidão 50.
- **Metas automáticas** (`src/lib/metas`): passos, sono, água, meditação, minutos ativos e peso.
  - **Progresso:** média dos dias com registro em 7 dias. No peso, vale o valor mais recente em 30 dias, e a direção (reduzir ou aumentar) vem do alvo.
  - **Prazo:** com prazo vencido sem o alvo, a meta fica "Em atraso".
  - **Plano de IA:** sugere até 3 metas pelos objetivos do perfil, que viram meta com um clique.
- **Sequências** (`src/lib/kpi/streak-repository.ts`): registro do dia, sono ≥ 7 h, movimento (7.000 passos ou 30 min ativos), meditação e 2 L de água. São derivadas do registro, e o navegador não as declara. A aderência considera sempre as cinco.
- **Plano de IA com validade** (`src/lib/ai/plano-do-dia.ts`).
  - **Entradas:** média de 7 dias, prontidão de hoje, uma ação por objetivo do perfil e o céu do dia.
  - **Atualização:** refeito sozinho (sem consumir a cota de gerações manuais) quando é de outro dia ou o registro mudou.
- **Dica do dia** (`src/lib/ai/dica-do-dia.ts`): vem do conteúdo curado pela equipe, pela área que pede atenção hoje. A ordem de prioridade é sono, estresse, movimento, água e proteína. A tela mostra o motivo. Sem sinal que aponte uma área, a dica roda por dia.
- **Ações proativas** (`src/lib/ai/agent-engine.ts`): sem dados hoje, pedem o check-in em vez de afirmar "tudo em equilíbrio". Sem linha de base, informam os dias que faltam.
- **Monitoramento:** pareamento na própria página e gráfico só com leituras reais.
  - **Aviso de frequência alta:** a partir de 90% da FC máxima estimada pela idade (Tanaka: 208 − 0,7 × idade). Antes eram 120 bpm fixos.
  - **Sino:** o aviso também é gravado no sino a partir da sessão.
- **Insights védicos:** a tendência de 7 dias sai em ordem cronológica, só com dias registrados. A efeméride traz o dasha natal da pessoa logada.
- **Chat:** usa só as métricas de hoje ou de ontem e responde sobre o dia com os mesmos períodos do coach.

## Texto do coach por IA externa (opcional)

Com o consentimento específico da pessoa (Perfil → Privacidade e dados), revogável a qualquer momento, o texto do "Seu dia" é reescrito pelo Google Gemini com a chave do servidor (`GEMINI_API_KEY`).

- **Dados minimizados:** seguem só o texto já pronto do dia e os nomes do céu. Não seguem nome, e-mail, cidade, data de nascimento, métricas, ciclo nem sinais do corpo.
- **Horários sob controle da Lyra:** o Gemini só reescreve a manchete, o resumo e as sugestões dos períodos.
  - Uma resposta fora do formato ou com horário que não existe no dia é descartada.
  - Qualquer falha mantém o texto local.
- **Consentimento registrado:** o aceite fica em `consent_records` (tipo `coach_external_ai`, versão e data). A preferência fica em `profiles.coach_external_ai_since` (migração `022`).
- **Sem chave no servidor:** a opção aparece como indisponível.
