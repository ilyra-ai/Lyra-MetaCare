'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, ChevronRight, Cpu, Sparkles } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
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
import { PlanKey } from '@/types/subscription';

interface AITip {
  id: string | number;
  title: string;
  detail: string;
}

interface AITipsCardProps {
  className?: string;
  featureEnabled?: boolean;
  currentPlanKey?: PlanKey;
}

export function AITipsCard({
  className,
  featureEnabled = true,
  currentPlanKey = 'free',
}: AITipsCardProps) {
  const router = useRouter();
  const { db } = useAuth();
  const [tip, setTip] = React.useState<AITip | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Sem o recurso no plano o card renderiza apenas o aviso de upgrade, então
    // não há o que carregar (o estado inicial já é "carregando").
    if (!featureEnabled) {
      return;
    }

    let ignoreResult = false;

    const fetchTip = async () => {
      try {
        const { count, error: countError } = await db
          .from('ai_tips')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (countError || count == null || count === 0) {
          throw new Error('Nenhum insight ativo foi encontrado.');
        }

        const randomIndex = Math.floor(Math.random() * count);
        const { data, error } = await db
          .from('ai_tips')
          .select('id, title, detail')
          .eq('is_active', true)
          .range(randomIndex, randomIndex)
          .maybeSingle();

        if (error || !data) {
          throw new Error('Falha ao selecionar insight do feed.');
        }

        if (!ignoreResult) {
          setTip(data);
        }
      } catch (error) {
        console.error('Erro ao carregar insight de IA do dashboard:', error);
        if (!ignoreResult) {
          setTip(null);
        }
      } finally {
        if (!ignoreResult) {
          setLoading(false);
        }
      }
    };

    void fetchTip();

    return () => {
      ignoreResult = true;
    };
  }, [db, featureEnabled]);

  if (!featureEnabled) {
    return (
      <div className={className}>
        <PlanUpgradeNotice
          currentPlanKey={currentPlanKey}
          title="Feed premium de insights"
          description="Seu plano atual não inclui a camada contínua de insights inteligentes no dashboard. O bloqueio está conectado à matriz real de capacidades."
        />
      </div>
    );
  }

  if (loading) {
    return <Skeleton className={cn('h-full min-h-72 w-full', className)} />;
  }

  if (!tip) {
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
              <CardTitle>Feed de insights indisponível</CardTitle>
              <CardDescription>
                O motor de recomendações não encontrou um insight ativo para
                exibir agora.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn('min-w-0', className)}>
      <CardHeader className="gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cosmic-light text-cosmic-strong"
            >
              <Cpu className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cosmic">Insight privado IA</Badge>
                <Badge variant="secondary">Fluxo ativo</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle>Protocolo sensível ao seu momento</CardTitle>
                <CardDescription>
                  Uma leitura curta, útil e gentil para orientar o seu próximo
                  passo.
                </CardDescription>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-cosmic-light px-2.5 py-1 text-[13px] font-medium text-cosmic-strong">
            <Sparkles aria-hidden="true" className="size-3.5" />
            On-device
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="rounded-md border border-border bg-background p-5">
          <p className="font-display text-lg font-semibold leading-7 tracking-tight text-foreground">
            {tip.title}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">
            {tip.detail}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Intenção
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Clareza antes de intensidade
            </p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Atmosfera
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Astrologia moderna com IA gentil
            </p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Próximo passo
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Expandir para o plano completo
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-between">
        <p className="min-w-0 text-[13px] text-muted-foreground">
          O conteúdo vem do feed real de `ai_tips` ativo nesta instância.
        </p>
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
