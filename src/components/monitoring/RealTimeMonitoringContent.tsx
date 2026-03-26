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
  Waves,
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
  const [liveData, setLiveData] = useState({
    heartRate: null as number | null,
    hrv: null as number | null,
    respiratoryRate: null as number | null,
    temperature: null as number | null,
    lastUpdatedAt: null as string | null,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasLiveData = liveData.lastUpdatedAt !== null;
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
      <Card className="relative overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.15)_0%,hsl(var(--card))_48%,hsl(var(--card))_100%)]">
        <div className="orchestrated-orb -left-12 top-2 h-32 w-32 bg-primary/60" />
        <div className="orchestrated-orb right-0 top-0 h-28 w-28 bg-cosmic/35" />

        <CardHeader className="relative gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <Badge variant="secondary">telemetria contínua</Badge>
              <CardTitle className="mt-4 text-3xl">
                Painel vivo com presença, ritmo e leitura local
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl">
                Este módulo acompanha sinais recebidos em tempo real e mantém
                voz, alertas locais e histórico recente em uma superfície mais
                organizada, suave e útil.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-end gap-2">
                <Badge variant={hasLiveData ? 'success' : 'secondary'}>
                  {hasLiveData ? 'fluxo ativo' : 'sem pacote ainda'}
                </Badge>
                <Badge variant="cosmic">plano {currentPlanKey}</Badge>
              </div>
              <div className="rounded-full border border-border bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                Última sincronização: <span className="font-medium text-foreground">{lastSyncLabel}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RealTimeMetricCard
              icon={HeartPulse}
              label="Batimentos"
              value={liveData.heartRate ?? 0}
              unit="BPM"
              accent="accent"
              isActive={hasLiveData}
            />
            <RealTimeMetricCard
              icon={Zap}
              label="HRV"
              value={liveData.hrv ?? 0}
              unit="ms"
              accent="cosmic"
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
            <Alert className="border-cosmic/20 bg-cosmic-light/60 text-foreground">
              <Sparkles className="text-cosmic" />
              <AlertTitle>Leitura operacional da Lyra</AlertTitle>
              <AlertDescription className="leading-7">
                Os dados deste painel nascem do canal local `realtime-wearable`.
                Quando o pacote chega, a interface reage na hora, atualiza o
                gráfico e pode disparar alerta local ou síntese de voz de forma
                real.
              </AlertDescription>
            </Alert>

            <div className="rounded-[28px] border border-border/70 bg-white/78 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm">
                  <Orbit className="animate-spin-slow" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Contexto instantâneo
                  </p>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    {hasLiveData
                      ? 'O dispositivo está alimentando a sessão atual com sinais recentes.'
                      : 'Assim que o wearable enviar o primeiro pacote, este painel entra em ritmo automaticamente.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_0.8fr]">
        <div className="min-h-[24rem]">
          <LiveHeartRateChart initialData={liveData.heartRate ?? 0} />
        </div>
        <div className="min-h-[24rem]">
          <MapPlaceholder />
        </div>
      </div>

      <Card className="border-border/70 bg-card/90 backdrop-blur-xl">
        <CardHeader className="gap-3">
          <CardTitle className="text-2xl">Controles em tempo real</CardTitle>
          <CardDescription>
            Acione uma leitura por voz ou confira a política ativa de alertas
            locais desta sessão.
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
            <Button onClick={handleVoiceUpdate} disabled={isSpeaking}>
              <Mic data-icon="inline-start" />
              {isSpeaking
                ? 'Falando agora'
                : voiceUpdatesEnabled
                  ? 'Ouvir atualização por voz'
                  : 'Voz indisponível no plano'}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.info('Alertas locais ativos', {
                  description:
                    'A sessão atual acompanha frequência cardíaca elevada e dispara aviso quando o limiar configurado é ultrapassado.',
                })
              }
            >
              <Bell data-icon="inline-start" />
              Conferir alertas
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-warning/20 bg-warning-light/65 text-foreground">
        <ShieldAlert className="text-warning" />
        <AlertTitle>Proteção de limiar em execução</AlertTitle>
        <AlertDescription className="leading-7">
          Se a frequência cardíaca ultrapassar 120 BPM em uma leitura recebida,
          a aplicação dispara um aviso local real e vibração no dispositivo
          compatível.
        </AlertDescription>
      </Alert>
    </div>
  );
}
