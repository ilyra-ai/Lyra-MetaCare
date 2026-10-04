'use client';

import * as React from 'react';
import {
  Loader2,
  Palette,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import {
  PlanFeatureAccess,
  PlanKey,
  PlanMatrixPlan,
  PlanMatrixResponse,
  PlanMatrixUpdateInput,
} from '@/types/subscription';

const planDescriptions: Record<PlanKey, string> = {
  free: 'Base operacional para onboarding, ativação e uso inicial do produto com segurança.',
  meta: 'Plano intermediário orientado por continuidade de acompanhamento, IA e automações clínicas.',
  care: 'Camada premium, completa e integral para máxima profundidade de uso e retenção.',
};

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

function buildFeatureCatalog(plans: PlanMatrixPlan[]) {
  const catalog = new Map<
    PlanFeatureAccess['key'],
    Pick<
      PlanFeatureAccess,
      | 'key'
      | 'name'
      | 'description'
      | 'category'
      | 'featureType'
      | 'meterKind'
      | 'unit'
      | 'sortOrder'
    >
  >();

  for (const plan of plans) {
    for (const feature of plan.features) {
      if (!catalog.has(feature.key)) {
        catalog.set(feature.key, {
          key: feature.key,
          name: feature.name,
          description: feature.description,
          category: feature.category,
          featureType: feature.featureType,
          meterKind: feature.meterKind,
          unit: feature.unit,
          sortOrder: feature.sortOrder,
        });
      }
    }
  }

  return Array.from(catalog.values()).sort(
    (left, right) => left.sortOrder - right.sortOrder
  );
}

// Busca a matriz de planos na API administrativa; lança erro com a mensagem
// real da API quando a resposta não é válida.
async function requestPlanMatrix(): Promise<PlanMatrixPlan[]> {
  const response = await fetch('/api/admin/plans', {
    credentials: 'include',
  });
  const payload = (await response.json()) as
    PlanMatrixResponse | { error?: string };

  if (!response.ok || !('plans' in payload)) {
    throw new Error(
      extractApiError(payload) || 'Falha ao carregar a matriz de planos.'
    );
  }

  return payload.plans;
}

function notifyMatrixLoadError(error: unknown) {
  toast.error('Falha ao carregar a matriz de capacidades.', {
    description: error instanceof Error ? error.message : 'Erro desconhecido.',
  });
}

export function AdminPlanMatrixContent() {
  const [plans, setPlans] = React.useState<PlanMatrixPlan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingPlanKey, setSavingPlanKey] = React.useState<PlanKey | null>(
    null
  );

  // Carga inicial da matriz (o estado inicial já é "carregando").
  React.useEffect(() => {
    let active = true;
    requestPlanMatrix()
      .then((loadedPlans) => {
        if (active) setPlans(loadedPlans);
      })
      .catch((error: unknown) => {
        if (active) notifyMatrixLoadError(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Botão "Recarregar matriz".
  const handleReload = React.useCallback(() => {
    setLoading(true);
    requestPlanMatrix()
      .then(setPlans)
      .catch(notifyMatrixLoadError)
      .finally(() => setLoading(false));
  }, []);

  const updatePlanField = React.useCallback(
    <K extends keyof PlanMatrixPlan>(
      planKey: PlanKey,
      field: K,
      value: PlanMatrixPlan[K]
    ) => {
      setPlans((current) =>
        current.map((plan) =>
          plan.key === planKey ? { ...plan, [field]: value } : plan
        )
      );
    },
    []
  );

  const updateFeatureField = React.useCallback(
    (
      planKey: PlanKey,
      featureKey: PlanFeatureAccess['key'],
      field: keyof Pick<
        PlanFeatureAccess,
        'enabled' | 'quotaValue' | 'resetInterval'
      >,
      value: boolean | number | string | null
    ) => {
      setPlans((current) =>
        current.map((plan) =>
          plan.key === planKey
            ? {
                ...plan,
                features: plan.features.map((feature) =>
                  feature.key === featureKey
                    ? { ...feature, [field]: value }
                    : feature
                ),
              }
            : plan
        )
      );
    },
    []
  );

  const savePlan = React.useCallback(
    async (planKey: PlanKey) => {
      const plan = plans.find((item) => item.key === planKey);
      if (!plan) {
        return;
      }

      setSavingPlanKey(planKey);
      try {
        const requestPayload: PlanMatrixUpdateInput = {
          name: plan.name,
          tagline: plan.tagline,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          currencyCode: plan.currencyCode,
          highlightText: plan.highlightText,
          accentFrom: plan.accentFrom,
          accentTo: plan.accentTo,
          isActive: plan.isActive,
          isPublic: plan.isPublic,
          externalProductId: plan.externalProductId,
          externalMonthlyPriceId: plan.externalMonthlyPriceId,
          externalAnnualPriceId: plan.externalAnnualPriceId,
          features: plan.features.map((feature) => ({
            key: feature.key,
            enabled: feature.enabled,
            quotaValue: feature.quotaValue,
            resetInterval: feature.resetInterval,
          })),
        };

        const response = await fetch(`/api/admin/plans/${planKey}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });
        const payload = (await response.json()) as
          PlanMatrixResponse | { error?: string };

        if (!response.ok || !('plans' in payload)) {
          throw new Error(
            extractApiError(payload) || `Falha ao salvar o plano ${plan.name}.`
          );
        }

        setPlans(payload.plans);
        toast.success(`Plano ${plan.name} atualizado com sucesso.`);
      } catch (error) {
        toast.error(`Falha ao salvar o plano ${plan.name}.`, {
          description:
            error instanceof Error ? error.message : 'Erro desconhecido.',
        });
      } finally {
        setSavingPlanKey(null);
      }
    },
    [plans]
  );

  const featureCatalog = React.useMemo(
    () => buildFeatureCatalog(plans),
    [plans]
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-card/75 px-6 py-3 shadow-xl ring-1 ring-border/70 backdrop-blur">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Carregando matriz real de capacidades...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-0 shadow-2xl ring-1 ring-border/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_35%),radial-gradient(circle_at_top_right,hsl(var(--cosmic)/0.14),transparent_32%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.16),transparent_32%)]" />
        <CardHeader className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="border-border/80 bg-card/75 text-foreground backdrop-blur"
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Administração premium de planos
              </Badge>
              <CardTitle className="text-3xl font-semibold tracking-tight">
                Matriz real de capacidades
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-7">
                Esta central controla o catálogo comercial, os entitlements e os
                limites reais do produto. Tudo o que está aqui é aplicado no
                MySQL, refletido na API e respeitado na interface do app.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleReload}
              className="rounded-full bg-card/85 backdrop-blur"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar matriz
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.key}
            className="overflow-hidden border-0 shadow-xl ring-1 ring-border/70"
          >
            <div
              className="h-2 w-full"
              style={{
                background: `linear-gradient(90deg, ${plan.accentFrom}, ${plan.accentTo})`,
              }}
            />
            <CardHeader className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <PlanBadge planKey={plan.key} />
                <Badge variant="secondary" className="rounded-full">
                  {planDescriptions[plan.key]}
                </Badge>
              </div>

              <div
                className="rounded-3xl p-5 text-white shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${plan.accentFrom}, ${plan.accentTo})`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-sm/6 uppercase tracking-[0.2em] text-white/70">
                      Preview comercial
                    </p>
                    <h3 className="text-3xl font-semibold tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="max-w-sm text-sm/7 text-white/85">
                      {plan.tagline}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                    <Palette className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                      Mensal
                    </p>
                    <p className="text-3xl font-semibold">
                      {plan.currencyCode} {plan.monthlyPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                      Anual
                    </p>
                    <p className="text-xl font-semibold">
                      {plan.currencyCode} {plan.annualPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`name-${plan.key}`}>Nome</Label>
                  <Input
                    id={`name-${plan.key}`}
                    value={plan.name}
                    onChange={(event) =>
                      updatePlanField(plan.key, 'name', event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`highlight-${plan.key}`}>Destaque</Label>
                  <Input
                    id={`highlight-${plan.key}`}
                    value={plan.highlightText || ''}
                    onChange={(event) =>
                      updatePlanField(
                        plan.key,
                        'highlightText',
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`tagline-${plan.key}`}>Tagline</Label>
                <Input
                  id={`tagline-${plan.key}`}
                  value={plan.tagline}
                  onChange={(event) =>
                    updatePlanField(plan.key, 'tagline', event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${plan.key}`}>Descrição</Label>
                <Textarea
                  id={`description-${plan.key}`}
                  value={plan.description}
                  onChange={(event) =>
                    updatePlanField(plan.key, 'description', event.target.value)
                  }
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`monthly-${plan.key}`}>Preço mensal</Label>
                  <Input
                    id={`monthly-${plan.key}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.monthlyPrice}
                    onChange={(event) =>
                      updatePlanField(
                        plan.key,
                        'monthlyPrice',
                        Number(event.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`annual-${plan.key}`}>Preço anual</Label>
                  <Input
                    id={`annual-${plan.key}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.annualPrice}
                    onChange={(event) =>
                      updatePlanField(
                        plan.key,
                        'annualPrice',
                        Number(event.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`accent-from-${plan.key}`}>Cor inicial</Label>
                  <Input
                    id={`accent-from-${plan.key}`}
                    type="color"
                    value={plan.accentFrom}
                    onChange={(event) =>
                      updatePlanField(
                        plan.key,
                        'accentFrom',
                        event.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`accent-to-${plan.key}`}>Cor final</Label>
                  <Input
                    id={`accent-to-${plan.key}`}
                    type="color"
                    value={plan.accentTo}
                    onChange={(event) =>
                      updatePlanField(plan.key, 'accentTo', event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Plano ativo</p>
                    <p className="text-xs text-muted-foreground">
                      Disponível para atribuição e uso.
                    </p>
                  </div>
                  <Switch
                    checked={plan.isActive}
                    onCheckedChange={(checked) =>
                      updatePlanField(plan.key, 'isActive', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Plano público</p>
                    <p className="text-xs text-muted-foreground">
                      Exibido para escolha comercial.
                    </p>
                  </div>
                  <Switch
                    checked={plan.isPublic}
                    onCheckedChange={(checked) =>
                      updatePlanField(plan.key, 'isPublic', checked)
                    }
                  />
                </div>
              </div>

              <Button
                onClick={() => savePlan(plan.key)}
                className="w-full rounded-full"
                disabled={savingPlanKey === plan.key}
              >
                {savingPlanKey === plan.key ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando plano
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Salvar {plan.name}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-border/70">
        <CardHeader>
          <CardTitle>Matriz editável de entitlements</CardTitle>
          <CardDescription>
            Cada linha abaixo representa uma capacidade real do produto e cada
            coluna reflete o comportamento liberado para `Free`, `Meta` e
            `Care`.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[320px]">Capacidade</TableHead>
                {plans.map((plan) => (
                  <TableHead key={plan.key} className="min-w-[280px] align-top">
                    <div className="space-y-2">
                      <PlanBadge planKey={plan.key} />
                      <div className="text-xs text-muted-foreground">
                        {plan.tagline}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {featureCatalog.map((feature) => (
                <TableRow key={feature.key}>
                  <TableCell className="align-top">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{feature.name}</p>
                        <Badge variant="secondary">{feature.category}</Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {feature.description}
                      </p>
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                        {feature.featureType === 'boolean'
                          ? 'Toggle'
                          : `${feature.meterKind} ${feature.unit ? `• ${feature.unit}` : ''}`}
                      </p>
                    </div>
                  </TableCell>
                  {plans.map((plan) => {
                    const planFeature = plan.features.find(
                      (item) => item.key === feature.key
                    );
                    if (!planFeature) {
                      return <TableCell key={plan.key}>-</TableCell>;
                    }

                    return (
                      <TableCell key={plan.key} className="align-top">
                        <div className="space-y-4 rounded-2xl border border-border/70 bg-secondary/60 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Habilitado</p>
                              <p className="text-xs text-muted-foreground">
                                Controle real do entitlement.
                              </p>
                            </div>
                            <Switch
                              checked={planFeature.enabled}
                              onCheckedChange={(checked) =>
                                updateFeatureField(
                                  plan.key,
                                  planFeature.key,
                                  'enabled',
                                  checked
                                )
                              }
                            />
                          </div>

                          {planFeature.featureType === 'quota' ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/85 p-3">
                                <div>
                                  <p className="text-sm font-medium">
                                    Ilimitado
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Quota nula libera uso sem teto.
                                  </p>
                                </div>
                                <Switch
                                  checked={planFeature.quotaValue === null}
                                  onCheckedChange={(checked) =>
                                    updateFeatureField(
                                      plan.key,
                                      planFeature.key,
                                      'quotaValue',
                                      checked ? null : 0
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`${plan.key}-${planFeature.key}-quota`}
                                >
                                  Limite
                                </Label>
                                <Input
                                  id={`${plan.key}-${planFeature.key}-quota`}
                                  type="number"
                                  min="0"
                                  step="1"
                                  disabled={planFeature.quotaValue === null}
                                  value={planFeature.quotaValue ?? ''}
                                  onChange={(event) =>
                                    updateFeatureField(
                                      plan.key,
                                      planFeature.key,
                                      'quotaValue',
                                      event.target.value === ''
                                        ? 0
                                        : Number(event.target.value)
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`${plan.key}-${planFeature.key}-reset`}
                                >
                                  Janela de reset
                                </Label>
                                <Input
                                  id={`${plan.key}-${planFeature.key}-reset`}
                                  value={planFeature.resetInterval || ''}
                                  onChange={(event) =>
                                    updateFeatureField(
                                      plan.key,
                                      planFeature.key,
                                      'resetInterval',
                                      event.target.value || null
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
