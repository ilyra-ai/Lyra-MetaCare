'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Info, Orbit, Target, TriangleAlert } from 'lucide-react';

import { PageIntro } from '@/components/layout/PageIntro';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSemana } from '@/hooks/use-semana';
import {
  formatarSono,
  MINIMO_POR_GRUPO,
  praticaDoDia,
} from '@/lib/semana/analise';
import type { SemanaDaPessoa } from '@/lib/semana/servico';
import { cn } from '@/lib/utils';

import { dataCurta, GraficoDaSemana, rotuloDoDia } from './GraficoDaSemana';

/**
 * Página "Sua semana" (tarefa 44): retrospectiva dos últimos 7 dias com
 * prontidão, sono, prática, reflexões, metas e o céu de cada dia, e só as
 * percepções que os registros da pessoa sustentam.
 */

function variacao(valor: number | null, formatar: (v: number) => string) {
  if (valor === null || valor === 0) return null;
  return `${valor > 0 ? '+' : '−'}${formatar(Math.abs(valor))} vs. semana anterior`;
}

function Indicador({
  rotulo,
  valor,
  unidade,
  nota,
}: {
  rotulo: string;
  valor: string;
  unidade?: string;
  nota?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
        {valor}
        {unidade ? (
          <>
            {' '}
            <span className="text-sm font-normal text-muted-foreground">
              {unidade}
            </span>
          </>
        ) : null}
      </dd>
      {nota ? (
        <dd className="mt-0.5 text-xs text-muted-foreground">{nota}</dd>
      ) : null}
    </div>
  );
}

