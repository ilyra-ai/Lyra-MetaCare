'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, MapPin } from 'lucide-react';
import { db } from '@/integrations/mysql/client';

interface ActivityEvent {
  timestamp: string;
  description: string;
}

export function MapPlaceholder() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const channel = db
      .channel('realtime-wearable')
      .on('broadcast', { event: 'new_data' }, (payload) => {
        const data = payload.payload as {
          heartRate: number | null;
          hrv: number | null;
        };
        setEvents((current) =>
          [
            {
              timestamp: new Date().toLocaleTimeString('pt-BR'),
              description: `Leitura recebida: BPM ${data.heartRate ?? 'N/A'} e HRV ${data.hrv ?? 'N/A'} ms`,
            },
            ...current,
          ].slice(0, 6)
        );
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
        <div className="flex items-center gap-3 rounded-xl bg-white/70 p-4 shadow-sm dark:bg-gray-900/70">
          <MapPin className="h-10 w-10 text-teal-600" />
          <div>
            <p className="font-medium">Feed local de telemetria</p>
            <p className="text-sm text-muted-foreground">
              Eventos capturados no dispositivo em tempo real.
            </p>
          </div>
        </div>
        {events.length > 0 ? (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={`${event.timestamp}-${event.description}`}
                className="rounded-xl bg-white/70 p-3 text-sm shadow-sm dark:bg-gray-900/70"
              >
                <p className="font-medium">{event.timestamp}</p>
                <p className="text-muted-foreground">{event.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <Activity className="h-10 w-10 text-gray-400" />
            <p className="text-muted-foreground">
              Aguardando o primeiro pacote real do wearable via Bluetooth.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
