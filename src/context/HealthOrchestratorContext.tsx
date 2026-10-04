'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import {
  fetchRealTimeVitals,
  HealthDataMetrics,
  getHealthRuntimeAvailability,
} from '../lib/health/healthConnect';
import { AstrologicalData } from '../lib/astrology/engine';
import { db } from '../integrations/mysql/client';
import { useBluetoothVitals } from '../hooks/use-bluetooth-vitals';

export interface HealthSyncResult {
  error: string | null;
}

interface HealthOrchestratorState {
  vitals: HealthDataMetrics | null;
  astrology: AstrologicalData | null;
  isSyncing: boolean;
  syncError: string | null;
  triggerManualSync: () => Promise<HealthSyncResult>;
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

interface SyncSnapshot {
  astrology: AstrologicalData | null;
  vitals: HealthDataMetrics | null;
  error: string | null;
}

const EMPTY_VITALS: HealthDataMetrics = {
  heartRate: null,
  hrv_ms: null,
  sleepDurationMinutes: null,
  bloodGlucoseMgDl: null,
  weightKg: null,
  moodScore: null,
};

// Executa uma sincronização completa sem alterar estado: efemérides reais e,
// quando houver runtime nativo (HealthKit/Health Connect), sinais vitais.
async function runHealthSync(
  previousAstrology: AstrologicalData | null
): Promise<SyncSnapshot> {
  let astrology = previousAstrology;

  try {
    const resAstro = await fetch('/api/astrology/ephemeris');
    if (!resAstro.ok) {
      throw new Error('Falha na API de Efemérides');
    }
    const astroData = await resAstro.json();
    astrology = astroData.data;

    const availability = getHealthRuntimeAvailability();
    if (!availability.hasSupportedRuntime) {
      return {
        astrology,
        vitals: null,
        error:
          'Nenhum runtime nativo de saúde foi detectado neste ambiente. O plano seguirá com contexto astrológico e biomarcadores apenas quando houver fonte real disponível.',
      };
    }

    const currentVitals = await fetchRealTimeVitals();
    return { astrology, vitals: currentVitals, error: null };
  } catch (error) {
    return {
      astrology,
      vitals: null,
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao sincronizar dados de saúde.',
    };
  }
}

export const HealthOrchestratorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Sinais obtidos na última sincronização com o runtime nativo.
  const [syncedVitals, setSyncedVitals] = useState<HealthDataMetrics | null>(
    null
  );
  // Frequência cardíaca recebida pelo canal em tempo real do app.
  const [broadcastHeartRate, setBroadcastHeartRate] = useState<number | null>(
    null
  );
  const [astrology, setAstrology] = useState<AstrologicalData | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { heartRate, hrv, connected, connect, disconnect } =
    useBluetoothVitals();

  // Os sinais exibidos combinam a última sincronização com as leituras ao
  // vivo (BLE do monitor cardíaco e canal em tempo real). Antes, as leituras
  // ao vivo eram descartadas quando não havia runtime nativo de saúde.
  const vitals = useMemo<HealthDataMetrics | null>(() => {
    const liveHeartRate = heartRate ?? broadcastHeartRate;
    if (liveHeartRate === null) {
      return syncedVitals;
    }

    const base = syncedVitals ?? EMPTY_VITALS;
    return {
      ...base,
      heartRate: liveHeartRate,
      hrv_ms: heartRate !== null ? (hrv ?? base.hrv_ms) : base.hrv_ms,
    };
  }, [broadcastHeartRate, heartRate, hrv, syncedVitals]);

  const applySnapshot = useCallback((snapshot: SyncSnapshot) => {
    setAstrology(snapshot.astrology);
    setSyncedVitals(snapshot.vitals);
    setSyncError(snapshot.error);
    setIsSyncing(false);
  }, []);

  const triggerManualSync = useCallback(async (): Promise<HealthSyncResult> => {
    setIsSyncing(true);
    setSyncError(null);
    const snapshot = await runHealthSync(astrology);
    applySnapshot(snapshot);
    return { error: snapshot.error };
  }, [applySnapshot, astrology]);

  // Sincronização inicial na montagem do ecossistema orquestrado (o estado
  // inicial já é "sincronizando").
  useEffect(() => {
    let active = true;
    runHealthSync(null).then((snapshot) => {
      if (active) applySnapshot(snapshot);
    });
    return () => {
      active = false;
    };
  }, [applySnapshot]);

  // Canal em tempo real para eventos de wearables publicados pelo app.
  useEffect(() => {
    const channel = db
      .channel('realtime-wearable')
      .on('broadcast', { event: 'new_data' }, (payload) => {
        const newData = payload.payload as Partial<{
          heartRate: number | null;
        }>;
        if (typeof newData.heartRate === 'number') {
          setBroadcastHeartRate(newData.heartRate);
        }
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  return (
    <HealthOrchestratorContext.Provider
      value={{
        vitals,
        astrology,
        isSyncing,
        syncError,
        triggerManualSync,
        bluetoothConnect: connect,
        bluetoothDisconnect: disconnect,
        isBluetoothConnected: connected,
      }}
    >
      {children}
    </HealthOrchestratorContext.Provider>
  );
};
