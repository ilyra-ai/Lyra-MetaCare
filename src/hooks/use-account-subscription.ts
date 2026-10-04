'use client';

import {
  useAccountResource,
  UseAccountResourceResult,
} from '@/hooks/use-account-resource';
import { AccountSubscriptionSummary } from '@/types/subscription';

function isAccountSubscriptionSummary(
  payload: unknown
): payload is AccountSubscriptionSummary {
  return typeof payload === 'object' && payload !== null && 'plan' in payload;
}

export function useAccountSubscription(): UseAccountResourceResult<AccountSubscriptionSummary> {
  return useAccountResource({
    endpoint: '/api/account/subscription',
    isValid: isAccountSubscriptionSummary,
    fallbackErrorMessage: 'Falha ao carregar o plano atual.',
    errorToastTitle: 'Falha ao carregar o plano atual.',
  });
}
