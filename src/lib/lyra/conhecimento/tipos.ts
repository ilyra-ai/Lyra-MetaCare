/**
 * Formato comum dos verbetes da base de conhecimento da Lyra (tarefa 55).
 * Cada verbete é curado (escrito e conferido à mão, a partir das fontes
 * citadas) e serve ao motor determinístico: a Lyra responde perguntas e
 * monta leituras sem precisar de um modelo de IA.
 */

export type AreaDoConhecimento =
  'vedanta' | 'upaveda' | 'vedanga' | 'jyotish' | 'mapa';

export interface Verbete {
  /** Identificador estável (kebab-case). */
  id: string;
  area: AreaDoConhecimento;
  titulo: string;
  /** Uma ou duas frases: o essencial, em linguagem simples. */
  resumo: string;
  /** Pontos centrais do ensinamento. */
  pontos: string[];
  /** Como trazer para o dia a dia (bem-estar e autoconhecimento). */
  pratica: string;
  /** Termos que levam a este verbete numa pergunta (sem acento, minúsculas). */
  palavrasChave: string[];
  /** Fonte tradicional ou documento de origem. */
  fonte: string;
}
