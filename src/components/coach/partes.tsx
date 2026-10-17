'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import type {
  BriefingDoDia,
  Dica,
  Janela,
  Periodo,
  Qualidade,
  Tom,
} from '@/lib/coach/tipos';
import { cn } from '@/lib/utils';

/**
 * Peças visuais do coach diário, compartilhadas pelo cartão "Seu dia" do
 * painel e pela página "Meu dia": anel de prontidão, faixa de 24 h, relógio
 * radial do dia e dicas com "Por quê?".
 */

export const QUALIDADE: Record<
  Qualidade,
  { rotulo: string; cor: string; fundo: string; ponto: string }
> = {
  favoravel: {
    rotulo: 'Favorável',
    cor: 'hsl(var(--success))',
    fundo: 'bg-success-light',
    ponto: 'bg-success',
  },
  neutro: {
    rotulo: 'Neutro',
    cor: 'hsl(var(--cosmic))',
    fundo: 'bg-cosmic-light',
    ponto: 'bg-cosmic',
  },
  desfavoravel: {
    rotulo: 'Cautela',
    cor: 'hsl(var(--warning))',
    fundo: 'bg-warning-light',
    ponto: 'bg-warning',
  },
};

export const TOM: Record<
  Tom,
  { rotulo: string; aura: string; selo: string; halo: string }
> = {
  favoravel: {
    rotulo: 'Dia favorável',
    aura: 'from-success/25 via-cosmic/15',
    selo: 'border-success/30 bg-success-light text-foreground',
    halo: 'bg-success/10 ring-success/30',
  },
  misto: {
    rotulo: 'Dia de equilíbrio',
    aura: 'from-cosmic/25 via-golden/15',
    selo: 'border-cosmic/30 bg-cosmic-light text-foreground',
    halo: 'bg-cosmic/10 ring-cosmic/30',
  },
  atencao: {
    rotulo: 'Dia de atenção',
    aura: 'from-warning/25 via-cosmic/10',
    selo: 'border-warning/30 bg-warning-light text-foreground',
    halo: 'bg-warning/10 ring-warning/30',
  },
};

/** "Bom dia", "Boa tarde" ou "Boa noite" pela hora do lugar do briefing. */
export function saudacao(agora: number, fuso: string, nome: string | null) {
  const hora = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hourCycle: 'h23',
      timeZone: fuso,
    }).format(agora)
  );
  const parte =
    hora < 5
      ? 'Boa noite'
      : hora < 12
        ? 'Bom dia'
        : hora < 18
          ? 'Boa tarde'
          : 'Boa noite';
  return nome ? `${parte}, ${nome}` : parte;
}

