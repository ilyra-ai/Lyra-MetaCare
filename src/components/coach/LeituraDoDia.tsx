'use client';

import * as React from 'react';
import {
  BookOpenText,
  CircleCheck,
  Cpu,
  Flower2,
  HeartHandshake,
  PersonStanding,
  ScrollText,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BriefingDoDia, LeituraDoPeriodo } from '@/lib/coach/tipos';
import { cn } from '@/lib/utils';

import { DicaComPorque, periodoAtual, QUALIDADE } from './partes';

const TOPICOS = [
  {
    chave: 'emocional',
    rotulo: 'Parte emocional',
    icone: HeartHandshake,
    tinta: 'bg-cosmic-light text-cosmic',
    borda: 'before:bg-cosmic',
  },
  {
    chave: 'fisico',
    rotulo: 'Parte física (corpo)',
    icone: PersonStanding,
    tinta: 'bg-success-light text-success',
    borda: 'before:bg-success',
  },
  {
    chave: 'espiritual',
    rotulo: 'Parte espiritual',
    icone: Flower2,
    tinta: 'bg-golden-light text-golden',
    borda: 'before:bg-golden',
  },
] as const satisfies ReadonlyArray<{
  chave: keyof Omit<LeituraDoPeriodo, 'chave'>;
  rotulo: string;
  icone: React.ComponentType<{ className?: string }>;
  tinta: string;
  borda: string;
}>;

function SeloDoAutor({ briefing }: { briefing: BriefingDoDia }) {
  const autor = briefing.leitura.autor;
  if (autor.tipo === 'lyra') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
        <Sparkles className="h-3.5 w-3.5 text-cosmic" aria-hidden="true" />
        Motor védico da Lyra
      </span>
    );
  }
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
      <Cpu className="h-3.5 w-3.5 shrink-0 text-cosmic" aria-hidden="true" />
      <span className="truncate">
        Escrito por {autor.provedor} · {autor.modelo}
      </span>
      {autor.local ? (
        <span className="shrink-0 rounded-full bg-success-light px-1.5 py-px text-micro font-semibold text-foreground">
          local
        </span>
      ) : null}
    </span>
  );
}

/**
 * Leitura védica do dia (tarefa 43), na ordem pedida: resumo geral, cada
 * período com as partes emocional, física e espiritual, pontos positivos e
 * negativos e as dicas que o mapa traz para a data.
 */
export function LeituraDoDia({
  briefing,
  agora,
}: {
  briefing: BriefingDoDia;
  agora: number;
}) {
  const { leitura } = briefing;
  const [escolhido, setEscolhido] = React.useState<string | null>(null);
  const atual = agora ? periodoAtual(briefing, agora) : null;
  const periodos = briefing.periodos.filter((p) =>
    leitura.periodos.some((l) => l.chave === p.chave)
  );
  const aba =
    escolhido ??
    atual?.chave ??
    periodos.find((p) => p.chave === 'manha')?.chave ??
    periodos[0]?.chave;

  return (
    <section
      aria-labelledby="titulo-leitura"
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] h-64 w-[70%] rounded-full bg-linear-to-br from-cosmic/15 via-golden/10 to-transparent blur-3xl"
      />
      <div className="relative flex flex-col gap-7">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Seu mapa védico hoje
            </p>
            <h3
              id="titulo-leitura"
              className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground"
            >
              <ScrollText
                className="h-6 w-6 shrink-0 text-cosmic"
                aria-hidden="true"
              />
              Leitura do dia
            </h3>
          </div>
          <SeloDoAutor briefing={briefing} />
        </header>

        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Resumo geral do dia
          </h4>
          <p className="mt-2 max-w-3xl font-display text-lg leading-relaxed text-foreground sm:text-xl">
            {leitura.resumoGeral}
          </p>
        </div>

        {aba ? (
          <div className="flex flex-col gap-3">
            <h4
              id="titulo-leitura-periodos"
              className="text-sm font-semibold text-foreground"
            >
              Como será o seu dia, período a período
            </h4>
            <Tabs value={aba} onValueChange={setEscolhido}>
              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <TabsList
                  className="w-max"
                  aria-labelledby="titulo-leitura-periodos"
                >
                  {periodos.map((p) => (
                    <TabsTrigger
                      key={p.chave}
                      value={p.chave}
                      className="gap-2"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'h-2 w-2 rounded-full',
                          QUALIDADE[p.qualidade].ponto
                        )}
                      />
                      {p.nome}
                      {atual?.chave === p.chave ? (
                        <span className="rounded-full bg-primary px-1.5 py-px text-micro font-semibold text-primary-foreground">
                          agora
                        </span>
                      ) : null}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {periodos.map((p) => {
                const texto = leitura.periodos.find((l) => l.chave === p.chave);
                if (!texto) return null;
                return (
                  <TabsContent key={p.chave} value={p.chave} className="mt-4">
                    <p className="mb-3 text-xs text-muted-foreground">
                      {p.nome} · {p.horario} · {QUALIDADE[p.qualidade].rotulo}
                    </p>
                    <div className="grid gap-3 md:grid-cols-3">
                      {TOPICOS.map(
                        ({ chave, rotulo, icone: Icone, tinta, borda }) => (
                          <article
                            key={chave}
                            className={cn(
                              'relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-background/70 p-4 before:absolute before:inset-x-0 before:top-0 before:h-1 before:content-[""]',
                              borda
                            )}
                          >
                            <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <span
                                aria-hidden="true"
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-full',
                                  tinta
                                )}
                              >
                                <Icone className="h-4 w-4" />
                              </span>
                              {rotulo}
                            </h5>
                            <p className="text-sm leading-relaxed text-foreground">
                              {texto[chave]}
                            </p>
                          </article>
                        )
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-success/30 bg-success-light/50 p-4 sm:p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CircleCheck
                className="h-5 w-5 text-success"
                aria-hidden="true"
              />
              Pontos positivos
            </h4>
            <ul className="mt-3 flex flex-col gap-2.5">
              {leitura.pontosPositivos.map((ponto) => (
                <li
                  key={ponto}
                  className="flex gap-2 text-sm leading-relaxed text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                  />
                  {ponto}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-warning/40 bg-warning-light/50 p-4 sm:p-5">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TriangleAlert
                className="h-5 w-5 text-warning"
                aria-hidden="true"
              />
              Pontos negativos
            </h4>
            <ul className="mt-3 flex flex-col gap-2.5">
              {leitura.pontosNegativos.map((ponto) => (
                <li
                  key={ponto}
                  className="flex gap-2 text-sm leading-relaxed text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
                  />
                  {ponto}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpenText className="h-5 w-5 text-golden" aria-hidden="true" />
            Dicas do seu mapa védico para hoje
          </h4>
          <ol className="mt-4 grid gap-5 md:grid-cols-2">
            {leitura.dicas.map((dica, indice) => (
              <DicaComPorque
                key={dica.texto}
                dica={dica}
                icone={
                  <span className="text-xs font-semibold tabular-nums">
                    {indice + 1}
                  </span>
                }
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
