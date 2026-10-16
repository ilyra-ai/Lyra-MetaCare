'use client';

import * as React from 'react';
import { ExternalLink, Receipt } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { paginaSaindo } from '@/lib/navegador/saida-da-pagina';

interface Compra {
  id: string;
  invoice_number: string | null;
  description: string | null;
  plan_key: string | null;
  billing_interval: string | null;
  currency_code: string;
  amount_total: number;
  amount_tax: number;
  paid_at: string;
  hosted_invoice_url: string | null;
}

// Valores chegam em centavos (unidade mínima da moeda, padrão da Stripe).
function valorFormatado(centavos: number, moeda: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda,
  }).format(centavos / 100);
}

function dataBr(valor: string) {
  const [ano, mes, dia] = valor.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Histórico de compras: só as faturas pagas da própria conta. */
export function PurchaseHistoryCard() {
  const [compras, setCompras] = React.useState<Compra[] | null>(null);
  const [erro, setErro] = React.useState(false);

  React.useEffect(() => {
    let ativo = true;
    fetch('/api/account/purchases', { credentials: 'include' })
      .then(async (resposta) => {
        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`);
        }
        const corpo = (await resposta.json()) as { compras: Compra[] };
        if (ativo) setCompras(corpo.compras);
      })
      .catch((falha: unknown) => {
        // Página saindo: o navegador cancelou a busca (não é falha).
        if (paginaSaindo()) return;
        console.error('Falha ao carregar o histórico de compras:', falha);
        if (ativo) setErro(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" aria-hidden="true" />
          Histórico de compras
        </CardTitle>
        <CardDescription>Faturas pagas da sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        {erro ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar o histórico agora.
          </p>
        ) : compras === null ? (
          <Skeleton className="h-16 w-full" />
        ) : compras.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma compra registrada. O plano gratuito não gera fatura.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {compras.map((compra) => (
              <li key={compra.id} className="flex flex-col gap-1 px-3 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">
                    {compra.description ?? 'Assinatura Lyra'}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {valorFormatado(compra.amount_total, compra.currency_code)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Pago em {dataBr(compra.paid_at)}</span>
                  {compra.invoice_number ? (
                    <span>Fatura {compra.invoice_number}</span>
                  ) : null}
                  {compra.hosted_invoice_url ? (
                    <a
                      href={compra.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-6 items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Ver fatura
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
