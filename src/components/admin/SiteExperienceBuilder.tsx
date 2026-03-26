'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  FileJson,
  Layers3,
  Plus,
  Save,
  Sparkles,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { LoginExperience } from '@/components/auth/LoginExperience';
import { LandingPage } from '@/components/landing/LandingPage';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  AppPageConfig,
  BuilderIconKey,
  ContentItem,
  FaqItem,
  getDefaultPageConfig,
  LandingPageConfig,
  LandingStepItem,
  LoginHighlightItem,
  LoginPageConfig,
  SitePageKey,
  ToneKey,
} from '@/lib/site-page-config/schema';
import {
  getSitePageLabel,
  lyraCustomazeEditableSurfaces,
} from '@/lib/site-page-config/registry';
import { builderIconOptions, toneOptions } from '@/lib/site-page-config/ui';

type EditableDraft = LandingPageConfig | LoginPageConfig | AppPageConfig;

type AdminConfigResponse = {
  pageKey: SitePageKey;
  draftConfig: EditableDraft;
  publishedConfig: EditableDraft;
  createdAt: string | null;
  updatedAt: string | null;
  updatedByUserId: string | null;
  error?: string;
};

function isLandingConfig(config: EditableDraft): config is LandingPageConfig {
  return 'hero' in config && 'features' in config && 'faq' in config;
}

function isLoginConfig(config: EditableDraft): config is LoginPageConfig {
  return 'intro' in config && 'auth' in config;
}

