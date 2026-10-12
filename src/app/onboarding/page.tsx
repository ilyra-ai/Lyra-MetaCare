import { OnboardingForm } from '@/components/onboarding/onboarding-form';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';

export default function OnboardingPage() {
  // Coluna única: o bloco editável (Puck) acima e o formulário abaixo, os
  // dois com a largura da tela. Antes era uma linha flex centralizada, e no
  // celular o formulário crescia até 672px e estourava para os dois lados
  // (o início dos cartões ficava fora da tela, sem como rolar até ele).
  return (
    <main
      id="conteudo-principal"
      className="page-shell flex min-h-dvh w-full flex-col items-center justify-start gap-6 px-4 py-6 sm:justify-center sm:p-6"
    >
      {/* Título da página para leitores de tela; cada etapa tem o próprio
          título visível. */}
      <h1 className="sr-only">Configuração inicial do seu perfil</h1>
      <PuckClientRenderer
        documentKey="onboarding"
        className="w-full max-w-2xl"
      />
      <OnboardingForm />
    </main>
  );
}
