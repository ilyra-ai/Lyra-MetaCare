'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, ChevronRight, Lightbulb } from 'lucide-react';

import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import { ouvirMetricasAtualizadas } from '@/lib/metricas/evento-de-atualizacao';
import { cn } from '@/lib/utils';
import { PlanKey } from '@/types/subscription';

interface DicaDoDia {
  dica: {
    id: string;
    title: string;
    detail: string;
    category: string | null;
  } | null;
  motivo: string | null;
}

interface AITipsCardProps {
  className?: string;
  featureEnabled?: boolean;
  currentPlanKey?: PlanKey;
}

const SEM_DICA: DicaDoDia = { dica: null, motivo: null };

async function lerDica(): Promise<DicaDoDia> {
  const resposta = await fetch('/api/dicas/hoje', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return (await resposta.json()) as DicaDoDia;
}

function avisarFalha(falha: unknown) {
  console.error('Falha ao carregar a dica do dia:', falha);
}

/**
 * Dica do dia (tarefa 43): do conteúdo curado pela equipe Lyra, escolhida
 * pela área que mais pede atenção nos sinais registrados hoje e trocada
 * quando o registro muda. Antes era um sorteio a cada carga da página, com
 * rótulos e blocos fixos.
 */
export function AITipsCard({
  className,
  featureEnabled = true,
  currentPlanKey = 'free',
}: AITipsCardProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [versao, setVersao] = React.useState(0);
  React.useEffect(
    () => ouvirMetricasAtualizadas(() => setVersao((v) => v + 1)),
    []
  );
  const userId = session?.user.id ?? null;
  const { data, loading } = useKeyedResource(
    featureEnabled && userId ? `dica:${userId}:${versao}` : null,
    lerDica,
    avisarFalha,
    SEM_DICA
  );

  if (!featureEnabled) {
    return (
      <div className={className}>
        <PlanUpgradeNotice
          currentPlanKey={currentPlanKey}
          title="Dica do dia"
          description="O seu plano atual não inclui as dicas diárias de IA."
        />
      </div>
    );
  }

  if (loading) {
    return <Skeleton className={cn('h-full min-h-72 w-full', className)} />;
  }

  if (!data.dica) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardHeader className="gap-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cosmic-light text-cosmic"
            >
              <BrainCircuit className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <CardTitle>Sem dica para hoje</CardTitle>
              <CardDescription>
                Ainda não há dicas ativas cadastradas pela equipe.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn('min-w-0', className)}>
      <CardHeader className="gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cosmic-light text-cosmic-strong"
          >
            <Lightbulb className="size-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cosmic">Dica do dia</Badge>
              {data.dica.category ? (
                <Badge variant="secondary">{data.dica.category}</Badge>
              ) : null}
            </div>
            <CardTitle>{data.dica.title}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-[15px] leading-relaxed text-foreground/85">
          {data.dica.detail}
        </p>
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Por que esta dica hoje
          </p>
          <p className="mt-1 text-sm text-foreground">
            {data.motivo ??
              'Nenhum sinal de hoje pede atenção especial: a dica muda a cada dia. Faça o check-in para ela acompanhar o seu momento.'}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-end">
        <Button
          variant="secondary"
          onClick={() => router.push('/plan')}
          className="min-w-44"
        >
          Ver plano completo
          <ChevronRight />
        </Button>
      </CardFooter>
    </Card>
  );
}