function Percepcoes({ semana }: { semana: SemanaDaPessoa }) {
  return (
    <section
      aria-labelledby="titulo-percepcoes"
      className="rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <h3
        id="titulo-percepcoes"
        className="font-display text-lg font-semibold text-foreground"
      >
        O que a semana mostra
      </h3>
      {semana.percepcoes.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-4">
          {semana.percepcoes.map((percepcao) => (
            <li key={percepcao.texto} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cosmic-light text-cosmic-strong"
              >
                ✦
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-relaxed text-foreground">
                  {percepcao.texto}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Base: {percepcao.base}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Ainda não há registros suficientes para comparar dias: cada comparação
          precisa de pelo menos {MINIMO_POR_GRUPO} dias de cada lado (por
          exemplo, dias de Tara favorável e dias sem, todos com prontidão).
          Registre o check-in e a reflexão da noite e a semana começa a falar.
        </p>
      )}
      <p className="mt-4 flex gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        São padrões de uma semana, não conclusões: servem para observar a sua
        rotina, não para diagnosticar.
      </p>
    </section>
  );
}

function Metas({ semana }: { semana: SemanaDaPessoa }) {
  return (
    <section
      aria-labelledby="titulo-metas-da-semana"
      className="rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <h3
        id="titulo-metas-da-semana"
        className="flex items-center gap-2 font-display text-lg font-semibold text-foreground"
      >
        <Target className="h-5 w-5 text-primary" aria-hidden="true" />
        Metas dia a dia
      </h3>
      {semana.metas.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-4">
          {semana.metas.map((meta) => {
            const fracao =
              meta.diasComRegistro === 0
                ? 0
                : meta.diasCumpridos / meta.diasComRegistro;
            return (
              <li key={meta.titulo}>
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-medium text-foreground">
                    {meta.titulo}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {meta.diasComRegistro === 0
                      ? 'sem registros'
                      : `${meta.diasCumpridos} de ${meta.diasComRegistro} ${meta.diasComRegistro === 1 ? 'dia' : 'dias'} com registro`}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`${meta.titulo}: cumprida em ${meta.diasCumpridos} de ${meta.diasComRegistro} dias com registro`}
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${fracao * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma meta automática ativa. Metas de sono, passos, água, meditação
          ou minutos ativos aparecem aqui dia a dia.
        </p>
      )}
      <Button asChild variant="outline" className="mt-5">
        <Link href="/goals">
          Planejar a próxima semana
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </section>
  );
}

function Reflexoes({ semana }: { semana: SemanaDaPessoa }) {
  const { mediasDaReflexao } = semana.resumo;
  const frases = semana.dias.filter((d) => d.reflexao?.frase);
  return (
    <section
      aria-labelledby="titulo-reflexoes"
      className="rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <h3
        id="titulo-reflexoes"
        className="font-display text-lg font-semibold text-foreground"
      >
        Reflexões da noite
      </h3>
      {mediasDaReflexao ? (
        <>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            {(
              [
                ['Emocional', mediasDaReflexao.emocional],
                ['Corpo', mediasDaReflexao.corpo],
                ['Espiritual', mediasDaReflexao.espiritual],
              ] as const
            ).map(([rotulo, valor]) => (
              <div key={rotulo} className="rounded-2xl bg-muted p-3">
                <dt className="text-xs text-muted-foreground">{rotulo}</dt>
                <dd className="font-display text-xl font-semibold tabular-nums text-foreground">
                  {valor.toFixed(1).replace('.', ',')}
                  <span className="text-xs font-normal text-muted-foreground">
                    {' '}
                    /5
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">
            Média de {semana.resumo.reflexoes}{' '}
            {semana.resumo.reflexoes === 1 ? 'reflexão' : 'reflexões'}.
          </p>
          {frases.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {frases.map((dia) => (
                <li
                  key={dia.data}
                  className="rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span className="text-xs text-muted-foreground">
                    {rotuloDoDia(dia)}
                  </span>
                  <p className="text-foreground">{dia.reflexao?.frase}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma reflexão nesta semana. Feche o dia no{' '}
          <Link
            href="/dia#reflexao"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Meu dia
          </Link>{' '}
          e as notas aparecem aqui.
        </p>
      )}
    </section>
  );
}

function CeuDaSemana({ semana }: { semana: SemanaDaPessoa }) {
  return (
    <section
      aria-labelledby="titulo-ceu-da-semana"
      className="rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <h3
        id="titulo-ceu-da-semana"
        className="flex items-center gap-2 font-display text-lg font-semibold text-foreground"
      >
        <Orbit className="h-5 w-5 text-cosmic" aria-hidden="true" />O céu da
        semana para você
      </h3>
      {semana.temMapa ? (
        <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
          {semana.dias.map((dia) => (
            <li
              key={dia.data}
              className={cn(
                'rounded-xl border px-3 py-2',
                dia.tara?.qualidade === 'favoravel'
                  ? 'border-success/30 bg-success-light'
                  : dia.tara?.qualidade === 'desfavoravel'
                    ? 'border-warning/30 bg-warning-light'
                    : 'border-border bg-muted'
              )}
            >
              <span className="block text-xs text-muted-foreground">
                {rotuloDoDia(dia)}
              </span>
              <span className="block text-sm font-medium text-foreground">
                {dia.tara?.qualidade === 'favoravel' ? '★ ' : ''}
                {dia.tara?.nome ?? '—'}
              </span>
              <span className="block text-xs text-muted-foreground">
                {dia.tara?.qualidade === 'favoravel'
                  ? 'Favorável'
                  : dia.tara?.qualidade === 'desfavoravel'
                    ? 'Cautela'
                    : 'Neutro'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          O Tara Bala de cada dia depende do seu mapa natal: informe a data e a
          cidade de nascimento e a cidade onde mora no{' '}
          <Link
            href="/profile"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            perfil
          </Link>
          .
        </p>
      )}
    </section>
  );
}

function TabelaDaSemana({ semana }: { semana: SemanaDaPessoa }) {
  return (
    <section
      aria-labelledby="titulo-tabela-da-semana"
      className="rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <h3
        id="titulo-tabela-da-semana"
        className="font-display text-lg font-semibold text-foreground"
      >
        Dia a dia
      </h3>
      {/* Rolável no celular: focável para quem navega pelo teclado. */}
      <div
        className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        role="region"
        aria-labelledby="titulo-tabela-da-semana"
        tabIndex={0}
      >
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Registros de cada dia da semana</caption>
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">
                Dia
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Prontidão
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Sono
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Prática
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Reflexão (E · C · S)
              </th>
              <th scope="col" className="py-2 font-medium">
                Tara
              </th>
            </tr>
          </thead>
          <tbody>
            {semana.dias.map((dia) => {
              const pratica = praticaDoDia(dia);
              return (
                <tr key={dia.data} className="border-b border-border/60">
                  <th
                    scope="row"
                    className="py-2 pr-3 font-medium text-foreground"
                  >
                    {rotuloDoDia(dia)}
                  </th>
                  <td className="py-2 pr-3 tabular-nums">
                    {dia.prontidao ?? '—'}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    {dia.sonoMinutos === null
                      ? '—'
                      : formatarSono(dia.sonoMinutos)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    {pratica > 0 ? `${pratica} min` : '—'}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    {dia.reflexao
                      ? `${dia.reflexao.emocional} · ${dia.reflexao.corpo} · ${dia.reflexao.espiritual}`
                      : '—'}
                  </td>
                  <td className="py-2">
                    {dia.tara
                      ? `${dia.tara.qualidade === 'favoravel' ? '★ ' : ''}${dia.tara.nome}`
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SuaSemana() {
  const { semana, carregando, erro } = useSemana();

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageIntro
        eyebrow="Retrospectiva"
        title="Sua semana"
        description={
          semana
            ? `De ${dataCurta(semana.inicio)} a ${dataCurta(semana.fim)}${semana.lugar ? ` · ${semana.lugar}` : ''}. Só o que os seus registros sustentam.`
            : 'Os últimos 7 dias: prontidão, sono, prática, reflexões, metas e o céu de cada dia.'
        }
      />

      {!semana && carregando ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-busy="true"
        >
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : !semana ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <TriangleAlert className="h-4 w-4 text-warning" aria-hidden="true" />
          {erro ?? 'Não foi possível montar a sua semana.'}
        </p>
      ) : (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Indicador
              rotulo="Prontidão média"
              valor={
                semana.resumo.prontidaoMedia === null
                  ? '—'
                  : String(semana.resumo.prontidaoMedia)
              }
              nota={variacao(
                semana.resumo.prontidaoVariacao,
                (v) => `${v} pts`
              )}
            />
            <Indicador
              rotulo="Sono médio"
              valor={
                semana.resumo.sonoMedioMinutos === null
                  ? '—'
                  : formatarSono(semana.resumo.sonoMedioMinutos)
              }
              nota={variacao(
                semana.resumo.sonoVariacaoMinutos,
                (v) => `${v} min`
              )}
            />
            <Indicador
              rotulo="Dias com registro"
              valor={String(semana.resumo.diasComRegistro)}
              unidade="de 7"
            />
            <Indicador
              rotulo="Respiração guiada"
              valor={String(semana.resumo.respiracaoMinutos)}
              unidade="min"
            />
          </dl>

          <section
            aria-labelledby="titulo-grafico-da-semana"
            className="rounded-3xl border border-border bg-card p-5 sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <h3
                id="titulo-grafico-da-semana"
                className="font-display text-lg font-semibold text-foreground"
              >
                Prontidão por dia
              </h3>
              {semana.temMapa ? (
                <p className="text-xs text-muted-foreground">
                  <span className="text-golden" aria-hidden="true">
                    ★
                  </span>{' '}
                  Tara favorável
                </p>
              ) : null}
            </div>
            <GraficoDaSemana dias={semana.dias} />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Percepcoes semana={semana} />
            <Metas semana={semana} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Reflexoes semana={semana} />
            <CeuDaSemana semana={semana} />
          </div>
          <TabelaDaSemana semana={semana} />
        </>
      )}
    </div>
  );
}
