# Mapa védico e dia védico

Cálculos em `src/lib/astrology/`, feitos no servidor com o [astronomy-engine](https://github.com/cosinekitty/astronomy) (posições VSOP87/ELP). Nenhum dado de nascimento vai para serviço externo.

## Local, data e hora

- **Cidades:** base local `data/geo/cidades.json.gz` (GeoNames, CC BY 4.0; ver [`data/geo/LEIA-ME.md`](../data/geo/LEIA-ME.md)). A pessoa escolhe a cidade na lista (onboarding e perfil); o servidor grava nome, coordenadas e fuso IANA juntos pela rota `PATCH /api/perfil/localizacao`. A API genérica de dados não altera essas colunas.
- **Hora local → UTC:** `tempo.ts` usa o banco de fusos do Node (ICU), inclusive horários de verão antigos (ex.: São Paulo em 1990, UTC−2). Hora inexistente (início do verão) avança o relógio; hora repetida (fim do verão) fica com a primeira ocorrência.
- **Sem hora de nascimento:** o mapa usa 12:00 local, sem Lagna nem casas; a Lua e o dasha podem variar algumas horas (o perfil avisa).

## Mapa natal (`mapa-natal.ts`)

- Zodíaco sideral com **ayanamsha Lahiri** (23°51'11" em J2000 + precessão geral).
- **Grahas:** Sol, Lua, Marte, Mercúrio, Júpiter, Vênus e Saturno (longitude eclíptica verdadeira de data), **Rahu** pelo nodo lunar médio (Meeus) e **Ketu** a 180°. Retrogradação pelo movimento em ±12 h.
- **Lagna:** ascendente pelo tempo sideral aparente de Greenwich e obliquidade verdadeira; casas por **signo inteiro** a partir do Lagna.
- **Vimshottari Dasha** (`vimshottari.ts`): saldo do nascimento pela parte percorrida da Lua no nakshatra natal, ano de 365,25 dias, Mahadasha e Antardasha vigentes e a próxima Antardasha.

## Dia védico (`panchang.ts`, `dia-pessoal.ts`)

No lugar onde a pessoa mora (sem moradia, no de nascimento):

- **Nascer e pôr do sol** (borda superior do disco com refração padrão).
- **Panchang** no nascer do sol: vara, tithi e paksha, nakshatra, yoga e karana, cada um com o horário em que termina.
- **Períodos:** Brahma Muhurta, Abhijit Muhurta (não vale às quartas), Rahu Kalam, Yamaganda e Gulika Kalam (oitavos do dia pelas tabelas tradicionais) e Choghadiya do dia e da noite.
- **Pessoal** (com mapa natal): Tara Bala (nakshatra do dia contado do natal, inclusive a troca de nakshatra durante o dia), Chandra Bala e Chandrashtama (Lua do dia na 8ª casa da Lua natal).

## Validação

Os testes `sideral.test.ts`, `tempo-e-dia.test.ts` e `engine.test.ts` comparam com o **Swiss Ephemeris 2.10.03** (pyswisseph, `SIDM_LAHIRI`), fonte independente:

| Item                                             | Tolerância usada nos testes                                |
| ------------------------------------------------ | ---------------------------------------------------------- |
| Ayanamsha                                        | 0,01°                                                      |
| Longitudes dos grahas e de Rahu                  | 0,02°                                                      |
| Lagna                                            | 0,05°                                                      |
| Nascer e pôr do sol (São Paulo e Nova Délhi)     | 2 minutos                                                  |
| Tithi, nakshatra, yoga e karana no nascer do sol | idênticos                                                  |
| Datas do Vimshottari                             | 2 dias (0,008° de diferença na Lua desloca cerca de 1 dia) |

## Rotas

- `GET /api/geo/cidades?q=` · busca de cidades (sessão).
- `PATCH /api/perfil/localizacao` · `{ tipo: 'nascimento' | 'moradia', cidadeId | null }`.
- `GET /api/astrologia/mapa` · mapa natal, dasha e o que falta no perfil.
- `GET /api/astrologia/dia?data=AAAA-MM-DD` · dia védico (padrão: hoje no fuso do lugar).

## Limites conhecidos

- Locais com dia ou noite polar não têm nascer/pôr do sol: a rota do dia responde 422.
- A base tem cidades com mais de 5.000 habitantes no mundo e, no Brasil, também as com mais de 1.000 e as sedes de município; fora disso, a pessoa escolhe a cidade maior mais próxima. Nomes de cidades fora do Brasil aparecem como no GeoNames (ex.: "Lisbon"), mas a busca aceita o nome em português ("Lisboa").
