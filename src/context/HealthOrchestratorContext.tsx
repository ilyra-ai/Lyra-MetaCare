'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { format } from 'date-fns';

import {
  COLUNAS_DOS_SINAIS_DO_DIA,
  combinarSinais,
  sinaisDoRegistro,
  type HealthDataMetrics,
  type RegistroDosSinaisDoDia,
} from '../lib/health/sinais-vitais';
import { AstrologicalData } from '../lib/astrology/engine';
import { ouvirMetricasAtualizadas } from '../lib/metricas/evento-de-atualizacao';
import { db } from '../integrations/mysql/client';
import { paginaSaindo } from '@/lib/navegador/saida-da-pagina';
import { useAuth } from './AuthContext';
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

// Uma sincronização completa, sem alterar estado: efemérides reais do céu do
// momento e os sinais do dia já gravados no banco (registro do dia e
// pulseira). A integração nativa com Apple Saúde e Health Connect foi
// desativada: ela exige um app de celular que o projeto não tem.
async function runHealthSync(
  userId: string | null,
  previousAstrology: AstrologicalData | null
): Promise<SyncSnapshot> {
  const falhas: string[] = [];
  let astrology = previousAstrology;
  let vitals: HealthDataMetrics | null = null;

  try {
    const resAstro = await fetch('/api/astrology/ephemeris');
    if (!resAstro.ok) {
      throw new Error(`HTTP ${resAstro.status}`);
    }
    const astroData = (await resAstro.json()) as { data: AstrologicalData };
    astrology = astroData.data;
  } catch (error) {
    // Página saindo: o navegador cancelou a busca (não é falha).
    if (!paginaSaindo()) {
      console.error('Falha ao ler as efemérides:', error);
      falhas.push('o céu do momento');
    }
  }

  if (userId) {
    const hoje = format(new Date(), 'yyyy-MM-dd');
    const { data, error } = await db
      .from<RegistroDosSinaisDoDia>('daily_metrics')
      .select(COLUNAS_DOS_SINAIS_DO_DIA)
      .eq('user_id', userId)
      .eq('date', hoje)
      .maybeSingle();
    if (error) {
      if (!paginaSaindo()) {
        console.error('Falha ao ler os sinais do dia:', error);
        falhas.push('os sinais do dia');
      }
    } else {
      vitals = sinaisDoRegistro(data);
    }
  }

  return {
    astrology,
    vitals,
    error: falhas.length
      ? `Não foi possível atualizar ${falhas.join(' e ')} agora. Tente sincronizar de novo em instantes.`
      : null,
  };
}

export const HealthOrchestratorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  // Sinais do dia gravados no banco na última sincronização.
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

  // Os sinais exibidos combinam os gravados com as leituras ao vivo (BLE do
  // monitor cardíaco e canal em tempo real).
  const vitals = useMemo(
    () =>
      combinarSinais(syncedVitals, {
        heartRate: heartRate ?? broadcastHeartRate,
        hrv: heartRate !== null ? hrv : null,
      }),
    [broadcastHeartRate, heartRate, hrv, syncedVitals]
  );

  const applySnapshot = useCallback((snapshot: SyncSnapshot) => {
    setAstrology(snapshot.astrology);
    setSyncedVitals(snapshot.vitals);
    setSyncError(snapshot.error);
    setIsSyncing(false);
  }, []);

  const triggerManualSync = useCallback(async (): Promise<HealthSyncResult> => {
    setIsSyncing(true);
    setSyncError(null);
    const snapshot = await runHealthSync(userId, astrology);
    applySnapshot(snapshot);
    return { error: snapshot.error };
  }, [applySnapshot, astrology, userId]);

  // Sincronização inicial (o estado inicial já é "sincronizando") e a cada
  // troca de conta.
  useEffect(() => {
    let active = true;
    runHealthSync(userId, null)
      .then((snapshot) => {
        if (active) applySnapshot(snapshot);
      })
      .catch((erro: unknown) => {
        // Antes sem `catch`: uma falha virava rejeição não tratada.
        console.error('Falha na sincronização dos sinais:', erro);
      });
    return () => {
      active = false;
    };
  }, [applySnapshot, userId]);

  // Check-in salvo ou sessão da pulseira gravada: relê os sinais do dia.
  useEffect(() => {
    if (!userId) return;
    return ouvirMetricasAtualizadas(() => {
      void runHealthSync(userId, astrology)
        .then(applySnapshot)
        .catch((erro: unknown) => {
          console.error('Falha ao reler os sinais do dia:', erro);
        });
    });
  }, [applySnapshot, astrology, userId]);

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
