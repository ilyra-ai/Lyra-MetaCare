'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarRange,
  Info,
  MoonStar,
  Orbit,
  ScrollText,
  Sparkles,
  Target,
  TriangleAlert,
} from 'lucide-react';

import { PageIntro } from '@/components/layout/PageIntro';
import { BotaoRegistroDoDia } from '@/components/metricas/RegistroDoDia';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSemana } from '@/hooks/use-semana';
import {
  formatarSono,
  MINIMO_POR_GRUPO,
  praticaDoDia,
} from '@/lib/semana/analise';
import type { CeuDoDia } from '@/lib/semana/leitura';
import type { SemanaDaPessoa } from '@/lib/semana/servico';
import { cn } from '@/lib/utils';

import { dataCurta, GraficoDaSemana, rotuloDoDia } from './GraficoDaSemana';

/**
 * Página "Sua semana" (tarefa 44): retrospectiva dos últimos 7 dias com
 * prontidão, sono, prática, reflexões, metas e o céu de cada dia, e só as
 * percepções que os registros da pessoa sustentam. Desde a tarefa 50 abre
 * com a leitura da semana pelo motor da Lyra (a que passou e a que vem, pelo
 * mapa da pessoa), que existe mesmo sem registros, e cada cartão vazio diz o
 * que falta e leva à ação.
 */

const TOM_DO_DIA = {
  favoravel: {
    rotulo: 'Favorável',
    cartao: 'border-success/30 bg-success-light',
    ponto: 'bg-success',
  },
  neutro: {
    rotulo: 'Neutro',
    cartao: 'border-border bg-muted',
    ponto: 'bg-cosmic',
  },
  desfavoravel: {
    rotulo: 'Cautela',
    cartao: 'border-warning/30 bg-warning-light',
    ponto: 'bg-warning',
  },
} as const;

const NOME_LONGO = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

function rotuloCurto(data: string) {
  const texto = NOME_LONGO.format(new Date(`${data}T12:00:00Z`)).replace(
    '.',
    ''
  );
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

function primeiraMaiuscula(texto: string) {
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

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

/** Aviso de cartão vazio: o que falta e a ação que resolve. */
function SemDados({
  children,
  acao,
}: {
  children: React.ReactNode;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-background/60 p-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
      {acao}
    </div>
  );
}

function DiaDoCeu({ dia }: { dia: CeuDoDia }) {
  const tom = dia.paraVoce ? TOM_DO_DIA[dia.paraVoce.qualidade] : null;
  return (
    <li
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-2xl border px-3 py-3',
        dia.paraVoce?.pontoSensivel
          ? TOM_DO_DIA.desfavoravel.cartao
          : (tom?.cartao ?? 'border-border bg-background/70')
      )}
    >
      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        {rotuloCurto(dia.data)}
        {tom ? (
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <span
              aria-hidden="true"
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                dia.paraVoce?.pontoSensivel
                  ? TOM_DO_DIA.desfavoravel.ponto
                  : tom.ponto
              )}
            />
            {dia.paraVoce?.pontoSensivel ? 'Prudência' : tom.rotulo}
          </span>
        ) : null}
      </span>
      {dia.paraVoce?.pontoSensivel ? (
        <>
          <span className="text-sm font-semibold text-foreground">
            Ponto sensível do seu mapa
          </span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            Prudência, sem confrontos nem riscos
          </span>
        </>
      ) : dia.paraVoce ? (
        <>
          <span className="text-sm font-semibold text-foreground">
            Dia de {dia.paraVoce.tema}
          </span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            Bom para {dia.paraVoce.area}
          </span>
        </>
      ) : (
        <span className="text-sm font-semibold text-foreground">
          Clima {dia.clima}
        </span>
      )}
      <span className="mt-auto pt-1 text-xs text-muted-foreground">
        Lua em {dia.luaEm} · {dia.diaDaLua}
      </span>
    </li>
  );
}

