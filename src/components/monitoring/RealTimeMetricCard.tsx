"use client";

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RealTimeMetricCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
}

export function RealTimeMetricCard({ icon: Icon, label, value, unit }: RealTimeMetricCardProps) {
  return (
    <Card className="bg-gray-50 dark:bg-gray-800 shadow-neumorphic-light dark:shadow-neumorphic-dark p-4 transition-all duration-300">
      <CardContent className="flex flex-col items-center justify-center p-0">
        <div className="flex items-center text-muted-foreground">
          <Icon className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="mt-2 text-3xl font-bold text-primary">
          {value}
          <span className="text-lg ml-1 text-muted-foreground">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}