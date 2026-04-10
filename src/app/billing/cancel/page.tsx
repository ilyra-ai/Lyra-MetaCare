import { Suspense } from 'react';

import { SplashScreen } from '@/components/SplashScreen';
import { BillingReturnExperience } from '@/components/subscription/BillingReturnExperience';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';

export default function BillingCancelPage() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <BillingReturnExperience mode="cancel" />
    </Suspense>
  );
}
