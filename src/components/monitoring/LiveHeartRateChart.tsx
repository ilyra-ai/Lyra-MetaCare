'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { db } from '@/integrations/mysql/client';

interface WearableRealtimePayload {
  heartRate: number | null;
  hrv: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
}

const chartConfig = {
  heartRate: {
    label: 'BPM',
    color: 'hsl(var(--destructive))',
  },
};

export function LiveHeartRateChart({ initialData }: { initialData: number }) {
  const [data, setData] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      heartRate: initialData,
    }))
  );

  useEffect(() => {
    const channel = db
      .channel('realtime-wearable')
      .on('broadcast', { event: 'new_data' }, (payload) => {
        const realtimePayload = payload.payload as WearableRealtimePayload;
        const newPoint = {
          time: new Date().getTime(),
          heartRate: realtimePayload.heartRate ?? initialData,
        };
        setData((currentData) => [...currentData.slice(1), newPoint]);
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, [initialData]);

  return (
    <Card className="flex h-full flex-col border-border/70 bg-card/90 backdrop-blur-xl">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">Frequência cardíaca ao vivo</CardTitle>
          <Badge variant="info">linha contínua</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 rounded-b-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,247,255,0.66))] p-5">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={false} axisLine={false} />
            <YAxis domain={[40, 160]} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="heartRate"
              type="monotone"
              stroke="var(--color-heartRate)"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
