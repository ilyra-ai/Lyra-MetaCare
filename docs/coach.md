# Coach diário ("Seu dia")

Todos os dias o coach prepara, para cada pessoa, como será o dia dela: o tom do dia, a prontidão do corpo, os quatro períodos (madrugada, manhã, tarde e noite) com os horários bons e os de cautela, e recomendações de saúde, alimentação, movimento, mente e sono. Cada dica traz o **"Por quê?"** com a origem (sinal do corpo, Panchang, mapa natal ou Ayurveda).

São orientações de bem-estar e autoconhecimento: não substituem avaliação profissional de saúde.

## Onde aparece

- **Painel:** cartão "Seu dia" no topo, com manchete, o resumo geral da leitura védica, anel de prontidão, faixa das 24 h com o "Agora" ao vivo, o período atual com as partes emocional, física e espiritual e os três focos do dia.
- **Meu dia (`/dia`):** relógio radial das 24 h; a **leitura do dia**, na ordem: 1) resumo geral, 2) cada período (madrugada, manhã, tarde e noite) por tópicos, parte emocional, parte física (corpo) e parte espiritual, 3) pontos positivos e pontos negativos, 4) as dicas do mapa védico para a data, cada uma com o fundamento; depois os horários por período, focos e cuidados práticos, recomendações por área, o céu de hoje (Panchang, Tara Bala, dasha, dosha, ciclo) e a **reflexão da noite** (ver abaixo), junto com a avaliação "a leitura de hoje te ajudou?".
- **Sino:** "Seu dia está pronto" e os alertas do dia (Chandrashtama e sinais precoces do corpo). Abrir o sino marca como lidas.
- **Chat:** perguntas sobre o dia ("como vai ser meu dia?", "e a tarde?") respondem com os mesmos períodos e horários.
- **Atalho:** `G` e depois `H` abre o "Meu dia" (os atalhos `G + letra` da paleta `Ctrl+K` passaram a funcionar).

## Entradas (todas reais)

`src/lib/coach/contexto.ts` lê do banco:

- **Perfil:** cidade onde mora (ou, sem ela, a de nascimento) com coordenadas e fuso; data, hora e cidade de nascimento; nome; ciclo menstrual quando acompanhado.
- **Métricas:** o registro de hoje e os 7 dias anteriores (`daily_metrics`), vindos do check-in e da pulseira Bluetooth.

O SHA-256 dessas entradas fica em `daily_briefings.inputs_hash`. Ao abrir o app, se algo mudou (check-in, sessão da pulseira, cidade), o dia é refeito na hora; senão, o briefing guardado é reaproveitado.

## Regras do motor local (`src/lib/coach/gerador-local.ts`)

- **Prontidão** (`prontidao.ts`): sono, VFC e FC de repouso (comparadas à média pessoal quando há 3 ou mais dias), energia, estresse e humor. Só entra o que foi medido, com pesos renormalizados; com menos de dois sinais no dia, a prontidão fica **sem valor** (nunca um neutro inventado) e o coach pede o check-in.
- **Períodos** (`periodos.ts`): nota de 0 a 100 pela fração de Choghadiya favorável (Amrit, Shubh, Labh = 1; Char = 0,5; Udveg, Kaal, Rog = 0), menos Rahu Kalam (0,6), Yamaganda (0,4) e Gulika (0,3), mais Abhijit (0,3). A madrugada usa a Choghadiya da noite anterior. Brahma Muhurta e a troca de nakshatra aparecem como destaques.
- **Melhor janela:** Abhijit Muhurta (fora de quarta-feira), depois Amrit, Shubh e Labh, sempre sem sobrepor Rahu Kalam, Yamaganda ou Gulika.
- **Treino:** intensidade pela prontidão (≥ 75 intenso, 55–74 moderado, < 55 leve); em nakshatra suave (mridu) o treino forte vira técnico. Horário numa Choghadiya favorável ou Char, fora das cautelas, com a preferência do dosha do dia (Kapha cedo, Pitta fora das 11 h–15 h) e, se houver alternativa, fora da janela de foco.
- **Tom do dia:** Tara Bala, Chandra Bala (Chandrashtama pesa −2), yoga, karana Vishti, tithi Rikta e a nota média do dia. Fica **atenção** com Chandrashtama, prontidão < 40, sinais precoces de atenção ou céu muito desfavorável.
- **Relógio do corpo:** luz natural na primeira hora após o nascer do sol, refeição principal no meio-dia solar, deitar cerca de 8 h antes do próximo nascer do sol (entre 21 h e 23 h), jantar 3 h e última cafeína 9 h antes de deitar.
- **Alimentação:** dosha do dia (`calculateDynamicDosha`), água (35 ml/kg) e proteína (1,2 a 1,6 g/kg) quando há peso registrado, Ekadashi (11º tithi) como opção tradicional e a fase do ciclo.
- **Mente:** respiração pela prontidão e pelo estresse (4-7-8, quadrada ou Nadi Shodhana), intenção do nakshatra e lembrete de meditação se não houve nenhuma em 7 dias.
- **Alertas:** sinais precoces (`evaluateEarlyWarning`) e Chandrashtama.

