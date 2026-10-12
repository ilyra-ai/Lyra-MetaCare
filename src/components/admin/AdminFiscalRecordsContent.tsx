'use client';

import * as React from 'react';
import { Download, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RegistroFiscal {
  id: string;
  external_invoice_id: string;
  invoice_number: string | null;
  conta_ativa: boolean;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_tax_id_type: string | null;
  buyer_tax_id: string | null;
  description: string | null;
  plan_key: string | null;
  billing_interval: string | null;
  currency_code: string;
  amount_subtotal: number;
  amount_tax: number;
  amount_total: number;
  paid_at: string;
}

interface RespostaFiscal {
  registros: RegistroFiscal[];
  total: number;
  totaisPorMoeda: { moeda: string; registros: number; total: number }[];
  page: number;
  pageSize: number;
}

const TAMANHO_DA_PAGINA = 20;

function valor(centavos: number, moeda: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda,
  }).format(centavos / 100);
}

function dataHoraBr(valorUtc: string) {
  const [data, hora = ''] = valorUtc.split(' ');
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano} ${hora.slice(0, 5)} UTC`;
}

function celulaCsv(conteudo: unknown) {
  const texto =
    conteudo === null || conteudo === undefined ? '' : String(conteudo);
  return /[",;\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

async function buscarPagina(
  pagina: number,
  tamanho: number,
  de: string,
  ate: string
) {
  const parametros = new URLSearchParams({
    page: String(pagina),
    pageSize: String(tamanho),
  });
  if (de) parametros.set('de', de);
  if (ate) parametros.set('ate', ate);
  const resposta = await fetch(`/api/admin/fiscal-records?${parametros}`, {
    credentials: 'include',
  });
  const corpo = (await resposta.json().catch(() => null)) as
    (RespostaFiscal & { error?: string }) | null;
  if (!resposta.ok || !corpo) {
    throw new Error(corpo?.error ?? `HTTP ${resposta.status}`);
  }
  return corpo;
}

/**
 * Registros fiscais (LGPD, tarefa 28.1): consulta só de leitura, exclusiva do
 * administrador. Não há ação de alterar nem de excluir.
 */
export function AdminFiscalRecordsContent() {
  const [de, setDe] = React.useState('');
  const [ate, setAte] = React.useState('');
  const [filtro, setFiltro] = React.useState({ de: '', ate: '' });
  const [pagina, setPagina] = React.useState(0);
  const [dados, setDados] = React.useState<RespostaFiscal | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [exportando, setExportando] = React.useState(false);

  React.useEffect(() => {
    let ativo = true;
    buscarPagina(pagina, TAMANHO_DA_PAGINA, filtro.de, filtro.ate)
      .then((resultado) => {
        if (!ativo) return;
        setDados(resultado);
        setErro(null);
      })
      .catch((falha: unknown) => {
        if (!ativo) return;
        setErro(falha instanceof Error ? falha.message : 'Falha ao carregar.');
      });
    return () => {
      ativo = false;
    };
  }, [pagina, filtro]);

  function aplicarFiltro(evento: React.SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setDados(null);
    setPagina(0);
    setFiltro({ de, ate });
  }

  async function exportarCsv() {
    setExportando(true);
    try {
      const linhas: RegistroFiscal[] = [];
      for (let pag = 0; ; pag++) {
        const lote = await buscarPagina(pag, 100, filtro.de, filtro.ate);
        linhas.push(...lote.registros);
        if (linhas.length >= lote.total || lote.registros.length === 0) break;
      }
      const cabecalho = [
        'pago_em_utc',
        'fatura',
        'id_externo',
        'comprador',
        'email',
        'tipo_documento',
        'documento',
        'descricao',
        'plano',
        'ciclo',
        'moeda',
        'subtotal',
        'impostos',
        'total',
        'conta_ativa',
      ];
      const corpo = linhas.map((r) =>
        [
          r.paid_at,
          r.invoice_number,
          r.external_invoice_id,
          r.buyer_name,
          r.buyer_email,
          r.buyer_tax_id_type,
          r.buyer_tax_id,
          r.description,
          r.plan_key,
          r.billing_interval,
          r.currency_code,
          (r.amount_subtotal / 100).toFixed(2),
          (r.amount_tax / 100).toFixed(2),
          (r.amount_total / 100).toFixed(2),
          r.conta_ativa ? 'sim' : 'não',
        ]
          .map(celulaCsv)
          .join(';')
      );
      const arquivo = new Blob(
        ['﻿' + [cabecalho.join(';'), ...corpo].join('\n')],
        { type: 'text/csv;charset=utf-8' }
      );
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement('a');
      link.href = url;
      link.download = `registros-fiscais-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`${linhas.length} registros fiscais exportados.`);
    } catch (falha: unknown) {
      console.error('Falha ao exportar os registros fiscais:', falha);
      toast.error('Não foi possível exportar agora.');
    } finally {
      setExportando(false);
    }
  }

  const totalDePaginas = dados
    ? Math.max(1, Math.ceil(dados.total / TAMANHO_DA_PAGINA))
    : 1;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
            Guarda legal
          </CardTitle>
          <CardDescription>
            Uma linha por fatura paga, registrada pelo webhook da Stripe. Os
            registros não são alterados nem excluídos pela plataforma e
            permanecem depois da exclusão da conta, sem ligação com dados de
            saúde.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={aplicarFiltro}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="fiscal-de">Pago a partir de</Label>
              <Input
                id="fiscal-de"
                type="date"
                value={de}
                onChange={(e) => setDe(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscal-ate">Pago até</Label>
              <Input
                id="fiscal-ate"
                type="date"
                value={ate}
                onChange={(e) => setAte(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Filtrar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exportarCsv}
              disabled={exportando || !dados || dados.total === 0}
              className="sm:ml-auto"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {exportando ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {dados && dados.totaisPorMoeda.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dados.totaisPorMoeda.map((item) => (
            <Card key={item.moeda}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Total em {item.moeda} ({item.registros}{' '}
                  {item.registros === 1 ? 'fatura' : 'faturas'})
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                  {valor(item.total, item.moeda)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {erro ? (
            <p role="alert" className="p-6 text-sm text-destructive">
              {erro}
            </p>
          ) : !dados ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : dados.registros.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Nenhuma fatura paga no período.
            </p>
          ) : (
            <Table scrollLabel="Tabela de registros fiscais">
              <TableHeader>
                <TableRow>
                  <TableHead>Pago em</TableHead>
                  <TableHead>Fatura</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Impostos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Conta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell className="whitespace-nowrap">
                      {dataHoraBr(registro.paid_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {registro.invoice_number ?? registro.external_invoice_id}
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[10rem]">
                        <p className="font-medium">
                          {registro.buyer_name ?? 'Não informado'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {registro.buyer_email ?? ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {registro.buyer_tax_id
                        ? `${registro.buyer_tax_id_type?.replace('br_', '').toUpperCase() ?? ''} ${registro.buyer_tax_id}`
                        : 'Não informado'}
                    </TableCell>
                    <TableCell className="min-w-[10rem]">
                      {registro.description ?? registro.plan_key ?? ''}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {valor(registro.amount_tax, registro.currency_code)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                      {valor(registro.amount_total, registro.currency_code)}
                    </TableCell>
                    <TableCell>
                      {registro.conta_ativa ? (
                        <Badge variant="success">Ativa</Badge>
                      ) : (
                        <Badge variant="secondary">Excluída</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {dados && dados.total > TAMANHO_DA_PAGINA ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Página {pagina + 1} de {totalDePaginas} · {dados.total} registros
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPagina((atual) => Math.max(0, atual - 1))}
              disabled={pagina === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setPagina((atual) => Math.min(totalDePaginas - 1, atual + 1))
              }
              disabled={pagina >= totalDePaginas - 1}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
