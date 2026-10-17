'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  CalendarClock,
  CreditCard,
  Sunrise,
  TriangleAlert,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import { ouvirCoachAtualizado } from '@/lib/coach/evento-do-coach';
import { scalePx } from '@/lib/site-page-config/runtime';
import { cn } from '@/lib/utils';

interface Notificacao {
  id: string;
  titulo: string;
  detalhe: string;
  href: string;
  tipo: 'consulta' | 'assinatura' | 'coach_dia' | 'coach_alerta';
  /** Notificação do coach ainda não lida (consultas e avisos: sempre false). */
  nova: boolean;
}

interface NotificacaoDoServidor {
  id: string;
  tipo: 'coach_dia' | 'coach_alerta';
  titulo: string;
  corpo: string;
  link: string | null;
  criadaEm: string;
  lida: boolean;
}

interface RespostaDasNotificacoes {
  notificacoes: NotificacaoDoServidor[];
  naoLidas: number;
}

const SEM_NOTIFICACOES: RespostaDasNotificacoes = {
  notificacoes: [],
  naoLidas: 0,
};

async function lerNotificacoes(): Promise<RespostaDasNotificacoes> {
  const resposta = await fetch('/api/notificacoes', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return (await resposta.json()) as RespostaDasNotificacoes;
}

function avisarFalha(falha: unknown) {
  // O sino continua com as consultas e os avisos da assinatura.
  console.error('Falha ao carregar as notificações:', falha);
}

const ICONE_DO_TIPO = {
  consulta: CalendarClock,
  assinatura: CreditCard,
  coach_dia: Sunrise,
  coach_alerta: TriangleAlert,
} as const;

function quando(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
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
 * Central de notificações do cabeçalho, com dados reais da conta: as
 * notificações do coach diário gravadas no servidor ("Seu dia está pronto" e
 * alertas), consultas dos próximos dias e avisos da assinatura. Abrir o sino
 * marca as notificações do coach como lidas.
 */
export function NotificationsMenu({ iconScale }: { iconScale: number }) {
  const { db, session } = useAuth();
  const { data: assinatura } = useAccountSubscription();
  const [consultas, setConsultas] = React.useState<ConsultaProxima[]>([]);
  const userId = session?.user.id ?? null;
  const [versao, setVersao] = React.useState(0);
  const [lidasAoAbrir, setLidasAoAbrir] = React.useState(false);

  React.useEffect(
    () => ouvirCoachAtualizado(() => setVersao((v) => v + 1)),
    []
  );
  const { data: doServidor, refresh } = useKeyedResource(
    userId ? `notificacoes:${userId}:${versao}` : null,
    lerNotificacoes,
    avisarFalha,
    SEM_NOTIFICACOES
  );

  const aoAbrirOuFechar = (aberto: boolean) => {
    if (aberto && doServidor.naoLidas > 0) {
      setLidasAoAbrir(true);
      void fetch('/api/notificacoes', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todas: true }),
      }).catch(avisarFalha);
    }
    if (!aberto && lidasAoAbrir) {
      setLidasAoAbrir(false);
      void refresh();
    }
  };

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

  const notificacoes: Notificacao[] = doServidor.notificacoes.map((item) => ({
    id: item.id,
    tipo: item.tipo,
    titulo: item.titulo,
    detalhe: `${quando(item.criadaEm)} · ${item.corpo}`,
    href: item.link ?? '/dia',
    nova: !item.lida,
  }));
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
      nova: false,
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
      nova: false,
    });
  } else if (assinatura?.cancelAtPeriodEnd && assinatura.plan.key !== 'free') {
    notificacoes.push({
      id: 'assinatura-termina',
      tipo: 'assinatura',
      titulo: `Seu plano ${assinatura.plan.name} termina em ${data(assinatura.currentPeriodEnd)}`,
      detalhe:
        'A renovação foi cancelada. Você pode reativá-la no portal de cobrança.',
      href: '/profile',
      nova: false,
    });
  }

  // Consultas e avisos da assinatura valem enquanto existirem; as do coach
  // contam até serem lidas.
  const total =
    notificacoes.filter((n) => n.tipo === 'consulta' || n.tipo === 'assinatura')
      .length + (lidasAoAbrir ? 0 : doServidor.naoLidas);
  const tamanhoDoIcone = scalePx(18, iconScale);

  return (
    <Popover onOpenChange={aoAbrirOuFechar}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="relative"
          aria-label={
            // O número visível no selo abre o nome acessível (WCAG 2.5.3,
            // rótulo no nome).
            total > 0
              ? `${total} ${total === 1 ? 'notificação nova' : 'notificações novas'}`
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
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-micro font-semibold leading-none text-primary-foreground"
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
            Seu dia e alertas do coach, consultas dos próximos{' '}
            {DIAS_DE_ANTECEDENCIA} dias e avisos da assinatura.
          </p>
        </div>
        {notificacoes.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma notificação no momento.
          </p>
        ) : (
          <ul className="max-h-[60dvh] divide-y divide-border overflow-y-auto">
            {notificacoes.map((item) => {
              const Icone = ICONE_DO_TIPO[item.tipo];
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex min-h-11 items-start gap-3 px-4 py-3 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-hidden',
                      item.nova && 'bg-primary/5'
                    )}
                  >
                    <Icone
                      className={cn(
                        'mt-0.5 h-4 w-4 shrink-0',
                        item.tipo === 'coach_alerta'
                          ? 'text-warning'
                          : 'text-primary'
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {item.titulo}
                        {item.nova ? (
                          <span className="sr-only"> (nova)</span>
                        ) : null}
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
