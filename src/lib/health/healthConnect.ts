export interface HealthDataMetrics {
  heartRate: number | null;
  sleepDurationMinutes: number | null;
  bloodGlucoseMgDl: number | null;
  weightKg: number | null;
  moodScore: number | null;
}

interface NativeHealthRecord {
  value: number;
}

interface NativeHealthPlugin {
  isAvailable: (
    onSuccess: (available: boolean) => void,
    onError: (error: unknown) => void
  ) => void;
  requestAuthorization: (
    dataTypes: string[],
    onSuccess: () => void,
    onError: (error: unknown) => void
  ) => void;
  query: (
    options: { startDate: Date; endDate: Date; dataType: string },
    onSuccess: (records: NativeHealthRecord[]) => void,
    onError: (error: unknown) => void
  ) => void;
}

type NativeHealthWindow = Window & {
  plugins?: {
    health?: NativeHealthPlugin;
  };
};

type BluetoothNavigator = Navigator & { bluetooth?: Bluetooth };

export async function fetchRealTimeVitals(): Promise<HealthDataMetrics> {
  const metrics: HealthDataMetrics = {
    heartRate: null,
    sleepDurationMinutes: null,
    bloodGlucoseMgDl: null,
    weightKg: null,
    moodScore: null,
  };

  const win = window as NativeHealthWindow;

  if (win.plugins && win.plugins.health) {
    try {
      const hasPermission = await new Promise((resolve, reject) => {
        win.plugins.health.isAvailable(resolve, reject);
      });

      if (hasPermission) {
        await new Promise((resolve, reject) => {
          win.plugins.health.requestAuthorization(
            ['heart_rate', 'sleep', 'blood_glucose', 'weight'],
            resolve,
            reject
          );
        });

        const hrData = await new Promise<NativeHealthRecord[]>(
          (resolve, reject) => {
            win.plugins.health.query(
              {
                startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                endDate: new Date(),
                dataType: 'heart_rate',
              },
              resolve,
              reject
            );
          }
        );
        if (hrData && hrData.length > 0)
          metrics.heartRate = hrData[hrData.length - 1].value;

        return metrics;
      }
    } catch (error) {
      throw new Error(
        'Falha estrutural ao tentar ler HealthKit/Health Connect: ' +
          (error as Error).message
      );
    }
  }

  if ((navigator as BluetoothNavigator).bluetooth) {
    throw new Error(
      'A coleta em background via Web Bluetooth é bloqueada pelo navegador. Conecte o dispositivo manualmente na interface do Wearable ou encapsule o app via Capacitor para permissões Health Connect nativas.'
    );
  }

  throw new Error(
    'Nenhum ecossistema de saúde nativo (HealthKit/Google Fit/Health Connect) ou Bluetooth API foi detectado no ambiente de execução. Isolamento de sandbox impedindo fluxo real de dados.'
  );
}
