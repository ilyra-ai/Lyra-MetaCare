'use client';

import { useCallback } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import { requisicaoCompartilhada } from '@/lib/http/requisicao-compartilhada';

/**
 * Nome e foto da pessoa para o cabeçalho e o menu lateral (tarefa 58).
 * Os dois faziam a mesma consulta, cada um com o seu efeito, sem descartar
 * respostas de uma sessão anterior nem a resposta que chegava depois de o
 * componente sair da tela. Agora a leitura é uma só (compartilhada entre os
 * dois enquanto está em andamento) e fica presa à sessão atual.
 */
export interface PerfilDoCabecalho {
  first_name: string | null;
  avatar_url: string | null;
}

const VAZIO: PerfilDoCabecalho | null = null;

function avisar(erro: unknown) {
  console.error('Erro ao carregar o perfil do cabeçalho:', erro);
}

export function usePerfilDoCabecalho(): PerfilDoCabecalho | null {
  const { db, session } = useAuth();
  const userId = session?.user?.id ?? null;

  const ler = useCallback(async (): Promise<PerfilDoCabecalho | null> => {
    if (!userId) return null;
    const { data, error } = await db
      .from('profiles')
      .select('first_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      first_name: data?.first_name ?? null,
      avatar_url: data?.avatar_url ?? null,
    };
  }, [db, userId]);

  const lerCompartilhado = useCallback(
    () => requisicaoCompartilhada(`perfil-do-cabecalho:${userId ?? ''}`, ler),
    [ler, userId]
  );

  const { data } = useKeyedResource(
    userId ? `perfil-do-cabecalho:${userId}` : null,
    ler,
    avisar,
    VAZIO,
    lerCompartilhado
  );
  return data;
}
