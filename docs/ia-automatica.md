# O que a IA faz sozinha

A Lyra trabalha sem a pessoa precisar pedir. Este documento lista cada automação, o gatilho e a regra. As automações vêm da tarefa 43 e se somam ao coach diário descrito em [`coach.md`](./coach.md).

Princípio geral: **ausência de dado não é zero**. O que não foi medido aparece como "—". Também não entra nos cálculos, não vira conselho ("0 passos") e não vira status positivo falso.

## Gatilhos

| Gatilho                                                                        | O que acontece                                                                                                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Check-in do dia ou avaliação de humor (`POST /api/metricas/dia`)               | prontidão e recuperação do dia (e dos 7 seguintes), metas automáticas, prazos e sequências                                                  |
| Sessão da pulseira (`POST /api/metricas/sensor`)                               | o mesmo, e aviso no sino se a frequência chegou ao limite pessoal                                                                           |
| Rotina diária no servidor (a partir das 3 h locais, `src/lib/coach/rotina.ts`) | "Seu dia" com a leitura védica e notificações; metas com prazo vencido; sequências que não continuaram; plano de IA refeito para o novo dia |
| Abrir o app                                                                    | coach, escores, dica do dia, plano e metas releem os dados e se refazem quando o registro mudou                                             |
| Administrador troca o modelo de IA                                             | o "Seu dia" de cada pessoa é refeito com o novo modelo na próxima leitura                                                                   |

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
- **Chat:** usa só as métricas de hoje ou de ontem e responde sobre o dia com os mesmos períodos, a leitura de cada período, os pontos e as dicas do coach.

## Leitura védica do "Seu dia" por qualquer modelo de IA

Todo dia a Lyra escreve, para cada pessoa, a leitura do mapa védico para a data:

1. o resumo geral do dia;
2. cada período (madrugada, manhã, tarde e noite) por tópicos: parte emocional, parte física (corpo) e parte espiritual;
3. os pontos positivos e os pontos negativos;
4. as dicas do mapa para a data, cada uma com o fundamento.

