"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function MapPlaceholder() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-b-lg">
        <MapPin className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-center text-muted-foreground">
          O mapa de atividades será exibido aqui.
        </p>
        <p className="text-xs text-center text-muted-foreground mt-2">
          (Requer configuração de chave de API do Google Maps)
        </p>
      </CardContent>
    </Card>
  );
}