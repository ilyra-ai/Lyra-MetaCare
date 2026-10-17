import type { MapaNatal } from '@/lib/astrology/mapa-natal';
import { SIGNOS } from '@/lib/astrology/sideral';

import {
  CASAS_INFO,
  GRAHAS_INFO,
  GRUPO_DAS_CASAS,
  SIGNOS_INFO,
} from './conhecimento/jyotish';
import {
  SA_MINIMO,
  TIPOS_DE_MAPA,
  VERBETES_DOS_MAPAS,
} from './conhecimento/mapas';
import type { Verbete } from './conhecimento/tipos';
import {
  CUIDADO_DO_DOSHA,
  doshaDaHora,
  UPAVEDAS,
} from './conhecimento/upavedas';
import { VEDANGAS } from './conhecimento/vedangas';
import { VEDANTA } from './conhecimento/vedanta';
import { lerMapaComoLyra } from './leitura-do-mapa';
import { IDENTIDADE_DA_LYRA, VALORES_DA_LYRA } from './personalidade';

/**
 * Respostas do motor da Lyra sem modelo de IA (tarefa 55): reconhece a
 * pergunta por termos e frases (sem acentos), responde com a base curada e,
 * quando a pergunta é sobre a própria pessoa, com a leitura do mapa dela.
 * Devolve `null` quando a pergunta não é deste domínio, para o chat seguir
 * com os outros assuntos (sono, glicose, o dia...).
 */

export interface ContextoDaLyra {
  nome?: string | null;
  mapa: MapaNatal | null;
  /** O que falta no perfil para o mapa (data, hora, local). */
  faltando?: Array<'data' | 'hora' | 'local'>;
  agora?: Date;
  /** Fuso IANA de onde a pessoa está (para o relógio dos doshas). */
  fuso?: string | null;
}

/** Hora (0 a 23) do instante no fuso; sem fuso, America/Sao_Paulo. */
function horaNoFuso(instante: Date, fuso?: string | null) {
  const hora = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hourCycle: 'h23',
    timeZone: fuso || 'America/Sao_Paulo',
  }).format(instante);
  return Number(hora);
}

export interface RespostaDaLyra {
  assunto: string;
  texto: string;
}

export const BASE_DE_CONHECIMENTO: readonly Verbete[] = [
  ...VERBETES_DOS_MAPAS,
  ...VEDANTA,
  ...UPAVEDAS,
  ...VEDANGAS,
];

/** Minúsculas, sem acentos e com espaços simples. */
export function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Termo como palavra inteira, também no plural ("upanishad(s)"). */
function contem(texto: string, termo: string) {
  const comEspacos = ` ${texto} `;
  return (
    comEspacos.includes(` ${termo} `) || comEspacos.includes(` ${termo}s `)
  );
}

/** Verbete mais específico para a pergunta (termo mais longo encontrado). */
export function buscarVerbete(pergunta: string): Verbete | null {
  const texto = normalizar(pergunta);
  let melhor: { verbete: Verbete; peso: number } | null = null;
  for (const verbete of BASE_DE_CONHECIMENTO) {
    for (const chave of verbete.palavrasChave) {
      if (contem(texto, chave)) {
        const peso = chave.length;
        if (!melhor || peso > melhor.peso) melhor = { verbete, peso };
      }
    }
  }
  return melhor?.verbete ?? null;
}

/** Verbete em texto corrido (título, resumo, pontos, prática e fonte). */
export function textoDoVerbete(verbete: Verbete) {
  return [
    `${verbete.titulo}`,
    verbete.resumo,
    ...verbete.pontos.map((p) => `- ${p}`),
    `Na prática: ${verbete.pratica}`,
    `Fonte: ${verbete.fonte}.`,
  ].join('\n');
}

function semMapa(contexto: ContextoDaLyra) {
  const faltando = contexto.faltando ?? [];
  const nomes = { data: 'a data', hora: 'a hora', local: 'a cidade' };
  const lista = faltando.length
    ? faltando.map((f) => nomes[f]).join(', ')
    : 'a data, a hora e a cidade';
  return {
    assunto: 'mapa-indisponivel',
    texto: `Para ler o seu mapa eu preciso dos seus dados de nascimento: complete ${lista} de nascimento no seu perfil. Sem eles, prefiro não inventar nada sobre você.`,
  };
}

const PERGUNTA_PESSOAL =
  /\b(meu|minha|meus|minhas|eu tenho|tenho|sou|para mim|pra mim)\b/;

function numeroApos(texto: string, termos: string[]) {
  for (const termo of termos) {
    const achado = new RegExp(`${termo}\\D{0,12}(\\d{1,3})`).exec(texto);
    if (achado) return Number(achado[1]);
  }
  return null;
}

