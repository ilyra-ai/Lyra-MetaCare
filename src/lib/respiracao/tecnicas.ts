import { z } from 'zod';

import { doshaDoRelogio } from '@/lib/coach/leitura-conhecimento';

/**
 * Respiração guiada (tarefa 44): as três técnicas, as fases de cada ciclo,
 * a recomendação explicável do momento e a validação da sessão registrada.
 * Módulo puro, usado pela tela (ritmo do orbe) e pelo servidor (conferência
 * da duração antes de somar os minutos à meditação do dia).
 */

export const TECNICAS = ['4-7-8', 'quadrada', 'nadi_shodhana'] as const;
export type Tecnica = (typeof TECNICAS)[number];

export type MovimentoDaFase = 'inspirar' | 'segurar' | 'soltar';

export interface Fase {
  movimento: MovimentoDaFase;
  /** Rótulo curto exibido sobre o orbe. */
  rotulo: string;
  /** Instrução completa (tela e voz). */
  instrucao: string;
  segundos: number;
}

export interface DefinicaoDaTecnica {
  id: Tecnica;
  nome: string;
  resumo: string;
  /** Para que serve, em linguagem de bem-estar. */
  indicacao: string;
  fases: Fase[];
}

const inspirar = (instrucao: string, segundos: number): Fase => ({
  movimento: 'inspirar',
  rotulo: 'Inspire',
  instrucao,
  segundos,
});
const segurar = (instrucao: string, segundos: number): Fase => ({
  movimento: 'segurar',
  rotulo: 'Segure',
  instrucao,
  segundos,
});
const soltar = (instrucao: string, segundos: number): Fase => ({
  movimento: 'soltar',
  rotulo: 'Solte',
  instrucao,
  segundos,
});

export const DEFINICOES: Record<Tecnica, DefinicaoDaTecnica> = {
  '4-7-8': {
    id: '4-7-8',
    nome: '4-7-8',
    resumo: 'Inspire 4 s, segure 7 s, solte 8 s',
    indicacao:
      'A expiração longa desacelera o ritmo e ajuda a relaxar antes de dormir ou em momentos de tensão.',
    fases: [
      inspirar('Inspire pelo nariz', 4),
      segurar('Segure o ar', 7),
      soltar('Solte pela boca, devagar', 8),
    ],
  },
  quadrada: {
    id: 'quadrada',
    nome: 'Quadrada',
    resumo: 'Inspire, segure, solte e segure: 4 s cada',
    indicacao:
      'Ritmo estável e simétrico que organiza a atenção: bom para foco e para retomar o centro.',
    fases: [
      inspirar('Inspire pelo nariz', 4),
      segurar('Segure com os pulmões cheios', 4),
      soltar('Solte devagar', 4),
      segurar('Segure com os pulmões vazios', 4),
    ],
  },
  nadi_shodhana: {
    id: 'nadi_shodhana',
    nome: 'Nadi Shodhana',
    resumo: 'Respiração alternada pelas narinas, sem retenção',
    indicacao:
      'Prática do yoga para equilibrar a energia que oscila: acalma sem dar sono.',
    fases: [
      inspirar('Inspire pela narina esquerda', 4),
      soltar('Solte pela narina direita', 6),
      inspirar('Inspire pela narina direita', 4),
      soltar('Solte pela narina esquerda', 6),
    ],
  },
};

export function duracaoDoCiclo(tecnica: Tecnica) {
  return DEFINICOES[tecnica].fases.reduce(
    (soma, fase) => soma + fase.segundos,
    0
  );
}

/** Durações oferecidas na tela, em minutos. */
export const DURACOES_EM_MINUTOS = [1, 3, 5, 10] as const;

/** Ciclos completos que cabem na duração escolhida (ao menos 1). */
export function ciclosParaMinutos(tecnica: Tecnica, minutos: number) {
  return Math.max(1, Math.round((minutos * 60) / duracaoDoCiclo(tecnica)));
}

export interface PosicaoNaSessao {
  ciclo: number;
  indiceDaFase: number;
  fase: Fase;
  /** Segundos já passados dentro da fase atual. */
  decorridoNaFase: number;
  /** Segundos completos que faltam na fase (para o contador). */
  restanteNaFase: number;
  /** 0 a 1, progresso da sessão inteira. */
  progresso: number;
  concluida: boolean;
  /** Ciclos completos até o instante. */
  ciclosCompletos: number;
}

/**
 * Onde a sessão está depois de `segundos` decorridos. Calculado pelo relógio
 * (e não por contadores incrementais), então o ritmo continua certo mesmo
 * com a aba em segundo plano ou com o navegador atrasando os temporizadores.
 */
export function posicaoNaSessao(
  tecnica: Tecnica,
  totalDeCiclos: number,
  segundos: number
): PosicaoNaSessao {
  const fases = DEFINICOES[tecnica].fases;
  const ciclo = duracaoDoCiclo(tecnica);
  const total = ciclo * totalDeCiclos;
  const limitado = Math.max(0, Math.min(segundos, total));
  const ciclosCompletos = Math.floor(limitado / ciclo);
  if (limitado >= total) {
    const ultima = fases[fases.length - 1];
    return {
      ciclo: totalDeCiclos,
      indiceDaFase: fases.length - 1,
      fase: ultima,
      decorridoNaFase: ultima.segundos,
      restanteNaFase: 0,
      progresso: 1,
      concluida: true,
      ciclosCompletos: totalDeCiclos,
    };
  }
  let dentroDoCiclo = limitado - ciclosCompletos * ciclo;
  let indiceDaFase = 0;
  while (dentroDoCiclo >= fases[indiceDaFase].segundos) {
    dentroDoCiclo -= fases[indiceDaFase].segundos;
    indiceDaFase += 1;
  }
  const fase = fases[indiceDaFase];
  return {
    ciclo: ciclosCompletos + 1,
    indiceDaFase,
    fase,
    decorridoNaFase: dentroDoCiclo,
    restanteNaFase: Math.ceil(fase.segundos - dentroDoCiclo),
    progresso: limitado / total,
    concluida: false,
    ciclosCompletos,
  };
}

