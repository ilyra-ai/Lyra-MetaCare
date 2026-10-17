import { z } from 'zod';

import {
  type EloDaCadeia,
  gerarNaCadeia,
  type TentativaNaCadeia,
} from '@/lib/ai/cadeia-de-modelos';
import {
  type ConexaoDeIa,
  ErroDoProvedor,
  extrairJson,
} from '@/lib/ai/cliente-de-ia';
import {
  conferirVozDaLyra,
  instrucoesDaLeituraComoLyra,
} from '@/lib/lyra/modelos-como-lyra';

import type { EntradaDaLeitura } from './leitura-vedica';
import { termoTecnicoEm } from './linguagem-simples';
import type { LeituraVedica, Periodo } from './tipos';

/**
 * Leitura védica do dia escrita pelo modelo de IA configurado pelo
 * administrador (local, como Ollama, LM Studio, Jan ou llama.cpp, ou em
 * nuvem). O modelo escreve como a Lyra (tarefa 56) e recebe só os fatos
 * astrológicos do dia (`EntradaDaLeitura`), a leitura que o motor da Lyra já
 * calculou (a base) e a leitura da véspera, para não se repetir. A resposta é
 * validada: formato (Zod), horários que existem no dia, voz da Lyra e texto
 * diferente do de ontem. Qualquer falha mantém a leitura do motor da Lyra.
 */

const texto = (minimo: number, maximo: number) =>
  z.string().trim().min(minimo).max(maximo);

const periodoSchema = z.object({
  emocional: texto(30, 900),
  fisico: texto(30, 900),
  espiritual: texto(30, 900),
});

export const leituraDaIaSchema = z.object({
  resumoGeral: texto(80, 1600),
  periodos: z
    .object({
      madrugada: periodoSchema,
      manha: periodoSchema,
      tarde: periodoSchema,
      noite: periodoSchema,
    })
    .partial(),
  pontosPositivos: z.array(texto(8, 320)).min(2).max(6),
  pontosNegativos: z.array(texto(8, 320)).min(2).max(6),
  dicas: z
    .array(z.object({ texto: texto(10, 400), porque: texto(10, 400) }))
    .min(3)
    .max(6),
});

export type LeituraDaIa = z.infer<typeof leituraDaIaSchema>;

const textoJson = (minimo: number) => ({ type: 'string', minLength: minimo });

/**
 * JSON Schema enviado ao servidor para a saída estruturada: os períodos que
 * existem no dia, todos obrigatórios, e tamanhos mínimos que evitam respostas
 * de uma palavra. Só mínimos (sem máximos), para a gramática dos servidores
 * locais continuar pequena; os máximos ficam na validação (`leituraDaIaSchema`).
 */
export function esquemaJsonDaLeitura(
  entrada: EntradaDaLeitura
): Record<string, unknown> {
  const periodo = {
    type: 'object',
    properties: {
      emocional: textoJson(40),
      fisico: textoJson(40),
      espiritual: textoJson(40),
    },
    required: ['emocional', 'fisico', 'espiritual'],
    additionalProperties: false,
  };
  const chaves = entrada.periodos.map((p) => p.chave);
  return {
    type: 'object',
    properties: {
      resumoGeral: textoJson(120),
      periodos: {
        type: 'object',
        properties: Object.fromEntries(chaves.map((c) => [c, periodo])),
        required: chaves,
        additionalProperties: false,
      },
      pontosPositivos: {
        type: 'array',
        items: textoJson(15),
        minItems: 2,
        maxItems: 5,
      },
      pontosNegativos: {
        type: 'array',
        items: textoJson(15),
        minItems: 2,
        maxItems: 5,
      },
      dicas: {
        type: 'array',
        items: {
          type: 'object',
          properties: { texto: textoJson(20), porque: textoJson(20) },
          required: ['texto', 'porque'],
          additionalProperties: false,
        },
        minItems: 3,
        maxItems: 6,
      },
    },
    required: [
      'resumoGeral',
      'periodos',
      'pontosPositivos',
      'pontosNegativos',
      'dicas',
    ],
    additionalProperties: false,
  };
}

const HORARIO = /\b\d{2}:\d{2}\b/g;

