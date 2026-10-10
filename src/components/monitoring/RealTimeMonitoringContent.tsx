'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/integrations/mysql/client';
import { toast } from 'sonner';
import {
  Bell,
  HeartPulse,
  Mic,
  Orbit,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';
import { RealTimeMetricCard } from './RealTimeMetricCard';
import { LiveHeartRateChart } from './LiveHeartRateChart';
import { MapPlaceholder } from './MapPlaceholder';
import { Button } from '@/components/ui/button';
import { PlanKey } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scaleRem } from '@/lib/site-page-config/runtime';

// Exibe um alerta push real baseado em limites de biomarcadores
const showPushAlert = (metric: string, value: number, threshold: number) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(200); // Vibra por 200ms
  }
  toast.warning('Alerta de Métrica', {
    description: `${metric} atingiu ${value}, que está acima do seu limite de ${threshold}.`,
  });
};

export function RealTimeMonitoringContent({
  voiceUpdatesEnabled = true,
  currentPlanKey = 'free',
}: {
  voiceUpdatesEnabled?: boolean;
  currentPlanKey?: PlanKey;
}) {
  const { config: appConfig } = usePublicSitePageConfig('app');
  const [liveData, setLiveData] = useState({
    heartRate: null as number | null,
    hrv: null as number | null,
    respiratoryRate: null as number | null,
    temperature: null as number | null,
    lastUpdatedAt: null as string | null,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasLiveData = liveData.lastUpdatedAt !== null;
  const monitoringConfig = appConfig.monitoring;
  const titleStyle = {
    fontSize: scaleRem(1.875, appConfig.typography.pageTitle),
  };
  const bodyStyle = {
    fontSize: scaleRem(0.95, appConfig.typography.pageBody),
  };
  const cardTitleStyle = {
    fontSize: scaleRem(1.5, appConfig.typography.cardTitle),
  };
  const cardBodyStyle = {
    fontSize: scaleRem(0.95, appConfig.typography.cardBody),
  };
  const buttonStyle = {
    fontSize: scaleRem(0.875, appConfig.typography.buttonLabel),
  };
  const lastSyncLabel = liveData.lastUpdatedAt
    ? new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(liveData.lastUpdatedAt))
    : 'aguardando';

  useEffect(() => {
    // Recebe eventos sincronizados em tempo real a partir do canal local de monitoramento.
    const channel = db
      .channel('realtime-wearable')
      .on('broadcast', { event: 'new_data' }, (payload) => {
        const newData = payload.payload as {
          heartRate: number | null;
          hrv: number | null;
          respiratoryRate: number | null;
          temperature: number | null;
        };
        setLiveData({
          ...newData,
          lastUpdatedAt: new Date().toISOString(),
        });

        // Lógica de Alerta
        if (newData.heartRate && newData.heartRate > 120) {
          showPushAlert('Frequência Cardíaca', newData.heartRate, 120);
        }
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const handleVoiceUpdate = () => {
    if (!voiceUpdatesEnabled) {
      toast.info('Atualizações por voz indisponíveis', {
        description: `O plano ${currentPlanKey.toUpperCase()} não libera a síntese de voz em tempo real.`,
      });
      return;
    }

    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(
        `Atualização de métricas: Frequência cardíaca em ${liveData.heartRate ?? 'indisponível'} batimentos por minuto. HRV em ${liveData.hrv ?? 'indisponível'}.`
      );
      utterance.lang = 'pt-BR';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Seu navegador não suporta atualizações por voz.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="min-w-0">
        <CardHeader className="gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 max-w-3xl">
              <Badge variant="secondary">{monitoringConfig.pageEyebrow}</Badge>
              <CardTitle className="mt-4 tracking-[-0.02em]" style={titleStyle}>
                {monitoringConfig.pageTitle}
              </CardTitle>
              <CardDescription
                className="mt-2 max-w-2xl leading-relaxed text-foreground/80"
                style={bodyStyle}
              >
                {monitoringConfig.pageDescription}
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge variant={hasLiveData ? 'success' : 'secondary'}>
                  {hasLiveData ? 'fluxo ativo' : 'sem pacote ainda'}
                </Badge>
                <Badge variant="outline">plano {currentPlanKey}</Badge>
              </div>
              <div className="rounded-[10px] border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
                Última sincronização:{' '}
                <span className="font-display font-medium tabular-nums text-foreground">
                  {lastSyncLabel}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <RealTimeMetricCard
              icon={HeartPulse}
              label="Batimentos"
              value={liveData.heartRate ?? 0}
              unit="BPM"
              accent="primary"
              isActive={hasLiveData}
            />
            <RealTimeMetricCard
              icon={Zap}
              label="HRV"
              value={liveData.hrv ?? 0}
              unit="ms"
              accent="info"
              isActive={hasLiveData}
            />
            <RealTimeMetricCard
              icon={Wind}
              label="Respiração"
              value={liveData.respiratoryRate ?? 0}
              unit="RPM"
              accent="info"
              isActive={hasLiveData}
            />
            <RealTimeMetricCard
              icon={Thermometer}
              label="Temperatura"
              value={liveData.temperature ?? 0}
              unit="°C"
              accent="primary"
              isActive={hasLiveData}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Alert className="rounded-md border-border bg-background text-foreground shadow-none">
              <Sparkles className="text-primary" aria-hidden="true" />
              <AlertTitle>{monitoringConfig.infoTitle}</AlertTitle>
              <AlertDescription className="leading-6 text-foreground/80">
                {monitoringConfig.infoDescription}
              </AlertDescription>
            </Alert>

            <div className="rounded-md border border-border bg-background p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-primary">
                  <Orbit className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {monitoringConfig.heroBadge}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-foreground/80">
                    {hasLiveData
                      ? monitoringConfig.heroTitle
                      : monitoringConfig.heroDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_0.8fr]">
        <div className="min-h-96">
          <LiveHeartRateChart initialData={liveData.heartRate ?? 0} />
        </div>
        <div className="min-h-96">
          <MapPlaceholder />
        </div>
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-3">
          <CardTitle style={cardTitleStyle}>
            {monitoringConfig.controlsTitle}
          </CardTitle>
          <CardDescription style={cardBodyStyle}>
            {monitoringConfig.controlsDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <Badge variant={voiceUpdatesEnabled ? 'success' : 'warning'}>
              {voiceUpdatesEnabled
                ? 'voz liberada no plano'
                : 'voz bloqueada no plano'}
            </Badge>
            <Badge variant={hasLiveData ? 'info' : 'secondary'}>
              {hasLiveData ? 'dados ativos na sessão' : 'sem amostra recente'}
            </Badge>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {monitoringConfig.showVoiceButton ? (
              <Button
                onClick={handleVoiceUpdate}
                disabled={isSpeaking}
                style={buttonStyle}
              >
                <Mic data-icon="inline-start" aria-hidden="true" />
                {isSpeaking
                  ? 'Falando agora'
                  : voiceUpdatesEnabled
                    ? 'Ouvir atualização por voz'
                    : 'Voz indisponível no plano'}
              </Button>
            ) : null}
            {monitoringConfig.showAlertsButton ? (
              <Button
                variant="secondary"
                style={buttonStyle}
                onClick={() =>
                  toast.info(monitoringConfig.alertsTitle, {
                    description: monitoringConfig.alertsDescription,
                  })
                }
              >
                <Bell data-icon="inline-start" aria-hidden="true" />
                Conferir alertas
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Alert className="rounded-xl border-warning/30 bg-warning-light text-foreground shadow-none">
        <ShieldAlert className="text-warning" aria-hidden="true" />
        <AlertTitle>{monitoringConfig.alertsTitle}</AlertTitle>
        <AlertDescription className="leading-6">
          {monitoringConfig.alertsDescription}
        </AlertDescription>
      </Alert>
    </div>
  );
}