// ---------------------------------------------------------------------------
// Registro da sessão
// ---------------------------------------------------------------------------

/** Mínimo para registrar: um ciclo completo e 30 segundos de prática. */
export const SEGUNDOS_MINIMOS = 30;
export const SEGUNDOS_MAXIMOS = 3600;

/** Minutos somados à meditação do dia (arredondados, pelo menos 1). */
export function minutosDaSessao(segundos: number) {
  return Math.max(1, Math.round(segundos / 60));
}

/**
 * A duração informada tem de ser coerente com os ciclos feitos: entre os
 * ciclos completos e o ciclo seguinte (o tempo de uma fase em andamento ao
 * parar). Evita somar à meditação minutos que a sessão não teve.
 */
export function duracaoCoerente(
  tecnica: Tecnica,
  ciclos: number,
  segundos: number
) {
  const ciclo = duracaoDoCiclo(tecnica);
  return segundos >= ciclos * ciclo - 1 && segundos < (ciclos + 1) * ciclo + 1;
}

export const sessaoDeRespiracaoSchema = z
  .object({
    tecnica: z.enum(TECNICAS, {
      error: 'Técnica de respiração desconhecida.',
    }),
    ciclos: z
      .number({ error: 'Informe os ciclos feitos.' })
      .int('Os ciclos são um número inteiro.')
      .min(1, 'Faça ao menos um ciclo completo para registrar.')
      .max(200, 'Sessão longa demais para registrar.'),
    segundos: z
      .number({ error: 'Informe a duração da sessão.' })
      .int('A duração é um número inteiro de segundos.')
      .min(
        SEGUNDOS_MINIMOS,
        `Pratique ao menos ${SEGUNDOS_MINIMOS} segundos para registrar.`
      )
      .max(SEGUNDOS_MAXIMOS, 'A sessão pode ter no máximo 60 minutos.'),
  })
  .strict()
  .refine(
    ({ tecnica, ciclos, segundos }) =>
      duracaoCoerente(tecnica, ciclos, segundos),
    {
      message: 'A duração não corresponde aos ciclos feitos.',
      path: ['segundos'],
    }
  );

export type SessaoDeRespiracao = z.infer<typeof sessaoDeRespiracaoSchema>;

// ---------------------------------------------------------------------------
// Recomendação do momento
// ---------------------------------------------------------------------------

export interface Recomendacao {
  tecnica: Tecnica;
  minutos: number;
  /** "Por que agora", com a origem do motivo (registro do dia ou relógio do Ayurveda). */
  porque: string;
}

/**
 * Técnica sugerida para o momento, explicável: o estresse registrado hoje
 * pesa primeiro; sem ele alto, vale a fase do relógio do Ayurveda (e a
 * prontidão baixa pede o ritmo estável da quadrada).
 */
export function recomendarTecnica({
  hora,
  estresse,
  prontidao,
}: {
  /** Hora local (0 a 23) da cidade da pessoa. */
  hora: number;
  /** Estresse do registro de hoje (0 a 100), quando informado. */
  estresse: number | null;
  /** Prontidão de hoje (0 a 100), quando calculada. */
  prontidao: number | null;
}): Recomendacao {
  if (estresse !== null && estresse >= 60) {
    return {
      tecnica: '4-7-8',
      minutos: 3,
      porque: `Seu estresse registrado hoje está em ${estresse}/100: a expiração longa do 4-7-8 ajuda a desacelerar.`,
    };
  }
  const relogio = doshaDoRelogio(hora);
  // Das 18 h às 2 h (Kapha da noite e Pitta da madrugada) o corpo se prepara
  // para dormir ou se repara no sono: nada que desperte.
  if (hora >= 18 || hora < 2) {
    return {
      tecnica: '4-7-8',
      minutos: 3,
      porque: `Agora (${relogio.faixa}) ${relogio.sentido}. A expiração longa do 4-7-8 desacelera e prepara o sono.`,
    };
  }
  if (relogio.dosha === 'vata') {
    return {
      tecnica: 'nadi_shodhana',
      minutos: 5,
      porque: `Agora (${relogio.faixa}) ${relogio.sentido}. A respiração alternada equilibra essa energia.`,
    };
  }
  if (prontidao !== null && prontidao < 55) {
    return {
      tecnica: 'quadrada',
      minutos: 3,
      porque: `Sua prontidão hoje está em ${prontidao}: o ritmo estável da respiração quadrada ajuda a retomar o centro sem exigir do corpo.`,
    };
  }
  if (relogio.dosha === 'kapha') {
    // Kapha da manhã (6 h–10 h): o corpo pesa se ficar parado.
    return {
      tecnica: 'quadrada',
      minutos: 3,
      porque: `Agora (${relogio.faixa}) ${relogio.sentido}. O ritmo firme da respiração quadrada desperta a atenção.`,
    };
  }
  // Pitta do meio do dia (10 h–14 h): foco e calor no auge.
  return {
    tecnica: '4-7-8',
    minutos: 3,
    porque: `Agora (${relogio.faixa}) ${relogio.sentido}. A expiração longa do 4-7-8 acalma e esfria.`,
  };
}