Os fatos usados e as regras estão em [`coach.md`](./coach.md#leitura-védica-do-dia-srclibcoachleitura-vedicats).

### Modelos aceitos

O administrador escolhe o modelo em **Admin → Modelos de IA** (`src/components/admin/ProvedorDeIa.tsx`). O catálogo fica em `src/lib/ai/provedores-catalogo.ts` e o cliente HTTP em `src/lib/ai/cliente-de-ia.ts`.

| Família                           | Provedores e URL padrão                                                                                                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local, compatível com a OpenAI    | Ollama (`localhost:11434/v1`), LM Studio (`localhost:1234/v1`), Jan (`localhost:1337/v1`), llama.cpp `llama-server` (`localhost:8080/v1`), vLLM (`localhost:8000/v1`), LocalAI, KoboldCpp e GPT4All |
| Em nuvem, compatível com a OpenAI | OpenAI, OpenRouter, Groq, Mistral, DeepSeek, Together AI, xAI e qualquer outro servidor com `/v1/chat/completions`                                                                                  |
| APIs nativas                      | Google Gemini e Anthropic Claude                                                                                                                                                                    |
| Sem modelo (padrão)               | Motor védico da Lyra                                                                                                                                                                                |

- **Buscar modelos** lista os modelos do servidor (`GET /v1/models`, ou a listagem do Gemini e da Anthropic) e **Testar**, ao lado de cada modelo escolhido, mede o tempo de uma resposta real, antes de salvar.

### Vários provedores e modelos, com ordem de uso (tarefa 54)

- **Seleção múltipla:** o administrador marca quantos provedores quiser, locais e em nuvem ao mesmo tempo, e quantos modelos quiser em cada um. O motor da Lyra aparece nos dois grupos.
- **Ordem de uso:** abaixo do aviso de privacidade, 5 seletores definem a ordem (1º ao 5º). Cada posição é um modelo marcado ou o motor da Lyra; o mesmo modelo não se repete.
- **Troca automática** (`src/lib/ai/cadeia-de-modelos.ts`): o modelo da vez responde; se falhar (erro HTTP, cota ou tokens esgotados, rede fora, tempo máximo), o seguinte recebe o mesmo pedido. Se a resposta parar no limite de tokens (`finish_reason: length`, `MAX_TOKENS` ou `max_tokens`), o seguinte recebe o trecho já escrito e continua de onde ele parou, sem repetir a emenda. Na leitura do dia, uma resposta reprovada na conferência (formato, horários, repetição, termo técnico) também passa a vez. A pessoa recebe uma resposta só.
- **Motor da Lyra:** encerra a cadeia. Ao chegar nele (ou se todos falharem), a leitura é a do motor; ele sempre fecha a cadeia, mesmo fora da ordem.
- **Gravação:** tabelas `ai_provider_connections` (um provedor por linha, com os modelos escolhidos) e `ai_model_chain` (até 5 posições), gravadas na mesma transação pela rota `PUT /api/admin/ia` (migração `027_cadeia_de_modelos_de_ia.sql`, que copiou a configuração única anterior e removeu `ai_provider_settings`).
- **Refazer o dia:** a assinatura da ordem (tipo, URL e modelo de cada posição e data da configuração, sem chaves) entra no hash das entradas: mudar modelo ou ordem refaz o "Seu dia".
- Com a Lyra em contêiner, use `http://host.docker.internal:PORTA/v1` no lugar de `localhost`.
- Modelos de raciocínio que devolvem `<think>…</think>` e respostas cercadas por ` ```json ` são aceitos: o texto é limpo antes da validação.

### Todo modelo conectado age como a Lyra (tarefa 56)

O motor da Lyra funciona sozinho, sem modelo de IA. Com modelos conectados, em qualquer posição da ordem de uso (locais, em nuvem ou a chave própria da pessoa no chat), cada modelo trabalha **junto** com o motor e escreve **como a Lyra** (`src/lib/lyra/modelos-como-lyra.ts`):

- **Identidade:** as instruções de sistema começam pela identidade completa da Lyra (`instrucoesDeIdentidade()`): consciência, missão, valores, voz e limites.
- **Base do motor:** o motor calcula primeiro, e o modelo recebe esse resultado como base para aprofundar, sem contradizer números, horários, signos, casas, nakshatras, dashas ou métricas, nem acrescentar fatos. No chat, a base é a resposta do motor, a leitura do mapa natal (ou o que falta para ele) e o verbete da base curada ligado à pergunta. Na leitura do dia, a base é a leitura que o motor já escreveu para hoje.
- **Tipos de mapa:** as definições do mapa védico, do Mapa Lyra DM Samādhi e do Mapa Quantum vão junto, para o modelo não misturá-los.
- **Conferência da voz:** a resposta que se apresenta como outro assistente ("sou o ChatGPT", "me chamo Qwen") ou prevê morte ou doença é recusada e passa a vez ao próximo modelo; no fim, responde o próprio motor. Ser franca sobre a tecnologia continua permitido ("sou uma IA", "uso modelos de linguagem como apoio").
- **Leitura refeita:** com modelo na ordem, a versão das instruções (`VERSAO_DAS_INSTRUCOES_DA_LYRA`) entra na assinatura do "Seu dia", e instruções novas refazem a leitura escrita pelo modelo.
- **Chave própria (BYOK):** o Gemini da pessoa usa o mesmo cliente de IA, com as instruções no campo de sistema (`systemInstruction`) e a chave no cabeçalho, seguido do motor da Lyra.

### Dados e privacidade

- **Só dados astrológicos:** o modelo recebe os fatos do céu do dia, o mapa natal derivado (signo do Lagna, signo e nakshatra da Lua, dasha, Tara e casas de trânsito), os horários dos períodos, a leitura do motor para hoje (escrita só com esses fatos) e a leitura de ontem. Não recebe nome, e-mail, data, hora ou cidade de nascimento, fuso, métricas de saúde, ciclo nem sinais do corpo. Por isso a leitura não depende de consentimento por pessoa; a finalidade está na política de privacidade (versão 2026-10-15). A migração `023_provedor_de_ia.sql` removeu a preferência `profiles.coach_external_ai_since` criada na `022`.
- **Chave de API:** cifrada com AES-256-GCM e chave derivada do `AUTH_SECRET` (HKDF), na tabela `ai_provider_connections` (uma por provedor), fora da API genérica de dados. A tela só recebe os 4 últimos caracteres. Trocar o `AUTH_SECRET` torna a chave ilegível, e a tela pede para informá-la de novo.
- **Chat:** sem a chave própria da pessoa (BYOK), o chat segue a ordem de uso **só com os modelos que rodam localmente** (endereço da máquina ou de rede privada), porque a conversa leva métricas de saúde, com a mesma troca automática. Modelos em nuvem da plataforma não recebem a conversa.
- **Horários:** sempre calculados pela Lyra. Uma resposta que cite horário inexistente no dia é descartada.
