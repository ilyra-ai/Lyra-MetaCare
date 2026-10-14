'use client';

import { useEffect, useState } from 'react';
import { Activity, Radio } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/integrations/mysql/client';

interface EventoDaPulseira {
  id: number;
  horario: string;
  descricao: string;
}

/**
 * Últimas leituras recebidas da pulseira nesta aba (antes chamado
 * "MapPlaceholder", com ícone de mapa, embora nunca tenha sido um mapa). O
 * histórico do dia fica gravado no registro do dia a cada 5 minutos.
 */
export function FluxoDeEventos() {
  const [eventos, setEventos] = useState<EventoDaPulseira[]>([]);

  useEffect(() => {
    const channel = db
      .channel('realtime-wearable')
      .on('broadcast', { event: 'new_data' }, (payload) => {
        const dados = payload.payload as {
          heartRate: number | null;
          hrv: number | null;
        };
        const partes = [
          dados.heartRate !== null ? `${dados.heartRate} bpm` : null,
          dados.hrv !== null ? `VFC ${dados.hrv} ms` : null,
        ].filter(Boolean);
        setEventos((atual) =>
          [
            {
              id: Date.now(),
              horario: new Date().toLocaleTimeString('pt-BR'),
              descricao: partes.length
                ? `Leitura recebida: ${partes.join(' · ')}`
                : 'Pacote recebido sem frequência cardíaca',
            },
            ...atual,
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
          <CardTitle>Leituras recebidas</CardTitle>
          <Badge variant="secondary">
            {eventos.length > 0 ? `${eventos.length} recentes` : 'em espera'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
        <div className="flex items-center gap-3 rounded-md border border-border bg-background p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-primary">
            <Radio className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-medium">Pulseira Bluetooth</p>
            <p className="text-sm text-muted-foreground">
              As 6 leituras mais recentes desta aba; o dia fica gravado no seu
              registro a cada 5 minutos.
            </p>
          </div>
        </div>
        {eventos.length > 0 ? (
          <ul className="flex flex-col gap-3" aria-live="polite">
            {eventos.map((evento) => (
              <li
                key={evento.id}
                className="rounded-md border border-border bg-card p-4 text-sm"
              >
                <p className="font-display font-medium tabular-nums text-foreground">
                  {evento.horario}
                </p>
                <p className="mt-1 break-words leading-6 text-muted-foreground">
                  {evento.descricao}
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
              Aguardando a primeira leitura da pulseira.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
