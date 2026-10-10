'use client';

import { Waves } from 'lucide-react';

import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { useVedicInsights } from '@/hooks/use-vedic-insights';
import { isPlanFeatureEnabled } from '@/lib/plans/access';
import type { AppPageConfig } from '@/lib/site-page-config/schema';
import { scaleRem } from '@/lib/site-page-config/runtime';

/**
 * Cartão "Harmonia atual" do topo do dashboard: exibe o Índice de Coerência
 * Quântica (ICQ, 0–100) calculado pelo motor `coherence-engine` a partir das
 * métricas do dia e do céu do momento — o mesmo valor do painel
 * "Coerência Quântica". Antes o cartão mostrava o número fixo 94.2 para
 * qualquer pessoa. Deve ficar dentro do HealthOrchestratorProvider.
 */
export function HarmoniaAtualCard({ appConfig }: { appConfig: AppPageConfig }) {
  const { data: subscription, loading: subscriptionLoading } =
    useAccountSubscription();
  const habilitado = isPlanFeatureEnabled(subscription, 'dashboard_access');
  const { coherence, loading } = useVedicInsights(habilitado);
  const dashboardConfig = appConfig.dashboard;

  const carregando = subscriptionLoading || (habilitado && loading);
  const valor = habilitado && !carregando ? String(coherence.index) : '—';
  const detalhe = carregando
    ? 'Calculando a partir das métricas do dia.'
    : habilitado
      ? `Coerência: ${coherence.level}. ${dashboardConfig.harmonyNote}`
      : 'Disponível com o acesso ao dashboard do seu plano.';

  return (
    <div
      className="flex w-full max-w-sm shrink-0 items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
      style={{
        transform: `scale(${appConfig.sizing.cardScale})`,
        transformOrigin: 'top right',
      }}
    >
      <div
        aria-hidden="true"
        className="flex shrink-0 items-center justify-center rounded-full bg-cosmic-light text-cosmic-strong"
        style={{
          width: scaleRem(2.75, appConfig.sizing.iconScale),
          height: scaleRem(2.75, appConfig.sizing.iconScale),
        }}
      >
        <Waves className="h-5 w-5" />
      </div>
      <div aria-live="polite" className="min-w-0">
        <p
          className="font-medium text-muted-foreground"
          style={{
            fontSize: scaleRem(0.8125, appConfig.typography.cardBody),
          }}
        >
          {dashboardConfig.harmonyEyebrow}
        </p>
        <p className="metric-display text-cosmic-strong">
          {valor}
          {valor !== '—' ? (
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              /100
            </span>
          ) : null}
        </p>
        <p
          className="text-muted-foreground"
          style={{
            fontSize: scaleRem(0.76, appConfig.typography.cardBody),
          }}
        >
          {detalhe}
        </p>
      </div>
    </div>
  );
}