As mesmas entradas geram sempre o mesmo briefing (testes em `src/lib/coach/coach.test.ts`).

## Leitura védica do dia (`src/lib/coach/leitura-vedica.ts`)

Os fatos de cada período, calculados no meio do período e no lugar do dia:

- **Lua:** signo (elemento e tom emocional), nakshatra e divindade, Tara a partir do nakshatra natal e casa a partir da Lua natal.
- **Ascendente (Lagna) do momento:** a região do corpo regida pelo signo (Kalapurusha) e o elemento.
- **Horas planetárias** (`src/lib/astrology/horas.ts`): 12 horas do dia e 12 da noite, a primeira do regente do dia da semana e as seguintes na ordem caldeia; a que mais ocupa o período dá a prática espiritual e o mantra.
- **Relógio do Ayurveda:** Kapha 6 h–10 h e 18 h–22 h, Pitta 10 h–14 h e 22 h–2 h, Vata 2 h–6 h e 14 h–18 h.
- **Do dia:** Panchang, Tara Bala, Chandra Bala, trânsitos de Júpiter (favorável nas casas 2, 5, 7, 9 e 11 a partir da Lua) e de Saturno (Sade Sati nas casas 12, 1 e 2; Ashtama Shani na 8ª), dasha vigente e a melhor janela.

O motor da Lyra escreve a leitura com esses fatos; como o céu muda (tithi, nakshatra, dia da semana, horas, ascendente), cada dia sai diferente. Com um modelo de IA configurado (`src/lib/coach/leitura-ia.ts`), o modelo recebe os mesmos fatos e a leitura de ontem, para não repetir, e a resposta só é aceita com o formato completo (Zod), os quatro períodos, horários que existem no dia e resumo diferente do de ontem. Uma falha mantém a leitura da Lyra e uma nova tentativa acontece depois de 30 minutos. Trocar o modelo refaz o dia.

## Aura do dia (tarefa 44)

O topo do "Meu dia" passou a ser a **Aura do dia**: o anel da prontidão envolto por um halo chapado na cor do tom do dia (verde no dia favorável, coral no dia de equilíbrio, âmbar no dia de atenção; sem brilho nem desfoque, como pede o Lyra Clean), o selo do tom e da Lua do dia ("Lua em Jyeshtha") e três ações à mão: **Respirar agora** (abre `/respiracao` com a técnica recomendada), **Levar para o calendário** (leva às janelas de hoje, com o .ics e a assinatura) e **Reflexão da noite** (leva à seção de reflexão). Logo abaixo da leitura do dia ficam, em grade, as janelas de hoje, a respiração guiada e a semana.

## Reflexão da noite (tarefa 44)

Fecha o ciclo do dia no "Meu dia" (`#reflexao`): a pessoa dá uma nota de 1 a 5 para a parte **emocional**, o **corpo** e a parte **espiritual** (as mesmas dimensões da leitura) e escreve uma frase opcional de até 280 caracteres. Na mesma seção fica a avaliação "a leitura de hoje te ajudou?".

- API `/api/reflexao` (sessão obrigatória, só a própria conta): `GET` lê, `PUT` grava ou substitui, `DELETE` apaga. A data é conferida no servidor pelo fuso da cidade da pessoa (o mesmo "hoje" do coach) e aceita hoje e ontem, para quem reflete depois da meia-noite; qualquer outra data é recusada (400).
- Validação compartilhada entre a tela e o servidor (`src/lib/reflexao/esquema.ts`): notas inteiras de 1 a 5, frase sem caracteres de controle e sem espaços nas pontas (vazia vira "sem frase"), campos desconhecidos recusados.
- Tabela `daily_reflections` (migração `024_reflexao_da_noite.sql`), uma por pessoa e data, com `CHECK` das notas; entra na exportação LGPD e é apagada com a conta.
- As notas e as frases alimentam a retrospectiva "Sua semana" (médias, frases e a percepção sobre prática e nota emocional).

