"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HeartPulse, Zap, Wind, Thermometer, Map, Mic, Bell } from 'lucide-react';
import { RealTimeMetricCard } from './RealTimeMetricCard';
import { LiveHeartRateChart } from './LiveHeartRateChart';
import { MapPlaceholder } from './MapPlaceholder';
import { Button } from '@/components/ui/button';

// Simula um alerta push
const showPushAlert = (metric: string, value: number, threshold: number) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(200); // Vibra por 200ms
  }
  toast.warning("Alerta de Métrica", {
    description: `${metric} atingiu ${value}, que está acima do seu limite de ${threshold}.`,
  });
};

export function RealTimeMonitoringContent() {
  const [liveData, setLiveData] = useState({
    heartRate: 75,
    hrv: 45,
    respiratoryRate: 16,
    temperature: 36.8,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Simula a recepção de dados de um wearable via Supabase Realtime
    const channel = supabase
      .channel('realtime-wearable')
      .on('broadcast', { event: 'new_data' }, (payload) => {
        const newData = payload.payload;
        setLiveData(newData);

        // Lógica de Alerta
        if (newData.heartRate > 120) {
          showPushAlert("Frequência Cardíaca", newData.heartRate, 120);
        }
      })
      .subscribe();

    // Simula o envio de dados para o canal a cada 2 segundos
    const interval = setInterval(() => {
      const newHeartRate = Math.floor(Math.random() * (130 - 60 + 1)) + 60;
      const newHrv = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
      const newRespRate = Math.floor(Math.random() * (20 - 12 + 1)) + 12;
      const newTemp = parseFloat((Math.random() * (37.5 - 36.5) + 36.5).toFixed(1));
      
      const simulatedPayload = {
        heartRate: newHeartRate,
        hrv: newHrv,
        respiratoryRate: newRespRate,
        temperature: newTemp,
      };
      
      supabase.channel('realtime-wearable').send({
        type: 'broadcast',
        event: 'new_data',
        payload: simulatedPayload,
      });
    }, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const handleVoiceUpdate = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(
        `Atualização de métricas: Frequência cardíaca em ${liveData.heartRate} batimentos por minuto. HRV em ${liveData.hrv}.`
      );
      utterance.lang = 'pt-BR';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Seu navegador não suporta atualizações por voz.");
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] gap-6 h-[calc(100vh-200px)] bg-green-50/30 dark:bg-gray-900/50 p-4 rounded-lg">
      {/* Header com métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RealTimeMetricCard
          icon={HeartPulse}
          label="Batimentos"
          value={liveData.heartRate}
          unit="BPM"
        />
        <RealTimeMetricCard
          icon={Zap}
          label="HRV"
          value={liveData.hrv}
          unit="ms"
        />
        <RealTimeMetricCard
          icon={Wind}
          label="Respiração"
          value={liveData.respiratoryRate}
          unit="RPM"
        />
        <RealTimeMetricCard
          icon={Thermometer}
          label="Temperatura"
          value={liveData.temperature}
          unit="°C"
        />
      </div>

      {/* Gráfico e Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2">
          <LiveHeartRateChart initialData={liveData.heartRate} />
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
        <Button variant="outline" onClick={() => toast.info("Configurações de Alertas (Em Breve)")}>
          <Bell className="mr-2 h-4 w-4" />
          Configurar Alertas
        </Button>
      </div>
    </div>
  );
}