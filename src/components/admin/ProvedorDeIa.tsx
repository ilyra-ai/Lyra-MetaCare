'use client';

import * as React from 'react';
import {
  Cloud,
  Cpu,
  KeyRound,
  ListRestart,
  Loader2,
  PlugZap,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import type { ProvedorPublico } from '@/lib/ai/provedor-da-plataforma';
import {
  type PresetDeProvedor,
  urlEhLocal,
} from '@/lib/ai/provedores-catalogo';
import { cn } from '@/lib/utils';

interface Resposta {
  provedor: ProvedorPublico;
  presets: PresetDeProvedor[];
}

type Teste =
  | { ok: true; milissegundos: number; resposta: string }
  | { ok: false; milissegundos?: number; error: string };

async function json<T>(resposta: Response): Promise<T> {
  const corpo = (await resposta.json().catch(() => null)) as
    (T & { error?: string }) | null;
  if (!resposta.ok) {
    throw new Error(corpo?.error ?? `HTTP ${resposta.status}`);
  }
  return corpo as T;
}

function segundos(ms: number) {
  return `${(ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} s`;
}

/**
 * Escolha do modelo de IA da plataforma (tarefa 43): modelos locais
 * (Ollama, LM Studio, Jan, llama.cpp e outros compatíveis com a OpenAI) ou em
 * nuvem. A chave de API vai só do navegador para o servidor, que a cifra; a
 * tela recebe apenas os 4 últimos caracteres.
 */
export function ProvedorDeIa() {
  const [dados, setDados] = React.useState<Resposta | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [presetId, setPresetId] = React.useState('lyra');
  const [baseUrl, setBaseUrl] = React.useState('');
  const [modelo, setModelo] = React.useState('');
  const [chave, setChave] = React.useState('');
  const [apagarChave, setApagarChave] = React.useState(false);
  const [temperatura, setTemperatura] = React.useState(0.7);
  const [tempoMaximo, setTempoMaximo] = React.useState(90);
  const [modelos, setModelos] = React.useState<string[]>([]);
  const [ocupado, setOcupado] = React.useState<
    'salvar' | 'testar' | 'modelos' | null
  >(null);
  const [teste, setTeste] = React.useState<Teste | null>(null);

  const aplicar = React.useCallback((resposta: Resposta) => {
    setDados(resposta);
    const p = resposta.provedor;
    setPresetId(
      p.preset ?? (p.tipo === 'lyra_local' ? 'lyra' : 'personalizado')
    );
    setBaseUrl(p.baseUrl ?? '');
    setModelo(p.modelo ?? '');
    setTemperatura(p.temperatura);
    setTempoMaximo(p.tempoMaximoSegundos);
    setChave('');
    setApagarChave(false);
  }, []);

  React.useEffect(() => {
    let ativo = true;
    fetch('/api/admin/ia', { credentials: 'include', cache: 'no-store' })
      .then((r) => json<Resposta>(r))
      .then((r) => {
        if (ativo) aplicar(r);
      })
      .catch((falha: unknown) => {
        if (ativo) {
          setErro(
            falha instanceof Error ? falha.message : 'Falha ao carregar.'
          );
        }
      });
    return () => {
      ativo = false;
    };
  }, [aplicar]);

  if (!dados) {
    return erro ? (
      <Card>
        <CardContent className="p-6 text-sm text-destructive" role="alert">
          Não foi possível carregar o provedor de IA: {erro}
        </CardContent>
      </Card>
    ) : (
      <Skeleton
        className="h-96 w-full rounded-xl"
        role="status"
        aria-label="Carregando o provedor de IA"
      />
    );
  }

  const preset =
    dados.presets.find((p) => p.id === presetId) ?? dados.presets[0];
  const salvo = dados.provedor;
  const mesmoProvedorSalvo =
    salvo.preset === preset.id && salvo.tipo === preset.tipo;
  const usaUrl = preset.tipo === 'openai_compativel';
  const usaModelo = preset.tipo !== 'lyra_local';
  const exigeChave =
    preset.exigeChave ||
    preset.tipo === 'gemini' ||
    preset.tipo === 'anthropic';
  const ehLocal =
    preset.tipo === 'lyra_local' || (usaUrl && urlEhLocal(baseUrl));

  const escolher = (id: string) => {
    const novo = dados.presets.find((p) => p.id === id);
    if (!novo) return;
    setPresetId(id);
    setTeste(null);
    setModelos([]);
    if (salvo.preset === id) {
      setBaseUrl(salvo.baseUrl ?? '');
      setModelo(salvo.modelo ?? '');
    } else {
      setBaseUrl(novo.urlPadrao ?? '');
      setModelo('');
    }
    setChave('');
    setApagarChave(false);
  };

  const corpo = () => ({
    tipo: preset.tipo,
    preset: preset.id,
    baseUrl: usaUrl ? baseUrl.trim() || null : null,
    modelo: usaModelo ? modelo.trim() || null : null,
    ...(chave.trim()
      ? { chave: chave.trim() }
      : apagarChave
        ? { chave: null }
        : mesmoProvedorSalvo
          ? {}
          : { chave: null }),
    tempoMaximoSegundos: tempoMaximo,
    temperatura,
  });

  const enviar = async <T,>(url: string, metodo: 'POST' | 'PUT') =>
    json<T>(
      await fetch(url, {
        method: metodo,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo()),
      })
    );

  const buscarModelos = async () => {
    setOcupado('modelos');
    try {
      const r = await enviar<{ modelos: string[] }>(
        '/api/admin/ia/modelos',
        'POST'
      );
      setModelos(r.modelos);
      if (r.modelos.length === 0) {
        toast.info('O servidor respondeu, mas não há modelos carregados.');
      } else {
        if (!modelo) setModelo(r.modelos[0]);
        toast.success(`${r.modelos.length} modelo(s) encontrado(s).`);
      }
    } catch (falha) {
      toast.error('Não foi possível listar os modelos.', {
        description: falha instanceof Error ? falha.message : undefined,
      });
    } finally {
      setOcupado(null);
    }
  };

  const testar = async () => {
    setOcupado('testar');
    setTeste(null);
    try {
      const resposta = await fetch('/api/admin/ia/testar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo()),
      });
      const r = (await resposta.json().catch(() => null)) as Teste | null;
      setTeste(r ?? { ok: false, error: `HTTP ${resposta.status}` });
    } catch (falha) {
      setTeste({
        ok: false,
        error: falha instanceof Error ? falha.message : 'Falha no teste.',
      });
    } finally {
      setOcupado(null);
    }
  };

  const salvar = async () => {
    setOcupado('salvar');
    try {
      const r = await enviar<{ provedor: ProvedorPublico }>(
        '/api/admin/ia',
        'PUT'
      );
      aplicar({ provedor: r.provedor, presets: dados.presets });
      toast.success('Provedor de IA salvo.', {
        description:
          r.provedor.tipo === 'lyra_local'
            ? 'O "Seu dia" volta a ser escrito pelo motor da Lyra.'
            : 'Os próximos "Seu dia" serão escritos por este modelo.',
      });
    } catch (falha) {
      toast.error('Não foi possível salvar.', {
        description: falha instanceof Error ? falha.message : undefined,
      });
    } finally {
      setOcupado(null);
    }
  };

  const grupos = [
    {
      titulo: 'Na sua máquina ou rede',
      descricao: 'Os dados não saem da infraestrutura da Lyra.',
      icone: Cpu,
      itens: dados.presets.filter((p) => p.local),
    },
    {
      titulo: 'Em nuvem',
      descricao: 'Recebem só os dados astrológicos do dia.',
      icone: Cloud,
      itens: dados.presets.filter((p) => !p.local),
    },
  ];

  const presetSalvo = dados.presets.find((p) => p.id === salvo.preset);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-3 font-display text-xl font-semibold leading-tight tracking-tight text-card-foreground">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cosmic-light text-cosmic"
                aria-hidden="true"
              >
                <Sparkles className="h-5 w-5" />
              </span>
              Modelo de IA da plataforma
            </h2>
            <CardDescription className="mt-2">
              Escreve a leitura védica do &quot;Seu dia&quot; de cada pessoa.
              Aceita modelos locais (Ollama, LM Studio, Jan, llama.cpp e outros)
              e em nuvem; sem modelo ou em qualquer falha, o motor da Lyra
              escreve a leitura.
            </CardDescription>
          </div>
          <span
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
            aria-label={`Em uso: ${presetSalvo?.nome ?? salvo.tipo}${salvo.modelo ? `, modelo ${salvo.modelo}` : ''}`}
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                salvo.tipo === 'lyra_local' ? 'bg-cosmic' : 'bg-success'
              )}
            />
            <span className="truncate">
              Em uso: {presetSalvo?.nome ?? salvo.tipo}
              {salvo.modelo ? ` · ${salvo.modelo}` : ''}
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-7">
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-3 text-sm font-semibold text-foreground">
            Provedor
          </legend>
          {grupos.map(({ titulo, descricao, icone: Icone, itens }) => (
            <div key={titulo} className="flex flex-col gap-2.5">
              <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Icone className="h-4 w-4 text-foreground" aria-hidden="true" />
                <span className="font-semibold text-foreground">{titulo}</span>
                <span>{descricao}</span>
              </p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {itens.map((p) => {
                  const marcado = p.id === presetId;
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        'relative flex min-h-11 cursor-pointer flex-col gap-1 rounded-xl border bg-background p-3 transition-colors hover:border-primary/60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                        marcado
                          ? 'border-primary bg-sidebar-accent'
                          : 'border-border'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="provedor-de-ia"
                          value={p.id}
                          checked={marcado}
                          onChange={() => escolher(p.id)}
                          aria-labelledby={`provedor-${p.id}-nome`}
                          aria-describedby={`provedor-${p.id}-descricao`}
                          className="h-4 w-4 accent-[hsl(var(--primary))]"
                        />
                        <span
                          id={`provedor-${p.id}-nome`}
                          className="text-sm font-semibold text-foreground"
                        >
                          {p.nome}
                        </span>
                        {salvo.preset === p.id ? (
                          <span className="ml-auto rounded-full bg-success-light px-2 py-px text-[0.6875rem] font-semibold text-foreground">
                            em uso
                          </span>
                        ) : null}
                      </span>
                      <span
                        id={`provedor-${p.id}-descricao`}
                        className="pl-6 text-xs leading-relaxed text-muted-foreground"
                      >
                        {p.descricao}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </fieldset>

        {usaModelo ? (
          <div className="grid gap-5 rounded-2xl border border-border bg-background/60 p-4 sm:p-5">
            {usaUrl ? (
              <div className="grid gap-2">
                <Label htmlFor="ia-url">URL base da API</Label>
                <Input
                  id="ia-url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="http://localhost:11434/v1"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  aria-describedby="ia-url-ajuda"
                />
                <p
                  id="ia-url-ajuda"
                  className="text-xs leading-relaxed text-muted-foreground"
                >
                  Endereço visto pelo servidor da Lyra, terminando em /v1. Com a
                  Lyra em contêiner, troque localhost por host.docker.internal.
                  {ehLocal
                    ? ' Endereço local: os dados não saem da sua rede.'
                    : ''}
                </p>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="ia-chave">
                Chave de API {exigeChave ? '' : '(opcional)'}
              </Label>
              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="ia-chave"
                  type="password"
                  autoComplete="new-password"
                  spellCheck={false}
                  className="pl-9"
                  placeholder={
                    mesmoProvedorSalvo && salvo.temChave
                      ? `Chave salva terminada em ${salvo.finalDaChave ?? '••••'}`
                      : exigeChave
                        ? 'Cole a chave deste provedor'
                        : 'Só se o servidor exigir'
                  }
                  value={chave}
                  onChange={(e) => {
                    setChave(e.target.value);
                    if (e.target.value) setApagarChave(false);
                  }}
                />
              </div>
              {mesmoProvedorSalvo && salvo.chaveIlegivel ? (
                <p
                  className="text-xs font-medium text-destructive"
                  role="alert"
                >
                  A chave salva não pode mais ser lida (o AUTH_SECRET mudou).
                  Informe a chave de novo.
                </p>
              ) : null}
              {mesmoProvedorSalvo && salvo.temChave && !exigeChave ? (
                <label className="flex min-h-8 items-center gap-2 text-xs text-foreground">
                  <Checkbox
                    checked={apagarChave}
                    onCheckedChange={(v) => setApagarChave(v === true)}
                  />
                  Remover a chave salva
                </label>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ia-modelo">Modelo</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="ia-modelo"
                  list="ia-modelos-encontrados"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="ex.: qwen2.5:7b-instruct"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="min-w-0 flex-1"
                />
                <datalist id="ia-modelos-encontrados">
                  {modelos.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void buscarModelos()}
                  disabled={ocupado !== null}
                >
                  {ocupado === 'modelos' ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <ListRestart aria-hidden="true" />
                  )}
                  Buscar modelos
                </Button>
              </div>
              {modelos.length > 0 ? (
                <ul
                  className="flex flex-wrap gap-1.5"
                  aria-label="Modelos encontrados"
                >
                  {modelos.slice(0, 24).map((m) => (
                    <li key={m}>
                      <button
                        type="button"
                        aria-pressed={m === modelo}
                        onClick={() => setModelo(m)}
                        className={cn(
                          'min-h-8 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                          m === modelo
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-foreground hover:border-primary/60'
                        )}
                      >
                        {m}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label id="ia-temperatura">Criatividade (temperatura)</Label>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {temperatura.toLocaleString('pt-BR', {
                      minimumFractionDigits: 1,
                    })}
                  </span>
                </div>
                <Slider
                  aria-labelledby="ia-temperatura"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[temperatura]}
                  onValueChange={([v]) =>
                    setTemperatura(Math.round(v * 10) / 10)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  0,6 a 0,9 equilibra variedade e fidelidade aos fatos.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ia-tempo">Tempo máximo de resposta (s)</Label>
                <Input
                  id="ia-tempo"
                  type="number"
                  min={10}
                  max={600}
                  step={5}
                  value={tempoMaximo}
                  onChange={(e) =>
                    setTempoMaximo(
                      Math.min(600, Math.max(10, Number(e.target.value) || 10))
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Modelos locais em CPU podem levar 1 a 3 minutos.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-border bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground">
            O motor védico da Lyra escreve a leitura com regras do Jyotish e do
            Ayurveda, sem modelo generativo e sem enviar dados para fora.
          </p>
        )}

        <div
          className={cn(
            'flex gap-3 rounded-2xl border p-4 text-xs leading-relaxed',
            ehLocal
              ? 'border-success/30 bg-success-light/50 text-foreground'
              : 'border-cosmic/30 bg-cosmic-light/50 text-foreground'
          )}
        >
          <ShieldCheck
            className={cn(
              'mt-0.5 h-4 w-4 shrink-0',
              ehLocal ? 'text-success' : 'text-cosmic'
            )}
            aria-hidden="true"
          />
          <p>
            O modelo recebe só os fatos astrológicos do dia (mapa natal
            derivado, Panchang, períodos, horas planetárias, trânsitos e dasha).
            Não recebe nome, e-mail, data, hora ou cidade de nascimento,
            métricas de saúde nem ciclo. O chat da pessoa usa este modelo apenas
            quando ele roda localmente.
          </p>
        </div>

        {teste ? (
          <div
            role="status"
            className={cn(
              'rounded-2xl border p-4 text-sm',
              teste.ok
                ? 'border-success/30 bg-success-light/50'
                : 'border-destructive/40 bg-destructive/10'
            )}
          >
            <p className="font-semibold text-foreground">
              {teste.ok
                ? `Conexão funcionando · ${segundos(teste.milissegundos)}`
                : `Falha na conexão${teste.milissegundos ? ` · ${segundos(teste.milissegundos)}` : ''}`}
            </p>
            <p className="mt-1 break-words text-foreground">
              {teste.ok
                ? `Resposta do modelo: “${teste.resposta}”`
                : teste.error}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          {usaModelo ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void testar()}
              disabled={ocupado !== null}
            >
              {ocupado === 'testar' ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <PlugZap aria-hidden="true" />
              )}
              Testar conexão
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={() => void salvar()}
            disabled={ocupado !== null}
          >
            {ocupado === 'salvar' ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Save aria-hidden="true" />
            )}
            Salvar provedor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
