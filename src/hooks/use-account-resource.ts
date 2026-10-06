'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import { requisicaoCompartilhada } from '@/lib/http/requisicao-compartilhada';

export interface UseAccountResourceResult<T> {
  data: T | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

interface AccountResourceOptions<T> {
  // Rota da API da conta autenticada (ex.: /api/account/billing).
  endpoint: string;
  // Valida a forma da resposta de sucesso.
  isValid: (payload: unknown) => payload is T;
  // Mensagem usada quando a API não informa o erro.
  fallbackErrorMessage: string;
  // Título do toast exibido quando a carga falha.
  errorToastTitle: string;
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

/**
 * Carrega um recurso da conta do usuário autenticado, associado ao id do
 * usuário (ao trocar de sessão os dados anteriores deixam de ser exibidos).
 */
export function useAccountResource<T>({
  endpoint,
  isValid,
  fallbackErrorMessage,
  errorToastTitle,
}: AccountResourceOptions<T>): UseAccountResourceResult<T> {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const request = React.useCallback(async (): Promise<T | null> => {
    const response = await fetch(endpoint, { credentials: 'include' });
    const payload: unknown = await response.json();

    if (!response.ok || !isValid(payload)) {
      throw new Error(extractApiError(payload) || fallbackErrorMessage);
    }

    return payload;
  }, [endpoint, fallbackErrorMessage, isValid]);

  // Cabeçalho, menu lateral e conteúdo pedem o mesmo recurso ao montar: a
  // carga automática compartilha uma única chamada por usuário e rota.
  const initialRequest = React.useCallback(
    () => requisicaoCompartilhada(`${endpoint}:${userId ?? ''}`, request),
    [endpoint, request, userId]
  );

  const notifyError = React.useCallback(
    (error: unknown) => {
      toast.error(errorToastTitle, {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido.',
      });
    },
    [errorToastTitle]
  );

  return useKeyedResource<T | null>(
    userId,
    request,
    notifyError,
    null,
    initialRequest
  );
}
