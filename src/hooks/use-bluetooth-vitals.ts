'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { db } from '@/integrations/mysql/client';
import {
  AgregadorDaSessao,
  lerMedicaoDeFrequencia,
} from '@/lib/health/sessao-cardiaca';
import { avisarMetricasAtualizadas } from '@/lib/metricas/evento-de-atualizacao';

export type EstadoDaConexao = 'idle' | 'connecting' | 'connected' | 'error';

export interface BluetoothVitals {
  heartRate: number | null;
  hrv: number | null;
  connected: boolean;
  isConnecting: boolean;
  status: EstadoDaConexao;
  deviceName: string | null;
  errorMessage: string | null;
  /** Hora (HH:mm) da última sessão gravada no banco. */
  lastSavedAt: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

/** A cada 5 minutos a sessão agregada é gravada (e ao desconectar ou sair). */
const INTERVALO_DE_GRAVACAO_MS = 5 * 60 * 1000;

export const MENSAGEM_SEM_BLUETOOTH =
  'O Web Bluetooth só funciona em navegadores compatíveis baseados em Chromium e em contexto seguro (localhost ou HTTPS).';

/**
 * Conexão com a pulseira/cinta cardíaca por Web Bluetooth: leitura ao vivo
 * (FC e VFC), aviso às outras telas pelo canal "realtime-wearable" e gravação
 * periódica da sessão no banco (`POST /api/metricas/sensor`). Antes havia duas
 * implementações (painel e central de dispositivos) e nenhuma gravava nada.
 */
export function useBluetoothVitals(): BluetoothVitals {
  const [status, setStatus] = useState<EstadoDaConexao>('idle');
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [hrv, setHrv] = useState<number | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const agregadorRef = useRef(new AgregadorDaSessao());
  const dataDaSessaoRef = useRef<string | null>(null);
  const gravacaoBloqueadaRef = useRef(false);
  // Um único canal por conexão (antes cada leitura abria um canal novo, que
  // nunca era fechado).
  const canalRef = useRef<ReturnType<typeof db.channel> | null>(null);

  useEffect(() => {
    const canal = db.channel('realtime-wearable');
    canalRef.current = canal;
    return () => {
      canalRef.current = null;
      db.removeChannel(canal);
    };
  }, []);

  /** Grava o resumo da sessão acumulada e recomeça a agregação. */
  const gravarSessao = useCallback(async (aoSair = false) => {
    const agregador = agregadorRef.current;
    const data = dataDaSessaoRef.current;
    const resumo = agregador.resumo();
    if (!resumo || !data || gravacaoBloqueadaRef.current) {
      return;
    }
    agregador.zerar();
    dataDaSessaoRef.current = null;
    try {
      const resposta = await fetch('/api/metricas/sensor', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, ...resumo }),
        // Ao fechar a página a gravação continua depois da navegação.
        keepalive: aoSair,
      });
      if (resposta.status === 403) {
        gravacaoBloqueadaRef.current = true;
        const corpo = (await resposta.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.info('As leituras da pulseira não serão salvas.', {
          description:
            corpo?.error ?? 'O seu plano não inclui a conexão com wearables.',
        });
        return;
      }
      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
      }
      setLastSavedAt(format(new Date(), 'HH:mm'));
      if (!aoSair) avisarMetricasAtualizadas();
    } catch (error) {
      console.error('Falha ao gravar a sessão da pulseira:', error);
      if (!aoSair) {
        toast.error('Não foi possível salvar as leituras da pulseira agora.');
      }
    }
  }, []);

  const handleMeasurement = useCallback(
    (event: Event) => {
      const characteristic =
        event.target as BluetoothRemoteGATTCharacteristic | null;
      const value = characteristic?.value;
      if (!value) return;

      let medicao;
      try {
        medicao = lerMedicaoDeFrequencia(value);
      } catch {
        return;
      }

      // Virada do dia: a sessão de ontem é gravada antes de começar a de hoje.
      const hoje = format(new Date(), 'yyyy-MM-dd');
      if (dataDaSessaoRef.current && dataDaSessaoRef.current !== hoje) {
        void gravarSessao();
      }
      dataDaSessaoRef.current = hoje;

      agregadorRef.current.adicionar(medicao, Date.now());
      const vfc = agregadorRef.current.rmssdAoVivo();
      setHeartRate(medicao.fc);
      setHrv(vfc);

      // Leitura ao vivo para o monitoramento e o painel abertos em outras abas.
      void canalRef.current?.send({
        type: 'broadcast',
        event: 'new_data',
        payload: {
          heartRate: medicao.fc,
          hrv: vfc,
          respiratoryRate: null,
          temperature: null,
        },
      });
    },
    [gravarSessao]
  );

  const encerrar = useCallback(
    (mensagem: boolean) => {
      void gravarSessao();
      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
      deviceRef.current = null;
      setStatus('idle');
      setDeviceName(null);
      setHeartRate(null);
      setHrv(null);
      if (mensagem) {
        toast.info('Monitor cardíaco desconectado.');
      }
    },
    [gravarSessao]
  );

  const disconnect = useCallback(() => encerrar(true), [encerrar]);

  const connect = useCallback(async () => {
    const bluetooth = navigator.bluetooth;
    setErrorMessage(null);
    if (!bluetooth) {
      setErrorMessage(MENSAGEM_SEM_BLUETOOTH);
      toast.error('Bluetooth indisponível neste navegador', {
        description: MENSAGEM_SEM_BLUETOOTH,
      });
      return;
    }

    try {
      setStatus('connecting');
      const device = await bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });
      if (!device.gatt) {
        throw new Error('O dispositivo não oferece o serviço GATT.');
      }
      device.addEventListener('gattserverdisconnected', () => encerrar(true));
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic(
        'heart_rate_measurement'
      );
      await characteristic.startNotifications();
      characteristic.addEventListener(
        'characteristicvaluechanged',
        handleMeasurement
      );

      deviceRef.current = device;
      gravacaoBloqueadaRef.current = false;
      setDeviceName(device.name || 'Monitor cardíaco');
      setStatus('connected');
      toast.success(`Conectado a ${device.name || 'monitor cardíaco'}`, {
        description:
          'As leituras são salvas no seu dia a cada 5 minutos e ao desconectar.',
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        setStatus('idle');
        toast.info('Seleção cancelada', {
          description: 'Nenhum dispositivo Bluetooth foi selecionado.',
        });
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível conectar ao dispositivo.';
      console.error(error);
      setStatus('error');
      setErrorMessage(message);
      toast.error('Falha na conexão', { description: message });
    }
  }, [encerrar, handleMeasurement]);

  // Gravação periódica enquanto conectado.
  useEffect(() => {
    if (status !== 'connected') return;
    const intervalo = window.setInterval(() => {
      void gravarSessao();
    }, INTERVALO_DE_GRAVACAO_MS);
    return () => window.clearInterval(intervalo);
  }, [gravarSessao, status]);

  // Saída da página (fechar aba, trocar de rota) grava o que ficou pendente.
  useEffect(() => {
    const aoSair = () => {
      void gravarSessao(true);
    };
    window.addEventListener('pagehide', aoSair);
    return () => {
      window.removeEventListener('pagehide', aoSair);
      aoSair();
      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
    };
  }, [gravarSessao]);

  return {
    heartRate,
    hrv,
    connected: status === 'connected',
    isConnecting: status === 'connecting',
    status,
    deviceName,
    errorMessage,
    lastSavedAt,
    connect,
    disconnect,
  };
}