function isAppConfig(config: EditableDraft): config is AppPageConfig {
  return (
    'sidebar' in config && 'appointments' in config && 'monitoring' in config
  );
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createId(prefix: string) {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function setByPath<T>(value: T, path: string[], nextValue: unknown): T {
  const draft = cloneValue(value);
  let cursor: unknown = draft;

  for (let index = 0; index < path.length - 1; index += 1) {
    cursor = (cursor as Record<string, unknown>)[path[index]];
  }

  (cursor as Record<string, unknown>)[path[path.length - 1]] = nextValue;
  return draft;
}

function updateArrayItemByPath<T>(
  value: T,
  path: string[],
  itemIndex: number,
  updater: (current: Record<string, unknown>) => Record<string, unknown>
): T {
  const draft = cloneValue(value);
  let cursor: unknown = draft;

  for (const segment of path) {
    cursor = (cursor as Record<string, unknown>)[segment];
  }

  const items = cursor as Array<Record<string, unknown>>;
  items[itemIndex] = updater(items[itemIndex]);
  return draft;
}

function appendToArrayByPath<T>(
  value: T,
  path: string[],
  nextItem: unknown
): T {
  const draft = cloneValue(value);
  let cursor: unknown = draft;

  for (const segment of path) {
    cursor = (cursor as Record<string, unknown>)[segment];
  }

  (cursor as unknown[]).push(nextItem);
  return draft;
}

function removeFromArrayByPath<T>(
  value: T,
  path: string[],
  itemIndex: number
): T {
  const draft = cloneValue(value);
  let cursor: unknown = draft;

  for (const segment of path) {
    cursor = (cursor as Record<string, unknown>)[segment];
  }

  (cursor as unknown[]).splice(itemIndex, 1);
  return draft;
}

function moveInArrayByPath<T>(
  value: T,
  path: string[],
  itemIndex: number,
  direction: -1 | 1
): T {
  const draft = cloneValue(value);
  let cursor: unknown = draft;

  for (const segment of path) {
    cursor = (cursor as Record<string, unknown>)[segment];
  }

  const items = cursor as unknown[];
  const nextIndex = itemIndex + direction;

  if (nextIndex < 0 || nextIndex >= items.length) {
    return draft;
  }

  const [movedItem] = items.splice(itemIndex, 1);
  items.splice(nextIndex, 0, movedItem);
  return draft;
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TypographySliderField({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <div className="rounded-[20px] border border-border/70 bg-white/82 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Badge variant="secondary">{value.toFixed(2)}x</Badge>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <Slider
          min={0.8}
          max={1.4}
          step={0.05}
          value={[value]}
          onValueChange={(values) => onValueChange(values[0] ?? value)}
        />
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          <span>menor</span>
          <span>base</span>
          <span>maior</span>
        </div>
      </div>
    </div>
  );
}

function SwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-border/70 bg-white/82 px-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-6 text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function ItemShell({
  title,
  children,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  title: string;
  children: React.ReactNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-border/70 bg-white/84">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>
            Edite o bloco, reposicione ou remova.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={onMoveUp}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
            <Plus className="h-4 w-4 rotate-45" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

function ToneSelectField({
  value,
  onValueChange,
}: {
  value: ToneKey;
  onValueChange: (value: ToneKey) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as ToneKey)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {toneOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function IconSelectField({
  value,
  onValueChange,
}: {
  value: BuilderIconKey;
  onValueChange: (value: BuilderIconKey) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as BuilderIconKey)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {builderIconOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function buildContentItem(prefix: string): ContentItem {
  return {
    id: createId(prefix),
    title: 'Novo bloco',
    description: 'Descreva aqui o que este bloco entrega na experiencia.',
    icon: 'sparkles',
    tone: 'primary',
  };
}

function buildStepItem(): LandingStepItem {
  return {
    id: createId('landing-step'),
    step: '00',
    title: 'Nova etapa',
    description: 'Explique a jornada desta etapa.',
    icon: 'sparkles' as BuilderIconKey,
  };
}

function buildFaqItem(): FaqItem {
  return {
    id: createId('landing-faq'),
    question: 'Nova pergunta',
    answer: 'Nova resposta',
  };
}

function buildLoginHighlightItem(): LoginHighlightItem {
  return {
    id: createId('login-highlight'),
    title: 'Novo destaque',
    description: 'Mostre aqui um diferencial importante do login.',
    icon: 'sparkles',
    tone: 'primary',
  };
}

function buildAppNavigationItem() {
  return {
    href: '/nova-rota',
    label: 'Novo item',
    description: 'Explique o propósito deste ponto de navegação.',
    visible: true,
  };
}

function AppExperiencePreview({ config }: { config: AppPageConfig }) {
  const visibleItems = config.sidebar.items.filter((item) => item.visible);

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,rgba(249,248,252,0.98),rgba(255,255,255,0.98))] p-6">
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/88 shadow-sm">
          <CardHeader className="gap-4">
            <div className="rounded-[22px] border border-border/70 bg-gradient-to-br from-white via-white to-cosmic-light/45 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                {config.sidebar.brandEyebrow}
              </p>
              <CardTitle className="mt-2 text-3xl lowercase">
                {config.sidebar.brandTitle}
              </CardTitle>
            </div>
            <CardDescription>
              Sidebar prevista com largura de {config.sizing.sidebarWidth}px e{' '}
              {visibleItems.length} itens visíveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[20px] border border-border/70 bg-cosmic-light/45 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {config.sidebar.statusEyebrow}
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {config.sidebar.statusTitle}
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(config.sidebar.sectionLabels).map(
                ([sectionKey, label]) => (
                  <div
                    key={sectionKey}
                    className="rounded-[18px] border border-border/60 bg-white/90 px-4 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {sectionKey}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {label}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="rounded-[20px] border border-border/70 bg-white/90 p-4">
              <p className="text-sm font-semibold text-foreground">
                {config.sidebar.preferencesTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {config.sidebar.preferencesDescription}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-border/70 bg-white/88 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Header do app
                  </p>
                  <CardTitle className="mt-2 text-2xl">
                    {config.header.commandPlaceholder}
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    atalho {config.header.commandShortcutLabel}
                  </Badge>
                  <Badge variant="cosmic">{config.header.assistantLabel}</Badge>
                </div>
              </div>
              <CardDescription>
                Menu do perfil: {config.header.profileMenuLabel}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border/70 bg-white/88 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {config.dashboard.pulseTitle}
                </CardTitle>
                <CardDescription>
                  {config.dashboard.pulseDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{config.dashboard.heroEyebrow}</p>
                <p>{config.dashboard.harmonyEyebrow}</p>
                <p>{config.dashboard.weeklyTitle}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">{config.dashboard.pulseBadge}</Badge>
                  <Badge variant="cosmic">{config.dashboard.astroBadge}</Badge>
                  <Badge variant="info">{config.dashboard.sleepBadge}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/88 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {config.appointments.heroTitle}
                </CardTitle>
                <CardDescription>
                  {config.appointments.heroDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{config.appointments.listTitle}</p>
                <p>{config.appointments.professionalsTitle}</p>
                <p>{config.appointments.calendarTitle}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      config.appointments.showUpcomingList
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    lista
                  </Badge>
                  <Badge
                    variant={
                      config.appointments.showProfessionalsList
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    profissionais
                  </Badge>
                  <Badge
                    variant={
                      config.appointments.showCalendar ? 'success' : 'secondary'
                    }
                  >
                    calendário
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/88 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {config.monitoring.pageTitle}
                </CardTitle>
                <CardDescription>
                  {config.monitoring.pageDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{config.monitoring.infoTitle}</p>
                <p>{config.monitoring.controlsTitle}</p>
                <p>{config.monitoring.alertsTitle}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      config.monitoring.showEventFeed ? 'success' : 'secondary'
                    }
                  >
                    feed
                  </Badge>
                  <Badge
                    variant={
                      config.monitoring.showVoiceButton
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    voz
                  </Badge>
                  <Badge
                    variant={
                      config.monitoring.showAlertsButton
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    alertas
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/88 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {config.profile.pageTitle}
                </CardTitle>
                <CardDescription>
                  {config.profile.pageDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{config.profile.pageEyebrow}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 bg-white/88 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Navegação visível</CardTitle>
              <CardDescription>
                Itens ativos conforme o rascunho atual da experiência interna.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {visibleItems.map((item) => (
                <div
                  key={item.href}
                  className="rounded-[20px] border border-border/70 bg-white/92 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <Badge variant="outline">{item.href}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function SiteExperienceBuilder() {
  const [pageKey, setPageKey] = useState<SitePageKey>('landing');
  const [draftConfig, setDraftConfig] = useState<EditableDraft>(
    getDefaultPageConfig('landing')
  );
  const [publishedConfig, setPublishedConfig] = useState<EditableDraft>(
    getDefaultPageConfig('landing')
  );
  const [jsonValue, setJsonValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [meta, setMeta] = useState<{
    updatedAt: string | null;
    updatedByUserId: string | null;
  }>({
    updatedAt: null,
    updatedByUserId: null,
  });

  useEffect(() => {
    async function loadPage() {
      setLoading(true);

      try {
        const response = await fetch(`/api/admin/page-config/${pageKey}`, {
          cache: 'no-store',
        });
        const payload = (await response.json()) as AdminConfigResponse;

        if (!response.ok) {
          throw new Error(payload.error || 'Falha ao carregar o editor.');
        }

        setDraftConfig(payload.draftConfig);
        setPublishedConfig(payload.publishedConfig);
        setMeta({
          updatedAt: payload.updatedAt,
          updatedByUserId: payload.updatedByUserId,
        });
      } catch (error) {
        toast.error('Nao foi possivel carregar o editor.', {
          description:
            error instanceof Error ? error.message : 'Falha desconhecida.',
        });

        const fallback = getDefaultPageConfig(pageKey);
        setDraftConfig(fallback);
        setPublishedConfig(cloneValue(fallback));
        setMeta({
          updatedAt: null,
          updatedByUserId: null,
        });
      } finally {
        setLoading(false);
      }
    }

    void loadPage();
  }, [pageKey]);

  useEffect(() => {
    setJsonValue(JSON.stringify(draftConfig, null, 2));
  }, [draftConfig]);

  const normalizedLandingDraft = useMemo(() => {
    return isLandingConfig(draftConfig)
      ? draftConfig
      : getDefaultPageConfig('landing');
  }, [draftConfig]);

  const normalizedLoginDraft = useMemo(() => {
    return isLoginConfig(draftConfig)
      ? draftConfig
      : getDefaultPageConfig('login');
  }, [draftConfig]);

  const normalizedAppDraft = useMemo(() => {
    return isAppConfig(draftConfig) ? draftConfig : getDefaultPageConfig('app');
  }, [draftConfig]);

  const preview = useMemo(() => {
    if (pageKey === 'landing') {
      return (
        <LandingPage overrideConfig={normalizedLandingDraft} previewMode />
      );
    }

    if (pageKey === 'login') {
      return (
        <LoginExperience overrideConfig={normalizedLoginDraft} previewMode />
      );
    }

    return <AppExperiencePreview config={normalizedAppDraft} />;
  }, [
    normalizedAppDraft,
    normalizedLandingDraft,
    normalizedLoginDraft,
    pageKey,
  ]);

  const hasDraftChanges =
    JSON.stringify(draftConfig) !== JSON.stringify(publishedConfig);

  const landingDraft = normalizedLandingDraft;
  const loginDraft = normalizedLoginDraft;
  const appDraft = normalizedAppDraft;

  function updateDraft(path: string[], nextValue: unknown) {
    setDraftConfig((current) => setByPath(current, path, nextValue));
  }

  function updateListItem(
    path: string[],
    itemIndex: number,
    key: string,
    nextValue: unknown
  ) {
    setDraftConfig((current) =>
      updateArrayItemByPath(current, path, itemIndex, (item) => ({
        ...item,
        [key]: nextValue,
      }))
    );
  }

  function addListItem(path: string[], nextItem: unknown) {
    setDraftConfig((current) => appendToArrayByPath(current, path, nextItem));
  }

  function removeListItem(path: string[], itemIndex: number) {
    setDraftConfig((current) =>
      removeFromArrayByPath(current, path, itemIndex)
    );
  }

  function moveListItem(path: string[], itemIndex: number, direction: -1 | 1) {
    setDraftConfig((current) =>
      moveInArrayByPath(current, path, itemIndex, direction)
    );
  }

  async function saveDraft(nextConfig: EditableDraft) {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/page-config/${pageKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: nextConfig }),
      });
      const payload = (await response.json()) as AdminConfigResponse;

      if (!response.ok) {
        throw new Error(payload.error || 'Falha ao salvar o rascunho.');
      }

      setDraftConfig(payload.draftConfig);
      setPublishedConfig(payload.publishedConfig);
      setMeta({
        updatedAt: payload.updatedAt,
        updatedByUserId: payload.updatedByUserId,
      });
      toast.success('Rascunho salvo com sucesso.');
    } catch (error) {
      toast.error('Nao foi possivel salvar o rascunho.', {
        description:
          error instanceof Error ? error.message : 'Falha desconhecida.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function runAdminAction(
    action: 'publish' | 'restorePublished' | 'restoreDefaults'
  ) {
    setPublishing(true);

    try {
      const response = await fetch(`/api/admin/page-config/${pageKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json()) as AdminConfigResponse;

      if (!response.ok) {
        throw new Error(payload.error || 'Falha ao executar a acao.');
      }

      setDraftConfig(payload.draftConfig);
      setPublishedConfig(payload.publishedConfig);
      setMeta({
        updatedAt: payload.updatedAt,
        updatedByUserId: payload.updatedByUserId,
      });

      toast.success(
        action === 'publish'
          ? 'Experiencia publicada com sucesso.'
          : action === 'restorePublished'
            ? 'Rascunho restaurado a partir da versao publicada.'
            : 'Rascunho restaurado para o estado padrao.'
      );
    } catch (error) {
      toast.error('Nao foi possivel executar a acao.', {
        description:
          error instanceof Error ? error.message : 'Falha desconhecida.',
      });
    } finally {
      setPublishing(false);
    }
  }

  function applyJsonLocally() {
    try {
      setDraftConfig(JSON.parse(jsonValue) as EditableDraft);
      toast.success('JSON aplicado no preview local.');
    } catch (error) {
      toast.error('JSON invalido.', {
        description:
          error instanceof Error ? error.message : 'Falha ao ler o JSON.',
      });
    }
  }

  async function saveJsonDraft() {
    try {
      await saveDraft(JSON.parse(jsonValue) as EditableDraft);
    } catch {
      toast.error('JSON invalido.', {
        description: 'Corrija o JSON antes de salvar no backend.',
      });
    }
  }

  function renderLandingEditor() {
    return (
      <Accordion
        type="multiple"
        defaultValue={['hero', 'typography', 'sections', 'features', 'faq']}
        className="flex flex-col gap-4"
      >
        <AccordionItem value="hero">
          <AccordionTrigger>Hero, entrada e preview inicial</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <FieldBlock label="Login simples do topo">
              <Input
                value={landingDraft.header.loginLabel}
                onChange={(event) =>
                  updateDraft(['header', 'loginLabel'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Login completo do topo">
              <Input
                value={landingDraft.header.fullLoginLabel}
                onChange={(event) =>
                  updateDraft(['header', 'fullLoginLabel'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Badge do hero">
              <Input
                value={landingDraft.hero.badgeText}
                onChange={(event) =>
                  updateDraft(['hero', 'badgeText'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo principal">
              <Input
                value={landingDraft.hero.title}
                onChange={(event) =>
                  updateDraft(['hero', 'title'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo em destaque">
              <Input
                value={landingDraft.hero.accentTitle}
                onChange={(event) =>
                  updateDraft(['hero', 'accentTitle'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Descricao">
              <Textarea
                value={landingDraft.hero.description}
                onChange={(event) =>
                  updateDraft(['hero', 'description'], event.target.value)
                }
              />
            </FieldBlock>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock label="CTA principal">
                <Input
                  value={landingDraft.hero.primaryCtaLabel}
                  onChange={(event) =>
                    updateDraft(['hero', 'primaryCtaLabel'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Link do CTA principal">
                <Input
                  value={landingDraft.hero.primaryCtaHref}
                  onChange={(event) =>
                    updateDraft(['hero', 'primaryCtaHref'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="CTA secundario">
                <Input
                  value={landingDraft.hero.secondaryCtaLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['hero', 'secondaryCtaLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Link do CTA secundario">
                <Input
                  value={landingDraft.hero.secondaryCtaHref}
                  onChange={(event) =>
                    updateDraft(
                      ['hero', 'secondaryCtaHref'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock label="Badge da entrada rapida">
                <Input
                  value={landingDraft.hero.quickAuthBadge}
                  onChange={(event) =>
                    updateDraft(['hero', 'quickAuthBadge'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Titulo da entrada rapida">
                <Input
                  value={landingDraft.hero.quickAuthTitle}
                  onChange={(event) =>
                    updateDraft(['hero', 'quickAuthTitle'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Botao principal da entrada rapida">
                <Input
                  value={landingDraft.hero.quickAuthSubmitLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['hero', 'quickAuthSubmitLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Botao secundario da entrada rapida">
                <Input
                  value={landingDraft.hero.quickAuthSecondaryLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['hero', 'quickAuthSecondaryLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
            </div>
            <FieldBlock label="Descricao da entrada rapida">
              <Textarea
                value={landingDraft.hero.quickAuthDescription}
                onChange={(event) =>
                  updateDraft(
                    ['hero', 'quickAuthDescription'],
                    event.target.value
                  )
                }
              />
            </FieldBlock>
            <FieldBlock label="Badge do preview">
              <Input
                value={landingDraft.hero.previewBadge}
                onChange={(event) =>
                  updateDraft(['hero', 'previewBadge'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo do preview">
              <Input
                value={landingDraft.hero.previewTitle}
                onChange={(event) =>
                  updateDraft(['hero', 'previewTitle'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Descricao do preview">
              <Textarea
                value={landingDraft.hero.previewDescription}
                onChange={(event) =>
                  updateDraft(
                    ['hero', 'previewDescription'],
                    event.target.value
                  )
                }
              />
            </FieldBlock>
            <div className="flex items-center justify-between rounded-[20px] border border-border/70 bg-white/82 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Cards do preview inicial
                </p>
                <p className="text-xs leading-6 text-muted-foreground">
                  Adicione, reordene e personalize os cards da vitrine
                  principal.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  addListItem(
                    ['hero', 'previewItems'],
                    buildContentItem('landing-preview')
                  )
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar card
              </Button>
            </div>
            {landingDraft.hero.previewItems.map((item, index) => (
              <ItemShell
                key={item.id}
                title={item.title || `Card ${index + 1}`}
                onMoveUp={() =>
                  moveListItem(['hero', 'previewItems'], index, -1)
                }
                onMoveDown={() =>
                  moveListItem(['hero', 'previewItems'], index, 1)
                }
                onRemove={() => removeListItem(['hero', 'previewItems'], index)}
              >
                <FieldBlock label="Titulo">
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateListItem(
                        ['hero', 'previewItems'],
                        index,
                        'title',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Descricao">
                  <Textarea
                    value={item.description}
                    onChange={(event) =>
                      updateListItem(
                        ['hero', 'previewItems'],
                        index,
                        'description',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock label="Icone">
                    <IconSelectField
                      value={item.icon}
                      onValueChange={(nextValue) =>
                        updateListItem(
                          ['hero', 'previewItems'],
                          index,
                          'icon',
                          nextValue
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Tom visual">
                    <ToneSelectField
                      value={item.tone}
                      onValueChange={(nextValue) =>
                        updateListItem(
                          ['hero', 'previewItems'],
                          index,
                          'tone',
                          nextValue
                        )
                      }
                    />
                  </FieldBlock>
                </div>
              </ItemShell>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="typography">
          <AccordionTrigger>Tipografia e escala visual</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TypographySliderField
                label="Hero principal"
                description="Controla o tamanho do titulo principal da landing."
                value={landingDraft.typography.heroTitle}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'heroTitle'], nextValue)
                }
              />
              <TypographySliderField
                label="Texto do hero"
                description="Ajusta o paragrafo principal logo abaixo do titulo."
                value={landingDraft.typography.heroBody}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'heroBody'], nextValue)
                }
              />
              <TypographySliderField
                label="Titulos de secao"
                description="Afeta recursos, metricas, fluxo, planos, FAQ e CTA final."
                value={landingDraft.typography.sectionTitle}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'sectionTitle'], nextValue)
                }
              />
              <TypographySliderField
                label="Textos de secao"
                description="Ajusta descricoes de blocos e introducoes das secoes."
                value={landingDraft.typography.sectionBody}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'sectionBody'], nextValue)
                }
              />
              <TypographySliderField
                label="Titulos de cards"
                description="Controla titulos de cards do hero, recursos e planos."
                value={landingDraft.typography.cardTitle}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'cardTitle'], nextValue)
                }
              />
              <TypographySliderField
                label="Corpo dos cards"
                description="Ajusta descricoes internas dos cards da landing."
                value={landingDraft.typography.cardBody}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'cardBody'], nextValue)
                }
              />
              <TypographySliderField
                label="Rotulos de botoes"
                description="Ajusta o tamanho dos CTAs e botoes de navegacao da landing."
                value={landingDraft.typography.buttonLabel}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'buttonLabel'], nextValue)
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sections">
          <AccordionTrigger>
            Secoes principais, CTA final e ordem
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <SwitchRow
              title="Exibir recursos"
              description="Liga ou desliga a secao de recursos."
              checked={landingDraft.features.visible}
              onCheckedChange={(checked) =>
                updateDraft(['features', 'visible'], checked)
              }
            />
            <SwitchRow
              title="Exibir metricas"
              description="Liga ou desliga a secao de metricas."
              checked={landingDraft.metrics.visible}
              onCheckedChange={(checked) =>
                updateDraft(['metrics', 'visible'], checked)
              }
            />
            <SwitchRow
              title="Exibir fluxo"
              description="Liga ou desliga a secao de fluxo."
              checked={landingDraft.flow.visible}
              onCheckedChange={(checked) =>
                updateDraft(['flow', 'visible'], checked)
              }
            />
            <SwitchRow
              title="Exibir planos"
              description="Liga ou desliga a vitrine dos planos reais."
              checked={landingDraft.plans.visible}
              onCheckedChange={(checked) =>
                updateDraft(['plans', 'visible'], checked)
              }
            />
            <SwitchRow
              title="Exibir FAQ"
              description="Liga ou desliga a secao de perguntas."
              checked={landingDraft.faq.visible}
              onCheckedChange={(checked) =>
                updateDraft(['faq', 'visible'], checked)
              }
            />
            <SwitchRow
              title="Exibir CTA final"
              description="Liga ou desliga o bloco final da landing."
              checked={landingDraft.finalCta.visible}
              onCheckedChange={(checked) =>
                updateDraft(['finalCta', 'visible'], checked)
              }
            />
            <FieldBlock label="Titulo da secao de recursos">
              <Input
                value={landingDraft.features.title}
                onChange={(event) =>
                  updateDraft(['features', 'title'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo da secao de metricas">
              <Input
                value={landingDraft.metrics.title}
                onChange={(event) =>
                  updateDraft(['metrics', 'title'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo da secao de fluxo">
              <Input
                value={landingDraft.flow.title}
                onChange={(event) =>
                  updateDraft(['flow', 'title'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo da secao de planos">
              <Input
                value={landingDraft.plans.title}
                onChange={(event) =>
                  updateDraft(['plans', 'title'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo da secao de FAQ">
              <Input
                value={landingDraft.faq.title}
                onChange={(event) =>
                  updateDraft(['faq', 'title'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo do CTA final">
              <Input
                value={landingDraft.finalCta.title}
                onChange={(event) =>
                  updateDraft(['finalCta', 'title'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Descricao do CTA final">
              <Textarea
                value={landingDraft.finalCta.description}
                onChange={(event) =>
                  updateDraft(['finalCta', 'description'], event.target.value)
                }
              />
            </FieldBlock>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock label="Botao principal do CTA final">
                <Input
                  value={landingDraft.finalCta.primaryLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['finalCta', 'primaryLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Link do botao principal">
                <Input
                  value={landingDraft.finalCta.primaryHref}
                  onChange={(event) =>
                    updateDraft(['finalCta', 'primaryHref'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Botao secundario do CTA final">
                <Input
                  value={landingDraft.finalCta.secondaryLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['finalCta', 'secondaryLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Link do botao secundario">
                <Input
                  value={landingDraft.finalCta.secondaryHref}
                  onChange={(event) =>
                    updateDraft(
                      ['finalCta', 'secondaryHref'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Marca do rodape">
                <Input
                  value={landingDraft.footer.brandLine}
                  onChange={(event) =>
                    updateDraft(['footer', 'brandLine'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Nota do rodape">
                <Input
                  value={landingDraft.footer.note}
                  onChange={(event) =>
                    updateDraft(['footer', 'note'], event.target.value)
                  }
                />
              </FieldBlock>
            </div>
            <div className="rounded-[24px] border border-border/70 bg-white/82 p-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground">
                  Ordem das secoes da landing
                </p>
                <p className="text-xs leading-6 text-muted-foreground">
                  O preview e a pagina publicada respeitam esta ordem.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {landingDraft.sectionOrder.map((sectionKey, index) => (
                  <div
                    key={`${sectionKey}-${index}`}
                    className="flex items-center justify-between rounded-[18px] border border-border/70 bg-background px-4 py-3"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {sectionKey}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          moveListItem(['sectionOrder'], index, -1)
                        }
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveListItem(['sectionOrder'], index, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger>Cards de recursos</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-[20px] border border-border/70 bg-white/82 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Lista de recursos
                </p>
                <p className="text-xs leading-6 text-muted-foreground">
                  Controle titulo, texto, icone e tom visual de cada card.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  addListItem(
                    ['features', 'items'],
                    buildContentItem('landing-feature')
                  )
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar card
              </Button>
            </div>
            {landingDraft.features.items.map((item, index) => (
              <ItemShell
                key={item.id}
                title={item.title || `Recurso ${index + 1}`}
                onMoveUp={() => moveListItem(['features', 'items'], index, -1)}
                onMoveDown={() => moveListItem(['features', 'items'], index, 1)}
                onRemove={() => removeListItem(['features', 'items'], index)}
              >
                <FieldBlock label="Titulo">
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateListItem(
                        ['features', 'items'],
                        index,
                        'title',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Descricao">
                  <Textarea
                    value={item.description}
                    onChange={(event) =>
                      updateListItem(
                        ['features', 'items'],
                        index,
                        'description',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock label="Icone">
                    <IconSelectField
                      value={item.icon}
                      onValueChange={(nextValue) =>
                        updateListItem(
                          ['features', 'items'],
                          index,
                          'icon',
                          nextValue
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Tom visual">
                    <ToneSelectField
                      value={item.tone}
                      onValueChange={(nextValue) =>
                        updateListItem(
                          ['features', 'items'],
                          index,
                          'tone',
                          nextValue
                        )
                      }
                    />
                  </FieldBlock>
                </div>
              </ItemShell>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq">
          <AccordionTrigger>FAQ e etapas do fluxo</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-[20px] border border-border/70 bg-white/82 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Etapas do fluxo
                </p>
                <p className="text-xs leading-6 text-muted-foreground">
                  Mude numero, texto e icone de cada etapa da jornada.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addListItem(['flow', 'items'], buildStepItem())}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar etapa
              </Button>
            </div>
            {landingDraft.flow.items.map((item, index) => (
              <ItemShell
                key={item.id}
                title={item.title || `Etapa ${index + 1}`}
                onMoveUp={() => moveListItem(['flow', 'items'], index, -1)}
                onMoveDown={() => moveListItem(['flow', 'items'], index, 1)}
                onRemove={() => removeListItem(['flow', 'items'], index)}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock label="Numero">
                    <Input
                      value={item.step}
                      onChange={(event) =>
                        updateListItem(
                          ['flow', 'items'],
                          index,
                          'step',
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Icone">
                    <IconSelectField
                      value={item.icon}
                      onValueChange={(nextValue) =>
                        updateListItem(
                          ['flow', 'items'],
                          index,
                          'icon',
                          nextValue
                        )
                      }
                    />
                  </FieldBlock>
                </div>
                <FieldBlock label="Titulo">
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateListItem(
                        ['flow', 'items'],
                        index,
                        'title',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Descricao">
                  <Textarea
                    value={item.description}
                    onChange={(event) =>
                      updateListItem(
                        ['flow', 'items'],
                        index,
                        'description',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
              </ItemShell>
            ))}
            <div className="flex items-center justify-between rounded-[20px] border border-border/70 bg-white/82 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Perguntas do FAQ
                </p>
                <p className="text-xs leading-6 text-muted-foreground">
                  Adicione, reordene ou remova itens do FAQ.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addListItem(['faq', 'items'], buildFaqItem())}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar pergunta
              </Button>
            </div>
            {landingDraft.faq.items.map((item, index) => (
              <ItemShell
                key={item.id}
                title={item.question || `Pergunta ${index + 1}`}
                onMoveUp={() => moveListItem(['faq', 'items'], index, -1)}
                onMoveDown={() => moveListItem(['faq', 'items'], index, 1)}
                onRemove={() => removeListItem(['faq', 'items'], index)}
              >
                <FieldBlock label="Pergunta">
                  <Input
                    value={item.question}
                    onChange={(event) =>
                      updateListItem(
                        ['faq', 'items'],
                        index,
                        'question',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Resposta">
                  <Textarea
                    value={item.answer}
                    onChange={(event) =>
                      updateListItem(
                        ['faq', 'items'],
                        index,
                        'answer',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
              </ItemShell>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  function renderLoginEditor() {
    return (
      <Accordion
        type="multiple"
        defaultValue={['intro', 'typography', 'auth']}
        className="flex flex-col gap-4"
      >
        <AccordionItem value="intro">
          <AccordionTrigger>Painel esquerdo da experiencia</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <SwitchRow
              title="Exibir painel esquerdo"
              description="Se desligar, o card de autenticacao assume protagonismo total."
              checked={loginDraft.intro.visible}
              onCheckedChange={(checked) =>
                updateDraft(['intro', 'visible'], checked)
              }
            />
            <FieldBlock label="Badge">
              <Input
                value={loginDraft.intro.badgeText}
                onChange={(event) =>
                  updateDraft(['intro', 'badgeText'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo">
              <Input
                value={loginDraft.intro.title}
                onChange={(event) =>
                  updateDraft(['intro', 'title'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Titulo em destaque">
              <Input
                value={loginDraft.intro.accentTitle}
                onChange={(event) =>
                  updateDraft(['intro', 'accentTitle'], event.target.value)
                }
              />
            </FieldBlock>
            <FieldBlock label="Descricao">
              <Textarea
                value={loginDraft.intro.description}
                onChange={(event) =>
                  updateDraft(['intro', 'description'], event.target.value)
                }
              />
            </FieldBlock>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock label="Eyebrow da nota">
                <Input
                  value={loginDraft.intro.noteEyebrow}
                  onChange={(event) =>
                    updateDraft(['intro', 'noteEyebrow'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Nota">
                <Textarea
                  value={loginDraft.intro.noteText}
                  onChange={(event) =>
                    updateDraft(['intro', 'noteText'], event.target.value)
                  }
                />
              </FieldBlock>
            </div>
            <div className="flex items-center justify-between rounded-[20px] border border-border/70 bg-white/82 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Highlights do painel
                </p>
                <p className="text-xs leading-6 text-muted-foreground">
                  Adicione cards para tornar o login mais amigavel e
                  explicativo.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  addListItem(
                    ['intro', 'highlights'],
                    buildLoginHighlightItem()
                  )
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar destaque
              </Button>
            </div>
            {loginDraft.intro.highlights.map((item, index) => (
              <ItemShell
                key={item.id}
                title={item.title || `Destaque ${index + 1}`}
                onMoveUp={() =>
                  moveListItem(['intro', 'highlights'], index, -1)
                }
                onMoveDown={() =>
                  moveListItem(['intro', 'highlights'], index, 1)
                }
                onRemove={() => removeListItem(['intro', 'highlights'], index)}
              >
                <FieldBlock label="Titulo">
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateListItem(
                        ['intro', 'highlights'],
                        index,
                        'title',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Descricao">
                  <Textarea
                    value={item.description}
                    onChange={(event) =>
                      updateListItem(
                        ['intro', 'highlights'],
                        index,
                        'description',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock label="Icone">
                    <IconSelectField
                      value={item.icon}
                      onValueChange={(nextValue) =>
                        updateListItem(
                          ['intro', 'highlights'],
                          index,
                          'icon',
                          nextValue
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Tom visual">
                    <ToneSelectField
                      value={item.tone}
                      onValueChange={(nextValue) =>
                        updateListItem(
                          ['intro', 'highlights'],
                          index,
                          'tone',
                          nextValue
                        )
                      }
                    />
                  </FieldBlock>
                </div>
              </ItemShell>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="typography">
          <AccordionTrigger>Tipografia e escala visual</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TypographySliderField
                label="Titulo do painel esquerdo"
                description="Controla o tamanho do titulo principal da experiencia de login."
                value={loginDraft.typography.introTitle}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'introTitle'], nextValue)
                }
              />
              <TypographySliderField
                label="Texto do painel esquerdo"
                description="Ajusta descricao e nota da area introdutoria."
                value={loginDraft.typography.introBody}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'introBody'], nextValue)
                }
              />
              <TypographySliderField
                label="Titulos dos destaques"
                description="Ajusta os titulos dos cards explicativos do login."
                value={loginDraft.typography.highlightTitle}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'highlightTitle'], nextValue)
                }
              />
              <TypographySliderField
                label="Descricoes dos destaques"
                description="Controla o texto dos cards do painel esquerdo."
                value={loginDraft.typography.highlightBody}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'highlightBody'], nextValue)
                }
              />
              <TypographySliderField
                label="Titulo do card de auth"
                description="Ajusta a hierarquia principal do card de autenticacao."
                value={loginDraft.typography.authTitle}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'authTitle'], nextValue)
                }
              />
              <TypographySliderField
                label="Texto do card de auth"
                description="Ajusta descricoes, apoio e contexto do formulario."
                value={loginDraft.typography.authBody}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'authBody'], nextValue)
                }
              />
              <TypographySliderField
                label="Labels dos campos"
                description="Controla o tamanho das labels dos formularios."
                value={loginDraft.typography.fieldLabel}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'fieldLabel'], nextValue)
                }
              />
              <TypographySliderField
                label="Rotulos dos botoes"
                description="Ajusta o texto dos botoes principais do login."
                value={loginDraft.typography.buttonLabel}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'buttonLabel'], nextValue)
                }
              />
              <TypographySliderField
                label="Rodape do card"
                description="Controla o texto final e o bloco de apoio do login."
                value={loginDraft.typography.footerText}
                onValueChange={(nextValue) =>
                  updateDraft(['typography', 'footerText'], nextValue)
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="auth">
          <AccordionTrigger>Card de autenticacao</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <FieldBlock label="Badge">
              <Input
                value={loginDraft.auth.badgeText}
                onChange={(event) =>
                  updateDraft(['auth', 'badgeText'], event.target.value)
                }
              />
            </FieldBlock>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock label="Marca">
                <Input
                  value={loginDraft.auth.brandText}
                  onChange={(event) =>
                    updateDraft(['auth', 'brandText'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Titulo">
                <Input
                  value={loginDraft.auth.title}
                  onChange={(event) =>
                    updateDraft(['auth', 'title'], event.target.value)
                  }
                />
              </FieldBlock>
            </div>
            <FieldBlock label="Descricao">
              <Textarea
                value={loginDraft.auth.description}
                onChange={(event) =>
                  updateDraft(['auth', 'description'], event.target.value)
                }
              />
            </FieldBlock>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock label="Aba entrar">
                <Input
                  value={loginDraft.auth.loginTabLabel}
                  onChange={(event) =>
                    updateDraft(['auth', 'loginTabLabel'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Aba criar conta">
                <Input
                  value={loginDraft.auth.registerTabLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['auth', 'registerTabLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Label de email">
                <Input
                  value={loginDraft.auth.emailLabel}
                  onChange={(event) =>
                    updateDraft(['auth', 'emailLabel'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Label de senha">
                <Input
                  value={loginDraft.auth.passwordLabel}
                  onChange={(event) =>
                    updateDraft(['auth', 'passwordLabel'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Label de nome">
                <Input
                  value={loginDraft.auth.firstNameLabel}
                  onChange={(event) =>
                    updateDraft(['auth', 'firstNameLabel'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Label de sobrenome">
                <Input
                  value={loginDraft.auth.lastNameLabel}
                  onChange={(event) =>
                    updateDraft(['auth', 'lastNameLabel'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Botao entrar">
                <Input
                  value={loginDraft.auth.loginButtonLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['auth', 'loginButtonLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Botao criar conta">
                <Input
                  value={loginDraft.auth.registerButtonLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['auth', 'registerButtonLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Eyebrow do rodape">
                <Input
                  value={loginDraft.auth.footerEyebrow}
                  onChange={(event) =>
                    updateDraft(['auth', 'footerEyebrow'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Voltar para a landing">
                <Input
                  value={loginDraft.auth.backToLandingLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['auth', 'backToLandingLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
            </div>
            <FieldBlock label="Texto do rodape">
              <Textarea
                value={loginDraft.auth.footerText}
                onChange={(event) =>
                  updateDraft(['auth', 'footerText'], event.target.value)
                }
              />
            </FieldBlock>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  function renderAppEditor() {
    return (
      <Accordion type="multiple" defaultValue={['visual', 'sidebar', 'pages']}>
        <AccordionItem value="visual">
          <AccordionTrigger>Visual global do app</AccordionTrigger>
          <AccordionContent className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-2">
              <TypographySliderField
                label="Título de página"
                description="Ajusta o tamanho dos títulos principais das páginas internas."
                value={appDraft.typography.pageTitle}
                onValueChange={(value) =>
                  updateDraft(['typography', 'pageTitle'], value)
                }
              />
              <TypographySliderField
                label="Texto de página"
                description="Controla descrições e textos introdutórios das páginas."
                value={appDraft.typography.pageBody}
                onValueChange={(value) =>
                  updateDraft(['typography', 'pageBody'], value)
                }
              />
              <TypographySliderField
                label="Título de cards"
                description="Escala usada em títulos de cards e painéis do app."
                value={appDraft.typography.cardTitle}
                onValueChange={(value) =>
                  updateDraft(['typography', 'cardTitle'], value)
                }
              />
              <TypographySliderField
                label="Corpo de cards"
                description="Escala para descrições, apoio visual e conteúdos internos dos cards."
                value={appDraft.typography.cardBody}
                onValueChange={(value) =>
                  updateDraft(['typography', 'cardBody'], value)
                }
              />
              <TypographySliderField
                label="Botões"
                description="Ajusta o tamanho do texto em botões do app."
                value={appDraft.typography.buttonLabel}
                onValueChange={(value) =>
                  updateDraft(['typography', 'buttonLabel'], value)
                }
              />
              <TypographySliderField
                label="Rótulos de navegação"
                description="Escala usada na sidebar e em labels de navegação."
                value={appDraft.typography.navLabel}
                onValueChange={(value) =>
                  updateDraft(['typography', 'navLabel'], value)
                }
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <TypographySliderField
                label="Escala dos cards"
                description="Amplia ou reduz os cards internos do app."
                value={appDraft.sizing.cardScale}
                onValueChange={(value) =>
                  updateDraft(['sizing', 'cardScale'], value)
                }
              />
              <TypographySliderField
                label="Escala dos ícones"
                description="Ajusta o tamanho percebido dos ícones da interface."
                value={appDraft.sizing.iconScale}
                onValueChange={(value) =>
                  updateDraft(['sizing', 'iconScale'], value)
                }
              />
              <TypographySliderField
                label="Escala das tabelas"
                description="Controla a densidade visual das tabelas do app."
                value={appDraft.sizing.tableScale}
                onValueChange={(value) =>
                  updateDraft(['sizing', 'tableScale'], value)
                }
              />
              <TypographySliderField
                label="Escala dos botões"
                description="Ajusta a presença visual dos botões internos."
                value={appDraft.sizing.buttonScale}
                onValueChange={(value) =>
                  updateDraft(['sizing', 'buttonScale'], value)
                }
              />
            </div>

            <div className="rounded-[20px] border border-border/70 bg-white/82 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Largura da sidebar
                  </p>
                  <p className="text-xs leading-6 text-muted-foreground">
                    Defina a largura base da navegação lateral do app.
                  </p>
                </div>
                <Badge variant="secondary">
                  {appDraft.sizing.sidebarWidth}px
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                <Slider
                  min={240}
                  max={360}
                  step={4}
                  value={[appDraft.sizing.sidebarWidth]}
                  onValueChange={(values) =>
                    updateDraft(['sizing', 'sidebarWidth'], values[0] ?? 288)
                  }
                />
                <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  <span>compacta</span>
                  <span>equilibrada</span>
                  <span>ampla</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sidebar">
          <AccordionTrigger>Sidebar e branding</AccordionTrigger>
          <AccordionContent className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-2">
              <FieldBlock label="Marca principal">
                <Input
                  value={appDraft.sidebar.brandTitle}
                  onChange={(event) =>
                    updateDraft(['sidebar', 'brandTitle'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Eyebrow da marca">
                <Input
                  value={appDraft.sidebar.brandEyebrow}
                  onChange={(event) =>
                    updateDraft(['sidebar', 'brandEyebrow'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Eyebrow do estado do dia">
                <Input
                  value={appDraft.sidebar.statusEyebrow}
                  onChange={(event) =>
                    updateDraft(
                      ['sidebar', 'statusEyebrow'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Título do estado do dia">
                <Input
                  value={appDraft.sidebar.statusTitle}
                  onChange={(event) =>
                    updateDraft(['sidebar', 'statusTitle'], event.target.value)
                  }
                />
              </FieldBlock>
              <FieldBlock label="Título do bloco final">
                <Input
                  value={appDraft.sidebar.preferencesTitle}
                  onChange={(event) =>
                    updateDraft(
                      ['sidebar', 'preferencesTitle'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Descrição do bloco final">
                <Input
                  value={appDraft.sidebar.preferencesDescription}
                  onChange={(event) =>
                    updateDraft(
                      ['sidebar', 'preferencesDescription'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <FieldBlock label="Label da seção principal">
                <Input
                  value={appDraft.sidebar.sectionLabels.principal}
                  onChange={(event) =>
                    updateDraft(
                      ['sidebar', 'sectionLabels', 'principal'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Label do fluxo guiado">
                <Input
                  value={appDraft.sidebar.sectionLabels.guidedFlow}
                  onChange={(event) =>
                    updateDraft(
                      ['sidebar', 'sectionLabels', 'guidedFlow'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Label da seção pessoal">
                <Input
                  value={appDraft.sidebar.sectionLabels.personal}
                  onChange={(event) =>
                    updateDraft(
                      ['sidebar', 'sectionLabels', 'personal'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Label da seção admin">
                <Input
                  value={appDraft.sidebar.sectionLabels.admin}
                  onChange={(event) =>
                    updateDraft(
                      ['sidebar', 'sectionLabels', 'admin'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="nav-items">
          <AccordionTrigger>Navegação editável</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-[20px] border border-border/70 bg-white/82 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Itens da sidebar
                </p>
                <p className="text-xs leading-6 text-muted-foreground">
                  Reordene, oculte, reescreva e expanda a navegação interna.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  addListItem(['sidebar', 'items'], buildAppNavigationItem())
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo item
              </Button>
            </div>

            {appDraft.sidebar.items.map((item, index) => (
              <ItemShell
                key={`${item.href}-${index}`}
                title={item.label}
                onMoveUp={() => moveListItem(['sidebar', 'items'], index, -1)}
                onMoveDown={() => moveListItem(['sidebar', 'items'], index, 1)}
                onRemove={() => removeListItem(['sidebar', 'items'], index)}
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Rota">
                    <Input
                      value={item.href}
                      onChange={(event) =>
                        updateListItem(
                          ['sidebar', 'items'],
                          index,
                          'href',
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Label">
                    <Input
                      value={item.label}
                      onChange={(event) =>
                        updateListItem(
                          ['sidebar', 'items'],
                          index,
                          'label',
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>
                <FieldBlock label="Descrição">
                  <Textarea
                    value={item.description}
                    onChange={(event) =>
                      updateListItem(
                        ['sidebar', 'items'],
                        index,
                        'description',
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <SwitchRow
                  title="Item visível"
                  description="Desative para esconder este item sem removê-lo da configuração."
                  checked={item.visible}
                  onCheckedChange={(checked) =>
                    updateListItem(
                      ['sidebar', 'items'],
                      index,
                      'visible',
                      checked
                    )
                  }
                />
              </ItemShell>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="header">
          <AccordionTrigger>Header do app</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <FieldBlock label="Placeholder da busca global">
                <Input
                  value={appDraft.header.commandPlaceholder}
                  onChange={(event) =>
                    updateDraft(
                      ['header', 'commandPlaceholder'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Atalho da busca">
                <Input
                  value={appDraft.header.commandShortcutLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['header', 'commandShortcutLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Botão do assistente">
                <Input
                  value={appDraft.header.assistantLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['header', 'assistantLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="Menu de perfil">
                <Input
                  value={appDraft.header.profileMenuLabel}
                  onChange={(event) =>
                    updateDraft(
                      ['header', 'profileMenuLabel'],
                      event.target.value
                    )
                  }
                />
              </FieldBlock>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pages">
          <AccordionTrigger>Páginas internas</AccordionTrigger>
          <AccordionContent className="space-y-6">
            <Card className="border-border/70 bg-white/84">
              <CardHeader>
                <CardTitle className="text-base">Dashboard</CardTitle>
                <CardDescription>
                  Controle os textos-chave da home e dos grandes blocos do
                  painel principal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Eyebrow da home">
                    <Input
                      value={appDraft.dashboard.heroEyebrow}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'heroEyebrow'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Eyebrow da harmonia">
                    <Input
                      value={appDraft.dashboard.harmonyEyebrow}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'harmonyEyebrow'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <FieldBlock label="Descrição da home">
                  <Textarea
                    value={appDraft.dashboard.heroDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'heroDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <FieldBlock label="Nota da harmonia atual">
                  <Textarea
                    value={appDraft.dashboard.harmonyNote}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'harmonyNote'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <div className="grid gap-4 xl:grid-cols-3">
                  <FieldBlock label="Badge do pulso">
                    <Input
                      value={appDraft.dashboard.pulseBadge}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'pulseBadge'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Badge astral">
                    <Input
                      value={appDraft.dashboard.astroBadge}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'astroBadge'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Badge do sono">
                    <Input
                      value={appDraft.dashboard.sleepBadge}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'sleepBadge'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Título do pulso">
                    <Input
                      value={appDraft.dashboard.pulseTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'pulseTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Botão de sincronização">
                    <Input
                      value={appDraft.dashboard.syncButtonLabel}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'syncButtonLabel'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <FieldBlock label="Descrição do pulso">
                  <Textarea
                    value={appDraft.dashboard.pulseDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'pulseDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <div className="grid gap-4 xl:grid-cols-3">
                  <FieldBlock label="Status sincronizando">
                    <Input
                      value={appDraft.dashboard.syncStatusLoading}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'syncStatusLoading'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Status parcial">
                    <Input
                      value={appDraft.dashboard.syncStatusPartial}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'syncStatusPartial'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Status pronto">
                    <Input
                      value={appDraft.dashboard.syncStatusReady}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'syncStatusReady'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Fallback do título astral">
                    <Input
                      value={appDraft.dashboard.astroCardFallbackTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'astroCardFallbackTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Label do insight astral">
                    <Input
                      value={appDraft.dashboard.astroInsightLabel}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'astroInsightLabel'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <FieldBlock label="Fallback da descrição astral">
                  <Textarea
                    value={appDraft.dashboard.astroCardFallbackDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'astroCardFallbackDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <FieldBlock label="Fallback do insight astral">
                  <Textarea
                    value={appDraft.dashboard.astroInsightFallback}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'astroInsightFallback'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <div className="grid gap-4 xl:grid-cols-3">
                  <FieldBlock label="Label da meta de sono">
                    <Input
                      value={appDraft.dashboard.sleepGoalLabel}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'sleepGoalLabel'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Label do sono profundo">
                    <Input
                      value={appDraft.dashboard.deepSleepLabel}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'deepSleepLabel'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Label do sono REM">
                    <Input
                      value={appDraft.dashboard.remSleepLabel}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'remSleepLabel'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <FieldBlock label="Descrição do sono com dados">
                  <Textarea
                    value={appDraft.dashboard.sleepDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'sleepDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <FieldBlock label="Descrição do sono sem dados">
                  <Textarea
                    value={appDraft.dashboard.sleepEmptyDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'sleepEmptyDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <FieldBlock label="Fallback do insight de sono">
                  <Textarea
                    value={appDraft.dashboard.sleepInsightFallback}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'sleepInsightFallback'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <div className="grid gap-4 xl:grid-cols-3">
                  <FieldBlock label="Badge semanal">
                    <Input
                      value={appDraft.dashboard.weeklyBadge}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'weeklyBadge'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Label da IA">
                    <Input
                      value={appDraft.dashboard.aiUnlockedLabel}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'aiUnlockedLabel'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Label do contexto vivo">
                    <Input
                      value={appDraft.dashboard.liveContextLabel}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'liveContextLabel'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Título semanal">
                    <Input
                      value={appDraft.dashboard.weeklyTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'weeklyTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Título dos pilares">
                    <Input
                      value={appDraft.dashboard.pillarsTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'pillarsTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <FieldBlock label="Descrição semanal">
                  <Textarea
                    value={appDraft.dashboard.weeklyDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'weeklyDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Texto da IA liberada">
                    <Input
                      value={appDraft.dashboard.aiUnlockedYes}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'aiUnlockedYes'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Texto da IA bloqueada">
                    <Input
                      value={appDraft.dashboard.aiUnlockedNo}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'aiUnlockedNo'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  <FieldBlock label="Label da prontidão">
                    <Input
                      value={appDraft.dashboard.currentReadinessLabel}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'currentReadinessLabel'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Label da longevidade">
                    <Input
                      value={appDraft.dashboard.longevityLabel}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'longevityLabel'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Título sem métricas">
                    <Input
                      value={appDraft.dashboard.emptyMetricsTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['dashboard', 'emptyMetricsTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>

                <FieldBlock label="Descrição dos pilares">
                  <Textarea
                    value={appDraft.dashboard.pillarsDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'pillarsDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <FieldBlock label="Fallback do contexto vivo">
                  <Textarea
                    value={appDraft.dashboard.liveContextFallback}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'liveContextFallback'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>

                <FieldBlock label="Descrição sem métricas">
                  <Textarea
                    value={appDraft.dashboard.emptyMetricsDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['dashboard', 'emptyMetricsDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/84">
              <CardHeader>
                <CardTitle className="text-base">Agendamentos</CardTitle>
                <CardDescription>
                  Controle o texto-base e os blocos visíveis do módulo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Badge">
                    <Input
                      value={appDraft.appointments.heroBadge}
                      onChange={(event) =>
                        updateDraft(
                          ['appointments', 'heroBadge'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Título principal">
                    <Input
                      value={appDraft.appointments.heroTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['appointments', 'heroTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Título da lista">
                    <Input
                      value={appDraft.appointments.listTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['appointments', 'listTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Título dos profissionais">
                    <Input
                      value={appDraft.appointments.professionalsTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['appointments', 'professionalsTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>
                <FieldBlock label="Descrição principal">
                  <Textarea
                    value={appDraft.appointments.heroDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['appointments', 'heroDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Descrição da lista">
                  <Textarea
                    value={appDraft.appointments.listDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['appointments', 'listDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Descrição dos profissionais">
                  <Textarea
                    value={appDraft.appointments.professionalsDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['appointments', 'professionalsDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Título do calendário">
                  <Input
                    value={appDraft.appointments.calendarTitle}
                    onChange={(event) =>
                      updateDraft(
                        ['appointments', 'calendarTitle'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Descrição do calendário">
                  <Textarea
                    value={appDraft.appointments.calendarDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['appointments', 'calendarDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <div className="grid gap-4 xl:grid-cols-3">
                  <SwitchRow
                    title="Lista de consultas"
                    description="Mostra o bloco de próximas consultas."
                    checked={appDraft.appointments.showUpcomingList}
                    onCheckedChange={(checked) =>
                      updateDraft(['appointments', 'showUpcomingList'], checked)
                    }
                  />
                  <SwitchRow
                    title="Lista de profissionais"
                    description="Mostra o bloco da rede profissional."
                    checked={appDraft.appointments.showProfessionalsList}
                    onCheckedChange={(checked) =>
                      updateDraft(
                        ['appointments', 'showProfessionalsList'],
                        checked
                      )
                    }
                  />
                  <SwitchRow
                    title="Calendário"
                    description="Mostra o calendário visual do módulo."
                    checked={appDraft.appointments.showCalendar}
                    onCheckedChange={(checked) =>
                      updateDraft(['appointments', 'showCalendar'], checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/84">
              <CardHeader>
                <CardTitle className="text-base">Monitoramento</CardTitle>
                <CardDescription>
                  Ajuste textos-base, contexto e blocos ativos do painel vivo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Eyebrow da página">
                    <Input
                      value={appDraft.monitoring.pageEyebrow}
                      onChange={(event) =>
                        updateDraft(
                          ['monitoring', 'pageEyebrow'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Título da página">
                    <Input
                      value={appDraft.monitoring.pageTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['monitoring', 'pageTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>
                <FieldBlock label="Descrição da página">
                  <Textarea
                    value={appDraft.monitoring.pageDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['monitoring', 'pageDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Badge principal">
                    <Input
                      value={appDraft.monitoring.heroBadge}
                      onChange={(event) =>
                        updateDraft(
                          ['monitoring', 'heroBadge'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Título do hero">
                    <Input
                      value={appDraft.monitoring.heroTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['monitoring', 'heroTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>
                <FieldBlock label="Descrição do hero">
                  <Textarea
                    value={appDraft.monitoring.heroDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['monitoring', 'heroDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <div className="grid gap-4 xl:grid-cols-3">
                  <FieldBlock label="Título do bloco informativo">
                    <Input
                      value={appDraft.monitoring.infoTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['monitoring', 'infoTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Título dos controles">
                    <Input
                      value={appDraft.monitoring.controlsTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['monitoring', 'controlsTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                  <FieldBlock label="Título dos alertas">
                    <Input
                      value={appDraft.monitoring.alertsTitle}
                      onChange={(event) =>
                        updateDraft(
                          ['monitoring', 'alertsTitle'],
                          event.target.value
                        )
                      }
                    />
                  </FieldBlock>
                </div>
                <div className="grid gap-4 xl:grid-cols-3">
                  <SwitchRow
                    title="Feed de eventos"
                    description="Mantém o feed recente visível no painel."
                    checked={appDraft.monitoring.showEventFeed}
                    onCheckedChange={(checked) =>
                      updateDraft(['monitoring', 'showEventFeed'], checked)
                    }
                  />
                  <SwitchRow
                    title="Botão de voz"
                    description="Permite acionar leitura falada das métricas."
                    checked={appDraft.monitoring.showVoiceButton}
                    onCheckedChange={(checked) =>
                      updateDraft(['monitoring', 'showVoiceButton'], checked)
                    }
                  />
                  <SwitchRow
                    title="Botão de alertas"
                    description="Exibe o acesso rápido aos alertas locais."
                    checked={appDraft.monitoring.showAlertsButton}
                    onCheckedChange={(checked) =>
                      updateDraft(['monitoring', 'showAlertsButton'], checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/84">
              <CardHeader>
                <CardTitle className="text-base">Perfil</CardTitle>
                <CardDescription>
                  Textos-base do módulo de perfil e contexto pessoal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FieldBlock label="Eyebrow">
                  <Input
                    value={appDraft.profile.pageEyebrow}
                    onChange={(event) =>
                      updateDraft(
                        ['profile', 'pageEyebrow'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Título">
                  <Input
                    value={appDraft.profile.pageTitle}
                    onChange={(event) =>
                      updateDraft(['profile', 'pageTitle'], event.target.value)
                    }
                  />
                </FieldBlock>
                <FieldBlock label="Descrição">
                  <Textarea
                    value={appDraft.profile.pageDescription}
                    onChange={(event) =>
                      updateDraft(
                        ['profile', 'pageDescription'],
                        event.target.value
                      )
                    }
                  />
                </FieldBlock>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <Badge className="rounded-full border-cosmic/20 bg-cosmic/10 px-4 py-1.5 text-cosmic">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              editor premium da experiencia web
            </Badge>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-3xl">
                Superfícies editáveis do módulo Lyra Customaze UI UX
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-7">
                Somente administradores podem editar, salvar rascunho, publicar,
                restaurar e reorganizar a experiência pública e a camada visual
                do app da Lyra.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              value={pageKey}
              onValueChange={(value) =>
                value && setPageKey(value as SitePageKey)
              }
            >
              {lyraCustomazeEditableSurfaces.map((surface) => (
                <ToggleGroupItem key={surface.key} value={surface.key}>
                  {surface.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button
              variant="secondary"
              onClick={() => runAdminAction('restoreDefaults')}
              disabled={publishing || loading}
            >
              Restaurar padrao
            </Button>
            <Button
              variant="secondary"
              onClick={() => runAdminAction('restorePublished')}
              disabled={publishing || loading}
            >
              Restaurar publicado
            </Button>
            <Button
              variant="secondary"
              onClick={() => saveDraft(draftConfig)}
              disabled={saving || loading}
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar rascunho
            </Button>
            <Button
              onClick={() => runAdminAction('publish')}
              disabled={publishing || loading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Publicar agora
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ResizablePanelGroup direction="horizontal" className="min-h-[980px]">
          <ResizablePanel defaultSize={44} minSize={36}>
            <ScrollArea className="h-[980px]">
              <div className="flex flex-col gap-6 p-6">
                <div className="rounded-[24px] border border-border/70 bg-white/82 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                      publicacao
                    </p>
                    <Badge
                      className={
                        hasDraftChanges
                          ? 'rounded-full border-accent/20 bg-accent/10 text-accent'
                          : 'rounded-full border-success/20 bg-success/10 text-success'
                      }
                    >
                      {hasDraftChanges
                        ? 'rascunho diferente do publicado'
                        : 'sem divergencia com o publicado'}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Ultima atualizacao:{' '}
                    {meta.updatedAt ?? 'ainda nao publicada'}.
                  </p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Atualizado por: {meta.updatedByUserId ?? 'sistema padrao'}.
                  </p>
                </div>

                <Tabs defaultValue="content" className="flex flex-col gap-5">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="content">
                      <Layers3 className="mr-2 h-4 w-4" />
                      Conteudo guiado
                    </TabsTrigger>
                    <TabsTrigger value="json">
                      <FileJson className="mr-2 h-4 w-4" />
                      JSON completo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="m-0">
                    {loading ? (
                      <Card className="border-dashed">
                        <CardContent className="px-6 py-10 text-sm text-muted-foreground">
                          Carregando editor...
                        </CardContent>
                      </Card>
                    ) : pageKey === 'landing' ? (
                      renderLandingEditor()
                    ) : pageKey === 'app' ? (
                      renderAppEditor()
                    ) : (
                      renderLoginEditor()
                    )}
                  </TabsContent>

                  <TabsContent value="json" className="m-0">
                    <Card className="border-border/70 bg-white/82">
                      <CardHeader>
                        <CardTitle className="text-xl">Modo avancado</CardTitle>
                        <CardDescription>
                          Aqui voce consegue editar a estrutura completa da{' '}
                          {pageKey === 'login'
                            ? 'tela de login'
                            : getSitePageLabel(pageKey).toLowerCase()}
                          .
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        <Textarea
                          value={jsonValue}
                          onChange={(event) => setJsonValue(event.target.value)}
                          className="min-h-[560px] font-mono text-xs leading-6"
                        />
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="secondary"
                            onClick={applyJsonLocally}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Aplicar JSON no preview
                          </Button>
                          <Button onClick={saveJsonDraft} disabled={saving}>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar JSON como rascunho
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={56} minSize={40}>
            <div className="h-[980px] bg-[linear-gradient(180deg,rgba(249,248,252,0.96),rgba(255,255,255,0.98))] p-6">
              <div className="mb-4 flex items-center justify-between rounded-[24px] border border-border/70 bg-white/82 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                    preview administrativo
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    O painel ao lado renderiza a experiencia com o rascunho
                    atual.
                  </p>
                </div>
                <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                  {getSitePageLabel(pageKey)}
                </Badge>
              </div>

              <div className="h-[900px] overflow-hidden rounded-[32px] border border-border/70 bg-white shadow-[0_30px_90px_-46px_rgba(22,21,48,0.34)]">
                <ScrollArea className="h-full">{preview}</ScrollArea>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  );
}
