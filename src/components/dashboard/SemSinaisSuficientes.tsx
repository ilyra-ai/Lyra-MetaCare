'use client';

import { Activity } from 'lucide-react';

import { BotaoRegistroDoDia } from '@/components/metricas/RegistroDoDia';
import {
  type Cobertura,
  resumoDaCobertura,
  sinaisQueFaltam,
} from '@/lib/integrativo/cobertura';

/**
 * Estado vazio honesto de um índice integrativo (tarefa 57): diz quantos
 * sinais foram medidos hoje, quantos o índice precisa e quais faltam, e
 * oferece o registro do dia. Substitui os números montados com valores de
 * referência que apareciam sem nenhum dado.
 */
export function SemSinaisSuficientes({
  indice,
  cobertura,
  comBotao = true,
}: {
  /** Nome do índice com o artigo ("o Índice Pránico", "os Pancha Koshas"). */
  indice: string;
  cobertura: Cobertura;
  comBotao?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-4">
      <p className="flex items-start gap-2 text-sm leading-6 text-foreground">
        <Activity
          aria-hidden="true"
          className="mt-1 size-4 shrink-0 text-muted-foreground"
        />
        <span>
          {`Sem sinais suficientes hoje para ${indice}: ${resumoDaCobertura(cobertura)}, e o cálculo precisa de pelo menos ${cobertura.minimo}.`}
        </span>
      </p>
      {cobertura.faltando.length > 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">
          Sinais que ajudam: {sinaisQueFaltam(cobertura, 4)}.
        </p>
      ) : null}
      {comBotao ? (
        <BotaoRegistroDoDia variant="outline" className="self-start" />
      ) : null}
    </div>
  );
}

/** Linha discreta com a cobertura de um índice calculado. */
export function CoberturaDoIndice({ cobertura }: { cobertura: Cobertura }) {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      Calculado com {resumoDaCobertura(cobertura)}
      {cobertura.faltando.length > 0
        ? `; os que faltam entram com valores de referência.`
        : '.'}
    </p>
  );
}
