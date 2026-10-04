import { Suspense } from 'react';

import { SplashScreen } from '@/components/SplashScreen';
import { BillingReturnExperience } from '@/components/subscription/BillingReturnExperience';

export default function BillingCancelPage() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <BillingReturnExperience mode="cancel" />
    </Suspense>
  );
}