## Sua semana (tarefa 44)

Página `/semana` (item "Sua semana" da navegação) e cartão no "Meu dia". Cobre os últimos 7 dias locais da pessoa (hoje e os 6 anteriores); a semana anterior entra só para a variação.

- **Dados** (`src/lib/semana/servico.ts`, `GET /api/semana`): prontidão, sono e meditação de `daily_metrics`, minutos de respiração guiada, reflexões da noite, metas automáticas diárias (peso fica de fora) e o Tara Bala de cada dia, calculado pelo mapa natal e pelo Panchang da cidade (sem mapa, o céu não aparece e a tela pede os dados de nascimento).
- **Resumo:** médias só com os dias medidos (dia sem registro é "—", nunca zero); a variação contra a semana anterior só aparece com pelo menos 2 dias medidos em cada semana.
- **Metas dia a dia:** em quantos dias com registro cada meta foi cumprida, respeitando a direção e a unidade da meta.
- **Percepções** (`src/lib/semana/analise.ts`, função pura): Tara favorável × prontidão, noites de 7 h ou mais × prontidão e prática (meditação ou respiração) × nota emocional da reflexão. Cada uma só aparece com pelo menos 2 dias em cada grupo e diferença relevante (5 pontos de prontidão ou 0,5 na reflexão), diz em quantos dias se baseia e também aparece quando o padrão vai contra o esperado. A tela lembra que são padrões de uma semana, não conclusões.
- **Gráfico:** barras finas da prontidão em um só tom, ★ nos dias de Tara favorável; cada barra é um botão (toque ou teclado) que mostra o detalhe do dia, e a tabela "Dia a dia" traz os mesmos dados em texto.

## Respiração guiada (tarefa 44)

Página `/respiracao` (item "Respiração" da navegação) e cartão no "Meu dia" com a técnica recomendada agora.

- **Técnicas** (`src/lib/respiracao/tecnicas.ts`): 4-7-8 (inspira 4 s, segura 7 s, solta 8 s), quadrada (4-4-4-4) e Nadi Shodhana (narinas alternadas, 4 s e 6 s, sem retenção). Durações de 1, 3, 5 ou 10 minutos convertidas em ciclos completos.
- **Ritmo real:** a fase, o contador e a escala do orbe saem do tempo decorrido (`posicaoNaSessao`), não de contadores, então o ritmo não deriva com a aba em segundo plano; pausa e retomada preservam a posição. Com "reduzir movimento" o orbe fica parado e um anel mostra a fase. A tela fica acesa durante a sessão (Screen Wake Lock, quando o navegador oferece); voz (Web Speech, pt-BR) e vibração (Android) são opcionais.
- **Recomendação explicável:** estresse do registro de hoje ≥ 60 → 4-7-8; das 18 h às 2 h → 4-7-8 (prepara o sono); fase de Vata (2 h–6 h e 14 h–18 h) → Nadi Shodhana; prontidão < 55 → quadrada; Kapha da manhã → quadrada; Pitta do meio-dia → 4-7-8. Cada sugestão traz o "por que agora".
- **Registro:** ao terminar (ou ao encerrar depois de ao menos um ciclo completo e 30 s), `POST /api/respiracao` grava a sessão em `breathing_sessions` (migração `025_respiracao_guiada.sql`) e soma os minutos a `daily_metrics.meditation_minutes` do dia local da pessoa (limite de 600 min do check-in), o que recalcula a meta automática de meditação e a sequência. O servidor recusa duração incoerente com os ciclos feitos. `GET /api/respiracao` devolve as sessões de hoje, os minutos e a recomendação. Tabela incluída na exportação LGPD e apagada com a conta.

## Agenda védica no calendário (tarefa 44)

Cartão "Janelas de hoje" no "Meu dia" com Brahma Muhurta, Abhijit Muhurta (fora de quarta-feira), Rahu Kalam e o pôr do sol (Sandhya, 1 ghati de 24 minutos), calculados pelo Panchang da cidade da pessoa (`src/lib/calendario/janelas.ts`). A tela, o arquivo e o link usam a mesma fonte.

