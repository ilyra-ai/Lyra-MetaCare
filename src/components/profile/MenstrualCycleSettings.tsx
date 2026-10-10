'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Loader2, Moon } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CycleState {
  tracks_menstrual_cycle: boolean;
  last_menstrual_period: string;
  menstrual_cycle_length: string;
  menstrual_period_length: string;
  menstrual_life_stage: string;
}

const LIFE_STAGES = [
  { value: 'ciclo_regular', label: 'Ciclo regular' },
  { value: 'perimenopausa', label: 'Perimenopausa' },
  { value: 'menopausa', label: 'Menopausa' },
  { value: 'gestacao', label: 'Gestação' },
] as const;

const EMPTY: CycleState = {
  tracks_menstrual_cycle: false,
  last_menstrual_period: '',
  menstrual_cycle_length: '',
  menstrual_period_length: '',
  menstrual_life_stage: 'ciclo_regular',
};

export function MenstrualCycleSettings() {
  const { db, session } = useAuth();
  const [state, setState] = React.useState<CycleState>(EMPTY);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!session?.user) return;

    const load = async () => {
      setLoading(true);
      const { data, error } = await db
        .from('profiles')
        .select(
          'tracks_menstrual_cycle, last_menstrual_period, menstrual_cycle_length, menstrual_period_length, menstrual_life_stage'
        )
        .eq('id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        const row = data as {
          tracks_menstrual_cycle: boolean | null;
          last_menstrual_period: string | null;
          menstrual_cycle_length: number | null;
          menstrual_period_length: number | null;
          menstrual_life_stage: string | null;
        };
        setState({
          tracks_menstrual_cycle: Boolean(row.tracks_menstrual_cycle),
          last_menstrual_period: row.last_menstrual_period
            ? row.last_menstrual_period.slice(0, 10)
            : '',
          menstrual_cycle_length:
            row.menstrual_cycle_length != null
              ? String(row.menstrual_cycle_length)
              : '',
          menstrual_period_length:
            row.menstrual_period_length != null
              ? String(row.menstrual_period_length)
              : '',
          menstrual_life_stage: row.menstrual_life_stage ?? 'ciclo_regular',
        });
      }
      setLoading(false);
    };

    void load();
  }, [db, session]);

  const update = <K extends keyof CycleState>(key: K, value: CycleState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!session?.user) return;

    const cycleLength = Number.parseInt(state.menstrual_cycle_length, 10);
    const periodLength = Number.parseInt(state.menstrual_period_length, 10);

    setSaving(true);
    const { error } = await db
      .from('profiles')
      .update({
        tracks_menstrual_cycle: state.tracks_menstrual_cycle,
        last_menstrual_period: state.last_menstrual_period || null,
        menstrual_cycle_length: Number.isFinite(cycleLength)
          ? cycleLength
          : null,
        menstrual_period_length: Number.isFinite(periodLength)
          ? periodLength
          : null,
        menstrual_life_stage: state.menstrual_life_stage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);
    setSaving(false);

    if (error) {
      toast.error('Não foi possível salvar as configurações do ciclo.', {
        description: error.message,
      });
      return;
    }
    toast.success('Configurações do ciclo salvas.');
  };

  const isRegular = state.menstrual_life_stage === 'ciclo_regular';

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-primary">
            <Moon className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg">Saúde da mulher e ciclo</CardTitle>
        </div>
        <CardDescription>
          Configure seu ciclo para ativar a fase atual, janela fértil e
          recomendações no painel de inteligência.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-4">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  Rastrear ciclo
                </p>
                <p className="text-xs text-muted-foreground">
                  Ativa o painel de ciclo no dashboard.
                </p>
              </div>
              <Switch
                checked={state.tracks_menstrual_cycle}
                onCheckedChange={(value) =>
                  update('tracks_menstrual_cycle', value)
                }
                aria-label="Rastrear ciclo menstrual"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="menstrual-life-stage"
                className="text-sm font-medium text-foreground"
              >
                Fase de vida
              </label>
              <Select
                value={state.menstrual_life_stage}
                onValueChange={(value) => update('menstrual_life_stage', value)}
              >
                <SelectTrigger id="menstrual-life-stage">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {LIFE_STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isRegular ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <label
                    htmlFor="lmp"
                    className="text-sm font-semibold text-foreground"
                  >
                    Última menstruação
                  </label>
                  <Input
                    id="lmp"
                    type="date"
                    value={state.last_menstrual_period}
                    onChange={(e) =>
                      update('last_menstrual_period', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="cycle-len"
                    className="text-sm font-semibold text-foreground"
                  >
                    Ciclo (dias)
                  </label>
                  <Input
                    id="cycle-len"
                    type="number"
                    min={20}
                    max={45}
                    placeholder="28"
                    value={state.menstrual_cycle_length}
                    onChange={(e) =>
                      update('menstrual_cycle_length', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="period-len"
                    className="text-sm font-semibold text-foreground"
                  >
                    Período (dias)
                  </label>
                  <Input
                    id="period-len"
                    type="number"
                    min={2}
                    max={10}
                    placeholder="5"
                    value={state.menstrual_period_length}
                    onChange={(e) =>
                      update('menstrual_period_length', e.target.value)
                    }
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-md border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                Nesta fase de vida o cálculo de fase do ciclo não se aplica. O
                acompanhamento foca em sintomas, energia, sono e longevidade.
              </p>
            )}

            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : null}
              Salvar configurações do ciclo
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
