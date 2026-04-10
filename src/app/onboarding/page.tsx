import { OnboardingForm } from '@/components/onboarding/onboarding-form';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <PuckClientRenderer documentKey="onboarding" className="w-full flex-shrink-0" />
      <OnboardingForm />
    </div>
  );
}
