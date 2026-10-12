'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, CalendarClock, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { scalePx } from '@/lib/site-page-config/runtime';

interface Notificacao {
  id: string;
  titulo: string;
  detalhe: string;
  href: string;
  tipo: 'consulta' | 'assinatura';
}

interface ConsultaProxima {
  id: string;
  appointment_time: string;
  professionals: { name: string; specialty: string } | null;
}

const DIAS_DE_ANTECEDENCIA = 7;

function dataHora(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(valor));
}

function data(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(valor));
}

/**
 * Central de notificações do cabeçalho, com dados reais da conta: consultas
 * dos próximos dias e avisos da assinatura. Antes o sino não tinha nenhuma
 * ação.
 */
export function NotificationsMenu({ iconScale }: { iconScale: number }) {
  const { db, session } = useAuth();
  const { data: assinatura } = useAccountSubscription();
  const [consultas, setConsultas] = React.useState<ConsultaProxima[]>([]);
  const userId = session?.user.id ?? null;

  React.useEffect(() => {
    if (!userId) return;
    let ativo = true;
    const agora = new Date();
    const limite = new Date(
      agora.getTime() + DIAS_DE_ANTECEDENCIA * 24 * 60 * 60 * 1000
    );
    db.from<ConsultaProxima[]>('appointments')
      .select('id, appointment_time, professionals(name, specialty)')
      .eq('user_id', userId)
      .gte('appointment_time', agora.toISOString())
      .lte('appointment_time', limite.toISOString())
      .order('appointment_time', { ascending: true })
      .then(({ data: linhas, error }) => {
        if (!ativo) return;
        // Sem a agenda no plano (403) ou em falha, o sino só mostra os demais
        // avisos.
        if (error) {
          setConsultas([]);
          return;
        }
        setConsultas(linhas ?? []);
      });
    return () => {
      ativo = false;
    };
  }, [db, userId]);

  const notificacoes: Notificacao[] = [];
  for (const consulta of consultas) {
    notificacoes.push({
      id: `consulta-${consulta.id}`,
      tipo: 'consulta',
      titulo: consulta.professionals
        ? `Consulta com ${consulta.professionals.name}`
        : 'Consulta agendada',
      detalhe: `${dataHora(consulta.appointment_time)}${
        consulta.professionals?.specialty
          ? ` · ${consulta.professionals.specialty}`
          : ''
      }`,
      href: '/appointments',
    });
  }
  if (assinatura?.status === 'past_due') {
    notificacoes.push({
      id: 'assinatura-pendente',
      tipo: 'assinatura',
      titulo: 'Pagamento da assinatura pendente',
      detalhe:
        'Atualize a forma de pagamento para manter os recursos do plano.',
      href: '/profile',
    });
  } else if (assinatura?.cancelAtPeriodEnd && assinatura.plan.key !== 'free') {
    notificacoes.push({
      id: 'assinatura-termina',
      tipo: 'assinatura',
      titulo: `Seu plano ${assinatura.plan.name} termina em ${data(assinatura.currentPeriodEnd)}`,
      detalhe:
        'A renovação foi cancelada. Você pode reativá-la no portal de cobrança.',
      href: '/profile',
    });
  }

  const total = notificacoes.length;
  const tamanhoDoIcone = scalePx(18, iconScale);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="relative"
          aria-label={
            total > 0
              ? `Notificações (${total} ${total === 1 ? 'nova' : 'novas'})`
              : 'Notificações'
          }
        >
          <Bell
            className="text-foreground"
            strokeWidth={1.9}
            aria-hidden="true"
            style={{ height: tamanhoDoIcone, width: tamanhoDoIcone }}
          />
          {total > 0 ? (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] font-semibold leading-none text-primary-foreground"
            >
              {total}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        // O conteúdo do popover tem papel de diálogo: o título dá o nome.
        aria-labelledby="titulo-das-notificacoes"
        className="w-[min(22rem,calc(100vw-2rem))] p-0"
      >
        <div className="border-b border-border px-4 py-3">
          <p
            id="titulo-das-notificacoes"
            className="text-sm font-semibold text-foreground"
          >
            Notificações
          </p>
          <p className="text-xs text-muted-foreground">
            Consultas dos próximos {DIAS_DE_ANTECEDENCIA} dias e avisos da
            assinatura.
          </p>
        </div>
        {total === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma notificação no momento.
          </p>
        ) : (
          <ul className="max-h-[60dvh] divide-y divide-border overflow-y-auto">
            {notificacoes.map((item) => {
              const Icone =
                item.tipo === 'consulta' ? CalendarClock : CreditCard;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-start gap-3 px-4 py-3 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-hidden"
                  >
                    <Icone
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {item.titulo}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.detalhe}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
