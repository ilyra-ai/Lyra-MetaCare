import type {
  AccountSubscriptionSummary,
  PlanFeatureAccess,
} from '@/types/subscription';

import { obterCacheDinamicoLyra } from '@/lib/puck/dynamic/cache';
import type { LyraTrendDirection } from '@/lib/puck/types';

export type LyraResumoAssinaturaDinamica = {
  planoNome: string;
  planoKey: string;
  status: string;
  billingInterval: string;
  recursosAtivos: number;
  cancelAtPeriodEnd: boolean;
  diasRestantes: number | null;
  badgeLabel: string;
  descricaoCurta: string;
  tendenciaRotulo: string;
  tendenciaDirecao: LyraTrendDirection;
};

function normalizarStatus(status: string) {
  if (!status) {
    return 'status não informado';
  }

  return status.replace(/_/g, ' ');
}

function normalizarIntervalo(intervalo: string) {
  if (!intervalo) {
    return 'intervalo não informado';
  }

  if (intervalo === 'monthly') {
    return 'mensal';
  }

  if (intervalo === 'annual') {
    return 'anual';
  }

  return intervalo.replace(/_/g, ' ');
}

function calcularDiasRestantes(dataIso: string) {
  if (!dataIso) {
    return null;
  }

  const timestamp = Date.parse(dataIso);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  const diferenca = timestamp - Date.now();
  return Math.max(0, Math.ceil(diferenca / 86_400_000));
}

function obterDirecaoTendencia(
  summary: AccountSubscriptionSummary
): LyraTrendDirection {
  if (summary.cancelAtPeriodEnd) {
    return 'down';
  }

  if (summary.status === 'active' || summary.status === 'trialing') {
    return 'up';
  }

  return 'neutral';
}

function montarRotuloTendencia(
  summary: AccountSubscriptionSummary,
  diasRestantes: number | null
) {
  const statusNormalizado = normalizarStatus(summary.status);
  const intervaloNormalizado = normalizarIntervalo(summary.billingInterval);

  if (summary.cancelAtPeriodEnd && diasRestantes !== null) {
    return `Encerramento programado em ${diasRestantes} dia(s)`;
  }

  if (diasRestantes !== null) {
    return `Status ${statusNormalizado} no ciclo ${intervaloNormalizado} • ${diasRestantes} dia(s) restantes`;
  }

  return `Status ${statusNormalizado} no ciclo ${intervaloNormalizado}`;
}

async function carregarResumoAssinaturaLyra(): Promise<LyraResumoAssinaturaDinamica> {
  const response = await fetch('/api/account/subscription', {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
  });

  const payloadBruto = (await response.json()) as
    AccountSubscriptionSummary | { error?: string };

  if (!response.ok) {
    throw new Error(
      'error' in payloadBruto && typeof payloadBruto.error === 'string'
        ? payloadBruto.error
        : 'Falha ao consultar a assinatura da conta atual.'
    );
  }

  const payload = payloadBruto as AccountSubscriptionSummary;
  const diasRestantes = calcularDiasRestantes(payload.currentPeriodEnd);
  const recursosAtivos = payload.features.filter(
    (item: PlanFeatureAccess) => item.enabled
  ).length;
  const tendenciaDirecao = obterDirecaoTendencia(payload);

  return {
    planoNome: payload.plan.name,
    planoKey: payload.plan.key,
    status: normalizarStatus(payload.status),
    billingInterval: normalizarIntervalo(payload.billingInterval),
    recursosAtivos,
    cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
    diasRestantes,
    badgeLabel: payload.plan.highlightText || payload.plan.name,
    descricaoCurta: `Plano ${payload.plan.name} com ${recursosAtivos} recurso(s) ativo(s), status ${normalizarStatus(payload.status)} e ciclo ${normalizarIntervalo(payload.billingInterval)}.`,
    tendenciaRotulo: montarRotuloTendencia(payload, diasRestantes),
    tendenciaDirecao,
  };
}

export async function obterResumoAssinaturaLyra() {
  return obterCacheDinamicoLyra(
    'lyra-puck:assinatura-atual',
    carregarResumoAssinaturaLyra
  );
}
