'use client';

import { useCallback, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import type { ResumoDaRespiracao } from '@/lib/respiracao/servico';

import { useKeyedResource } from './use-keyed-resource';

async function lerResumo(): Promise<ResumoDaRespiracao> {
  const resposta = await fetch('/api/respiracao', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!resposta.ok) {
    const corpo = (await resposta.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      corpo?.error ?? 'Não foi possível ler as suas respirações de hoje.'
    );
  }
  return (await resposta.json()) as ResumoDaRespiracao;
}

/**
 * Sessões de respiração de hoje e a técnica recomendada agora. `substituir`
 * aplica o resumo devolvido pelo registro de uma sessão sem nova leitura.
 */
export function useResumoDaRespiracao() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [erro, setErro] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState<ResumoDaRespiracao | null>(null);
  const aoFalhar = useCallback((falha: unknown) => {
    setErro(
      falha instanceof Error
        ? falha.message
        : 'Sem conexão para ler as suas respirações.'
    );
  }, []);
  const { data, loading } = useKeyedResource<ResumoDaRespiracao | null>(
    userId ? `respiracao:${userId}` : null,
    lerResumo,
    aoFalhar,
    null
  );
  return {
    resumo: registrado ?? data,
    carregando: loading && !registrado,
    erro,
    substituir: setRegistrado,
  };
}
