"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const chartConfig = {
  heartRate: {
    label: "BPM",
    color: "hsl(var(--destructive))",
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
    const channel = supabase
      .channel('realtime-wearable-chart')
      .on('broadcast', { event: 'new_data' }, (payload) => {
        const newPoint = {
          time: new Date().getTime(),
          heartRate: payload.payload.heartRate,
        };
        setData(currentData => [...currentData.slice(1), newPoint]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Frequência Cardíaca (Ao Vivo)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={false}
              axisLine={false}
            />
            <YAxis domain={[40, 160]} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
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
      </CardContent>
    </Card>
  );
}