import { Suspense } from 'react';

import { SplashScreen } from '@/components/SplashScreen';
import { BillingReturnExperience } from '@/components/subscription/BillingReturnExperience';

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <BillingReturnExperience mode="success" />
    </Suspense>
  );
}
