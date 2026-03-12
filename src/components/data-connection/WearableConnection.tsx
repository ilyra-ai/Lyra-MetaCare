'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Watch, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/integrations/mysql/client';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
type BluetoothNavigator = Navigator & { bluetooth?: Bluetooth };

function calculateRmssd(rrIntervalsMs: number[]) {
  if (rrIntervalsMs.length < 2) {
    return null;
  }

  const successiveDiffSquares = [];
  for (let index = 1; index < rrIntervalsMs.length; index += 1) {
    const diff = rrIntervalsMs[index] - rrIntervalsMs[index - 1];
    successiveDiffSquares.push(diff * diff);
  }

  const meanSquare =
    successiveDiffSquares.reduce((sum, value) => sum + value, 0) /
    successiveDiffSquares.length;
  return Number(Math.sqrt(meanSquare).toFixed(1));
}

export function WearableConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const rrHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
    };
  }, []);

  const handleCharacteristicValueChanged = (event: Event) => {
    const characteristic =
      event.target as BluetoothRemoteGATTCharacteristic | null;
    const value = characteristic?.value;
    if (!value) {
      return;
    }
    // Parse Heart Rate Measurement characteristic
    // Format: Flags (1 byte), Heart Rate (1 or 2 bytes depending on flags)
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    const rrPresent = Boolean(flags & 0x10);
    const heartRate = rate16Bits ? value.getUint16(1, true) : value.getUint8(1);
    let cursor = rate16Bits ? 3 : 2;

    if (rrPresent) {
      while (cursor + 1 < value.byteLength) {
        const rrValue = value.getUint16(cursor, true);
        const rrMs = Number(((rrValue / 1024) * 1000).toFixed(2));
        rrHistoryRef.current.push(rrMs);
        cursor += 2;
      }
      rrHistoryRef.current = rrHistoryRef.current.slice(-20);
    }

    const hrv = calculateRmssd(rrHistoryRef.current);

    // Propaga dados reais para o canal local em memória consumido pelo monitoramento.
    db.channel('realtime-wearable').send({
      type: 'broadcast',
      event: 'new_data',
      payload: {
        heartRate,
        hrv,
        respiratoryRate: null,
        temperature: null,
      },
    });
  };

  const handleConnect = async () => {
    setStatus('connecting');
    setDeviceName(null);

    try {
      const bluetoothNavigator = navigator as BluetoothNavigator;
      if (!bluetoothNavigator.bluetooth) {
        throw new Error('Web Bluetooth API não é suportada neste navegador.');
      }

      const device = await bluetoothNavigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });

      deviceRef.current = device;
      setDeviceName(device.name || 'Dispositivo Desconhecido');

      // Connect to GATT Server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error(
          'Servidor GATT indisponível para o dispositivo selecionado.'
        );
      }

      // Get Heart Rate Service
      const service = await server.getPrimaryService('heart_rate');

      // Get Heart Rate Measurement Characteristic
      const characteristic = await service.getCharacteristic(
        'heart_rate_measurement'
      );

      // Start notifications
      await characteristic.startNotifications();
      characteristic.addEventListener(
        'characteristicvaluechanged',
        handleCharacteristicValueChanged
      );

      device.addEventListener('gattserverdisconnected', handleDisconnect);

      setStatus('connected');
      toast.success('Conexão estabelecida!', {
        description: `Conectado ao ${device.name || 'dispositivo'} via Web Bluetooth.`,
      });
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast.error('Falha na Conexão', {
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível conectar ao dispositivo.',
      });
    }
  };

  const handleDisconnect = () => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    setStatus('idle');
    setDeviceName(null);
    deviceRef.current = null;
    toast.info('Desconectado', {
      description: 'A conexão com o dispositivo foi encerrada.',
    });
  };

  const renderStatusContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="text-center space-y-4">
            <Watch className="h-16 w-16 text-gray-400 mx-auto" />
            <p className="text-muted-foreground">
              Conecte sua cinta cardíaca ou relógio via Bluetooth para métricas
              reais.
            </p>
            <Button onClick={handleConnect} className="w-full">
              Conectar Dispositivo Bluetooth
            </Button>
          </div>
        );
      case 'connecting':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto animate-spin" />
            <p className="text-lg font-semibold">Aguardando seleção...</p>
            <p className="text-sm text-muted-foreground">
              Selecione o dispositivo no prompt do navegador.
            </p>
            <Button disabled className="w-full">
              Conectando...
            </Button>
          </div>
        );
      case 'connected':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <p className="text-lg font-semibold text-green-700">
              Conectado com Sucesso!
            </p>
            <p className="text-muted-foreground">
              Dispositivo:{' '}
              <span className="font-medium text-foreground">{deviceName}</span>
            </p>
            <Alert className="border-green-500/50 bg-green-50">
              <Zap className="h-4 w-4 text-green-600" />
              <AlertTitle>Recebendo Dados em Tempo Real</AlertTitle>
              <AlertDescription>
                O dashboard de monitoramento refletirá seus batimentos.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full"
            >
              Desconectar
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-600 mx-auto" />
            <p className="text-lg font-semibold text-red-700">
              Erro de Conexão
            </p>
            <p className="text-muted-foreground">
              Não foi possível estabelecer a conexão Bluetooth. Verifique se o
              dispositivo está ligado e pareado.
            </p>
            <Button onClick={handleConnect} className="w-full">
              Tentar Novamente
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          Conexão Real-Time (Bluetooth)
        </CardTitle>
        <CardDescription>
          Integre sua cinta de frequência cardíaca BLE ou smartwatch.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">{renderStatusContent()}</CardContent>
    </Card>
  );
}