function LeituraDaSemanaSecao({ semana }: { semana: SemanaDaPessoa }) {
  const { leitura } = semana;
  const semCidade = leitura.passados.length === 0;
  return (
    <section
      aria-labelledby="titulo-leitura-da-semana"
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] h-64 w-[70%] rounded-full bg-linear-to-br from-cosmic/15 via-golden/10 to-transparent blur-3xl"
      />
      <div className="relative flex flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Seu mapa védico na semana
            </p>
            <h3
              id="titulo-leitura-da-semana"
              className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground"
            >
              <ScrollText
                className="h-6 w-6 shrink-0 text-cosmic"
                aria-hidden="true"
              />
              Leitura da semana
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-cosmic" aria-hidden="true" />
            Motor védico da Lyra
          </span>
        </header>

        {semCidade ? (
          <SemDados
            acao={
              <Button asChild size="sm">
                <Link href="/profile">
                  Completar o perfil
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            {leitura.faltando}
          </SemDados>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  A semana que passou
                </h4>
                <p className="mt-2 text-base leading-relaxed text-foreground">
                  {leitura.resumo}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  A semana que vem para você
                </h4>
                <p className="mt-2 text-base leading-relaxed text-foreground">
                  {leitura.proxima.resumo}
                </p>
              </div>
            </div>

            <div>
              <h4
                id="titulo-proximos-dias"
                className="text-sm font-semibold text-foreground"
              >
                Os próximos 7 dias
              </h4>
              <ul
                aria-labelledby="titulo-proximos-dias"
                className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7"
              >
                {leitura.proxima.dias.map((dia) => (
                  <DiaDoCeu key={dia.data} dia={dia} />
                ))}
              </ul>
            </div>

            {leitura.fase || leitura.transitos.length > 0 ? (
              <div className="grid gap-4 rounded-2xl border border-border bg-background/60 p-4 sm:p-5 lg:grid-cols-2">
                {leitura.fase ? (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Sua fase de vida
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {leitura.fase}
                    </p>
                  </div>
                ) : null}
                {leitura.transitos.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Os planetas lentos para você
                    </h4>
                    <ul className="mt-1.5 flex flex-col gap-1.5">
                      {leitura.transitos.map((texto) => (
                        <li
                          key={texto}
                          className="text-sm leading-relaxed text-muted-foreground"
                        >
                          {texto}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {leitura.faltando ? (
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                {leitura.faltando}
                <Link
                  href="/profile"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Abrir o perfil
                </Link>
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
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
          exemplo, dias favoráveis no seu mapa e dias sem, todos com prontidão).
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
        className="flex items-center gap-2 font-display text-lg font-semibold text-foreground"
      >
        <MoonStar className="h-5 w-5 text-cosmic" aria-hidden="true" />
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
        <div className="mt-4">
          <SemDados
            acao={
              <Button asChild size="sm" variant="outline">
                <Link href="/dia#reflexao">
                  Fazer a reflexão de hoje
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            Nenhuma reflexão nesta semana. Em um minuto, no fim do dia, você dá
            uma nota de 1 a 5 para as emoções, o corpo e o espiritual; as médias
            e as suas frases aparecem aqui.
          </SemDados>
        </div>
      )}
    </section>
  );
}

function CeuDaSemana({ semana }: { semana: SemanaDaPessoa }) {
  const { leitura } = semana;
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
      {leitura.passados.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {leitura.passados.map((dia) => (
            <DiaDoCeu key={dia.data} dia={dia} />
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <SemDados
            acao={
              <Button asChild size="sm" variant="outline">
                <Link href="/profile">
                  Completar o perfil
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            {leitura.faltando}
          </SemDados>
        </div>
      )}
    </section>
  );
}

function TabelaDaSemana({ semana }: { semana: SemanaDaPessoa }) {
  const ceuPorData = new Map(semana.leitura.passados.map((d) => [d.data, d]));
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
      {semana.resumo.diasComRegistro === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Sem registros nesta semana: a tabela mostra o que o seu mapa disse de
          cada dia e se completa com o check-in e a reflexão da noite.
        </p>
      ) : null}
      {/* Rolável no celular: focável para quem navega pelo teclado. */}
      <div
        className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        role="region"
        aria-labelledby="titulo-tabela-da-semana"
        tabIndex={0}
      >
        <table className="w-full min-w-[44rem] text-left text-sm">
          <caption className="sr-only">
            Registros e céu de cada dia da semana
          </caption>
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
              <th scope="col" className="py-2 pr-3 font-medium">
                Para você (mapa)
              </th>
              <th scope="col" className="py-2 font-medium">
                Lua em
              </th>
            </tr>
          </thead>
          <tbody>
            {semana.dias.map((dia) => {
              const pratica = praticaDoDia(dia);
              const ceu = ceuPorData.get(dia.data);
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
                  <td className="py-2 pr-3">
                    {ceu?.paraVoce
                      ? `${ceu.paraVoce.qualidade === 'favoravel' && !ceu.paraVoce.pontoSensivel ? '★ ' : ''}${primeiraMaiuscula(ceu.paraVoce.pontoSensivel ? 'prudência' : ceu.paraVoce.tema)}`
                      : '—'}
                  </td>
                  <td className="py-2">{ceu?.luaEm ?? '—'}</td>
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
  const semProntidao =
    semana !== null && semana.dias.every((d) => d.prontidao === null);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageIntro
        eyebrow="Retrospectiva"
        title="Sua semana"
        description={
          semana
            ? `De ${dataCurta(semana.inicio)} a ${dataCurta(semana.fim)}${semana.lugar ? ` · ${semana.lugar}` : ''}. O seu mapa e os seus registros, lado a lado.`
            : 'Os últimos 7 dias e os próximos: o seu mapa, a prontidão, o sono, a prática, as reflexões e as metas.'
        }
      />

      {!semana && carregando ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
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
          <LeituraDaSemanaSecao semana={semana} />

          <section aria-labelledby="titulo-numeros-da-semana">
            <h3 id="titulo-numeros-da-semana" className="sr-only">
              Números da semana
            </h3>
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
            {semana.resumo.diasComRegistro === 0 ? (
              <div className="mt-4">
                <SemDados acao={<BotaoRegistroDoDia />}>
                  Ainda não há registros nesta semana. O check-in leva menos de
                  um minuto (sono, energia, humor e estresse) e já calcula a sua
                  prontidão do dia.
                </SemDados>
              </div>
            ) : null}
          </section>

          <section
            aria-labelledby="titulo-grafico-da-semana"
            className="rounded-3xl border border-border bg-card p-5 sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <h3
                id="titulo-grafico-da-semana"
                className="flex items-center gap-2 font-display text-lg font-semibold text-foreground"
              >
                <CalendarRange
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Prontidão por dia
              </h3>
              {semana.temMapa ? (
                <p className="text-xs text-muted-foreground">
                  <span className="text-golden" aria-hidden="true">
                    ★
                  </span>{' '}
                  Dia favorável no seu mapa
                </p>
              ) : null}
            </div>
            {semProntidao ? (
              <div className="mb-4">
                <SemDados acao={<BotaoRegistroDoDia variant="outline" />}>
                  A prontidão de cada dia aparece aqui a partir do check-in do
                  dia (ou dos sinais do seu dispositivo).
                  {semana.temMapa
                    ? ' As estrelas já mostram os dias favoráveis no seu mapa.'
                    : ''}
                </SemDados>
              </div>
            ) : null}
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