function horariosDe(valor: unknown) {
  return JSON.stringify(valor).match(HORARIO) ?? [];
}

/** Todo horário citado pelo modelo existe nos fatos do dia. */
export function horariosConferem(
  entrada: EntradaDaLeitura,
  leitura: LeituraDaIa
) {
  const permitidos = new Set(horariosDe(entrada));
  return horariosDe(leitura).every((h) => permitidos.has(h));
}

function normalizado(valor: string) {
  return valor.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Cada período precisa ter o próprio texto: o mesmo tópico (emocional,
 * físico ou espiritual) repetido em dois períodos, ou um ponto repetido,
 * indica um modelo que não acompanhou os fatos (comum em modelos muito
 * pequenos).
 */
export function temRepeticao(leitura: LeituraDaIa) {
  const periodos = Object.values(leitura.periodos).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );
  for (const topico of ['emocional', 'fisico', 'espiritual'] as const) {
    const textos = periodos.map((p) => normalizado(p[topico]));
    if (new Set(textos).size !== textos.length) return true;
  }
  const pontos = [...leitura.pontosPositivos, ...leitura.pontosNegativos].map(
    normalizado
  );
  return new Set(pontos).size !== pontos.length;
}

/**
 * Primeiro termo técnico encontrado nos textos da leitura do modelo (ou
 * null). A leitura é para leigos (tarefa 49): com termo técnico, ela é
 * descartada e a pessoa recebe a leitura da Lyra.
 */
export function termoTecnicoNaLeitura(leitura: LeituraDaIa): string | null {
  const textos = [
    leitura.resumoGeral,
    ...Object.values(leitura.periodos).flatMap((p) =>
      p ? [p.emocional, p.fisico, p.espiritual] : []
    ),
    ...leitura.pontosPositivos,
    ...leitura.pontosNegativos,
    ...leitura.dicas.flatMap((d) => [d.texto, d.porque]),
  ];
  for (const texto of textos) {
    const termo = termoTecnicoEm(texto);
    if (termo) return termo;
  }
  return null;
}

/**
 * Regras próprias da leitura do dia. Elas completam a identidade da Lyra
 * (tarefa 56) e valem acima das regras gerais dela: por exemplo, a Lyra
 * pode citar um termo em sânscrito explicando-o no chat, mas nesta leitura,
 * escrita para leigos (tarefa 49), nenhum termo técnico aparece.
 */
export const REGRAS_DA_LEITURA_DO_DIA = `Nesta tarefa, você escreve a leitura védica do dia desta pessoa, como astróloga védica e coach de bem-estar.
Escreva em português do Brasil, em segunda pessoa, com tom acolhedor, claro e específico, sem emojis.
Escreva para quem não entende de astrologia: nada de termos técnicos nem nomes em sânscrito (por exemplo nakshatra, tithi, paksha, Tara, dasha, Rahu Kalam, Choghadiya, muhurta, Chandrashtama, karana, nem "8ª casa"). Traduza cada fato no que ele significa para a vida da pessoa: em vez de "Tara Pratyari", diga "um dia de resistências"; em vez de "Lua na 7ª casa", diga "a Lua passa pela área do seu mapa ligada às parcerias". Planetas e signos podem ser citados pelo nome em português.
Fale do mapa desta pessoa: use a Lua de nascimento, o tom do dia para ela, a área do mapa por onde a Lua passa, a fase da vida e os trânsitos, sempre pelo que significam.
Use somente os fatos fornecidos (mapa natal derivado, céu do dia, períodos, horas planetárias, trânsitos e fase da vida). Não invente posições, horários nem fatos.
Cite horários apenas como aparecem nos fatos (HH:MM). Não dê diagnósticos, não cite medicamentos nem prometa resultados de saúde: são orientações de bem-estar e autoconhecimento.
Cada dia é único: a leitura de hoje precisa ser diferente da de ontem, destacando o que mudou no céu.
A leitura que o motor da Lyra já calculou para hoje é a sua base: escreva com as suas palavras, mais completa e pessoal, sem contradizer os fatos dela.`;

/**
 * Instruções de sistema enviadas a qualquer modelo da ordem de uso: o modelo
 * escreve como a Lyra (identidade, valores, voz e limites), sobre a base do
 * motor da Lyra.
 */