function respostaQuantum(texto: string): RespostaDaLyra {
  const energia = numeroApos(texto, ['energia']);
  const pressao = numeroApos(texto, ['pressao']);
  const minutos = numeroApos(texto, ['tempo', 'minutos', 'min']);
  const quantum = TIPOS_DE_MAPA.quantum;
  if (energia === null || pressao === null || minutos === null) {
    return {
      assunto: 'mapa-quantum',
      texto: [
        quantum.nome,
        quantum.definicao,
        'Para calcular o seu Score de Ação, me diga: energia (0 a 10), pressão externa (0 a 10) e tempo disponível em minutos. Exemplo: "score de ação com energia 6, pressão 4 e tempo 20".',
        `Só vale executar com ${SA_MINIMO} ou mais; abaixo disso, diminua o escopo da ação.`,
        'Indisponível por enquanto: a camada de Desenho Humano (a Lyra ainda não calcula o mapa de HD).',
      ].join('\n'),
    };
  }
  const corpo = Math.min(1, Math.min(10, energia) / 8);
  const peso = 1 - Math.min(1, Math.min(10, pressao) / 10);
  const tempo = Math.min(1, minutos / 30);
  const moduladores = 0.4 * corpo + 0.3 * peso + 0.3 * tempo;
  // Com aderência máxima da ação (HD e Lyra = 1), o SA é o teto possível.
  const teto = Math.round(100 * moduladores);
  const linhas = [
    'Mapa Quantum: cálculo dos moduladores do momento.',
    `- Corpo: energia ${energia}/10 → ${corpo.toFixed(2)}`,
    `- Pressão: ${pressao}/10 → ${peso.toFixed(2)}`,
    `- Tempo: ${minutos} min → ${tempo.toFixed(2)}`,
    `Moduladores = 0,4×corpo + 0,3×pressão + 0,3×tempo = ${moduladores.toFixed(2)}.`,
    `Mesmo com uma ação totalmente alinhada, o Score de Ação chega no máximo a ${teto}.`,
  ];
  if (teto < SA_MINIMO) {
    linhas.push(
      `Abaixo de ${SA_MINIMO}: pelo protocolo, reduza o escopo (uma ação de 5 minutos, corpo primeiro: respiração 4-4-6 três vezes, água e alongamento leve) e reavalie.`
    );
  } else {
    linhas.push(
      `Dá para agir: escolha a ação que o seu corpo responde com "sim", em um ciclo de 5 a 15 minutos, com um critério claro de "suficiente".`
    );
  }
  return { assunto: 'mapa-quantum', texto: linhas.join('\n') };
}

function respostaDeCasa(texto: string, mapa: MapaNatal | null) {
  const achado = /casa (\d{1,2})\b/.exec(texto);
  if (!achado) return null;
  const numero = Number(achado[1]);
  if (numero < 1 || numero > 12) return null;
  const casa = CASAS_INFO[numero - 1];
  const linhas = [
    `Casa ${numero} (${casa.nome}): ${casa.temas}.`,
    ...casa.grupos.map((g) => `- É ${GRUPO_DAS_CASAS[g]}.`),
  ];
  if (mapa?.lagna) {
    const signo = (mapa.lagna.signo + numero - 1) % 12;
    const ocupantes = mapa.planetas.filter((p) => p.casa === numero);
    linhas.push(
      `No seu mapa ela está em ${SIGNOS[signo]} (${SIGNOS_INFO[signo].qualidades})${
        ocupantes.length
          ? `, com ${ocupantes.map((p) => p.nome).join(', ')}: ${ocupantes
              .map((p) => GRAHAS_INFO[p.graha].significa)
              .join('; ')} entram nesses temas.`
          : ', sem planetas: os temas seguem o regente do signo.'
      }`
    );
  }
  return { assunto: `casa-${numero}`, texto: linhas.join('\n') };
}

