'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { AccountSubscriptionSummary } from '@/types/subscription';

interface UseAccountSubscriptionResult {
  data: AccountSubscriptionSummary | null;
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

export function useAccountSubscription(): UseAccountSubscriptionResult {
  const { session } = useAuth();
  const [data, setData] = React.useState<AccountSubscriptionSummary | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!session?.user) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/account/subscription', {
        credentials: 'include',
      });
      const payload = (await response.json()) as
        | AccountSubscriptionSummary
        | { error?: string };

      if (!response.ok || !('plan' in payload)) {
        throw new Error(
          extractApiError(payload) || 'Falha ao carregar o plano atual.'
        );
      }

      setData(payload);
    } catch (error) {
      toast.error('Falha ao carregar o plano atual.', {
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
