"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, FileDown, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function AdminReportsContent() {

  const handleExport = () => {
    toast.info("Gerando relatório...", {
      description: "Esta funcionalidade está em desenvolvimento.",
    });
  };

  const handleTestError = () => {
    try {
      throw new Error("Este é um erro de teste para o Sentry a partir da página de admin.");
    } catch (error) {
      toast.error("Erro de teste enviado para o Sentry!");
      // Sentry.captureException(error); // Descomente quando o DSN estiver configurado
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Card de Estatísticas */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-3 h-5 w-5 text-primary" /> Estatísticas de Usuários</CardTitle>
          <CardDescription>Visão geral da base de usuários.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <span className="font-medium">Total de Usuários</span>
            <span className="font-bold text-lg">1,234</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <span className="font-medium">Ativos Hoje</span>
            <span className="font-bold text-lg text-green-600">56</span>
          </div>
        </CardContent>
      </Card>

      {/* Card de Configurações Globais */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-3 h-5 w-5 text-primary" /> Configurações Globais</CardTitle>
          <CardDescription>Ajustes que afetam todos os usuários.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <label htmlFor="email-notifications" className="font-medium">Habilitar Notificações por Email</label>
            <Switch id="email-notifications" defaultChecked />
          </div>
           <Button onClick={handleExport} variant="outline" className="w-full">
            <FileDown className="mr-2 h-4 w-4" /> Gerar Relatório Mensal (PDF)
          </Button>
        </CardContent>
      </Card>

      {/* Card de Ferramentas */}
      <Card className="shadow-sm lg:col-span-2 border-amber-500/50">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-600"><AlertTriangle className="mr-3 h-5 w-5" /> Ferramentas de Desenvolvedor</CardTitle>
          <CardDescription>Ações para depuração e testes do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestError} variant="destructive" className="w-full">
            Testar Integração Sentry (Gerar Erro)
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Use esta opção para verificar se os erros estão sendo capturados corretamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}