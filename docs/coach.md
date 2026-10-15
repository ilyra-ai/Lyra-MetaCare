# Coach diário ("Seu dia")

Todos os dias o coach prepara, para cada pessoa, como será o dia dela: o tom do dia, a prontidão do corpo, os quatro períodos (madrugada, manhã, tarde e noite) com os horários bons e os de cautela, e recomendações de saúde, alimentação, movimento, mente e sono. Cada dica traz o **"Por quê?"** com a origem (sinal do corpo, Panchang, mapa natal ou Ayurveda).

São orientações de bem-estar e autoconhecimento: não substituem avaliação profissional de saúde.

## Onde aparece

- **Painel:** cartão "Seu dia" no topo, com manchete, o resumo geral da leitura védica, anel de prontidão, faixa das 24 h com o "Agora" ao vivo, o período atual com as partes emocional, física e espiritual e os três focos do dia.
- **Meu dia (`/dia`):** relógio radial das 24 h; a **leitura do dia**, na ordem: 1) resumo geral, 2) cada período (madrugada, manhã, tarde e noite) por tópicos, parte emocional, parte física (corpo) e parte espiritual, 3) pontos positivos e pontos negativos, 4) as dicas do mapa védico para a data, cada uma com o fundamento; depois os horários por período, focos e cuidados práticos, recomendações por área, o céu de hoje (Panchang, Tara Bala, dasha, dosha, ciclo) e a avaliação "o seu dia te ajudou?".
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