export const INSTRUCOES_DO_SISTEMA = instrucoesDaLeituraComoLyra(
  REGRAS_DA_LEITURA_DO_DIA
);

function pedidoDoUsuario(
  entrada: EntradaDaLeitura,
  ontem: LeituraVedica | null,
  base: LeituraVedica
) {
  const periodos = entrada.periodos.map((p) => p.chave);
  return `Escreva a leitura védica de ${entrada.data} para esta pessoa, com:
1. "resumoGeral": o resumo geral do dia (3 a 5 frases).
2. "periodos": para cada período (${periodos.join(', ')}), como será o dia por tópicos: "emocional" (parte emocional), "fisico" (parte física, o corpo) e "espiritual" (parte espiritual), de 1 a 3 frases completas cada (nunca uma palavra só), ligados aos fatos daquele período.
3. "pontosPositivos" e "pontosNegativos" do dia (2 a 5 de cada).
4. "dicas": 3 a 6 dicas que o mapa védico traz para este dia, cada uma com "texto" e "porque" (o fundamento no mapa ou no céu, explicado em palavras simples).
Lembre: sem termos técnicos nem nomes em sânscrito em nenhum texto.
Responda com UM ÚNICO objeto JSON, com as cinco chaves juntas, neste formato, sem texto antes ou depois:
{"resumoGeral":"...","periodos":{${periodos
    .map(
      (chave) =>
        `"${chave}":{"emocional":"...","fisico":"...","espiritual":"..."}`
    )
    .join(
      ','
    )}},"pontosPositivos":["..."],"pontosNegativos":["..."],"dicas":[{"texto":"...","porque":"..."}]}

Fatos do dia:
${JSON.stringify(entrada)}

Leitura do motor da Lyra para hoje (sua base; não copie, aprofunde):
${JSON.stringify({ resumoGeral: base.resumoGeral, periodos: base.periodos, pontosPositivos: base.pontosPositivos, pontosNegativos: base.pontosNegativos, dicas: base.dicas })}
${
  ontem
    ? `
Leitura de ontem (não repita as frases; mostre o que mudou):
${JSON.stringify({ resumoGeral: ontem.resumoGeral, pontosPositivos: ontem.pontosPositivos, pontosNegativos: ontem.pontosNegativos })}`
    : ''
}`;
}

export interface AutorDaIa {
  provedor: string;
  modelo: string;
  local: boolean;
}

/** Converte a resposta validada no formato da leitura do briefing. */
export function leituraAPartirDaIa(
  resposta: LeituraDaIa,
  base: LeituraVedica,
  autor: AutorDaIa
): LeituraVedica {
  return {
    resumoGeral: resposta.resumoGeral,
    periodos: base.periodos.map((periodo) => {
      const escrito = resposta.periodos[periodo.chave as Periodo['chave']];
      return escrito ? { chave: periodo.chave, ...escrito } : periodo;
    }),
    pontosPositivos: resposta.pontosPositivos,
    pontosNegativos: resposta.pontosNegativos,
    dicas: resposta.dicas,
    autor: { tipo: 'ia', ...autor },
  };
}

export type ResultadoDaLeituraDaIa =
  { ok: true; leitura: LeituraVedica } | { ok: false; motivo: string };

/**
 * Confere a resposta do modelo: formato (Zod), todos os períodos, horários
 * que existem no dia, sem texto repetido, sem termo técnico e diferente da
 * leitura de ontem.
 */