export function dataPorExtenso(data: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${data}T12:00:00Z`));
}

export function horaDoBriefing(iso: string, fuso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: fuso,
  }).format(new Date(iso));
}

/** Período em que `agora` cai (null fora do dia do briefing). */
export function periodoAtual(briefing: BriefingDoDia, agora: number) {
  return (
    briefing.periodos.find(
      (p) => agora >= Date.parse(p.inicio) && agora < Date.parse(p.fim)
    ) ?? null
  );
}

/** Fração (0 a 1) do dia do briefing em que o instante cai. */
export function fracaoDoDia(briefing: BriefingDoDia, instante: number) {
  const inicio = Date.parse(briefing.periodos[0].inicio);
  const fim = Date.parse(briefing.periodos[briefing.periodos.length - 1].fim);
  return (instante - inicio) / (fim - inicio);
}

// ---------------------------------------------------------------------------
// Dica com "Por quê?"
// ---------------------------------------------------------------------------

export function DicaComPorque({
  dica,
  icone,
  className,
}: {
  dica: Dica;
  icone?: React.ReactNode;
  className?: string;
}) {
  const [aberta, setAberta] = React.useState(false);
  const id = React.useId();
  return (
    <li className={cn('flex gap-3', className)}>
      {icone ? (
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/70 text-primary ring-1 ring-border"
        >
          {icone}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-foreground">{dica.texto}</p>
        <button
          type="button"
          aria-expanded={aberta}
          aria-controls={id}
          onClick={() => setAberta((a) => !a)}
          className="mt-1 inline-flex min-h-8 items-center gap-1 rounded-md text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Por quê?
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'h-3.5 w-3.5 transition-transform motion-reduce:transition-none',
              aberta && 'rotate-180'
            )}
          />
        </button>
        <p
          id={id}
          hidden={!aberta}
          className="mt-1 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
        >
          {dica.porque}
        </p>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Anel de prontidão
// ---------------------------------------------------------------------------

export function AnelDeProntidao({
  valor,
  rotulo,
  tamanho = 112,
  aura = null,
}: {
  valor: number | null;
  rotulo: string;
  tamanho?: number;
  /**
   * "Aura do dia" (tarefa 44): halo chapado em volta do anel, na cor do tom
   * do dia (sem brilho nem desfoque, como pede o Lyra Clean).
   */
  aura?: Tom | null;
}) {
  const raio = 44;
  const circunferencia = 2 * Math.PI * raio;
  const progresso =
    valor === null ? 0 : Math.max(0, Math.min(100, valor)) / 100;
  const cor =
    valor === null
      ? 'hsl(var(--muted-foreground))'
      : valor >= 75
        ? 'hsl(var(--success))'
        : valor >= 55
          ? 'hsl(var(--cosmic))'
          : 'hsl(var(--warning))';
  return (
    <div
      role="img"
      aria-label={
        valor === null
          ? `Prontidão: ${rotulo.toLowerCase()}`
          : `Prontidão ${valor} de 100: ${rotulo.toLowerCase()}`
      }
      className="relative shrink-0"
      style={{ width: tamanho, height: tamanho }}
    >
      {aura ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -inset-3 rounded-full ring-1 ring-inset',
            TOM[aura].halo
          )}
        />
      ) : null}
      <svg
        viewBox="0 0 100 100"
        className="relative h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={raio}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="7"
        />
        <circle
          cx="50"
          cy="50"
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - progresso)}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        aria-hidden="true"
      >
        <span className="font-display text-2xl font-semibold leading-none tracking-tight text-foreground">
          {valor ?? '—'}
        </span>
        <span className="mt-1 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Prontidão
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Faixa de 24 h (cartão do painel)
// ---------------------------------------------------------------------------

function janelasMarcadas(briefing: BriefingDoDia) {
  const vistas = new Set<string>();
  const todas: Janela[] = [];
  for (const p of briefing.periodos) {
    for (const j of [...p.cuidados, ...p.destaques]) {
      if (j.tipo === 'choghadiya' || j.tipo === 'troca_de_nakshatra') continue;
      const chave = `${j.tipo}:${j.inicio}`;
      if (vistas.has(chave)) continue;
      vistas.add(chave);
      todas.push(j);
    }
  }
  return todas;
}

export function FaixaDoDia({
  briefing,
  agora,
}: {
  briefing: BriefingDoDia;
  agora: number;
}) {
  const posicaoAgora = fracaoDoDia(briefing, agora);
  const marcas = janelasMarcadas(briefing);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-11" aria-hidden="true">
        <div className="absolute inset-x-0 top-2 flex h-5 overflow-hidden rounded-full ring-1 ring-border">
          {briefing.periodos.map((p) => (
            <div
              key={p.chave}
              className="h-full"
              style={{
                width: `${(fracaoDoDia(briefing, Date.parse(p.fim)) - fracaoDoDia(briefing, Date.parse(p.inicio))) * 100}%`,
                background: QUALIDADE[p.qualidade].cor,
                opacity: 0.25 + (p.nota / 100) * 0.6,
              }}
            />
          ))}
        </div>
        {marcas.map((j) => {
          const inicio = fracaoDoDia(briefing, Date.parse(j.inicio));
          const fim = fracaoDoDia(briefing, Date.parse(j.fim));
          return (
            <div
              key={`${j.tipo}-${j.inicio}`}
              className="absolute top-[30px] h-1.5 rounded-full"
              style={{
                left: `${Math.max(0, inicio) * 100}%`,
                width: `${Math.max(0.6, (Math.min(1, fim) - Math.max(0, inicio)) * 100)}%`,
                background: QUALIDADE[j.qualidade].cor,
              }}
            />
          );
        })}
        {posicaoAgora >= 0 && posicaoAgora <= 1 ? (
          <div
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${posicaoAgora * 100}%` }}
          >
            <span className="h-9 w-0.5 rounded-full bg-foreground" />
            <span className="absolute -top-1 h-2.5 w-2.5 rounded-full bg-foreground ring-4 ring-background motion-safe:animate-pulse" />
          </div>
        ) : null}
      </div>
      <div
        className="flex justify-between text-micro tabular-nums text-muted-foreground"
        aria-hidden="true"
      >
        <span>0h</span>
        <span>6h</span>
        <span>12h</span>
        <span>18h</span>
        <span>24h</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Relógio radial do dia (página "Meu dia")
