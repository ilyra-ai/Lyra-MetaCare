'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  Dumbbell,
  MapPin,
  Sparkles,
  Sunrise,
  TriangleAlert,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCoachDoDia,
  type EstadoDoCoachNaTela,
} from '@/hooks/use-coach-do-dia';
import { cn } from '@/lib/utils';

import {
  AnelDeProntidao,
  DicaComPorque,
  FaixaDoDia,
  dataPorExtenso,
  horaDoBriefing,
  periodoAtual,
  QUALIDADE,
  saudacao,
  TOM,
} from './partes';

const ICONES_DOS_FOCOS = [
  <CalendarClock key="janela" className="h-4 w-4" />,
  <Dumbbell key="movimento" className="h-4 w-4" />,
  <Sparkles key="intencao" className="h-4 w-4" />,
];

/** Moldura de vidro com a aura do tom do dia. */
export function MolduraDoDia({
  tom,
  children,
  className,
  rotulo,
}: {
  tom: keyof typeof TOM | null;
  children: ReactNode;
  className?: string;
  rotulo: string;
}) {
  return (
    <section
      aria-labelledby={rotulo}
      className={cn(
        // Superfície chapada com borda de 1px, como todos os cartões (tarefa
        // 59): sem vidro fosco, sombra nem aura pulsando sem parar.
        'relative isolate overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7',
        className
      )}
    >
      {/* Um único brilho estático e suave, no tom do dia. */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-linear-to-br to-transparent opacity-70 blur-3xl',
          tom ? TOM[tom].aura : 'from-cosmic/20 via-primary/10'
        )}
      />
      {children}
    </section>
  );
}

/** Estados sem briefing (carregando, sem cidade, polar, erro). */
export function EstadoSemDia({
  estado,
  carregando,
  idDoTitulo,
}: {
  estado: EstadoDoCoachNaTela | null;
  carregando: boolean;
  idDoTitulo: string;
}) {
  if (!estado || (carregando && estado.estado !== 'pronto')) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <h2 id={idDoTitulo} className="sr-only">
          Preparando o seu dia
        </h2>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }
  if (estado.estado === 'sem_local') {
    return (
      <div className="flex flex-col items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cosmic-light text-cosmic">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2
          id={idDoTitulo}
          className="font-display text-xl font-semibold text-foreground"
        >
          Seu coach diário está quase pronto
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Para dizer como será o seu dia, período a período, o coach precisa da
          cidade onde você mora ou nasceu (o nascer do sol e os horários bons e
          de cautela dependem dela) e, para ler o seu mapa védico, da data e da
          hora de nascimento.
        </p>
        <Button asChild>
          <Link href="/profile">
            Completar no perfil
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }
  if (estado.estado === 'sem_nascer_do_sol') {
    return (
      <div className="flex flex-col gap-2">
        <h2
          id={idDoTitulo}
          className="font-display text-xl font-semibold text-foreground"
        >
          Sem nascer ou pôr do sol hoje
        </h2>
        <p className="max-w-xl text-sm text-muted-foreground">
          Na sua cidade é dia ou noite polar: os períodos védicos dependem do
          nascer e do pôr do sol e não se aplicam até o Sol voltar a nascer.
        </p>
      </div>
    );
  }
  if (estado.estado === 'erro') {
    return (
      <div className="flex flex-col items-start gap-2" role="alert">
        <h2
          id={idDoTitulo}
          className="flex items-center gap-2 font-display text-xl font-semibold text-foreground"
        >
          <TriangleAlert className="h-5 w-5 text-warning" aria-hidden="true" />
          Não foi possível preparar o seu dia
        </h2>
        <p className="text-sm text-muted-foreground">{estado.mensagem}</p>
      </div>
    );
  }
  return null;
}

/**
 * "Seu dia" no topo do painel (tarefa 42): manchete, prontidão, a faixa das
 * 24 h com o "Agora" ao vivo, o período atual e os três focos do dia, cada um
 * com o "Por quê?".
 */
