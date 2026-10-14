import { calcularMapaNatal } from './mapa-natal';
import {
  ayanamshaLahiri,
  longitudeSideral,
  NAKSHATRAS,
  normalizarGraus,
  SIGNOS,
} from './sideral';
import { fusoValido } from './tempo';

/** Dados de nascimento do perfil (colunas de `profiles`). */
export interface BirthReference {
  birth_date?: string | Date | null;
  birth_time?: string | null;
  birth_location?: string | null;
  birth_latitude?: number | string | null;
  birth_longitude?: number | string | null;
  birth_timezone?: string | null;
}

export interface AstrologicalData {
  moonPhase: number;
  moonSign: string;
  sunSign: string;
  /** Mahadasha / Antardasha vigentes (só com nascimento completo). */
  currentDasha?: string;
  nakshatra: string;
  tithi: string;
  paksha: string;
  ayanamshaDegrees: number;
  impactOnHealth: {
    sleep: string;
    energy: string;
    stress: string;
  };
}

const shuklaTithis = [
  'Pratipada',
  'Dvitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Purnima',
];

const krishnaTithis = [...shuklaTithis.slice(0, 14), 'Amavasya'];

function buildTithi(phaseAngle: number) {
  const rawTithi = Math.floor(normalizarGraus(phaseAngle) / 12) + 1;
  const waxing = rawTithi <= 15;
  const paksha = waxing ? 'Shukla Paksha' : 'Krishna Paksha';
  const tithiNumber = waxing ? rawTithi : rawTithi - 15;
  const label = waxing
    ? shuklaTithis[tithiNumber - 1]
    : krishnaTithis[tithiNumber - 1];
  return {
    paksha,
    tithi: `${label} (${paksha})`,
  };
}

function buildHealthImpact(
  moonPhase: number,
  moonSign: string,
  paksha: string
) {
  const nearFullMoon = moonPhase >= 0.45 && moonPhase <= 0.55;
  const nearNewMoon = moonPhase <= 0.06 || moonPhase >= 0.94;

  if (nearFullMoon) {
    return {
      sleep:
        'Janela de Lua Cheia: maior chance de latência do sono e hiperalerta. Priorize luz baixa, temperatura ambiente menor e desaceleração cognitiva antecipada.',
      energy: `Expansão de energia em ${moonSign}. Use para treino técnico ou força submáxima, evitando excesso de intensidade à noite.`,
      stress:
        'Tendência de maior reatividade emocional. Respiração diafragmática, alongamento restaurativo e redução de estímulo social tardio ajudam a modular a carga autonômica.',
    };
  }

  if (nearNewMoon) {
    return {
      sleep:
        'Janela de Lua Nova: maior propensão a recuperação profunda. Vale consolidar rotina, ampliar higiene do sono e preservar horários consistentes.',
      energy: `Energia mais contida em ${moonSign}. Favorece recuperação ativa, mobilidade e trabalho aeróbico leve.`,
      stress:
        'Momento bom para introspecção, revisão de metas e redução de ruído decisório. Evite sobrecarga de agenda e excesso de cafeína.',
    };
  }

  if (paksha === 'Shukla Paksha') {
    return {
      sleep:
        'Fase de crescimento lunar com tendência a aumento progressivo de ativação. Termine o dia com rotina estável para não perder profundidade de sono.',
      energy: `Crescimento de energia em ${moonSign}. Janela favorável para construir volume de treino e consistência metabólica.`,
      stress:
        'Boa fase para planejamento e execução, desde que a carga externa não ultrapasse a recuperação percebida.',
    };
  }

  return {
    sleep:
      'Fase de recolhimento lunar. O corpo responde melhor a previsibilidade, menor estímulo noturno e redução de carga nas últimas horas do dia.',
    energy: `Energia em depuração sob ${moonSign}. Combine rotina, hidratação e movimento moderado com menor impulsividade.`,
    stress:
      'Tendência a sensibilidade maior a variações de humor e fadiga acumulada. Reforce pausas estratégicas e critérios de priorização.',
  };
}

function numero(valor: number | string | null | undefined) {
  if (valor === null || valor === undefined || valor === '') return null;
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : null;
}

function dataIso(valor: string | Date | null | undefined) {
  if (!valor) return null;
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}/.test(valor) ? valor.slice(0, 10) : null;
}

/**
 * Mahadasha e Antardasha vigentes, calculados do mapa natal real. Exige data
 * de nascimento e local escolhido da base de cidades (coordenadas e fuso);
 * antes este campo era só um texto fixo.
 */
function buildCurrentDasha(date: Date, nascimento?: BirthReference) {
  const data = dataIso(nascimento?.birth_date);
  const latitude = numero(nascimento?.birth_latitude);
  const longitude = numero(nascimento?.birth_longitude);
  const fuso = nascimento?.birth_timezone;
  if (
    !data ||
    latitude === null ||
    longitude === null ||
    !fuso ||
    !fusoValido(fuso)
  ) {
    return undefined;
  }
  const dasha = calcularMapaNatal(
    {
      data,
      hora: nascimento?.birth_time ? nascimento.birth_time.slice(0, 5) : null,
      latitude,
      longitude,
      fuso,
    },
    date
  ).dasha;
  if (!dasha) return undefined;
  const ate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dasha.antardasha.fim);
  return `Mahadasha de ${dasha.mahadasha.nome}, Antardasha de ${dasha.antardasha.nome} (até ${ate})`;
}

export function getAstrologicalContext(
  date: Date = new Date(),
  birthReference?: BirthReference
): AstrologicalData {
  const ayanamshaDegrees = Number(ayanamshaLahiri(date).toFixed(6));
  const siderealMoonLongitude = longitudeSideral('lua', date);
  const siderealSunLongitude = longitudeSideral('sol', date);
  const phaseAngle = normalizarGraus(
    siderealMoonLongitude - siderealSunLongitude
  );
  const moonPhase = Number((phaseAngle / 360).toFixed(6));

  const moonSignIndex = Math.floor(siderealMoonLongitude / 30);
  const sunSignIndex = Math.floor(siderealSunLongitude / 30);
  const nakshatraIndex = Math.floor(siderealMoonLongitude / (360 / 27));
  const { paksha, tithi } = buildTithi(phaseAngle);

  return {
    moonPhase,
    moonSign: SIGNOS[moonSignIndex],
    sunSign: SIGNOS[sunSignIndex],
    currentDasha: buildCurrentDasha(date, birthReference),
    nakshatra: NAKSHATRAS[nakshatraIndex],
    tithi,
    paksha,
    ayanamshaDegrees,
    impactOnHealth: buildHealthImpact(moonPhase, SIGNOS[moonSignIndex], paksha),
  };
}
