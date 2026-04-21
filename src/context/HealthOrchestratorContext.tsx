'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  fetchRealTimeVitals,
  HealthDataMetrics,
  getHealthRuntimeAvailability,
} from '../lib/health/healthConnect';
import {
  AstrologicalData,
} from '../lib/astrology/engine';
import { db } from '../integrations/mysql/client';
import { useBluetoothVitals } from '../hooks/use-bluetooth-vitals';

interface HealthOrchestratorState {
  vitals: HealthDataMetrics | null;
  astrology: AstrologicalData | null;
  isSyncing: boolean;
  syncError: string | null;
  triggerManualSync: () => Promise<void>;
  bluetoothConnect: () => Promise<void>;
  bluetoothDisconnect: () => void;
  isBluetoothConnected: boolean;
}

const HealthOrchestratorContext = createContext<
  HealthOrchestratorState | undefined
>(undefined);

export const useHealthOrchestrator = () => {
  const context = useContext(HealthOrchestratorContext);
  if (!context) {
    throw new Error(
      'useHealthOrchestrator must be used within a HealthOrchestratorProvider'
    );
  }
  return context;
};

export const HealthOrchestratorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [vitals, setVitals] = useState<HealthDataMetrics | null>(null);
  const [astrology, setAstrology] = useState<AstrologicalData | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const { heartRate, hrv, connected, connect, disconnect } = useBluetoothVitals();

  useEffect(() => {
    if (heartRate !== null) {
      setVitals(prev => prev ? { ...prev, heartRate, hrv_ms: hrv ?? prev.hrv_ms } : null);
    }
  }, [heartRate, hrv]);

  const performSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      // 1. Astrometria é sincronizada através da API real de efemérides
      const resAstro = await fetch('/api/astrology/ephemeris');
      if (resAstro.ok) {
        const astroData = await resAstro.json();
        setAstrology(astroData.data);
      } else {
        throw new Error('Falha na API de Efemérides');
      }

      const availability = getHealthRuntimeAvailability();
      if (!availability.hasSupportedRuntime) {
        setVitals(null);
        setSyncError(
          'Nenhum runtime nativo de saúde foi detectado neste ambiente. O plano seguirá com contexto astrológico e biomarcadores apenas quando houver fonte real disponível.'
        );
        return;
      }

      // 2. Coleta Nativa HealthKit/Health Connect (reais)
      const currentVitals = await fetchRealTimeVitals();
      setVitals(currentVitals);
    } catch (error) {
      setVitals(null);
      setSyncError(
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao sincronizar dados de saúde.'
      );
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Sincronização inicial na montagem do ecossistema orquestrado
    performSync();

    // 3. Orquestração em memória do cliente para eventos BLE capturados no navegador
    const channel = db
      .channel('realtime-wearable')
      .on('broadcast', { event: 'new_data' }, (payload) => {
        const newData = payload.payload as Partial<{
          heartRate: number | null;
        }>;
        setVitals((prev: HealthDataMetrics | null) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            heartRate: newData.heartRate ?? prev.heartRate,
          };
        });
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, [performSync]);

  return (
    <HealthOrchestratorContext.Provider
      value={{
        vitals,
        astrology,
        isSyncing,
        syncError,
        triggerManualSync: performSync,
        bluetoothConnect: connect,
        bluetoothDisconnect: disconnect,
        isBluetoothConnected: connected,
      }}
    >
      {children}
    </HealthOrchestratorContext.Provider>
  );
};