export function SeuDiaCard() {
  const { estado, carregando, agora } = useCoachDoDia();
  const idDoTitulo = 'titulo-seu-dia';

  if (!estado || estado.estado !== 'pronto') {
    return (
      <MolduraDoDia tom={null} rotulo={idDoTitulo}>
        <EstadoSemDia
          estado={estado}
          carregando={carregando}
          idDoTitulo={idDoTitulo}
        />
      </MolduraDoDia>
    );
  }

  const { briefing } = estado;
  const atual = periodoAtual(briefing, agora);
  const leituraAtual = atual
    ? (briefing.leitura.periodos.find((p) => p.chave === atual.chave) ?? null)
    : null;
  const cuidado = briefing.alertas[0] ?? briefing.cuidados[0] ?? null;

  return (
    <MolduraDoDia tom={briefing.tom} rotulo={idDoTitulo}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 flex-[1_1_22rem] flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Sunrise className="h-4 w-4 text-golden" aria-hidden="true" />
              <span className="font-medium text-foreground">Seu dia</span>
              <span aria-hidden="true">·</span>
              <span className="first-letter:uppercase">
                {dataPorExtenso(briefing.data)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{briefing.local.rotulo.split(',')[0]}</span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 font-medium',
                  TOM[briefing.tom].selo
                )}
              >
                {TOM[briefing.tom].rotulo}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {saudacao(
                agora || Date.parse(briefing.geradoEm),
                briefing.local.fuso,
                briefing.nome
              )}
            </p>
            <h2
              id={idDoTitulo}
              className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-[1.75rem]"
            >
              {briefing.manchete}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {briefing.leitura.resumoGeral}
            </p>
          </div>
          <AnelDeProntidao
            valor={briefing.prontidao.valor}
            rotulo={briefing.prontidao.rotulo}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/60 p-4">
          <FaixaDoDia briefing={briefing} agora={agora} />
          {atual ? (
            <p className="text-sm leading-relaxed text-foreground">
              <span className="mr-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 text-micro font-semibold text-primary-foreground">
                Agora · {atual.nome}
              </span>
              <span className="sr-only">
                ({QUALIDADE[atual.qualidade].rotulo}, {atual.horario}).
              </span>
              {atual.sugestao}
            </p>
          ) : null}
          {leituraAtual ? (
            <dl className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  ['Emocional', leituraAtual.emocional],
                  ['Corpo', leituraAtual.fisico],
                  ['Espiritual', leituraAtual.espiritual],
                ] as const
              ).map(([rotulo, texto]) => (
                <div
                  key={rotulo}
                  className="min-w-0 rounded-xl border border-border bg-card/80 px-3 py-2"
                >
                  <dt className="text-micro font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {rotulo}
                  </dt>
                  <dd className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-foreground">
                    {texto}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,20rem)]">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Três focos para hoje
            </h3>
            <ul className="flex flex-col gap-4">
              {briefing.focos.map((foco, i) => (
                <DicaComPorque
                  key={foco.texto}
                  dica={foco}
                  icone={ICONES_DOS_FOCOS[i]}
                />
              ))}
            </ul>
          </div>
          {cuidado ? (
            <div className="rounded-2xl border border-warning/30 bg-warning-light/60 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <TriangleAlert
                  className="h-4 w-4 text-warning"
                  aria-hidden="true"
                />
                {briefing.alertas.length > 0
                  ? 'Atenção hoje'
                  : 'Cuidado do dia'}
              </h3>
              <ul>
                <DicaComPorque dica={cuidado} />
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Preparado às{' '}
            {horaDoBriefing(briefing.geradoEm, briefing.local.fuso)} com o seu
            mapa védico e os seus sinais
            {briefing.leitura.autor.tipo === 'ia'
              ? ` · leitura por ${briefing.leitura.autor.provedor}`
              : ''}{' '}
            · atualiza com o check-in.
          </p>
          <Button asChild variant="secondary">
            <Link href="/dia">
              Ver o meu dia completo
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </MolduraDoDia>
  );
}