// ---------------------------------------------------------------------------

const CENTRO = 120;

function ponto(fracao: number, raio: number) {
  const angulo = fracao * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTRO + raio * Math.cos(angulo),
    y: CENTRO + raio * Math.sin(angulo),
  };
}

/** Mesmo ponto como `cx`/`cy` de um círculo SVG. */
function centro(fracao: number, raio: number) {
  const p = ponto(fracao, raio);
  return { cx: p.x, cy: p.y };
}

function arco(inicio: number, fim: number, raio: number) {
  const a = Math.max(0, Math.min(1, inicio));
  const b = Math.max(0, Math.min(1, fim));
  if (b - a <= 0) return '';
  // Arco completo não é desenhável com um único comando "A".
  const fimAjustado = b - a >= 1 ? a + 0.9999 : b;
  const p1 = ponto(a, raio);
  const p2 = ponto(fimAjustado, raio);
  const grande = fimAjustado - a > 0.5 ? 1 : 0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${raio} ${raio} 0 ${grande} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

export function RelogioDoDia({
  briefing,
  agora,
  className,
}: {
  briefing: BriefingDoDia;
  agora: number;
  className?: string;
}) {
  const marcas = janelasMarcadas(briefing);
  const fAgora = fracaoDoDia(briefing, agora);
  const atual = periodoAtual(briefing, agora);
  const nascer = briefing.periodos.find((p) => p.chave === 'manha');
  const por = briefing.periodos.find((p) => p.chave === 'noite');
  const resumo = briefing.periodos
    .map(
      (p) =>
        `${p.nome} ${p.horario}: ${QUALIDADE[p.qualidade].rotulo.toLowerCase()}`
    )
    .join('; ');

  return (
    <figure className={cn('relative mx-auto w-full max-w-[18rem]', className)}>
      <svg
        viewBox="0 0 240 240"
        role="img"
        aria-label={`Relógio do dia. ${resumo}.${atual ? ` Agora: ${atual.nome.toLowerCase()}.` : ''}`}
        className="h-auto w-full overflow-visible"
      >
        <circle
          cx={CENTRO}
          cy={CENTRO}
          r="100"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="16"
        />
        {briefing.periodos.map((p) => (
          <path
            key={p.chave}
            d={arco(
              fracaoDoDia(briefing, Date.parse(p.inicio)) + 0.003,
              fracaoDoDia(briefing, Date.parse(p.fim)) - 0.003,
              100
            )}
            fill="none"
            stroke={QUALIDADE[p.qualidade].cor}
            strokeOpacity={0.35 + (p.nota / 100) * 0.55}
            strokeWidth="16"
            strokeLinecap="round"
          />
        ))}
        {marcas.map((j) => (
          <path
            key={`${j.tipo}-${j.inicio}`}
            d={arco(
              fracaoDoDia(briefing, Date.parse(j.inicio)),
              Math.max(
                fracaoDoDia(briefing, Date.parse(j.fim)),
                fracaoDoDia(briefing, Date.parse(j.inicio)) + 0.004
              ),
              80
            )}
            fill="none"
            stroke={QUALIDADE[j.qualidade].cor}
            strokeWidth="6"
            strokeLinecap="round"
          />
        ))}
        {[0, 0.25, 0.5, 0.75].map((f, i) => {
          const p = ponto(f, 122);
          return (
            <text
              key={f}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {['0h', '6h', '12h', '18h'][i]}
            </text>
          );
        })}
        {nascer ? (
          <circle
            {...centro(fracaoDoDia(briefing, Date.parse(nascer.inicio)), 100)}
            r="5"
            fill="hsl(var(--golden))"
            stroke="hsl(var(--background))"
            strokeWidth="2"
          />
        ) : null}
        {por ? (
          <circle
            {...centro(fracaoDoDia(briefing, Date.parse(por.inicio)), 100)}
            r="5"
            fill="hsl(var(--cosmic-strong))"
            stroke="hsl(var(--background))"
            strokeWidth="2"
          />
        ) : null}
        {fAgora >= 0 && fAgora <= 1 ? (
          <g>
            <line
              x1={CENTRO}
              y1={CENTRO}
              x2={ponto(fAgora, 108).x}
              y2={ponto(fAgora, 108).y}
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              {...centro(fAgora, 108)}
              r="4.5"
              fill="hsl(var(--foreground))"
            />
            <circle
              cx={CENTRO}
              cy={CENTRO}
              r="4"
              fill="hsl(var(--foreground))"
            />
          </g>
        ) : null}
      </svg>
      <figcaption className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {(['favoravel', 'neutro', 'desfavoravel'] as const).map((q) => (
          <span key={q} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn('h-2 w-2 rounded-full', QUALIDADE[q].ponto)}
            />
            {QUALIDADE[q].rotulo}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-golden" />
          Nascer do sol {briefing.ceu.nascerDoSol}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-cosmic-strong"
          />
          Pôr do sol {briefing.ceu.porDoSol}
        </span>
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Cartão de um período
// ---------------------------------------------------------------------------

export function CartaoDoPeriodo({
  periodo,
  agora,
}: {
  periodo: Periodo;
  agora: number;
}) {
  const atual =
    agora >= Date.parse(periodo.inicio) && agora < Date.parse(periodo.fim);
  const meta = QUALIDADE[periodo.qualidade];
  return (
    <article
      aria-label={`${periodo.nome}, ${periodo.horario}${atual ? ', agora' : ''}`}
      className={cn(
        // O período atual se destaca pela borda e pelo anel na cor primária,
        // sem sombra nem vidro fosco (tarefa 59).
        'relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-5 transition-colors duration-(--duracao-media)',
        atual ? 'border-primary ring-1 ring-primary/40' : 'border-border'
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: meta.cor,
          opacity: 0.4 + (periodo.nota / 100) * 0.6,
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-display text-base font-semibold text-foreground">
            {periodo.nome}
          </h4>
          <p className="text-sm tabular-nums text-muted-foreground">
            {periodo.horario}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {atual ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 text-micro font-semibold text-primary-foreground">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-primary-foreground motion-safe:animate-pulse"
              />
              Agora
            </span>
          ) : null}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-foreground',
              meta.fundo
            )}
          >
            <span
              aria-hidden="true"
              className={cn('h-1.5 w-1.5 rounded-full', meta.ponto)}
            />
            {meta.rotulo}
          </span>
        </div>
      </div>
      <div
        className="flex items-center gap-2"
        aria-label={`Nota do período: ${periodo.nota} de 100`}
        role="img"
      >
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${periodo.nota}%`, background: meta.cor }}
          />
        </div>
        <span
          className="text-xs tabular-nums text-muted-foreground"
          aria-hidden="true"
        >
          {periodo.nota}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground">
        {periodo.sugestao}
      </p>
      {periodo.destaques.length + periodo.cuidados.length > 0 ? (
        <ul className="flex flex-col gap-2 border-t border-border pt-3">
          {[...periodo.destaques, ...periodo.cuidados]
            .sort((a, b) => a.inicio.localeCompare(b.inicio))
            .map((j) => (
              <li key={`${j.tipo}-${j.inicio}`} className="flex gap-2 text-xs">
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-1 h-2 w-2 shrink-0 rounded-full',
                    QUALIDADE[j.qualidade].ponto
                  )}
                />
                <span className="min-w-0">
                  <span className="font-medium text-foreground">
                    <span className="tabular-nums">
                      {j.tipo === 'troca_de_nakshatra'
                        ? j.horario.slice(0, 5)
                        : j.horario}
                    </span>{' '}
                    · {j.nome}
                  </span>
                  <span className="sr-only">
                    {' '}
                    ({QUALIDADE[j.qualidade].rotulo})
                  </span>
                  <span className="block text-muted-foreground">
                    {j.sentido}
                  </span>
                </span>
              </li>
            ))}
        </ul>
      ) : null}
    </article>
  );
}
