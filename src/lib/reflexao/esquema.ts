import { z } from 'zod';

/**
 * Reflexão da noite (tarefa 44): a pessoa fecha o dia dando uma nota de 1 a
 * 5 para a parte emocional, o corpo e a parte espiritual, e escreve uma frase
 * opcional. O mesmo schema valida o formulário no navegador e a gravação no
 * servidor.
 */

export const DIMENSOES_DA_REFLEXAO = [
  {
    chave: 'emocional',
    rotulo: 'Emocional',
    descricao: 'Como estiveram as emoções e os encontros de hoje',
  },
  {
    chave: 'corpo',
    rotulo: 'Corpo',
    descricao: 'Energia, disposição e sinais do corpo',
  },
  {
    chave: 'espiritual',
    rotulo: 'Espiritual',
    descricao: 'Presença, sentido e conexão com o que importa',
  },
] as const;

export type DimensaoDaReflexao =
  (typeof DIMENSOES_DA_REFLEXAO)[number]['chave'];

/** Significado de cada nota, lido também por leitores de tela. */
export const SIGNIFICADO_DA_NOTA: Record<number, string> = {
  1: 'muito difícil',
  2: 'difícil',
  3: 'equilibrado',
  4: 'bom',
  5: 'muito bom',
};

export const LIMITE_DA_FRASE = 280;

const nota = (rotulo: string) =>
  z
    .number({ error: `${rotulo}: escolha uma nota de 1 a 5.` })
    .int(`${rotulo}: escolha uma nota de 1 a 5.`)
    .min(1, `${rotulo}: escolha uma nota de 1 a 5.`)
    .max(5, `${rotulo}: escolha uma nota de 1 a 5.`);

/**
 * Caracteres de controle (exceto a quebra de linha) não têm lugar numa frase
 * curta e atrapalhariam a exibição e a exportação dos dados.
 */
export function semCaracteresDeControle(texto: string) {
  return Array.from(texto)
    .filter((caractere) => {
      const codigo = caractere.codePointAt(0) ?? 0;
      return codigo === 10 || (codigo >= 32 && codigo !== 127);
    })
    .join('');
}

const frase = z
  .string({ error: 'A frase precisa ser um texto.' })
  .transform((texto) => semCaracteresDeControle(texto).trim())
  .pipe(
    z
      .string()
      .max(
        LIMITE_DA_FRASE,
        `A frase pode ter até ${LIMITE_DA_FRASE} caracteres.`
      )
  )
  .transform((texto) => (texto.length > 0 ? texto : null));

export const reflexaoSchema = z
  .object({
    /** Data local (AAAA-MM-DD); sem ela, vale o dia de hoje da pessoa. */
    data: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data da reflexão inválida.')
      .optional(),
    emocional: nota('Emocional'),
    corpo: nota('Corpo'),
    espiritual: nota('Espiritual'),
    frase: frase.nullable().optional(),
  })
  .strict();

export type EntradaDaReflexao = z.input<typeof reflexaoSchema>;
export type ReflexaoValidada = z.output<typeof reflexaoSchema>;

export interface Reflexao {
  data: string;
  emocional: number;
  corpo: number;
  espiritual: number;
  frase: string | null;
  /** ISO 8601 (UTC) da última gravação. */
  atualizadaEm: string;
}

/** Resposta de `GET /api/reflexao`. */
export interface EstadoDaReflexao {
  /** Data local a que a reflexão se refere (hoje da pessoa, por padrão). */
  data: string;
  /** Datas aceitas para gravar: hoje e ontem (reflexão feita após a meia-noite). */
  datasPermitidas: string[];
  reflexao: Reflexao | null;
}
