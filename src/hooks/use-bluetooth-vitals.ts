'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface BluetoothVitals {
  heartRate: number | null;
  hrv: number | null;
  rrIntervals: number[];
  connected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useBluetoothVitals(): BluetoothVitals {
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [rrIntervals, setRrIntervals] = useState<number[]>([]);
  const [hrv, setHrv] = useState<number | null>(null);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);

  const calculateHRV = (intervals: number[]) => {
    if (intervals.length < 2) return null;
    let sumDiffSq = 0;
    for (let i = 1; i < intervals.length; i++) {
      const diff = intervals[i] - intervals[i - 1];
      sumDiffSq += diff * diff;
    }
    // rMSSD = root mean square of successive differences
    return Math.round(Math.sqrt(sumDiffSq / (intervals.length - 1)));
  };

  const handleCharacteristicValueChanged = useCallback((event: any) => {
    const value = event.target.value as DataView;
    const flags = value.getUint8(0);
    const hr16Bit = flags & 0x01;
    const rrPresent = (flags & 0x10) !== 0;

    let index = 1;
    const hr = hr16Bit ? value.getUint16(index, true) : value.getUint8(index);
    index += hr16Bit ? 2 : 1;

    setHeartRate(hr);

    if (rrPresent) {
      const newIntervals = [];
      while (index < value.byteLength) {
        // RR interval in 1/1024 seconds
        const rr = (value.getUint16(index, true) * 1000) / 1024;
        newIntervals.push(rr);
        index += 2;
      }
      setRrIntervals((prev) => {
        const updated = [...prev, ...newIntervals].slice(-60); // Keep last 60 intervals
        const newHrv = calculateHRV(updated);
        setHrv(newHrv);
        return updated;
      });
    }
  }, []);

  const connect = async () => {
    if (!navigator.bluetooth) {
      toast.error('Web Bluetooth não é suportado neste navegador. Use Chrome, Edge ou Opera.');
      return;
    }

    try {
      setIsConnecting(true);
      const btDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
      });

      if (!btDevice.gatt) throw new Error('Dispositivo sem serviço GATT');

      btDevice.addEventListener('gattserverdisconnected', disconnect);
      const server = await btDevice.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      setDevice(btDevice);
      setConnected(true);
      toast.success(`Conectado ao dispositivo: ${btDevice.name || 'Monitor Cardíaco'}`);
    } catch (err) {
      toast.error('Falha ao conectar: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setConnected(false);
    setHeartRate(null);
    setHrv(null);
    setRrIntervals([]);
    toast.info('Monitor cardíaco desconectado.');
  };

  return {
    heartRate,
    hrv,
    rrIntervals,
    connected,
    isConnecting,
    connect,
    disconnect,
  };
}
