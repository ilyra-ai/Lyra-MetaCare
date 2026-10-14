/**
 * Formato do "Seu dia", o briefing diário do coach (tarefa 42). É gravado como
 * JSON em `daily_briefings.conteudo` e lido pelo painel, pela página "Meu
 * dia", pelo sino e pelo chat.
 */

export type Tom = 'favoravel' | 'misto' | 'atencao';
export type Qualidade = 'favoravel' | 'neutro' | 'desfavoravel';

/** Janela marcada na linha do tempo (horário local do lugar do dia). */
export interface Janela {
  tipo:
    | 'brahma_muhurta'
    | 'abhijit'
    | 'rahu_kalam'
    | 'yamaganda'
    | 'gulika'
    | 'choghadiya'
    | 'troca_de_nakshatra'
    | 'nascer_do_sol'
    | 'por_do_sol';
  nome: string;
  qualidade: Qualidade;
  /** ISO 8601 (UTC). */
  inicio: string;
  fim: string;
  /** "06:12–07:48" no fuso do lugar. */
  horario: string;
  sentido: string;
}

export interface Periodo {
  chave: 'madrugada' | 'manha' | 'tarde' | 'noite';
  nome: string;
  inicio: string;
  fim: string;
  horario: string;
  qualidade: Qualidade;
  /** 0 a 100: proporção de tempo favorável, descontadas as janelas de cautela. */
  nota: number;
  destaques: Janela[];
  cuidados: Janela[];
  /** Melhor uso do período, em uma frase. */
  sugestao: string;
}

/** Dica com a explicação de onde ela vem (IA explicável). */
export interface Dica {
  texto: string;
  porque: string;
}

export interface Prontidao {
  /** 0 a 100, ou null sem dados suficientes no dia. */
  valor: number | null;
  rotulo: string;
  /** Sinais do dia usados no cálculo. */
  base: string[];
}

export interface BriefingDoDia {
  versao: 1;
  data: string;
  geradoEm: string;
  origem: 'local' | 'gemini';
  local: { rotulo: string; fuso: string };
  /** Primeiro nome, para a saudação (que a tela monta pela hora local). */
  nome: string | null;
  tom: Tom;
  manchete: string;
  resumo: string;
  prontidao: Prontidao;
  periodos: Periodo[];
  /** Os três pontos principais do dia. */
  focos: Dica[];
  cuidados: Dica[];
  recomendacoes: {
    saude: Dica[];
    alimentacao: Dica[];
    movimento: Dica[];
    mente: Dica[];
    sono: Dica[];
  };
  ceu: {
    vara: string;
    tithi: string;
    paksha: string;
    nakshatra: string;
    naturezaDoNakshatra: string;
    divindade: string;
    yoga: string;
    karana: string;
    signoDaLua: string;
    nascerDoSol: string;
    porDoSol: string;
    tara: { nome: string; qualidade: Qualidade; sentido: string } | null;
    chandrashtama: boolean;
    dasha: string | null;
  };
  ciclo: { fase: string; dia: number | null } | null;
  dosha: {
    dominante: 'vata' | 'pitta' | 'kapha';
    nome: string;
    percentuais: { vata: number; pitta: number; kapha: number };
    /** `metricas`: calculado dos sinais do dia; `lua`: sem sinais suficientes, pesa a Lua do dia. */
    base: 'metricas' | 'lua';
  };
  alertas: Dica[];
  /** O que faltou para um coach mais preciso (ex.: hora de nascimento). */
  completar: string[];
}

/** Resposta de `GET /api/coach/hoje`. */
export type EstadoDoCoach =
  | {
      estado: 'pronto';
      briefing: BriefingDoDia;
      /** "Isso te ajudou?": 1 sim, -1 não, null sem resposta. */
      feedback: 1 | -1 | null;
      /** `true` quando foi gerado ou refeito nesta leitura. */
      atualizado: boolean;
    }
  | { estado: 'sem_local'; faltando: Array<'data' | 'hora' | 'local'> }
  | { estado: 'sem_nascer_do_sol' };
