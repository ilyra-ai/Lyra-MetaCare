'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { AccountBillingContext } from '@/types/subscription';

interface UseAccountBillingResult {
  data: AccountBillingContext | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

function extractApiError(payload: unknown) {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }

  return undefined;
}

export function useAccountBilling(): UseAccountBillingResult {
  const { session } = useAuth();
  const [data, setData] = React.useState<AccountBillingContext | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!session?.user) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/account/billing', {
        credentials: 'include',
      });
      const payload = (await response.json()) as
        AccountBillingContext | { error?: string };

      if (!response.ok || !('environment' in payload)) {
        throw new Error(
          extractApiError(payload) || 'Falha ao carregar o contexto de billing.'
        );
      }

      setData(payload);
    } catch (error) {
      toast.error('Falha ao carregar billing da conta.', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido.',
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [session]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