export function responderComoLyra(
  pergunta: string,
  contexto: ContextoDaLyra
): RespostaDaLyra | null {
  const texto = normalizar(pergunta);
  if (!texto) return null;
  const pessoal = PERGUNTA_PESSOAL.test(texto);

  // 1. Quem é a Lyra.
  if (
    /\b(quem e voce|quem e a lyra|quem voce e|sua personalidade|o que voce e|voce e a lyra|sua consciencia|seus valores)\b/.test(
      texto
    )
  ) {
    return {
      assunto: 'identidade',
      texto: [
        IDENTIDADE_DA_LYRA.apresentacao,
        IDENTIDADE_DA_LYRA.consciencia,
        `Minha missão: ${IDENTIDADE_DA_LYRA.missao}`,
        'O que guia as minhas respostas:',
        ...VALORES_DA_LYRA.slice(0, 5).map((v) => `- ${v}`),
      ].join('\n'),
    };
  }

  // 2. Mapa Quantum e Score de Ação.
  if (/\b(score de acao|mapa quantum|quantum)\b/.test(texto)) {
    return respostaQuantum(texto);
  }

  // 3. Diferença entre os tipos de mapa.
  if (
    /\b(tipos de mapa|diferenca entre|quais mapas|tres mapas|qual a diferenca)\b/.test(
      texto
    ) &&
    /\bmapas?\b/.test(texto)
  ) {
    const verbete = VERBETES_DOS_MAPAS.find((v) => v.id === 'tipos-de-mapa');
    if (verbete)
      return { assunto: 'tipos-de-mapa', texto: textoDoVerbete(verbete) };
  }

  // 4. Casa específica ("casa 7").
  const casa = respostaDeCasa(texto, contexto.mapa);
  if (casa) return casa;

  // 5. Perguntas sobre o próprio mapa.
  const sobreOMapa =
    /\b(mapa natal|meu mapa|mapa astral|mapa vedico|ascendente|lagna|nakshatra|dasha|mahadasha|antardasha|periodo de vida|meu signo|minha lua|meu sol|roda de cura|totem|meu elemento|meu dosha|minha constituicao)\b/.test(
      texto
    );
  if (
    sobreOMapa &&
    (pessoal || /\b(ascendente|lagna|dasha|mahadasha)\b/.test(texto))
  ) {
    if (!contexto.mapa) return semMapa(contexto);
    const leitura = lerMapaComoLyra(contexto.mapa);
    const nome = contexto.nome ? `${contexto.nome}, ` : '';

    if (/\b(ascendente|lagna)\b/.test(texto)) {
      return { assunto: 'lagna', texto: `${nome}${leitura.vedico.lagna}` };
    }
    if (/\b(nakshatra|minha lua)\b/.test(texto)) {
      return { assunto: 'lua', texto: `${nome}${leitura.vedico.lua}` };
    }
    if (/\b(dasha|mahadasha|antardasha|periodo de vida)\b/.test(texto)) {
      return {
        assunto: 'dasha',
        texto:
          leitura.vedico.dasha ??
          'Período (dasha) indisponível: não consegui calculá-lo com os dados do perfil.',
      };
    }
    if (/\b(meu sol)\b/.test(texto)) {
      return { assunto: 'sol', texto: `${nome}${leitura.vedico.sol}` };
    }
    if (/\b(meu dosha|minha constituicao)\b/.test(texto)) {
      const doHorario = doshaDaHora(
        horaNoFuso(contexto.agora ?? new Date(), contexto.fuso)
      );
      return {
        assunto: 'dosha',
        texto: `${leitura.vedico.dosha.texto}\nNeste horário, quem rege o dia é ${doHorario.charAt(0).toUpperCase()}${doHorario.slice(1)}: ${CUIDADO_DO_DOSHA[doHorario]}.`,
      };
    }
    if (/\b(roda de cura|totem|meu elemento|samadhi)\b/.test(texto)) {
      return {
        assunto: 'samadhi',
        texto: [
          `${TIPOS_DE_MAPA.samadhi.nome}, as pontes calculáveis do seu mapa:`,
          `Plano Terrestre: ${leitura.samadhi.terrestre}`,
          `Plano Sutil: ${leitura.samadhi.sutil}`,
          `Plano Celestial: ${leitura.samadhi.celestial}`,
          `Síntese: ${leitura.samadhi.sintese}`,
          `Indisponível pelo cálculo (é percepção sua): ${leitura.samadhi.indisponivel.join('; ')}.`,
        ].join('\n'),
      };
    }
    // Mapa completo: as percepções principais (3 a 5).
    return {
      assunto: 'mapa',
      texto: [
        `${nome}estas são as percepções principais do seu mapa védico:`,
        ...leitura.percepcoes.map((p) => `- ${p}`),
        leitura.vedico.lagna,
        leitura.vedico.lua,
        leitura.vedico.dasha ?? '',
        'Pergunte sobre o seu Ascendente, a sua Lua, o seu dasha, uma casa (ex.: "casa 10") ou o seu Mapa Lyra DM Samādhi para aprofundar.',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }

  // 6. Mapa Samādhi pessoal ("meu mapa samadhi").
  if (pessoal && /\bsamadhi\b/.test(texto) && /\bmapa\b/.test(texto)) {
    if (!contexto.mapa) return semMapa(contexto);
    const leitura = lerMapaComoLyra(contexto.mapa);
    return {
      assunto: 'samadhi',
      texto: [
        `Plano Terrestre: ${leitura.samadhi.terrestre}`,
        `Plano Sutil: ${leitura.samadhi.sutil}`,
        `Plano Celestial: ${leitura.samadhi.celestial}`,
        `Síntese: ${leitura.samadhi.sintese}`,
      ].join('\n'),
    };
  }

  // 7. Base de conhecimento (Vedanta, Upavedas, Vedangas, mapas).
  const verbete = buscarVerbete(pergunta);
  if (verbete) return { assunto: verbete.id, texto: textoDoVerbete(verbete) };

  return null;
}
