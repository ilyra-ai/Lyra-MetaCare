'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Apple,
  ArrowRight,
  BedDouble,
  Brain,
  CalendarClock,
  Dumbbell,
  HeartPulse,
  Moon,
  Orbit,
  ShieldAlert,
  Sparkles,
  Sunrise,
  TriangleAlert,
} from 'lucide-react';

import { BotaoRegistroDoDia } from '@/components/metricas/RegistroDoDia';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCoachDoDia } from '@/hooks/use-coach-do-dia';
import type { BriefingDoDia, Dica } from '@/lib/coach/tipos';
import { cn } from '@/lib/utils';

import {
  AnelDeProntidao,
  CartaoDoPeriodo,
  DicaComPorque,
  dataPorExtenso,
  horaDoBriefing,
  QUALIDADE,
  RelogioDoDia,
  saudacao,
  TOM,
} from './partes';
import { LeituraDoDia } from './LeituraDoDia';
import { ReflexaoDaNoite } from './ReflexaoDaNoite';
import { EstadoSemDia, MolduraDoDia } from './SeuDiaCard';

const SECOES = [
  { chave: 'saude', rotulo: 'Saúde', icone: HeartPulse },
  { chave: 'alimentacao', rotulo: 'Alimentação', icone: Apple },
  { chave: 'movimento', rotulo: 'Movimento', icone: Dumbbell },
  { chave: 'mente', rotulo: 'Mente', icone: Brain },
  { chave: 'sono', rotulo: 'Sono', icone: BedDouble },
] as const;

function ListaDeDicas({
  dicas,
  icone,
}: {
  dicas: Dica[];
  icone?: React.ReactNode;
}) {
  return (
    <ul className="flex flex-col gap-5">
      {dicas.map((dica) => (
        <DicaComPorque key={dica.texto} dica={dica} icone={icone} />
      ))}
    </ul>
  );
}

