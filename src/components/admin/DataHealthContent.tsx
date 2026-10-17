'use client';

import * as React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Zap,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import { buscarJson } from '@/lib/http/transporte';

/**
 * Saúde dos dados (admin). Tudo é agregado no servidor
 * (`GET /api/admin/saude-dos-dados`, tarefa 58); a tela recebe só contagens,
 * médias e uma página de inativos. Falha de carga aparece como erro, nunca
 * como "0".
 */

interface MetricaDaSaude {
  metrica: string;
  preenchimento: number;
  media: number | null;
  minimo: number | null;
  maximo: number | null;
}

interface SaudeDosDados {
  totalDeRegistros: number;
  ativosHojeOuOntem: number;
  metricas: MetricaDaSaude[];
  inativos: {
    total: number;
    pagina: number;
    porPagina: number;
    itens: Array<{
      id: string;
      nome: string | null;
      email: string | null;
      ultimoRegistro: string | null;
    }>;
  };
}

type Carga =
  { ok: true; dados: SaudeDosDados } | { ok: false; mensagem: string };

const SEM_CONEXAO: Carga = {
  ok: false,
  mensagem: 'Não foi possível falar com o servidor. Verifique a conexão.',
};

const INTEIRO = new Intl.NumberFormat('pt-BR');
const DECIMAL = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function avisar(erro: unknown) {
  console.error('Falha ao carregar a saúde dos dados:', erro);
}

function varianteDoPreenchimento(
  taxa: number
): 'success' | 'warning' | 'destructive' {
  if (taxa > 80) return 'success';
  if (taxa > 50) return 'warning';
  return 'destructive';
}

function StatCard({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

export function DataHealthContent() {
  const { session } = useAuth();
  const [pagina, setPagina] = React.useState(1);
  const chave = session?.user
    ? `saude-dos-dados:${session.user.id}:${pagina}`
    : null;

  const carregar = React.useCallback(async (): Promise<Carga> => {
    const resposta = await buscarJson(
      `/api/admin/saude-dos-dados?pagina=${pagina}`
    );
    if (!resposta.ok) return { ok: false, mensagem: resposta.falha.message };
    return { ok: true, dados: resposta.corpo as SaudeDosDados };
  }, [pagina]);

  const { data, loading, refresh } = useKeyedResource(
    chave,
    carregar,
    avisar,
    SEM_CONEXAO
  );

  if (loading) {
    return (
      <div
        className="space-y-6"
        role="status"
        aria-label="Carregando a saúde dos dados"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data.ok) {
    return (
      <Alert variant="destructive">
        <AlertTriangle aria-hidden="true" className="size-4" />
        <div className="flex flex-col gap-3">
          <AlertTitle>Não foi possível carregar a saúde dos dados</AlertTitle>
          <AlertDescription>{data.mensagem}</AlertDescription>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => void refresh()}
          >
            <RefreshCw aria-hidden="true" />
            Tentar de novo
          </Button>
        </div>
      </Alert>
    );
  }

  const { dados } = data;
  const totalDePaginas = Math.max(
    1,
    Math.ceil(dados.inativos.total / dados.inativos.porPagina)
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Activity}
          title="Registros de métricas"
          value={INTEIRO.format(dados.totalDeRegistros)}
          description="Dias registrados por todas as pessoas."
        />
        <StatCard
          icon={Zap}
          title="Ativos hoje ou ontem"
          value={INTEIRO.format(dados.ativosHojeOuOntem)}
          description="Pessoas com registro hoje ou ontem (UTC)."
        />
        <StatCard
          icon={Clock}
          title="Inativos há 7 dias"
          value={INTEIRO.format(dados.inativos.total)}
          description="Pessoas sem registro na última semana."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* `min-w-0`: sem ele a tabela alarga o item da grade no celular. */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Análise de métricas</CardTitle>
            <CardDescription>
              Preenchimento e faixa de cada métrica, da menos preenchida para a
              mais preenchida.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table scrollLabel="Análise de métricas (rolável)">
              <TableHeader>
                <TableRow>
                  <TableHead>Métrica</TableHead>
                  <TableHead>Preenchimento</TableHead>
                  <TableHead>Média</TableHead>
                  <TableHead>Mín. / máx.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.metricas.map((m) => (
                  <TableRow key={m.metrica}>
                    <TableCell className="font-medium">{m.metrica}</TableCell>
                    <TableCell>
                      <Badge variant={varianteDoPreenchimento(m.preenchimento)}>
                        {DECIMAL.format(m.preenchimento)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {m.media === null ? '—' : DECIMAL.format(m.media)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {m.minimo === null || m.maximo === null
                        ? '—'
                        : `${DECIMAL.format(m.minimo)} / ${DECIMAL.format(m.maximo)}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Pessoas inativas</CardTitle>
            <CardDescription>
              Sem registro há mais de 7 dias, das mais recentes para as mais
              antigas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {dados.inativos.itens.length > 0 ? (
              <ul className="divide-y divide-border">
                {dados.inativos.itens.map((pessoa) => (
                  <li
                    key={pessoa.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {pessoa.nome || 'Sem nome no perfil'}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {pessoa.email}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pessoa.ultimoRegistro ? (
                        <>
                          Último registro{' '}
                          <time dateTime={pessoa.ultimoRegistro}>
                            {formatDistanceToNow(
                              parseISO(pessoa.ultimoRegistro),
                              { addSuffix: true, locale: ptBR }
                            )}
                          </time>
                        </>
                      ) : (
                        'Nenhum registro'
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-background p-8 text-center">
                <span
                  className="mb-4 flex size-12 items-center justify-center rounded-full bg-success-light text-success"
                  aria-hidden="true"
                >
                  <CheckCircle className="size-6" />
                </span>
                <p className="font-semibold text-foreground">Ninguém inativo</p>
                <p className="text-sm text-muted-foreground">
                  Todas as pessoas registraram algo nos últimos 7 dias.
                </p>
              </div>
            )}
            {totalDePaginas > 1 ? (
              <nav
                aria-label="Páginas de pessoas inativas"
                className="flex items-center justify-between gap-3"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft aria-hidden="true" />
                  Anterior
                </Button>
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Página {dados.inativos.pagina} de {totalDePaginas}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagina >= totalDePaginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
                  <ChevronRight aria-hidden="true" />
                </Button>
              </nav>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
