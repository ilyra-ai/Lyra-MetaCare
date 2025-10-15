"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Watch, Zap } from "lucide-react";
import { toast } from "sonner";

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export function WearableConnection() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [deviceName, setDeviceName] = useState<string | null>(null);

  const handleConnect = () => {
    setStatus("connecting");
    setDeviceName(null);

    // Simulate API call delay
    setTimeout(() => {
      // Randomly simulate success or failure
      if (Math.random() > 0.2) {
        setStatus("connected");
        setDeviceName("Apple Watch Series 9");
        toast.success("Conexão estabelecida!", {
          description: "Seus dados de saúde estão sendo sincronizados.",
        });
      } else {
        setStatus("error");
        toast.error("Falha na Conexão", {
          description: "Verifique se o dispositivo está ligado e tente novamente.",
        });
      }
    }, 2500);
  };

  const handleDisconnect = () => {
    setStatus("idle");
    setDeviceName(null);
    toast.info("Desconectado", {
        description: "A sincronização de dados foi interrompida.",
    });
  }

  const renderStatusContent = () => {
    switch (status) {
      case "idle":
        return (
          <div className="text-center space-y-4">
            <Watch className="h-16 w-16 text-gray-400 mx-auto" />
            <p className="text-muted-foreground">
              Conecte seu dispositivo para sincronizar dados de atividade, sono e frequência cardíaca.
            </p>
            <Button onClick={handleConnect} className="w-full">
              Conectar Wearable
            </Button>
          </div>
        );
      case "connecting":
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto animate-spin" />
            <p className="text-lg font-semibold">Buscando dispositivos...</p>
            <p className="text-sm text-muted-foreground">
              Isso pode levar alguns segundos.
            </p>
            <Button disabled className="w-full">
              Conectando...
            </Button>
          </div>
        );
      case "connected":
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <p className="text-lg font-semibold text-green-700">Conectado com Sucesso!</p>
            <p className="text-muted-foreground">
              Dispositivo: <span className="font-medium text-foreground">{deviceName}</span>
            </p>
            <Alert className="border-green-500/50 bg-green-50">
                <Zap className="h-4 w-4 text-green-600" />
                <AlertTitle>Sincronização Ativa</AlertTitle>
                <AlertDescription>
                    Seus dados estão sendo atualizados em tempo real.
                </AlertDescription>
            </Alert>
            <Button onClick={handleDisconnect} variant="destructive" className="w-full">
              Desconectar
            </Button>
          </div>
        );
      case "error":
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-600 mx-auto" />
            <p className="text-lg font-semibold text-red-700">Erro de Conexão</p>
            <p className="text-muted-foreground">
              Não foi possível estabelecer a conexão. Tente novamente ou verifique as permissões do aplicativo no seu dispositivo.
            </p>
            <Button onClick={handleConnect} className="w-full">
              Tentar Novamente
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Conexão de Dispositivos</CardTitle>
        <CardDescription>
          Integre seus dados de saúde para obter insights mais precisos.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {renderStatusContent()}
      </CardContent>
    </Card>
  );
}