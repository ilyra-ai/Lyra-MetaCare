'use client';

import React, { useSyncExternalStore } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  CheckCircle,
  HeartPulse,
  Loader2,
  Watch,
  XCircle,
  Zap,
} from 'lucide-react';
import type { AppPageConfig } from '@/lib/site-page-config/schema';
import { scaleRem } from '@/lib/site-page-config/runtime';
import { useBluetoothVitals } from '@/hooks/use-bluetooth-vitals';

// Capacidades do navegador não mudam durante a sessão: não há o que assinar.
const subscribeToStaticCapability = () => () => undefined;
type ConnectConfig = AppPageConfig['connect'];

/**
 * Central de dispositivos: conexão com a pulseira/cinta cardíaca por Web
 * Bluetooth. A leitura, o aviso às outras telas e a gravação da sessão no
 * banco ficam no hook compartilhado `useBluetoothVitals`.
 */
export function WearableConnection({
  config,
  typography,
}: {
  config: ConnectConfig;
  typography: AppPageConfig['typography'];
}) {
  // Suporte a Web Bluetooth é uma capacidade fixa do navegador: lida como
  // store externo (null no servidor, booleano no cliente após a hidratação).
  const bluetoothSupported = useSyncExternalStore<boolean | null>(
    subscribeToStaticCapability,
    () => Boolean(navigator.bluetooth),
    () => null
  );
  const {
    status,
    deviceName,
    errorMessage,
    heartRate,
    hrv,
    lastSavedAt,
    connect,
    disconnect,
  } = useBluetoothVitals();

  const renderStatusContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-accent text-primary">
              <Watch className="h-8 w-8" aria-hidden="true" />
            </div>
            {/* Título do estado inicial editável no construtor de UI
                (app.connect.idleTitle). */}
            <p className="font-display text-lg font-semibold text-foreground">
              {config.idleTitle}
            </p>
            <p className="leading-relaxed text-foreground/80">
              {config.idleDescription}
            </p>
            {bluetoothSupported === false ? (
              <Alert className="rounded-md border-warning/30 bg-warning-light text-left shadow-none">
                <XCircle className="h-4 w-4 text-warning" aria-hidden="true" />
                <AlertTitle>{config.unsupportedTitle}</AlertTitle>
                <AlertDescription>
                  {errorMessage || config.unsupportedDescription}
                </AlertDescription>
              </Alert>
            ) : null}
            <Button
              onClick={() => void connect()}
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
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-info-light text-info">
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
            </div>
            <p className="font-display text-lg font-semibold tracking-tight">
              {config.connectingTitle}
            </p>
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
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success">
              <CheckCircle className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="font-display text-lg font-semibold tracking-tight text-success">
              {config.connectedTitle}
            </p>
            <p className="break-words text-muted-foreground">
              {config.connectedDescription}:{' '}
              <span className="font-medium text-foreground">{deviceName}</span>
            </p>
            <dl className="grid grid-cols-2 gap-3 text-left" aria-live="polite">
              <div className="rounded-lg border border-border bg-card p-3">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />
                  Frequência cardíaca
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-foreground">
                  {heartRate ?? '—'}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    bpm
                  </span>
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                  VFC (RMSSD)
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-foreground">
                  {hrv ?? '—'}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    ms
                  </span>
                </dd>
              </div>
            </dl>
            <Alert className="rounded-md border-success/30 bg-success-light text-left shadow-none">
              <Zap className="h-4 w-4 text-success" aria-hidden="true" />
              <AlertTitle>{config.connectedAlertTitle}</AlertTitle>
              <AlertDescription>
                {config.connectedAlertDescription}{' '}
                {lastSavedAt
                  ? `Última gravação no seu dia às ${lastSavedAt}.`
                  : 'As leituras são salvas no seu dia a cada 5 minutos e ao desconectar.'}
              </AlertDescription>
            </Alert>
            <Button
              onClick={disconnect}
              variant="destructive"
              className="w-full"
            >
              {config.disconnectButtonLabel}
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive-light text-destructive">
              <XCircle className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="font-display text-lg font-semibold tracking-tight text-destructive">
              {config.errorTitle}
            </p>
            <p className="break-words text-muted-foreground">
              {errorMessage || config.errorDescription}
            </p>
            <Button onClick={() => void connect()} className="w-full">
              {config.retryButtonLabel}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader className="text-center">
        <CardTitle
          className="text-2xl tracking-[-0.02em]"
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
      <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
        {renderStatusContent()}
      </CardContent>
    </Card>
  );
}
