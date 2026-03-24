'use client';

import * as React from 'react';
import { Card, Title, Text, Flex, Badge, Button } from '@tremor/react';
import { Lightbulb, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
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
    if (!featureEnabled) {
      setTip(null);
      setLoading(false);
      return;
    }

    let ignoreResult = false;

    const fetchTip = async () => {
      setLoading(true);

      try {
        const { count, error: countError } = await db
          .from('ai_tips')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (countError || count == null || count === 0) {
          throw new Error('No tips found or error fetching count');
        }

        const randomIndex = Math.floor(Math.random() * count);
        const { data, error } = await db
          .from('ai_tips')
          .select('id, title, detail')
          .eq('is_active', true)
          .range(randomIndex, randomIndex)
          .maybeSingle();

        if (error || !data) {
          throw new Error('Error fetching random tip');
        }

        if (!ignoreResult) {
          setTip(data);
        }
      } catch (err) {
        if (!ignoreResult) {
          console.error('Error in fetchTip:', err);
          setTip(null);
        }
      } finally {
        if (!ignoreResult) {
          setLoading(false);
        }
      }
    };

    fetchTip();

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
          description="Seu plano atual não inclui a entrega contínua de insights inteligentes no dashboard. O bloqueio é aplicado pela matriz de capacidades e refletido no backend."
        />
      </div>
    );
  }

  if (loading) {
    return <Skeleton className={cn('h-full w-full rounded-2xl', className)} />;
  }

  if (!tip) {
    return (
      <Card
        className={cn(
          'h-full rounded-2xl border border-dashed border-border bg-secondary/50',
          className
        )}
      >
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
          Nenhum insight ativo foi encontrado para exibição no dashboard.
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'h-full rounded-2xl border border-border bg-card shadow hover:shadow-md transition-all duration-200 card-highlight-cosmic',
        className
      )}
    >
      <Flex justifyContent="start" className="gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cosmic/10">
          <Sparkles className="h-5 w-5 text-cosmic" />
        </span>
        <div>
          <Flex alignItems="center" className="gap-2">
            <Title className="font-display text-foreground">Insight de IA</Title>
            <Badge color="violet">Novo</Badge>
          </Flex>
          <Text className="text-sm text-muted-foreground">
            Dica personalizada para o seu dia.
          </Text>
        </div>
      </Flex>

      <div className="mt-5 space-y-3">
        <Text className="font-semibold text-foreground">
          {tip.title}
        </Text>
        <Text className="text-sm text-muted-foreground leading-relaxed">
          {tip.detail}
        </Text>
        <Button
          className="w-fit mt-2"
          size="sm"
          variant="secondary"
          icon={ChevronRight}
          iconPosition="right"
          onClick={() => router.push('/plan')}
        >
          Ver plano completo
        </Button>
      </div>
    </Card>
  );
}
