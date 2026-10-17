'use client';

import React, { useEffect, useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartFigure,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { db } from '@/integrations/mysql/client';
import { resumoDoGrafico } from '@/lib/graficos/resumo';

interface WearableRealtimePayload {
  heartRate: number | null;
}

const chartConfig = {
  heartRate: {
    label: 'BPM',
    color: 'hsl(var(--primary))',
  },
};

/** Pontos mantidos no gráfico (cerca de 1 minuto de leituras). */
const PONTOS = 60;

/**
 * Frequência cardíaca ao vivo: só leituras reais da pulseira. Antes o
 * gráfico começava com 20 pontos fictícios em 0 e repetia o último valor
 * quando a leitura faltava.
 */
export function LiveHeartRateChart() {
  const [data, setData] = useState<Array<{ time: number; heartRate: number }>>(
    []
  );

  useEffect(() => {
    const channel = db
      .channel('realtime-wearable')
      .on('broadcast', { event: 'new_data' }, (payload) => {
        const leitura = (payload.payload as WearableRealtimePayload).heartRate;
        if (leitura === null || !Number.isFinite(leitura)) return;
        setData((atual) =>
          [...atual, { time: Date.now(), heartRate: leitura }].slice(-PONTOS)
        );
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const valores = data.map((p) => p.heartRate);
  const minimo = valores.length ? Math.min(...valores) : 40;
  const maximo = valores.length ? Math.max(...valores) : 160;

  return (
    <Card className="flex h-full min-w-0 flex-col">
      <CardHeader className="gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>Frequência cardíaca ao vivo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Batimentos por minuto (bpm) no último minuto.
            </p>
          </div>
          <Badge variant={data.length ? 'success' : 'secondary'}>
            {data.length
              ? `${data.length} ${data.length === 1 ? 'leitura' : 'leituras'}`
              : 'aguardando a pulseira'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="min-h-64 flex-1 px-5 pb-5">
        {data.length === 0 ? (
          <div className="flex h-full min-h-60 flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HeartPulse className="size-5" aria-hidden="true" />
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Conecte a pulseira acima: o gráfico mostra cada batimento medido,
              sem valores de exemplo.
            </p>
          </div>
        ) : (
          <ChartFigure
            className="h-full"
            resumo={resumoDoGrafico(
              'Frequência cardíaca no último minuto, em batimentos por minuto',
              [{ nome: 'Frequência', valores: valores, unidade: 'bpm' }]
            )}
          >
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-full min-h-60 w-full border-0 p-0"
            >
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
                accessibilityLayer
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                {/* Eixo do tempo sem marcas: a janela é o último minuto,
                  informado no título do card. */}
                <XAxis
                  dataKey="time"
                  tick={false}
                  axisLine={false}
                  height={8}
                />
                <YAxis
                  domain={[
                    Math.max(30, Math.floor((minimo - 10) / 10) * 10),
                    Math.ceil((maximo + 10) / 10) * 10,
                  ]}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" hideLabel />}
                />
                <Line
                  dataKey="heartRate"
                  type="monotone"
                  stroke="var(--color-heartRate)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          </ChartFigure>
        )}
      </CardContent>
    </Card>
  );
}
