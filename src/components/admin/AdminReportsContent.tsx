'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import * as React from 'react';

export function AdminReportsContent() {
  const { db } = useAuth();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportUsers = async () => {
    setIsExporting(true);
    toast.info('Iniciando exportação...', {
      description: 'Buscando todos os perfis de usuários.',
    });

    const { data, error } = await db
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Falha na exportação.', { description: error.message });
      setIsExporting(false);
      return;
    }

    if (!data || data.length === 0) {
      toast.warning('Nenhum usuário para exportar.');
      setIsExporting(false);
      return;
    }

    try {
      // Constrói o cabeçalho do CSV
      const headers = Object.keys(data[0]).join(',');
      // Constrói as linhas de dados
      const rows = data.map((user) => {
        return Object.values(user)
          .map((value) => {
            // Trata valores que podem quebrar o CSV (aspas, vírgulas)
            const stringValue = String(value).replace(/"/g, '""');
            if (stringValue.includes(',')) {
              return `"${stringValue}"`;
            }
            return stringValue;
          })
          .join(',');
      });

      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `export_users_${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Exportação concluída!', {
        description: `${data.length} usuários exportados.`,
      });
    } catch {
      toast.error('Ocorreu um erro ao gerar o arquivo CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-primary"
              aria-hidden="true"
            >
              <Users className="h-4 w-4" />
            </span>
            Relatórios de Usuários
          </CardTitle>
          <CardDescription>
            Exporte dados da plataforma para análise externa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-border bg-background p-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground">
                Exportar Todos os Usuários
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Gera um arquivo CSV com todos os dados da tabela de perfis.
              </p>
            </div>
            <Button onClick={handleExportUsers} disabled={isExporting}>
              {isExporting ? (
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
