import { z } from 'zod';

/**
 * Campos do registro do dia (check-in manual) e as faixas aceitas. A mesma
 * definição valida o formulário no navegador e a gravação no servidor
 * (tarefa 40); valores fora da faixa fisiológica plausível são recusados em
 * vez de distorcer painel, scores e coach.
 */
export interface DefinicaoDoCampo {
  coluna: string;
  rotulo: string;
  unidade?: string;
  minimo: number;
  maximo: number;
  /** Casas decimais aceitas (0 = inteiro). */
  casas: number;
}

export const CAMPOS_DO_REGISTRO = {
  sono: {
    coluna: 'sleep_duration_minutes',
    rotulo: 'Sono da última noite',
    unidade: 'min',
    minimo: 0,
    maximo: 1440,
    casas: 0,
  },
  humor: {
    coluna: 'mood_score',
    rotulo: 'Humor',
    minimo: 1,
    maximo: 5,
    casas: 0,
  },
  energia: {
    coluna: 'energy_level',
    rotulo: 'Energia',
    minimo: 1,
    maximo: 5,
    casas: 0,
  },
  estresse: {
    coluna: 'stress_score',
    rotulo: 'Estresse',
    unidade: '/100',
    minimo: 0,
    maximo: 100,
    casas: 0,
  },
  meditacao: {
    coluna: 'meditation_minutes',
    rotulo: 'Meditação e respiração',
    unidade: 'min',
    minimo: 0,
    maximo: 600,
    casas: 0,
  },
  passos: {
    coluna: 'steps',
    rotulo: 'Passos',
    minimo: 0,
    maximo: 150_000,
    casas: 0,
  },
  minutosAtivos: {
    coluna: 'active_minutes',
    rotulo: 'Minutos de atividade',
    unidade: 'min',
    minimo: 0,
    maximo: 1440,
    casas: 0,
  },
  agua: {
    coluna: 'water_liters',
    rotulo: 'Água',
    unidade: 'L',
    minimo: 0,
    maximo: 15,
    casas: 2,
  },
  cafeina: {
    coluna: 'caffeine_mg',
    rotulo: 'Cafeína',
    unidade: 'mg',
    minimo: 0,
    maximo: 2000,
    casas: 0,
  },
  proteina: {
    coluna: 'protein_grams',
    rotulo: 'Proteína',
    unidade: 'g',
    minimo: 0,
    maximo: 500,
    casas: 0,
  },
  peso: {
    coluna: 'weight_kg',
    rotulo: 'Peso',
    unidade: 'kg',
    minimo: 20,
    maximo: 400,
    casas: 1,
  },
  fcRepouso: {
    coluna: 'resting_heart_rate',
    rotulo: 'Frequência cardíaca de repouso',
    unidade: 'bpm',
    minimo: 25,
    maximo: 220,
    casas: 0,
  },
  glicemia: {
    coluna: 'blood_glucose_mgdl',
    rotulo: 'Glicemia',
    unidade: 'mg/dL',
    minimo: 20,
    maximo: 600,
    casas: 0,
  },
  pressaoSistolica: {
    coluna: 'blood_pressure_systolic',
    rotulo: 'Pressão sistólica',
    unidade: 'mmHg',
    minimo: 60,
    maximo: 260,
    casas: 0,
  },
  pressaoDiastolica: {
    coluna: 'blood_pressure_diastolic',
    rotulo: 'Pressão diastólica',
    unidade: 'mmHg',
    minimo: 30,
    maximo: 160,
    casas: 0,
  },
} as const satisfies Record<string, DefinicaoDoCampo>;

export type CampoDoRegistro = keyof typeof CAMPOS_DO_REGISTRO;
export const NOMES_DOS_CAMPOS = Object.keys(
  CAMPOS_DO_REGISTRO
) as CampoDoRegistro[];

