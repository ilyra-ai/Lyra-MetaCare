'use client';

import * as React from 'react';
import { Card, Title, Text, Flex, Badge, Button } from '@tremor/react';
import { Lightbulb, ChevronRight } from 'lucide-react';
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

        // 2. Selecionar um índice aleatório e buscar apenas essa linha
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

        setTip(data);
      } catch (err) {
        console.error('Error in fetchTip:', err);
        setTip(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
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
    return <Skeleton className={cn('h-full w-full', className)} />;
  }

  if (!tip) {
    return (
      <Card
        className={cn(
          'h-full border border-dashed border-amber-200 bg-amber-50/70 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100',
          className
        )}
      >
        <div className="flex h-full items-center justify-center p-6 text-center text-sm">
          Nenhum insight ativo foi encontrado no banco MySQL para exibição no
          dashboard.
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'h-full bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-100',
        className
      )}
      decoration="top"
      decorationColor="amber"
    >
      <Flex justifyContent="start" className="gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200/80 dark:bg-amber-900/60">
          <Lightbulb className="h-5 w-5" />
        </span>
        <div>
          <Flex alignItems="center" className="gap-2">
            <Title>Insight de IA</Title>
            <Badge color="amber">Novo</Badge>
          </Flex>
          <Text className="text-sm text-amber-700 dark:text-amber-200">
            Dica personalizada para o seu dia.
          </Text>
        </div>
      </Flex>

      <div className="mt-6 space-y-3">
        <Text className="font-semibold text-amber-900 dark:text-amber-100">
          {tip.title}
        </Text>
        <Text className="text-sm text-amber-700 dark:text-amber-200">
          {tip.detail}
        </Text>
        <Button
          className="w-fit"
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
