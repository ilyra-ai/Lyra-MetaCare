'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, MapPin } from 'lucide-react';
import { db } from '@/integrations/mysql/client';
import { Badge } from '@/components/ui/badge';

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
    <Card className="flex h-full min-w-0 flex-col">
      <CardHeader className="gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Fluxo local de eventos</CardTitle>
          <Badge variant="secondary">
            {events.length > 0 ? `${events.length} eventos` : 'em espera'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
        <div className="flex items-center gap-3 rounded-md border border-border bg-background p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-primary">
            <MapPin className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-medium">Feed local de telemetria</p>
            <p className="text-sm text-muted-foreground">
              Eventos capturados no dispositivo em tempo real.
            </p>
          </div>
        </div>
        {events.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {events.map((event) => (
              <li
                key={`${event.timestamp}-${event.description}`}
                className="rounded-md border border-border bg-card p-4 text-sm"
              >
                <p className="font-display font-medium tabular-nums text-foreground">
                  {event.timestamp}
                </p>
                <p className="mt-1 break-words leading-6 text-muted-foreground">
                  {event.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Activity className="size-5" aria-hidden="true" />
            </div>
            <p className="text-muted-foreground">
              Aguardando o primeiro pacote real do wearable via Bluetooth.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
