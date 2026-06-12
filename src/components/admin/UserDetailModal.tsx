'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Activity,
  Target,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

import { PlanBadge } from '@/components/subscription/PlanBadge';
import {
  AdminUserListItem,
  PLAN_KEYS,
  PlanKey,
  UserSubscriptionAssignment,
} from '@/types/subscription';

interface UserDetailModalProps {
  user: AdminUserListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionUpdated?: () => Promise<void> | void;
}

type BillingInterval = 'monthly' | 'annual';

const planNameMap: Record<PlanKey, string> = {
  free: 'Free',
  meta: 'Meta',
  care: 'Care',
};

const planDescriptionMap: Record<PlanKey, string> = {
  free: 'Base operacional e onboarding seguro.',
  meta: 'Camada intermediária com IA e continuidade.',
  care: 'Matriz completa de capacidades e governança premium.',
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 backdrop-blur">
    <Icon className="mt-1 h-4 w-4 text-muted-foreground" />
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="text-sm font-medium">{value || 'Não informado'}</div>
    </div>
  </div>
);

function extractApiError(payload: unknown) {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }

  return undefined;
}

export function UserDetailModal({
  user,
  open,
  onOpenChange,
  onSubscriptionUpdated,
}: UserDetailModalProps) {
  const [assignment, setAssignment] =
    React.useState<UserSubscriptionAssignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = React.useState(false);
  const [savingAssignment, setSavingAssignment] = React.useState(false);
  const [selectedPlanKey, setSelectedPlanKey] = React.useState<PlanKey>(
    user.plan.key ?? 'free'
  );
  const [selectedBillingInterval, setSelectedBillingInterval] =
    React.useState<BillingInterval>(
      user.plan.billingInterval === 'annual' ? 'annual' : 'monthly'
    );

  const loadAssignment = React.useCallback(async () => {
    setLoadingAssignment(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription`, {
        credentials: 'include',
      });
      const payload = (await response.json()) as
        | UserSubscriptionAssignment
        | { error?: string };

      if (!response.ok || !('subscription' in payload)) {
        throw new Error(
          extractApiError(payload) ||
            'Falha ao carregar a assinatura do usuário.'
        );
      }

      setAssignment(payload);
      setSelectedPlanKey(payload.subscription.plan.key);
      setSelectedBillingInterval(
        payload.subscription.billingInterval === 'annual' ? 'annual' : 'monthly'
      );
    } catch (error) {
      toast.error('Falha ao carregar a assinatura do usuário.', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido.',
      });
      setAssignment(null);
    } finally {
      setLoadingAssignment(false);
    }
  }, [user.id]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    loadAssignment();
  }, [loadAssignment, open]);

  const handleSaveSubscription = async () => {
    setSavingAssignment(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey: selectedPlanKey,
          billingInterval: selectedBillingInterval,
        }),
      });
      const payload = (await response.json()) as
        | UserSubscriptionAssignment
        | { error?: string };

      if (!response.ok || !('subscription' in payload)) {
        throw new Error(
          extractApiError(payload) ||
            'Falha ao atualizar a assinatura do usuário.'
        );
      }

      setAssignment(payload);
      toast.success('Assinatura atualizada com sucesso.');
      await onSubscriptionUpdated?.();
    } catch (error) {
      toast.error('Falha ao atualizar a assinatura.', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido.',
      });
    } finally {
      setSavingAssignment(false);
    }
  };

  const enabledFeatures =
    assignment?.subscription.features.filter((feature) => feature.enabled) ??
    [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl overflow-hidden border-0 p-0 shadow-2xl ring-1 ring-border/70">
        <div className="bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_32%),radial-gradient(circle_at_top_right,hsl(var(--cosmic)/0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(249,248,252,0.92))] p-8">
          <DialogHeader className="space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24 border shadow-xl">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-3xl">
                    {user.firstName?.charAt(0) || <User />}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <div>
                    <DialogTitle className="text-3xl font-semibold tracking-tight">
                      {user.firstName || 'Usuário'} {user.lastName || ''}
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-sm leading-7">
                      {user.email}
                    </DialogDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.onboardingCompleted ? (
                      <Badge className="bg-success text-success-foreground">
                        Onboarding Completo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Onboarding Pendente</Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    {assignment ? (
                      <PlanBadge planKey={assignment.subscription.plan.key} />
                    ) : user.plan.key ? (
                      <PlanBadge planKey={user.plan.key} />
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="min-w-[280px] rounded-3xl border border-border/70 bg-card/85 p-5 shadow-xl backdrop-blur">
                <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Gestão premium da assinatura
                </div>
                {loadingAssignment ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan-select">Plano</Label>
                      <Select
                        value={selectedPlanKey}
                        onValueChange={(value) =>
                          setSelectedPlanKey(value as PlanKey)
                        }
                      >
                        <SelectTrigger id="plan-select">
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLAN_KEYS.map((planKey) => (
                            <SelectItem key={planKey} value={planKey}>
                              {planNameMap[planKey]}:{' '}
                              {planDescriptionMap[planKey]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billing-interval-select">
                        Intervalo de cobrança
                      </Label>
                      <Select
                        value={selectedBillingInterval}
                        onValueChange={(value) =>
                          setSelectedBillingInterval(value as BillingInterval)
                        }
                      >
                        <SelectTrigger id="billing-interval-select">
                          <SelectValue placeholder="Selecione o ciclo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="annual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSaveSubscription}
                      disabled={savingAssignment}
                      className="w-full"
                    >
                      {savingAssignment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Aplicando matriz ao usuário...
                        </>
                      ) : (
                        'Salvar assinatura'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 border-t border-border/70 pt-8 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-6">
              <Card className="border-0 shadow-xl ring-1 ring-border/70">
                <CardHeader>
                  <CardTitle>Perfil e contexto</CardTitle>
                  <CardDescription>
                    Dados operacionais e cadastrais usados na jornada do
                    produto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <DetailItem
                    icon={Calendar}
                    label="Data de Cadastro"
                    value={format(
                      new Date(user.createdAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                  />
                  <DetailItem icon={User} label="Gênero" value={user.gender} />
                  <DetailItem
                    icon={Calendar}
                    label="Idade"
                    value={user.age ? `${user.age} anos` : null}
                  />
                  <DetailItem
                    icon={Activity}
                    label="Nível de Atividade"
                    value={user.activityLevel}
                  />
                  <DetailItem
                    icon={MapPin}
                    label="Local de Nascimento"
                    value={user.birthLocation}
                  />
                  <DetailItem
                    icon={Clock}
                    label="Hora de Nascimento"
                    value={user.birthTime}
                  />
                  <div className="md:col-span-2">
                    <DetailItem
                      icon={Target}
                      label="Metas"
                      value={
                        user.goals && user.goals.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.goals.map((goal) => (
                              <Badge key={goal} variant="secondary">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          'Nenhuma meta definida'
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-xl ring-1 ring-border/70">
                <CardHeader>
                  <CardTitle>Assinatura vigente</CardTitle>
                  <CardDescription>
                    Estado atual da assinatura persistida em MySQL.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingAssignment ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : assignment ? (
                    <>
                      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 backdrop-blur">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="space-y-2">
                            <PlanBadge
                              planKey={assignment.subscription.plan.key}
                            />
                            <p className="text-lg font-semibold">
                              {assignment.subscription.plan.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.subscription.plan.tagline}
                            </p>
                          </div>
                          <div
                            className="h-12 w-12 rounded-2xl shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${assignment.subscription.plan.accentFrom}, ${assignment.subscription.plan.accentTo})`,
                            }}
                          />
                        </div>

                        <Separator className="my-4" />

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border bg-background/70 p-3">
                            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              <Wallet className="h-3.5 w-3.5" />
                              Cobrança
                            </div>
                            <p className="text-sm font-semibold capitalize">
                              {assignment.subscription.billingInterval ===
                              'annual'
                                ? 'Anual'
                                : 'Mensal'}
                            </p>
                          </div>
                          <div className="rounded-2xl border bg-background/70 p-3">
                            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              <Sparkles className="h-3.5 w-3.5" />
                              Status
                            </div>
                            <p className="text-sm font-semibold capitalize">
                              {assignment.subscription.status}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 backdrop-blur">
                        <p className="mb-3 text-sm font-semibold">
                          Capacidades habilitadas
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {enabledFeatures.slice(0, 8).map((feature) => (
                            <Badge key={feature.key} variant="outline">
                              {feature.name}
                            </Badge>
                          ))}
                          {enabledFeatures.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Nenhuma capacidade ativa encontrada.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 text-sm text-muted-foreground backdrop-blur">
                      Não foi possível carregar a assinatura atual deste
                      usuário.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
