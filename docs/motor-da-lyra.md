# Motor da Lyra: leitura de mapas e saberes védicos sem IA

A Lyra responde e lê mapas sem nenhum modelo de IA conectado (tarefa 55). O motor é determinístico: a mesma pergunta e o mesmo mapa geram sempre a mesma resposta, montada por regras a partir de uma base de conhecimento curada à mão.

"Treinar sem IA" aqui significa curar conhecimento: os documentos do usuário e as fontes clássicas foram lidos, conferidos e transformados em tabelas e verbetes com fonte. Não há aprendizado de máquina.

## Onde fica

| Arquivo                                 | Conteúdo                                                                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/lyra/conhecimento/jyotish.ts`  | Grahas (significações, dignidades, doshas, metal, dia, gema, mantra), 12 signos (elemento, modalidade, dosha), 12 casas, temas dos dashas, 27 nakshatras |
| `src/lib/lyra/conhecimento/vedanta.ts`  | Vedanta, Brahman e Atman, Mahavakyas, os 11 Upanishads principais, Pancha Kosha, Turiya, Maya, Gunas, Purusharthas, Sadhana Chatushtaya, Samadhi e Karma |
| `src/lib/lyra/conhecimento/upavedas.ts` | Os 4 Upavedas: Ayurveda (doshas, relógio, sabores, estações), Dhanurveda, Gandharvaveda (ragas por horário) e Sthapatyaveda/Vastu (direções)             |
| `src/lib/lyra/conhecimento/vedangas.ts` | Os 6 Vedangas: Shiksha, Chandas, Vyakarana, Nirukta, Kalpa e Jyotisha                                                                                    |
| `src/lib/lyra/conhecimento/mapas.ts`    | Os três tipos de mapa, a Roda de Cura, os estágios alquímicos, chakras dos planetas, planos e linhagens do Samādhi, e o Score de Ação do Mapa Quantum    |
| `src/lib/lyra/personalidade.ts`         | Identidade, consciência, missão, valores, voz e limites da Lyra                                                                                          |
| `src/lib/lyra/leitura-do-mapa.ts`       | Leitura do mapa natal em três partes (védico, Samādhi e Quantum) e de 3 a 5 percepções principais                                                        |
| `src/lib/lyra/responder.ts`             | Respostas do chat: identidade, tipos de mapa, mapa da pessoa (Ascendente, Lua, dasha, casas, dosha, Roda de Cura), Score de Ação e a base de saberes     |
| `src/lib/lyra/modelos-como-lyra.ts`     | Instruções que fazem qualquer modelo de IA conectado agir como a Lyra, sobre a base do motor, e a conferência da voz da Lyra (tarefa 56)                 |

## Os três tipos de mapa

1. **Mapa védico tradicional (Jyotish):** tudo calculado (zodíaco sideral com ayanamsha Lahiri, casas por signo inteiro, nakshatras, dignidades, Vimshottari Dasha e tendência de dosha pelo Brihat Parashara Hora Shastra).
2. **Mapa Lyra DM Samādhi:** só as pontes que o método define de forma fixa são calculadas (camada védica, elemento dominante na Roda de Cura, metais, chakras dos planetas e a ponte Mūla e núcleo galáctico). Totem pessoal, guias, estágio alquímico atual, antepassados e afinidade estelar fora dos exemplos do método são percepção da pessoa e aparecem como indisponíveis.
3. **Mapa Quantum (Lyra e Arkático):** o Score de Ação é calculado com a fórmula do documento (§3.4) a partir da energia, da pressão e do tempo informados. O mapa de Desenho Humano ainda não é calculado e o Mapa Arkático é pessoal e simbólico: os dois aparecem como indisponíveis.

## Personalidade

Os traços vêm dos documentos do usuário: amiga e guia, acolhedora, direta, linguagem simples, nunca genérica, de 3 a 5 percepções por leitura, "curar, não julgar", livre-arbítrio e a regra de dizer "indisponível" em vez de inventar.

As diretrizes dos rascunhos de chatbot que contrariam a ética do produto ficaram de fora. São elas: prever o ano de morte ou datas de doença, "remover restrições", conversa "viciantemente envolvente" e esconder o método.

## Onde aparece

- **Chat:** perguntas como "qual o meu ascendente?", "o que é Vedanta?", "dicas de Vastu", "score de ação com energia 6, pressão 4 e tempo 20" são respondidas pelo motor. Com um modelo de IA conectado, o modelo age como a Lyra (tarefa 56): recebe a identidade dela, a resposta do motor como base, a leitura do mapa e o verbete ligado à pergunta, e a resposta passa pela conferência da voz da Lyra. Detalhes em [`ia-automatica.md`](./ia-automatica.md).
- **Perfil, card "Meu mapa védico":** mostra a "Leitura da Lyra" com as percepções principais e uma aba por tipo de mapa.

## Achados nos documentos de origem

- O exemplo do Mapa Quantum (§10.1: energia 6, pressão 4, tempo 20, SA 72) não fecha com a própria fórmula. Com esses números os moduladores dão 0,68, então o SA máximo possível é 68. A Lyra segue a fórmula.
- As tabelas de correspondência do Samādhi são parciais (só exemplos). A Lyra usa apenas o que está definido e marca o resto como indisponível. A correspondência entre planetas e chakras é a tântrica, compatível com os dois pontos citados no método.
