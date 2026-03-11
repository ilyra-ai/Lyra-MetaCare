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
} from '../lib/health/healthConnect';
import {
  getAstrologicalContext,
  AstrologicalData,
} from '../lib/astrology/engine';
import { db } from '../integrations/mysql/client';

interface HealthOrchestratorState {
  vitals: HealthDataMetrics | null;
  astrology: AstrologicalData | null;
  isSyncing: boolean;
  syncError: string | null;
  triggerManualSync: () => Promise<void>;
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

  const performSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      // 1. Astrometria é calculada instantaneamente no dispositivo (sem dependência externa)
      const currentAstro = getAstrologicalContext(new Date());
      setAstrology(currentAstro);

      // 2. Coleta Nativa HealthKit/Health Connect (reais)
      const currentVitals = await fetchRealTimeVitals();
      setVitals(currentVitals);
    } catch (error) {
      console.error(
        '[Lyra MetaCare] Sincronização interrompida devido a falha sistêmica ou ausência de sensores:',
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
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
      }}
    >
      {children}
    </HealthOrchestratorContext.Provider>
  );
};