function valorDoCampo(definicao: DefinicaoDoCampo) {
  const fator = 10 ** definicao.casas;
  const sufixo = definicao.unidade ? ` ${definicao.unidade}` : '';
  return z
    .number({ error: `${definicao.rotulo}: informe um número.` })
    .finite()
    .min(
      definicao.minimo,
      `${definicao.rotulo}: o mínimo é ${definicao.minimo}${sufixo}.`
    )
    .max(
      definicao.maximo,
      `${definicao.rotulo}: o máximo é ${definicao.maximo}${sufixo}.`
    )
    .refine(
      (valor) => Math.abs(Math.round(valor * fator) - valor * fator) < 1e-6,
      definicao.casas === 0
        ? `${definicao.rotulo}: use um número inteiro.`
        : `${definicao.rotulo}: use no máximo ${
            definicao.casas === 1
              ? '1 casa decimal'
              : `${definicao.casas} casas decimais`
          }.`
    );
}

const formatoDeData = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Data local do registro (AAAA-MM-DD). Aceita do dia de amanhã em UTC (fusos
 * a leste) até 7 dias atrás: o check-in é do dia, com uma semana para
 * completar o que faltou.
 */
export function dataDoRegistroValida(data: string, agora = new Date()) {
  if (!formatoDeData.test(data)) return false;
  const [ano, mes, dia] = data.split('-').map(Number);
  const instante = Date.UTC(ano, mes - 1, dia);
  const conferida = new Date(instante);
  if (
    conferida.getUTCFullYear() !== ano ||
    conferida.getUTCMonth() !== mes - 1 ||
    conferida.getUTCDate() !== dia
  ) {
    return false;
  }
  const hojeUtc = Date.UTC(
    agora.getUTCFullYear(),
    agora.getUTCMonth(),
    agora.getUTCDate()
  );
  const umDia = 24 * 60 * 60 * 1000;
  return instante <= hojeUtc + umDia && instante >= hojeUtc - 7 * umDia;
}

export const dataDoRegistroSchema = z
  .string()
  .refine(
    (data) => dataDoRegistroValida(data),
    'Data do registro inválida: use o dia de hoje ou um dos últimos 7 dias.'
  );

const valoresSchema = z
  .object(
    Object.fromEntries(
      NOMES_DOS_CAMPOS.map((campo) => [
        campo,
        valorDoCampo(CAMPOS_DO_REGISTRO[campo]).optional(),
      ])
    ) as {
      [K in CampoDoRegistro]: z.ZodOptional<ReturnType<typeof valorDoCampo>>;
    }
  )
  .strict();

export const registroDoDiaSchema = z
  .object({
    data: dataDoRegistroSchema,
    valores: valoresSchema,
  })
  .refine(
    ({ valores }) => Object.values(valores).some((v) => v !== undefined),
    { message: 'Informe ao menos uma métrica.', path: ['valores'] }
  )
  .refine(
    ({ valores }) =>
      valores.pressaoSistolica === undefined ||
      valores.pressaoDiastolica === undefined ||
      valores.pressaoDiastolica < valores.pressaoSistolica,
    {
      message: 'A pressão diastólica precisa ser menor que a sistólica.',
      path: ['valores', 'pressaoDiastolica'],
    }
  );

export type RegistroDoDia = z.infer<typeof registroDoDiaSchema>;

/**
 * Sessão da pulseira Bluetooth já agregada no navegador. A frequência de
 * repouso estimada é a menor média móvel de 60 s da sessão (só existe em
 * sessões de pelo menos 1 minuto) e a VFC é o RMSSD dos intervalos RR válidos.
 */
export const sessaoDoSensorSchema = z
  .object({
    data: dataDoRegistroSchema,
    minutos: z.number().finite().min(0.25).max(1440),
    amostras: z.number().int().min(5).max(200_000),
    fcMinima: z.number().finite().min(25).max(240),
    fcMaxima: z.number().finite().min(25).max(240),
    fcMedia: z.number().finite().min(25).max(240),
    fcRepousoEstimada: z.number().finite().min(25).max(240).nullable(),
    rmssd: z.number().finite().min(1).max(300).nullable(),
  })
  .strict()
  .refine(
    (s) => s.fcMinima <= s.fcMedia && s.fcMedia <= s.fcMaxima,
    'A frequência mínima, média e máxima da sessão não são coerentes.'
  )
  .refine(
    (s) =>
      s.fcRepousoEstimada === null ||
      (s.fcRepousoEstimada >= s.fcMinima && s.fcRepousoEstimada <= s.fcMaxima),
    'A frequência de repouso estimada está fora da faixa da sessão.'
  );

export type SessaoDoSensor = z.infer<typeof sessaoDoSensorSchema>;
