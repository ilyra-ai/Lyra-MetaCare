# Coach diário ("Seu dia")

Todos os dias o coach prepara, para cada pessoa, como será o dia dela: o tom do dia, a prontidão do corpo, os quatro períodos (madrugada, manhã, tarde e noite) com os horários bons e os de cautela, e recomendações de saúde, alimentação, movimento, mente e sono. Cada dica traz o **"Por quê?"** com a origem (sinal do corpo, Panchang, mapa natal ou Ayurveda).

São orientações de bem-estar e autoconhecimento: não substituem avaliação profissional de saúde.

## Onde aparece

- **Painel:** cartão "Seu dia" no topo, com manchete, anel de prontidão, faixa das 24 h com o "Agora" ao vivo, o período atual e os três focos do dia.
- **Meu dia (`/dia`):** relógio radial das 24 h, os quatro períodos, pontos fortes e cuidados, recomendações por área, o céu de hoje (Panchang, Tara Bala, dasha, dosha, ciclo) e a avaliação "o seu dia te ajudou?".
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

## Rotina automática

- `src/instrumentation.ts` inicia `src/lib/coach/rotina.ts` no servidor Node.js: a cada 15 minutos prepara o dia de quem já passou das **3 h locais**, tem cidade, concluiu o primeiro acesso, tem o recurso `ai_tips_feed` no plano e ainda não tem o briefing de hoje. Índices únicos tornam seguro rodar em várias instâncias.
- Também apaga briefings e notificações com mais de **90 dias**.
- Hospedagem sem processo contínuo: `COACH_ROTINA=desligada` e um cron externo chamando `POST /api/coach/rotina` com `Authorization: Bearer <COACH_ROTINA_SEGREDO>` (ver `.env.example`).

## Dados e privacidade

- Tabelas `daily_briefings` e `user_notifications` (migração `019_coach_diario.sql`), apagadas em cascata com a conta e incluídas na exportação LGPD.
- Por padrão, tudo é calculado nos motores da própria Lyra e nenhum dado vai para serviço externo. No chat com a chave própria do Gemini (BYOK), o resumo do dia segue junto da análise local, como descrito na política de privacidade.
- Opcional: com o consentimento específico e revogável da pessoa, o texto do dia é reescrito pelo Google Gemini com a chave do servidor, com dados minimizados e os horários sempre da Lyra. Detalhes em [`ia-automatica.md`](./ia-automatica.md).
- Plano: o coach é o recurso `ai_tips_feed` (rota, página, cartão, rotina e contexto do chat respeitam o plano).

## Limites conhecidos

- Locais com dia ou noite polar não têm nascer ou pôr do sol: o coach informa que os períodos não se aplicam.
- A virada do dia na tela segue o relógio do navegador; o servidor usa o fuso da cidade da pessoa.
