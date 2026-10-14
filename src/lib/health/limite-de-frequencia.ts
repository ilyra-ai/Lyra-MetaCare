/**
 * Limite pessoal de frequência cardíaca para avisos (tarefa 43): 90% da
 * frequência máxima estimada pela fórmula de Tanaka (208 − 0,7 × idade),
 * mais precisa que 220 − idade em adultos. Antes o aviso usava 120 bpm
 * fixos para todo mundo. Sem idade conhecida, não há limite (o aviso fica
 * desligado e a tela pede a idade).
 */
export function limiteDeFrequencia(idade: number | null) {
  if (idade === null || !Number.isFinite(idade) || idade < 13 || idade > 110) {
    return null;
  }
  return Math.round(0.9 * (208 - 0.7 * idade));
}
