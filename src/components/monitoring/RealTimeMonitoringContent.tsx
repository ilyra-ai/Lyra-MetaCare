'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/integrations/mysql/client';
import { toast } from 'sonner';
import { HeartPulse, Zap, Wind, Thermometer, Mic, Bell } from 'lucide-react';
import { RealTimeMetricCard } from './RealTimeMetricCard';
import { LiveHeartRateChart } from './LiveHeartRateChart';
import { MapPlaceholder } from './MapPlaceholder';
import { Button } from '@/components/ui/button';

// Exibe um alerta push real baseado em limites de biomarcadores
const showPushAlert = (metric: string, value: number, threshold: number) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(200); // Vibra por 200ms
  }
  toast.warning('Alerta de Métrica', {
    description: `${metric} atingiu ${value}, que está acima do seu limite de ${threshold}.`,
  });
};

export function RealTimeMonitoringContent() {
  const [liveData, setLiveData] = useState({
    heartRate: null as number | null,
    hrv: null as number | null,
    respiratoryRate: null as number | null,
    temperature: null as number | null,
    lastUpdatedAt: null as string | null,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    <div className="grid grid-rows-[auto_1fr_auto] gap-6 h-[calc(100vh-200px)] bg-green-50/30 dark:bg-gray-900/50 p-4 rounded-lg">
      {/* Header com métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RealTimeMetricCard
          icon={HeartPulse}
          label="Batimentos"
          value={liveData.heartRate ?? 0}
          unit="BPM"
        />
        <RealTimeMetricCard
          icon={Zap}
          label="HRV"
          value={liveData.hrv ?? 0}
          unit="ms"
        />
        <RealTimeMetricCard
          icon={Wind}
          label="Respiração"
          value={liveData.respiratoryRate ?? 0}
          unit="RPM"
        />
        <RealTimeMetricCard
          icon={Thermometer}
          label="Temperatura"
          value={liveData.temperature ?? 0}
          unit="°C"
        />
      </div>

      {/* Gráfico e Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2">
          <LiveHeartRateChart initialData={liveData.heartRate ?? 0} />
        </div>
        <div className="lg:col-span-1">
          <MapPlaceholder />
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-inner">
        <Button onClick={handleVoiceUpdate} disabled={isSpeaking}>
          <Mic className="mr-2 h-4 w-4" />
          {isSpeaking ? 'Falando...' : 'Atualização por Voz'}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.info(
              'Alertas locais habilitados para frequência cardíaca acima do limiar.'
            )
          }
        >
          <Bell className="mr-2 h-4 w-4" />
          Status dos Alertas
        </Button>
      </div>
    </div>
  );
}