export function conferirLeituraDaIa(
  bruto: string,
  entrada: EntradaDaLeitura,
  ontem: LeituraVedica | null
): { ok: true; dados: LeituraDaIa } | { ok: false; motivo: string } {
  let json: unknown;
  try {
    json = extrairJson(bruto);
  } catch (erro) {
    return {
      ok: false,
      motivo:
        erro instanceof ErroDoProvedor ? erro.message : 'resposta sem JSON',
    };
  }
  const validada = leituraDaIaSchema.safeParse(json);
  if (!validada.success) {
    return { ok: false, motivo: 'resposta fora do formato da leitura' };
  }
  const faltando = entrada.periodos.filter(
    (p) => !validada.data.periodos[p.chave]
  );
  if (faltando.length > 0) {
    return {
      ok: false,
      motivo: `faltou o período ${faltando.map((p) => p.chave).join(', ')}`,
    };
  }
  if (!horariosConferem(entrada, validada.data)) {
    return { ok: false, motivo: 'horário que não existe no dia' };
  }
  if (temRepeticao(validada.data)) {
    return { ok: false, motivo: 'texto repetido entre períodos' };
  }
  const termo = termoTecnicoNaLeitura(validada.data);
  if (termo) {
    return { ok: false, motivo: `termo técnico na leitura ("${termo}")` };
  }
  // A leitura é da Lyra (tarefa 56): sem outra identidade e sem os limites
  // que ela não ultrapassa.
  const voz = conferirVozDaLyra(JSON.stringify(validada.data));
  if (voz) {
    return { ok: false, motivo: voz };
  }
  if (
    ontem &&
    normalizado(ontem.resumoGeral) === normalizado(validada.data.resumoGeral)
  ) {
    return { ok: false, motivo: 'resumo igual ao de ontem' };
  }
  return { ok: true, dados: validada.data };
}

/**
 * Leitura escrita pela ordem de uso dos modelos (tarefa 54): o primeiro
 * modelo que entrega uma leitura aprovada na conferência é o autor; um
 * modelo que falha, fica sem tokens ou erra o formato passa a vez ao
 * seguinte (que continua o texto, se ele foi cortado). Chegando ao motor da
 * Lyra, fica a leitura do motor.
 */
export async function escreverLeituraNaCadeia(opcoes: {
  cadeia: EloDaCadeia[];
  entrada: EntradaDaLeitura;
  base: LeituraVedica;
  ontem: LeituraVedica | null;
  buscar?: typeof fetch;
}): Promise<ResultadoDaLeituraDaIa & { tentativas: TentativaNaCadeia[] }> {
  const resultado = await gerarNaCadeia(
    opcoes.cadeia,
    {
      sistema: INSTRUCOES_DO_SISTEMA,
      usuario: pedidoDoUsuario(opcoes.entrada, opcoes.ontem, opcoes.base),
      json: true,
      esquemaJson: esquemaJsonDaLeitura(opcoes.entrada),
      nomeDoEsquema: 'leitura_vedica_do_dia',
      maximoDeTokens: 4096,
    },
    {
      buscar: opcoes.buscar,
      rotulo: 'leitura-do-dia',
      validar: (bruto) => {
        const conferida = conferirLeituraDaIa(
          bruto,
          opcoes.entrada,
          opcoes.ontem
        );
        return conferida.ok ? null : conferida.motivo;
      },
    }
  );
  if (resultado.origem === 'lyra') {
    const ultima = resultado.tentativas.at(-1);
    return {
      ok: false,
      motivo: ultima?.motivo ?? 'nenhum modelo antes do motor da Lyra',
      tentativas: resultado.tentativas,
    };
  }
  const conferida = conferirLeituraDaIa(
    resultado.texto,
    opcoes.entrada,
    opcoes.ontem
  );
  if (!conferida.ok) {
    return { ...conferida, tentativas: resultado.tentativas };
  }
  return {
    ok: true,
    leitura: leituraAPartirDaIa(conferida.dados, opcoes.base, resultado.autor),
    tentativas: resultado.tentativas,
  };
}

/** Leitura escrita por um único modelo (sem troca). */
export async function escreverLeituraComIa(opcoes: {
  conexao: ConexaoDeIa;
  autor: AutorDaIa;
  entrada: EntradaDaLeitura;
  base: LeituraVedica;
  ontem: LeituraVedica | null;
  buscar?: typeof fetch;
}): Promise<ResultadoDaLeituraDaIa> {
  const resultado = await escreverLeituraNaCadeia({
    cadeia: [
      { tipo: 'modelo', conexao: opcoes.conexao, autor: opcoes.autor },
      { tipo: 'lyra' },
    ],
    entrada: opcoes.entrada,
    base: opcoes.base,
    ontem: opcoes.ontem,
    buscar: opcoes.buscar,
  });
  return resultado.ok
    ? { ok: true, leitura: resultado.leitura }
    : { ok: false, motivo: resultado.motivo };
}
