'use client';

import Link from 'next/link';
import { ArrowRight, Wind } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useResumoDaRespiracao } from '@/hooks/use-resumo-da-respiracao';
import { DEFINICOES, TECNICAS } from '@/lib/respiracao/tecnicas';

/**
 * Cartão "Respiração guiada" do "Meu dia" (tarefa 44): a técnica recomendada
 * agora, com o porquê, e atalhos para as três técnicas.
 */
export function CartaoDeRespiracao() {
  const { resumo, carregando, erro } = useResumoDaRespiracao();
  const recomendacao = resumo?.recomendacao ?? null;

  return (
    <section
      id="respiracao"
      aria-labelledby="titulo-cartao-respiracao"
      className="flex h-full scroll-mt-24 flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Respiração guiada
        </p>
        <h3
          id="titulo-cartao-respiracao"
          className="mt-1 font-display text-lg font-semibold text-foreground"
        >
          {recomendacao
            ? `${DEFINICOES[recomendacao.tecnica].nome} · ${recomendacao.minutos} min`
            : 'Uma pausa para respirar'}
        </h3>
      </div>
      {carregando && !resumo ? (
        <Skeleton className="h-12 w-full" />
      ) : recomendacao ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {recomendacao.porque}
        </p>
      ) : erro ? (
        <p className="text-sm text-muted-foreground">{erro}</p>
      ) : null}
      <nav aria-label="Técnicas de respiração" className="flex flex-wrap gap-2">
        {TECNICAS.map((tecnica) => (
          <Link
            key={tecnica}
            href={`/respiracao?tecnica=${tecnica}`}
            className="inline-flex min-h-9 items-center rounded-full border border-border px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            {DEFINICOES[tecnica].nome}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        {resumo && resumo.minutosGuiados > 0 ? (
          <p className="text-xs text-muted-foreground">
            Hoje: {resumo.minutosGuiados} min guiados
          </p>
        ) : (
          <span />
        )}
        <Button asChild>
          <Link
            href={
              recomendacao
                ? `/respiracao?tecnica=${recomendacao.tecnica}&minutos=${recomendacao.minutos}`
                : '/respiracao'
            }
          >
            Começar
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
