'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useSyncExternalStore,
} from 'react';
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
import { AppPageConfig } from '@/lib/site-page-config/schema';
import { scaleRem } from '@/lib/site-page-config/runtime';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
// Capacidades do navegador não mudam durante a sessão: não há o que assinar.
const subscribeToStaticCapability = () => () => undefined;
const BLUETOOTH_UNSUPPORTED_MESSAGE =
  'O Web Bluetooth só funciona em navegadores compatíveis baseados em Chromium e em contexto seguro (localhost ou HTTPS).';
type ConnectConfig = AppPageConfig['connect'];

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

export function WearableConnection({
  config,
  typography,
}: {
  config: ConnectConfig;
  typography: AppPageConfig['typography'];
}) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Suporte a Web Bluetooth é uma capacidade fixa do navegador: lida como
  // store externo (null no servidor, booleano no cliente após a hidratação).
  const bluetoothSupported = useSyncExternalStore<boolean | null>(
    subscribeToStaticCapability,
    () => Boolean(navigator.bluetooth),
    () => null
  );
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
    setErrorMessage(null);

    const bluetooth = navigator.bluetooth;
    if (!bluetooth) {
      setStatus('idle');
      setErrorMessage(BLUETOOTH_UNSUPPORTED_MESSAGE);
      toast.error('Bluetooth indisponível neste navegador', {
        description: BLUETOOTH_UNSUPPORTED_MESSAGE,
      });
      return;
    }

    try {
      const device = await bluetooth.requestDevice({
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
      setErrorMessage(null);
      toast.success('Conexão estabelecida!', {
        description: `Conectado ao ${device.name || 'dispositivo'} via Web Bluetooth.`,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        setStatus('idle');
        toast.info('Seleção cancelada', {
          description:
            'Nenhum dispositivo Bluetooth foi selecionado para conexão.',
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
      toast.error('Falha na Conexão', {
        description: message,
      });
    }
  };

  const handleDisconnect = () => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    setStatus('idle');
    setDeviceName(null);
    setErrorMessage(null);
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
            <Watch className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{config.idleDescription}</p>
            {bluetoothSupported === false ? (
              <Alert className="border-warning/50 bg-warning-light text-left">
                <XCircle className="h-4 w-4 text-warning" />
                <AlertTitle>{config.unsupportedTitle}</AlertTitle>
                <AlertDescription>
                  {errorMessage || config.unsupportedDescription}
                </AlertDescription>
              </Alert>
            ) : null}
            <Button
              onClick={handleConnect}
              className="w-full"
              disabled={bluetoothSupported === false}
            >
              {bluetoothSupported === false
                ? 'Abra em um navegador compatível'
                : config.connectButtonLabel}
            </Button>
          </div>
        );
      case 'connecting':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 text-info mx-auto animate-spin" />
            <p className="text-lg font-semibold">{config.connectingTitle}</p>
            <p className="text-sm text-muted-foreground">
              {config.connectingDescription}
            </p>
            <Button disabled className="w-full">
              {config.connectingButtonLabel}
            </Button>
          </div>
        );
      case 'connected':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
            <p className="text-lg font-semibold text-success">
              {config.connectedTitle}
            </p>
            <p className="text-muted-foreground">
              {config.connectedDescription}:{' '}
              <span className="font-medium text-foreground">{deviceName}</span>
            </p>
            <Alert className="border-success/50 bg-success-light">
              <Zap className="h-4 w-4 text-success" />
              <AlertTitle>{config.connectedAlertTitle}</AlertTitle>
              <AlertDescription>
                {config.connectedAlertDescription}
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full"
            >
              {config.disconnectButtonLabel}
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <p className="text-lg font-semibold text-destructive">
              {config.errorTitle}
            </p>
            <p className="text-muted-foreground">
              {errorMessage || config.errorDescription}
            </p>
            <Button onClick={handleConnect} className="w-full">
              {config.retryButtonLabel}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="mx-auto max-w-3xl border-border/70 bg-white/88 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle
          className="text-2xl"
          style={{
            fontSize: scaleRem(1.5, typography.pageTitle),
          }}
        >
          {config.cardTitle}
        </CardTitle>
        <CardDescription
          style={{
            fontSize: scaleRem(0.95, typography.pageBody),
          }}
        >
          {config.cardDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">{renderStatusContent()}</CardContent>
    </Card>
  );
}
