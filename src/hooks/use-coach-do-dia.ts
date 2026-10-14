'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { ouvirMapaAtualizado } from '@/lib/astrology/evento-do-mapa';
import { avisarCoachAtualizado } from '@/lib/coach/evento-do-coach';
import type { EstadoDoCoach } from '@/lib/coach/tipos';
import { ouvirMetricasAtualizadas } from '@/lib/metricas/evento-de-atualizacao';

import { useAgora } from './use-agora';
import { useKeyedResource } from './use-keyed-resource';

export type EstadoDoCoachNaTela =
  EstadoDoCoach | { estado: 'erro'; mensagem: string };

async function lerCoach(): Promise<EstadoDoCoachNaTela> {
  try {
    const resposta = await fetch('/api/coach/hoje', {
      credentials: 'include',
      cache: 'no-store',
    });
    const corpo = (await resposta.json().catch(() => null)) as
      EstadoDoCoach | { error?: string } | null;
    if (!resposta.ok || !corpo || !('estado' in corpo)) {
      return {
        estado: 'erro',
        mensagem:
          (corpo && 'error' in corpo && corpo.error) ||
          'Não foi possível preparar o seu dia agora.',
      };
    }
    if (corpo.estado === 'pronto' && corpo.atualizado) {
      avisarCoachAtualizado();
    }
    return corpo;
  } catch {
    return {
      estado: 'erro',
      mensagem: 'Sem conexão com o servidor para preparar o seu dia.',
    };
  }
}

function ignorar() {
  // `lerCoach` nunca lança: falhas viram o estado "erro".
}

// Data local do navegador: na virada do dia o briefing é pedido de novo.
const formatoDaData = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * "Seu dia" de hoje. Recarrega quando o check-in ou a pulseira gravam
 * métricas, quando o mapa natal muda e na virada do dia.
 */
export function useCoachDoDia(ativo = true) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const agora = useAgora();
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const recarregar = () => setVersao((v) => v + 1);
    const pararMetricas = ouvirMetricasAtualizadas(recarregar);
    const pararMapa = ouvirMapaAtualizado(recarregar);
    return () => {
      pararMetricas();
      pararMapa();
    };
  }, []);

  // Na hidratação o relógio ainda vale 0: espera a hora real para não pedir
  // duas vezes.
  const ler = useCallback(() => lerCoach(), []);
  const { data, loading, refresh } =
    useKeyedResource<EstadoDoCoachNaTela | null>(
      ativo && userId && agora !== 0
        ? `coach:${userId}:${formatoDaData.format(agora)}:${versao}`
        : null,
      ler,
      ignorar,
      null
    );

  return { estado: data, carregando: loading, recarregar: refresh, agora };
}
