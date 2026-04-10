import { Body, Ecliptic, GeoVector, MakeTime } from 'astronomy-engine';

interface BirthReference {
  birth_timestamp_utc?: string | null;
  birth_date?: string | null;
  birth_time?: string | null;
  birth_location?: string | null;
}

export interface AstrologicalData {
  moonPhase: number;
  moonSign: string;
  sunSign: string;
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

const zodiacSigns = [
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
];

const nakshatras = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

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

const krishnaTithis = [
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
  'Amavasya',
];

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function calculateLahiriAyanamsha(date: Date) {
  const j2000Utc = Date.UTC(2000, 0, 1, 12, 0, 0);
  const tropicalYears =
    (date.getTime() - j2000Utc) / (365.24219879 * 24 * 60 * 60 * 1000);
  const baseDegrees = 23.8530555556;
  const annualPrecessionDegrees = 0.0139694444;
  const secularCorrection = -0.00000036 * tropicalYears * tropicalYears;
  return Number(
    (
      baseDegrees +
      tropicalYears * annualPrecessionDegrees +
      secularCorrection
    ).toFixed(6)
  );
}

function getSiderealLongitude(
  body: Body,
  date: Date,
  ayanamshaDegrees: number
) {
  const time = MakeTime(date);
  const ecliptic = Ecliptic(GeoVector(body, time, true));
  return normalizeDegrees(ecliptic.elon - ayanamshaDegrees);
}

function buildTithi(phaseAngle: number) {
  const rawTithi = Math.floor(normalizeDegrees(phaseAngle) / 12) + 1;
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

function buildCurrentDasha(birthReference?: BirthReference) {
  if (!birthReference?.birth_timestamp_utc) {
    return undefined;
  }

  return `Vimshottari calculável a partir do timestamp UTC ${birthReference.birth_timestamp_utc}.`;
}

export function getAstrologicalContext(
  date: Date = new Date(),
  birthReference?: BirthReference
): AstrologicalData {
  const ayanamshaDegrees = calculateLahiriAyanamsha(date);
  const siderealMoonLongitude = getSiderealLongitude(
    Body.Moon,
    date,
    ayanamshaDegrees
  );
  const siderealSunLongitude = getSiderealLongitude(
    Body.Sun,
    date,
    ayanamshaDegrees
  );
  const phaseAngle = normalizeDegrees(
    siderealMoonLongitude - siderealSunLongitude
  );
  const moonPhase = Number((phaseAngle / 360).toFixed(6));

  const moonSignIndex = Math.floor(siderealMoonLongitude / 30);
  const sunSignIndex = Math.floor(siderealSunLongitude / 30);
  const nakshatraIndex = Math.floor(siderealMoonLongitude / (360 / 27));
  const { paksha, tithi } = buildTithi(phaseAngle);

  return {
    moonPhase,
    moonSign: zodiacSigns[moonSignIndex],
    sunSign: zodiacSigns[sunSignIndex],
    currentDasha: buildCurrentDasha(birthReference),
    nakshatra: nakshatras[nakshatraIndex],
    tithi,
    paksha,
    ayanamshaDegrees,
    impactOnHealth: buildHealthImpact(
      moonPhase,
      zodiacSigns[moonSignIndex],
      paksha
    ),
  };
}
