import { OnboardingForm } from '@/components/onboarding/onboarding-form';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';

export default function OnboardingPage() {
  return (
    <div className="page-shell flex min-h-screen w-full items-center justify-center p-4">
      <PuckClientRenderer
        documentKey="onboarding"
        className="w-full flex-shrink-0"
      />
      <OnboardingForm />
    </div>
  );
}
