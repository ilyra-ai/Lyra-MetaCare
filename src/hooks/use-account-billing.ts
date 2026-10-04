'use client';

import {
  useAccountResource,
  UseAccountResourceResult,
} from '@/hooks/use-account-resource';
import { AccountBillingContext } from '@/types/subscription';

function isAccountBillingContext(
  payload: unknown
): payload is AccountBillingContext {
  return (
    typeof payload === 'object' && payload !== null && 'environment' in payload
  );
}

export function useAccountBilling(): UseAccountResourceResult<AccountBillingContext> {
  return useAccountResource({
    endpoint: '/api/account/billing',
    isValid: isAccountBillingContext,
    fallbackErrorMessage: 'Falha ao carregar o contexto de billing.',
    errorToastTitle: 'Falha ao carregar billing da conta.',
  });
}