function CeuDeHoje({ briefing }: { briefing: BriefingDoDia }) {
  const { ceu, dosha, ciclo } = briefing;
  const itens: Array<{ termo: string; valor: string; detalhe?: string }> = [
    { termo: 'Dia da semana', valor: ceu.vara },
    { termo: 'Tithi', valor: ceu.tithi, detalhe: ceu.paksha },
    {
      termo: 'Nakshatra',
      valor: ceu.nakshatra,
      detalhe: `${ceu.naturezaDoNakshatra} · ${ceu.divindade}`,
    },
    { termo: 'Lua em', valor: ceu.signoDaLua },
    { termo: 'Yoga', valor: ceu.yoga },
    { termo: 'Karana', valor: ceu.karana },
    {
      termo: 'Nascer e pôr do sol',
      valor: `${ceu.nascerDoSol} · ${ceu.porDoSol}`,
    },
  ];
  if (ceu.tara) {
    itens.push({
      termo: 'Tara Bala (para você)',
      valor: `${ceu.tara.nome} · ${QUALIDADE[ceu.tara.qualidade].rotulo}`,
      detalhe: ceu.tara.sentido,
    });
  }
  if (ceu.dasha) itens.push({ termo: 'Dasha vigente', valor: ceu.dasha });
  if (ciclo) {
    itens.push({
      termo: 'Ciclo',
      valor: ciclo.fase,
      detalhe: ciclo.dia ? `Dia ${ciclo.dia} do ciclo` : undefined,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,20rem)]">
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {itens.map((item) => (
          <div key={item.termo} className="min-w-0 border-b border-border pb-3">
            <dt className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {item.termo}
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {item.valor}
            </dd>
            {item.detalhe ? (
              <dd className="text-xs text-muted-foreground">{item.detalhe}</dd>
            ) : null}
          </div>
        ))}
      </dl>
      <div className="rounded-2xl border border-border bg-background/60 p-5">
        <h4 className="text-sm font-semibold text-foreground">
          Dosha do dia: {dosha.nome}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {dosha.base === 'metricas'
            ? 'Calculado com os seus sinais de hoje e a Lua do dia.'
            : 'Sem sinais suficientes hoje: pesa a Lua do dia. Faça o check-in para personalizar.'}
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {(['vata', 'pitta', 'kapha'] as const).map((d) => (
            <li key={d}>
              <div className="flex justify-between text-xs">
                <span
                  className={cn(
                    'capitalize',
                    d === dosha.dominante
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {d}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {dosha.percentuais[d]}%
                </span>
              </div>
              <div
                className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${d}: ${dosha.percentuais[d]}%`}
              >
                <div
                  className={cn(
                    'h-full rounded-full',
                    d === dosha.dominante
                      ? 'bg-primary'
                      : 'bg-muted-foreground/40'
                  )}
                  style={{ width: `${dosha.percentuais[d]}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Página "Meu dia" (tarefa 42): o briefing completo do coach, com o relógio
 * radial das 24 h, os quatro períodos, as recomendações por área, o céu do
 * dia e a avaliação "isso te ajudou?".
 */
export function MeuDia() {
  const { estado, carregando, agora } = useCoachDoDia();
  const idDoTitulo = 'titulo-meu-dia';

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
  const semCheckin = briefing.prontidao.valor === null;

  return (
    <div className="flex flex-col gap-8 pb-16">
      <MolduraDoDia tom={briefing.tom} rotulo={idDoTitulo}>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,18rem)]">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Sunrise className="h-4 w-4 text-golden" aria-hidden="true" />
              <span className="first-letter:uppercase">
                {dataPorExtenso(briefing.data)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{briefing.local.rotulo}</span>
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
              className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-foreground sm:text-4xl"
            >
              {briefing.manchete}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {briefing.resumo}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-5">
              <AnelDeProntidao
                valor={briefing.prontidao.valor}
                rotulo={briefing.prontidao.rotulo}
                tamanho={96}
              />
              <div className="flex min-w-0 flex-[1_1_14rem] flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {briefing.prontidao.rotulo}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {semCheckin
                    ? 'Registre sono, energia, humor e estresse: o coach recalcula o dia na hora.'
                    : `Com base em: ${briefing.prontidao.base.join(' · ')}.`}
                </p>
                <BotaoRegistroDoDia
                  variant={semCheckin ? 'default' : 'outline'}
                  className="self-start"
                />
              </div>
            </div>
          </div>
          <RelogioDoDia briefing={briefing} agora={agora} />
        </div>
      </MolduraDoDia>

      {briefing.alertas.length > 0 ? (
        <section
          aria-labelledby="titulo-alertas"
          className="rounded-3xl border border-warning/40 bg-warning-light/70 p-5 sm:p-6"
        >
          <h3
            id="titulo-alertas"
            className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground"
          >
            <ShieldAlert className="h-5 w-5 text-warning" aria-hidden="true" />
            Atenção hoje
          </h3>
          <ListaDeDicas dicas={briefing.alertas} />
        </section>
      ) : null}

      <LeituraDoDia briefing={briefing} agora={agora} />

      <section
        aria-labelledby="titulo-periodos"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3
            id="titulo-periodos"
            className="font-display text-xl font-semibold text-foreground"
          >
            Horários do dia por período
          </h3>
          <p className="text-xs text-muted-foreground">
            Horários de {briefing.local.rotulo.split(',')[0]}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {briefing.periodos.map((periodo) => (
            <CartaoDoPeriodo
              key={periodo.chave}
              periodo={periodo}
              agora={agora}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="titulo-focos"
          className="rounded-3xl border border-border bg-card p-5 sm:p-6"
        >
          <h3
            id="titulo-focos"
            className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground"
          >
            <Sparkles className="h-5 w-5 text-success" aria-hidden="true" />
            Focos práticos do dia
          </h3>
          <ListaDeDicas
            dicas={briefing.focos}
            icone={<CalendarClock className="h-4 w-4" />}
          />
        </section>
        <section
          aria-labelledby="titulo-cuidados"
          className="rounded-3xl border border-border bg-card p-5 sm:p-6"
        >
          <h3
            id="titulo-cuidados"
            className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground"
          >
            <TriangleAlert
              className="h-5 w-5 text-warning"
              aria-hidden="true"
            />
            Cuidados práticos
          </h3>
          <ListaDeDicas
            dicas={briefing.cuidados}
            icone={<Moon className="h-4 w-4" />}
          />
        </section>
      </div>

      <section
        aria-labelledby="titulo-coach"
        className="rounded-3xl border border-border bg-card p-5 sm:p-6"
      >
        <h3
          id="titulo-coach"
          className="mb-4 font-display text-xl font-semibold text-foreground"
        >
          O seu coach para hoje
        </h3>
        <Tabs defaultValue="saude">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <TabsList className="w-max">
              {SECOES.map(({ chave, rotulo, icone: Icone }) => (
                <TabsTrigger key={chave} value={chave} className="gap-1.5">
                  <Icone className="h-4 w-4" aria-hidden="true" />
                  {rotulo}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {SECOES.map(({ chave, icone: Icone }) => (
            <TabsContent key={chave} value={chave} className="mt-5">
              <ListaDeDicas
                dicas={briefing.recomendacoes[chave]}
                icone={<Icone className="h-4 w-4" />}
              />
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <section
        aria-labelledby="titulo-ceu"
        className="rounded-3xl border border-border bg-card p-5 sm:p-6"
      >
        <h3
          id="titulo-ceu"
          className="mb-5 flex items-center gap-2 font-display text-xl font-semibold text-foreground"
        >
          <Orbit className="h-5 w-5 text-cosmic" aria-hidden="true" />O céu de
          hoje
        </h3>
        <CeuDeHoje briefing={briefing} />
      </section>

      {briefing.completar.length > 0 ? (
        <section
          aria-labelledby="titulo-completar"
          className="rounded-3xl border border-dashed border-border p-5 sm:p-6"
        >
          <h3
            id="titulo-completar"
            className="mb-3 font-display text-lg font-semibold text-foreground"
          >
            Para um coach ainda mais preciso
          </h3>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
            {briefing.completar.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button asChild variant="link" className="mt-2 px-0">
            <Link href="/profile">
              Abrir o perfil
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </section>
      ) : null}

      <ReflexaoDaNoite
        dataDoBriefing={briefing.data}
        feedbackInicial={estado.feedback}
      />

      <footer className="flex flex-col gap-4 border-t border-border pt-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Preparado às {horaDoBriefing(briefing.geradoEm, briefing.local.fuso)}{' '}
          pelo motor do coach Lyra com o Panchang de {briefing.local.rotulo}, o
          seu mapa védico e os sinais que você registrou
          {briefing.leitura.autor.tipo === 'ia'
            ? `; a leitura do dia foi escrita por ${briefing.leitura.autor.provedor} (${briefing.leitura.autor.modelo}) só com os dados astrológicos, e os horários são calculados pela Lyra`
            : ''}
          . São orientações de bem-estar e autoconhecimento: não substituem
          avaliação profissional de saúde.
        </p>
      </footer>
    </div>
  );
}
