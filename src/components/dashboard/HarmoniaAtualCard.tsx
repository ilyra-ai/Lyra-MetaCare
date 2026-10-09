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
      className="glass-card flex max-w-sm items-center gap-4 rounded-[24px] px-5 py-4"
      style={{
        transform: `scale(${appConfig.sizing.cardScale})`,
        transformOrigin: 'top right',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-gradient-cosmic text-white shadow-cosmic"
        style={{
          width: scaleRem(3, appConfig.sizing.iconScale),
          height: scaleRem(3, appConfig.sizing.iconScale),
        }}
      >
        <Waves className="h-5 w-5" aria-hidden="true" />
      </div>
      <div aria-live="polite">
        <p
          className="font-semibold uppercase tracking-[0.22em] text-muted-foreground"
          style={{
            fontSize: scaleRem(0.72, appConfig.typography.cardBody),
          }}
        >
          {dashboardConfig.harmonyEyebrow}
        </p>
        <p className="metric-display text-gradient-aurora">
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
