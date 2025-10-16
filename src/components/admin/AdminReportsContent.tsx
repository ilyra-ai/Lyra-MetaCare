"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import * as React from "react";

export function AdminReportsContent() {
  const { supabase } = useAuth();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportUsers = async () => {
    setIsExporting(true);
    toast.info("Iniciando exportação...", { description: "Buscando todos os perfis de usuários." });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Falha na exportação.", { description: error.message });
      setIsExporting(false);
      return;
    }

    if (!data || data.length === 0) {
      toast.warning("Nenhum usuário para exportar.");
      setIsExporting(false);
      return;
    }

    try {
      // Constrói o cabeçalho do CSV
      const headers = Object.keys(data[0]).join(',');
      // Constrói as linhas de dados
      const rows = data.map(user => {
        return Object.values(user).map(value => {
          // Trata valores que podem quebrar o CSV (aspas, vírgulas)
          const stringValue = String(value).replace(/"/g, '""');
          if (stringValue.includes(',')) {
            return `"${stringValue}"`;
          }
          return stringValue;
        }).join(',');
      });

      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `export_users_${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Exportação concluída!", { description: `${data.length} usuários exportados.` });
    } catch (e) {
      toast.error("Ocorreu um erro ao gerar o arquivo CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-3 h-5 w-5 text-primary" /> Relatórios de Usuários</CardTitle>
          <CardDescription>Exporte dados da plataforma para análise externa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
            <div>
              <h4 className="font-semibold">Exportar Todos os Usuários</h4>
              <p className="text-sm text-muted-foreground">Gera um arquivo CSV com todos os dados da tabela de perfis.</p>
            </div>
            <Button onClick={handleExportUsers} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}