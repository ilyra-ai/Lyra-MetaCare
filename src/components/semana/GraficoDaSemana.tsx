'use client';

import * as React from 'react';

import {
  formatarSono,
  praticaDoDia,
  type DiaDaSemana,
} from '@/lib/semana/analise';
import { cn } from '@/lib/utils';

/**
 * Prontidão dos 7 dias em barras finas (uma série, um tom), com ★ nos dias
 * de Tara favorável. Cada barra é um botão: tocar ou focar mostra o detalhe
 * do dia logo abaixo (funciona no celular, sem depender de hover). Dias sem
 * prontidão aparecem como um traço, nunca como zero.
 */

const DATA_CURTA = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export function dataCurta(data: string) {
  return DATA_CURTA.format(new Date(`${data}T12:00:00Z`)).replace('.', '');
}

/** "Sáb, 10 de out": maiúscula só na primeira letra. */
export function rotuloDoDia(dia: Pick<DiaDaSemana, 'data' | 'diaDaSemana'>) {
  const texto = `${dia.diaDaSemana}, ${dataCurta(dia.data)}`;
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

function detalhe(dia: DiaDaSemana) {
  const partes = [
    dia.prontidao === null ? 'sem prontidão' : `prontidão ${dia.prontidao}`,
  ];
  if (dia.sonoMinutos !== null)
    partes.push(`sono ${formatarSono(dia.sonoMinutos)}`);
  const pratica = praticaDoDia(dia);
  if (pratica > 0) partes.push(`${pratica} min de prática`);
  if (dia.tara) {
    partes.push(
      `para você, dia de ${dia.tara.tema}${dia.tara.qualidade === 'favoravel' ? ' (favorável)' : dia.tara.qualidade === 'desfavoravel' ? ' (cautela)' : ''}`
    );
  }
  return partes.join(' · ');
}

export function GraficoDaSemana({
  dias,
  compacto = false,
}: {
  dias: DiaDaSemana[];
  compacto?: boolean;
}) {
  const ultimoComDado = [...dias].reverse().find((d) => d.prontidao !== null);
  const [selecionado, setSelecionado] = React.useState<string | null>(null);
  const atual =
    dias.find((d) => d.data === selecionado) ?? ultimoComDado ?? dias.at(-1);
  const idDoDetalhe = React.useId();
  const altura = compacto ? 72 : 140;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="sr-only">
        Prontidão de cada dia da semana; a estrela marca os dias favoráveis para
        você pelo seu mapa.
      </figcaption>
      <div
        className="grid grid-cols-7 items-end gap-1.5 sm:gap-2"
        role="group"
        aria-label="Dias da semana"
      >
        {dias.map((dia) => {
          const valor = dia.prontidao;
          const ativo = atual?.data === dia.data;
          return (
            <button
              key={dia.data}
              type="button"
              onClick={() => setSelecionado(dia.data)}
              aria-pressed={ativo}
              aria-controls={idDoDetalhe}
              aria-label={`${rotuloDoDia(dia)}: ${detalhe(dia)}`}
              className="group flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 pb-1 pt-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'text-xs leading-none',
                  dia.tara?.qualidade === 'favoravel'
                    ? 'text-golden'
                    : 'text-transparent'
                )}
              >
                ★
              </span>
              <span
                aria-hidden="true"
                className="flex w-full items-end justify-center"
                style={{ height: altura }}
              >
                {valor === null ? (
                  <span className="mb-0.5 h-0.5 w-3 rounded-full bg-border" />
                ) : (
                  <span
                    className={cn(
                      'w-full max-w-7 rounded-t-[4px] transition-colors motion-reduce:transition-none',
                      ativo
                        ? 'bg-primary'
                        : 'bg-primary/55 group-hover:bg-primary/80'
                    )}
                    style={{
                      height: `${Math.max(4, (valor / 100) * altura)}px`,
                    }}
                  />
                )}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'text-[0.6875rem] capitalize',
                  ativo
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {dia.diaDaSemana}
              </span>
            </button>
          );
        })}
      </div>
      {atual ? (
        <p
          id={idDoDetalhe}
          aria-live="polite"
          className="rounded-xl bg-muted px-3 py-2 text-xs text-foreground"
        >
          <span className="font-semibold">{rotuloDoDia(atual)}</span> ·{' '}
          {detalhe(atual)}
        </p>
      ) : null}
    </figure>
  );
}
