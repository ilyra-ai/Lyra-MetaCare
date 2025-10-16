"use client";

export function getMockAIResponse(userInput: string): string {
  const lowerInput = userInput.toLowerCase();

  if (lowerInput.includes("sono") || lowerInput.includes("dormir")) {
    return "Para melhorar seu sono, tente manter um horário regular, evite telas antes de deitar e certifique-se de que seu quarto esteja escuro e silencioso. Seus dados mostram que seu sono REM foi 15% menor ontem. Que tal uma meditação de 10 minutos hoje à noite?";
  }
  if (lowerInput.includes("resumo") || lowerInput.includes("ontem")) {
    return "Claro! Ontem você deu 8.245 passos, dormiu por 7h15m e sua frequência cardíaca de repouso foi de 58 BPM. Seu score de prontidão hoje é 85. Ótimo trabalho!";
  }
  if (lowerInput.includes("agendar") || lowerInput.includes("consulta")) {
    return "Entendido. Para agendar uma consulta com um especialista, por favor, me diga qual especialidade você procura e qual o melhor horário para você.";
  }
  if (lowerInput.includes("dieta") || lowerInput.includes("comer")) {
    return "Com base nos seus objetivos, recomendo focar em uma ingestão de 1.2g de proteína por kg de peso. Adicionar uma fonte de proteína no café da manhã, como ovos ou iogurte grego, pode ajudar a atingir essa meta.";
  }
  if (lowerInput.includes("obrigado") || lowerInput.includes("valeu")) {
    return "De nada! Estou aqui para ajudar. Se precisar de mais alguma coisa, é só perguntar.";
  }

  return "Não tenho certeza de como responder a isso. Você poderia reformular a pergunta? Posso ajudar com resumos de dados, dicas de saúde ou agendamentos.";
}