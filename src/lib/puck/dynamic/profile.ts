import type { AppSession, AppSessionResponse } from '@/types/app-session';

import { obterCacheDinamicoLyra } from '@/lib/puck/dynamic/cache';

export type LyraPerfilDinamico = {
  usuarioId: string | null;
  email: string | null;
  nomeExibicao: string;
  primeiroNome: string | null;
  role: string | null;
  isAdmin: boolean;
  saudacao: string;
  iniciais: string;
};

function obterSaudacaoAtual() {
  const horaAtual = new Date().getHours();

  if (horaAtual < 12) {
    return 'Bom dia';
  }

  if (horaAtual < 18) {
    return 'Boa tarde';
  }

  return 'Boa noite';
}

function extrairNomeExibicao(session: AppSession | null) {
  if (!session) {
    return 'Sessão não autenticada';
  }

  const metadata = session.user.user_metadata;
  const nomeCompleto =
    metadata.full_name ??
    [metadata.first_name, metadata.last_name].filter(Boolean).join(' ').trim();

  return nomeCompleto || session.user.email || 'Usuária Lyra';
}

function extrairPrimeiroNome(nomeExibicao: string) {
  const [primeiroNome] = nomeExibicao.trim().split(/\s+/);
  return primeiroNome || null;
}

function extrairIniciais(nomeExibicao: string, email: string | null) {
  const partes = nomeExibicao
    .split(/\s+/)
    .map((parte) => parte.trim())
    .filter(Boolean);

  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }

  if (partes.length === 1 && partes[0].length >= 2) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return 'LY';
}

async function carregarPerfilDinamicoLyra(): Promise<LyraPerfilDinamico> {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Falha ao consultar a sessão autenticada da Lyra.');
  }

  const payload = (await response.json()) as AppSessionResponse;
  const session = payload.session;
  const nomeExibicao = extrairNomeExibicao(session);

  return {
    usuarioId: session?.user.id ?? null,
    email: session?.user.email ?? null,
    nomeExibicao,
    primeiroNome: extrairPrimeiroNome(nomeExibicao),
    role: session?.user.role ?? null,
    isAdmin: session?.user.role === 'admin',
    saudacao: obterSaudacaoAtual(),
    iniciais: extrairIniciais(nomeExibicao, session?.user.email ?? null),
  };
}

export async function obterPerfilDinamicoLyra() {
  return obterCacheDinamicoLyra(
    'lyra-puck:perfil-sessao',
    carregarPerfilDinamicoLyra
  );
}
