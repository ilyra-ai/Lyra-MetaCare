'use client';

import Link from 'next/link';
import { ArrowRight, CalendarRange } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSemana } from '@/hooks/use-semana';

import { dataCurta, GraficoDaSemana } from './GraficoDaSemana';

/** "Sua semana" em miniatura no "Meu dia" (tarefa 44). */
export function CartaoDaSemana() {
  const { semana, carregando, erro } = useSemana();
  const percepcao = semana?.percepcoes[0] ?? null;

  return (
    <section
      aria-labelledby="titulo-cartao-semana"
      className="flex h-full flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          Retrospectiva
        </p>
        <h3
          id="titulo-cartao-semana"
          className="mt-1 font-display text-lg font-semibold text-foreground"
        >
          Sua semana
          {semana ? (
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              {dataCurta(semana.inicio)} a {dataCurta(semana.fim)}
            </span>
          ) : null}
        </h3>
      </div>
      {!semana && carregando ? (
        <Skeleton className="h-28" />
      ) : semana ? (
        <>
          <GraficoDaSemana dias={semana.dias} compacto />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {percepcao
              ? percepcao.texto
              : semana.leitura.proxima.resumo
                ? semana.leitura.proxima.resumo
                : semana.resumo.diasComRegistro === 0
                  ? 'Sem registros nesta semana ainda: o check-in e a reflexão da noite alimentam a retrospectiva.'
                  : `${semana.resumo.diasComRegistro} de 7 dias com registro. A retrospectiva mostra só o que os seus registros sustentam.`}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{erro}</p>
      )}
      <Button asChild variant="outline" className="mt-auto self-start">
        <Link href="/semana">
          Ver a semana
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </section>
  );
}
