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
    <Card className="flex h-full flex-col border-border/70 bg-card/90 backdrop-blur-xl">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">Fluxo local de eventos</CardTitle>
          <Badge variant="secondary">
            {events.length > 0 ? `${events.length} eventos` : 'em espera'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 rounded-b-[24px] bg-muted/35 p-5">
        <div className="flex items-center gap-3 rounded-[24px] border border-border/70 bg-white/82 p-4 shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-cosmic-light text-cosmic shadow-cosmic">
            <MapPin />
          </div>
          <div>
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
                className="rounded-[20px] border border-border/70 bg-white/82 p-4 text-sm shadow-sm"
              >
                <p className="font-medium text-foreground">{event.timestamp}</p>
                <p className="mt-1 leading-6 text-muted-foreground">
                  {event.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity />
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
