'use client';

import { useMemo } from 'react';

import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { getPlanFeature } from '@/lib/plans/access';
import { PlanFeatureKey } from '@/types/subscription';

export function usePlanFeatureAccess(featureKey: PlanFeatureKey) {
  const { data, loading, refresh } = useAccountSubscription();

  const feature = useMemo(
    () => getPlanFeature(data, featureKey),
    [data, featureKey]
  );

  return {
    subscription: data,
    feature,
    enabled: feature?.enabled ?? false,
    loading,
    refresh,
  };
}
