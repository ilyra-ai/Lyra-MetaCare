import { z } from 'zod';

import { registrarErroInterno } from '@/lib/observability/log-seguro';

import type { BriefingDoDia, Periodo } from './tipos';

/**
 * Texto do "Seu dia" reescrito pelo Google Gemini (tarefa 43), só para quem
 * ativou o consentimento específico e revogável, com a chave do servidor
 * (`GEMINI_API_KEY`).
 *
 * - Dados minimizados: vão só a manchete, o resumo, os quatro períodos (nome,
 *   horário, qualidade e sugestão), os focos, os cuidados, o rótulo da
 *   prontidão e os nomes do céu do dia. Não vão nome, e-mail, cidade, data
 *   de nascimento, métricas brutas, ciclo menstrual nem sinais precoces.
 * - O Gemini só reescreve o texto: horários, janelas e regras continuam do
 *   motor local. Uma resposta fora do formato, com horário que não existe no
 *   dia, ou qualquer falha mantém o texto local.
 */

const TEMPO_MAXIMO_MS = 15_000;

export function geminiDisponivel() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

const textoSchema = (minimo: number, maximo: number) =>
  z.string().trim().min(minimo).max(maximo);

export const respostaDoGeminiSchema = z
  .object({
    manchete: textoSchema(8, 120),
    resumo: textoSchema(40, 700),
    sugestoes: z
      .object({
        madrugada: textoSchema(10, 320),
        manha: textoSchema(10, 320),
        tarde: textoSchema(10, 320),
        noite: textoSchema(10, 320),
      })
      .partial(),
  })
  .strict();

export type RespostaDoGemini = z.infer<typeof respostaDoGeminiSchema>;

/** O que vai para o Gemini: só o texto já gerado e os nomes do céu. */
export function dadosMinimizados(briefing: BriefingDoDia) {
  return {
    tom: briefing.tom,
    manchete: briefing.manchete,
    resumo: briefing.resumo,
    prontidao: briefing.prontidao.rotulo,
    periodos: briefing.periodos.map((p) => ({
      chave: p.chave,
      nome: p.nome,
      horario: p.horario,
      qualidade: p.qualidade,
      sugestao: p.sugestao,
    })),
    focos: briefing.focos.map((f) => f.texto),
    cuidados: briefing.cuidados.map((c) => c.texto),
    ceu: {
      nakshatra: briefing.ceu.nakshatra,
      natureza: briefing.ceu.naturezaDoNakshatra,
      tithi: briefing.ceu.tithi,
      vara: briefing.ceu.vara,
      tara: briefing.ceu.tara?.nome ?? null,
    },
  };
}

const HORARIO = /\b\d{2}:\d{2}\b/g;

/** Todos os horários citados na resposta existem no dia original. */
export function horariosConferem(
  original: ReturnType<typeof dadosMinimizados>,
  resposta: RespostaDoGemini
) {
  const permitidos = new Set(JSON.stringify(original).match(HORARIO) ?? []);
  const textos = [
    resposta.manchete,
    resposta.resumo,
    ...Object.values(resposta.sugestoes),
  ];
  return textos.every((texto) =>
    (texto.match(HORARIO) ?? []).every((h) => permitidos.has(h))
  );
}

/** Aplica o texto reescrito sem tocar em horários, janelas e regras. */
export function aplicarTexto(
  briefing: BriefingDoDia,
  resposta: RespostaDoGemini
): BriefingDoDia {
  return {
    ...briefing,
    origem: 'gemini',
    manchete: resposta.manchete,
    resumo: resposta.resumo,
    periodos: briefing.periodos.map((p): Periodo => ({
      ...p,
      sugestao: resposta.sugestoes[p.chave] ?? p.sugestao,
    })),
  };
}

function instrucoes(dados: ReturnType<typeof dadosMinimizados>) {
  return `Você é o coach de bem-estar da Lyra MetaCare. Reescreva em português do Brasil, em segunda pessoa, com tom acolhedor, claro e direto, a manchete, o resumo e a sugestão de cada período do dia abaixo.
Regras:
- Mantenha exatamente os mesmos horários (HH:MM) e não crie horários novos.
- Não invente dados, números, diagnósticos nem promessas de saúde; não cite medicamentos.
- Sem emojis e sem travessão. Manchete com até 90 caracteres; resumo com até 3 frases; cada sugestão com 1 ou 2 frases.
- Responda só com JSON no formato {"manchete": "...", "resumo": "...", "sugestoes": {"madrugada": "...", "manha": "...", "tarde": "...", "noite": "..."}}.
Dia:
${JSON.stringify(dados)}`;
}

/**
 * Pede ao Gemini o texto do dia. Devolve o briefing com o texto novo, ou
 * null quando não for possível (o chamador mantém o texto local).
 */
export async function refinarComGemini(
  briefing: BriefingDoDia,
  opcoes: { fetch?: typeof fetch } = {}
): Promise<BriefingDoDia | null> {
  const chave = process.env.GEMINI_API_KEY?.trim();
  if (!chave) return null;
  const modelo = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  const dados = dadosMinimizados(briefing);
  const buscar = opcoes.fetch ?? fetch;

  try {
    const resposta = await buscar(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Chave no cabeçalho, nunca na URL (que aparece em logs de proxy).
          'x-goog-api-key': chave,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: instrucoes(dados) }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(TEMPO_MAXIMO_MS),
      }
    );
    if (!resposta.ok) {
      console.error(
        `[coach:gemini] Gemini respondeu HTTP ${resposta.status}; mantido o texto local.`
      );
      return null;
    }
    const corpo = (await resposta.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const texto = corpo.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) return null;
    const validada = respostaDoGeminiSchema.safeParse(JSON.parse(texto));
    if (!validada.success || !horariosConferem(dados, validada.data)) {
      console.error(
        '[coach:gemini] Resposta fora do formato ou com horário inventado; mantido o texto local.'
      );
      return null;
    }
    return aplicarTexto(briefing, validada.data);
  } catch (erro) {
    registrarErroInterno('coach:gemini', erro);
    return null;
  }
}