- **Baixar .ics:** `GET /api/calendario/hoje` (sessão) devolve as janelas de hoje; `GET /api/calendario/janelas` devolve as mesmas em JSON para o cartão.
- **Assinar agenda:** `POST /api/calendario/assinatura` cria (ou troca) um link privado `/api/calendario/feed/<token>.ics` com hoje e os próximos 6 dias, recalculados a cada leitura e com `REFRESH-INTERVAL` de 12 h; `GET` mostra o link de novo, `DELETE` desativa. O token tem 256 bits; no banco (`calendar_feeds`, migração `026_agenda_no_calendario.sql`) ficam o SHA-256 (para achar a pessoa) e o token cifrado com AES-256-GCM (para mostrar o link à própria pessoa). Trocar o link derruba o anterior na hora. O feed responde 404 igual para token inexistente ou desativado, tem limite de 60 leituras por hora por link e envia `X-Robots-Tag: noindex`.
- **iCalendar** (`src/lib/calendario/ics.ts`, RFC 5545 e 7986): CRLF, linhas dobradas em até 75 octetos sem partir caracteres UTF-8, textos escapados, horários em UTC (o app mostra no fuso de quem assina), eventos `TRANSP:TRANSPARENT` (não ocupam a agenda) e lembrete `VALARM` 10 minutos antes (`?lembretes=nao` tira). Validado também com a biblioteca `icalendar` do Python na QA.
- **Apps:** o diálogo oferece copiar o link, abrir por `webcal://` (Apple Calendário e Outlook para desktop) e os passos do Google Agenda ("Do URL"), Apple e Outlook ("Assinar da Web"). O Google pode levar horas para refletir mudanças e não usa os lembretes de agendas assinadas.
- **Limite:** com o app em `localhost`, só o calendário do mesmo computador lê o link; Google e Outlook na nuvem precisam do app publicado num endereço da internet (`APP_BASE_URL`). A tela avisa quando o endereço é local.
- **Privacidade:** os horários revelam a cidade aproximada, por isso o link é privado, pode ser trocado ou desativado, e a exportação LGPD traz só quando ele foi criado e lido (sem hash nem token).

## Rotina automática

- `src/instrumentation.ts` inicia `src/lib/coach/rotina.ts` no servidor Node.js: a cada 15 minutos prepara o dia de quem já passou das **3 h locais**, tem cidade, concluiu o primeiro acesso, tem o recurso `ai_tips_feed` no plano e ainda não tem o briefing de hoje. Índices únicos tornam seguro rodar em várias instâncias.
- Também apaga briefings e notificações com mais de **90 dias**.
- Hospedagem sem processo contínuo: `COACH_ROTINA=desligada` e um cron externo chamando `POST /api/coach/rotina` com `Authorization: Bearer <COACH_ROTINA_SEGREDO>` (ver `.env.example`).

## Dados e privacidade

- Tabelas `daily_briefings` e `user_notifications` (migração `019_coach_diario.sql`), apagadas em cascata com a conta e incluídas na exportação LGPD.
- Horários, janelas, prontidão e recomendações são sempre calculados nos motores da própria Lyra.
- A leitura védica do dia (resumo geral, as partes emocional, física e espiritual de cada período, pontos positivos e negativos e as dicas do mapa) é escrita pelo modelo de IA escolhido pelo administrador, local (Ollama, LM Studio, Jan, llama.cpp e outros) ou em nuvem, ou pelo motor da Lyra quando não há modelo. O modelo recebe só dados astrológicos, sem nome, e-mail, data, hora ou cidade de nascimento, métricas, ciclo nem sinais do corpo; por isso não há consentimento separado. Detalhes em [`ia-automatica.md`](./ia-automatica.md).
- No chat com a chave própria do Gemini (BYOK), o resumo do dia segue junto da análise local, como descrito na política de privacidade.
- Plano: o coach é o recurso `ai_tips_feed` (rota, página, cartão, rotina e contexto do chat respeitam o plano).

## Limites conhecidos

- Locais com dia ou noite polar não têm nascer ou pôr do sol: o coach informa que os períodos não se aplicam.
- A virada do dia na tela segue o relógio do navegador; o servidor usa o fuso da cidade da pessoa.
