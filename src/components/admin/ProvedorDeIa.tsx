'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Cloud,
  Cpu,
  KeyRound,
  ListOrdered,
  ListRestart,
  Loader2,
  PlugZap,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import type {
  EloDaOrdem,
  ProvedorPublico,
} from '@/lib/ai/provedores-da-plataforma';
import {
  type PresetDeProvedor,
  urlEhLocal,
} from '@/lib/ai/provedores-catalogo';
import { cn } from '@/lib/utils';

interface Resposta {
  provedores: ProvedorPublico[];
  ordem: EloDaOrdem[];
  posicoes: number;
  presets: PresetDeProvedor[];
}

type Teste =
  | { ok: true; milissegundos: number; resposta: string }
  | { ok: false; milissegundos?: number; error: string };

/** Provedor marcado na tela, com os valores ainda não salvos. */
interface ProvedorEmEdicao {
  preset: string;
  baseUrl: string;
  chave: string;
  apagarChave: boolean;
  modelos: string[];
  encontrados: string[];
  novoModelo: string;
  temperatura: number;
  tempoMaximo: number;
  testes: Record<string, Teste>;
}

const LYRA = 'lyra';
const VAZIO = 'nenhum';

async function json<T>(resposta: Response): Promise<T> {
  const corpo = (await resposta.json().catch(() => null)) as
    (T & { error?: string }) | null;
  if (!resposta.ok) {
    throw new Error(corpo?.error ?? `HTTP ${resposta.status}`);
  }
  return corpo as T;
}

function segundos(ms: number) {
  // Abaixo de 1 s, em milissegundos (antes "0 s" para respostas rápidas).
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} s`;
}

function chaveDoElo(elo: EloDaOrdem) {
  return elo.tipo === 'lyra' ? LYRA : `${elo.preset}|${elo.modelo}`;
}

function eloDaChave(chave: string): EloDaOrdem {
  if (chave === LYRA) return { tipo: 'lyra' };
  const separador = chave.indexOf('|');
  return {
    tipo: 'modelo',
    preset: chave.slice(0, separador),
    modelo: chave.slice(separador + 1),
  };
}

function emEdicao(
  preset: PresetDeProvedor,
  salvo?: ProvedorPublico
): ProvedorEmEdicao {
  return {
    preset: preset.id,
    baseUrl: salvo?.baseUrl ?? preset.urlPadrao ?? '',
    chave: '',
    apagarChave: false,
    modelos: salvo?.modelos ?? [],
    encontrados: [],
    novoModelo: '',
    temperatura: salvo?.temperatura ?? 0.7,
    tempoMaximo: salvo?.tempoMaximoSegundos ?? 90,
    testes: {},
  };
}

/**
 * Modelos de IA da plataforma (tarefa 54): vários provedores ao mesmo tempo
 * (na máquina ou rede e em nuvem), vários modelos por provedor, o motor da
 * Lyra e a ordem de uso com troca automática. As chaves de API vão só do
 * navegador para o servidor, que as cifra; a tela recebe apenas os 4
 * últimos caracteres.
 */
export function ProvedorDeIa() {
  const [dados, setDados] = React.useState<Resposta | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [selecionados, setSelecionados] = React.useState<ProvedorEmEdicao[]>(
    []
  );
  const [lyraNaOrdem, setLyraNaOrdem] = React.useState(true);
  const [ordem, setOrdem] = React.useState<string[]>([]);
  const [ocupado, setOcupado] = React.useState<string | null>(null);

  const aplicar = React.useCallback((resposta: Resposta) => {
    setDados(resposta);
    setSelecionados(
      resposta.provedores.flatMap((salvo) => {
        const preset = resposta.presets.find((p) => p.id === salvo.preset);
        return preset ? [emEdicao(preset, salvo)] : [];
      })
    );
    setLyraNaOrdem(
      resposta.provedores.length === 0 ||
        resposta.ordem.some((elo) => elo.tipo === 'lyra')
    );
    setOrdem(
      Array.from({ length: resposta.posicoes }, (_, i) =>
        resposta.ordem[i] ? chaveDoElo(resposta.ordem[i]) : VAZIO
      )
    );
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
          Não foi possível carregar os modelos de IA: {erro}
        </CardContent>
      </Card>
    ) : (
      <Skeleton
        className="h-96 w-full rounded-xl"
        role="status"
        aria-label="Carregando os modelos de IA"
      />
    );
  }

  const presetPor = (id: string) => dados.presets.find((p) => p.id === id);
  const salvoPor = (id: string) =>
    dados.provedores.find((p) => p.preset === id);
  const selecionado = (id: string) => selecionados.find((p) => p.preset === id);

  const atualizar = (id: string, mudanca: Partial<ProvedorEmEdicao>) =>
    setSelecionados((atual) =>
      atual.map((p) => (p.preset === id ? { ...p, ...mudanca } : p))
    );

  const alternarProvedor = (preset: PresetDeProvedor, marcar: boolean) => {
    if (preset.tipo === 'lyra_local') {
      setLyraNaOrdem(marcar);
      return;
    }
    setSelecionados((atual) =>
      marcar
        ? atual.some((p) => p.preset === preset.id)
          ? atual
          : [...atual, emEdicao(preset, salvoPor(preset.id))]
        : atual.filter((p) => p.preset !== preset.id)
    );
  };

  // Opções da ordem de uso: o motor da Lyra (se marcado) e cada modelo
  // escolhido. Posições que apontam para algo desmarcado ficam vazias.
  const opcoesDaOrdem = [
    ...(lyraNaOrdem ? [{ chave: LYRA, rotulo: 'Motor da Lyra' }] : []),
    ...selecionados.flatMap((p) =>
      p.modelos.map((modelo) => ({
        chave: `${p.preset}|${modelo}`,
        rotulo: `${presetPor(p.preset)?.nome ?? p.preset} · ${modelo}`,
      }))
    ),
  ];
  const chavesValidas = new Set(opcoesDaOrdem.map((o) => o.chave));
  const ordemValida = ordem.map((chave) =>
    chavesValidas.has(chave) ? chave : VAZIO
  );
  const ordemPreenchida = ordemValida.filter((chave) => chave !== VAZIO);

  const corpoDoProvedor = (p: ProvedorEmEdicao) => {
    const preset = presetPor(p.preset);
    const salvo = salvoPor(p.preset);
    return {
      preset: p.preset,
      baseUrl:
        preset?.tipo === 'openai_compativel' ? p.baseUrl.trim() || null : null,
      ...(p.chave.trim()
        ? { chave: p.chave.trim() }
        : p.apagarChave
          ? { chave: null }
          : salvo
            ? {}
            : { chave: null }),
      tempoMaximoSegundos: p.tempoMaximo,
      temperatura: p.temperatura,
    };
  };

  const buscarModelos = async (p: ProvedorEmEdicao) => {
    setOcupado(`modelos:${p.preset}`);
    try {
      const r = await json<{ modelos: string[] }>(
        await fetch('/api/admin/ia/modelos', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpoDoProvedor(p)),
        })
      );
      atualizar(p.preset, { encontrados: r.modelos });
      if (r.modelos.length === 0) {
        toast.info('O servidor respondeu, mas não há modelos carregados.');
      } else {
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

  const testarModelo = async (p: ProvedorEmEdicao, modelo: string) => {
    setOcupado(`testar:${p.preset}|${modelo}`);
    let resultado: Teste;
    try {
      const resposta = await fetch('/api/admin/ia/testar', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...corpoDoProvedor(p), modelo }),
      });
      const r = (await resposta.json().catch(() => null)) as Teste | null;
      resultado = r ?? { ok: false, error: `HTTP ${resposta.status}` };
    } catch (falha) {
      resultado = {
        ok: false,
        error: falha instanceof Error ? falha.message : 'Falha no teste.',
      };
    }
    setSelecionados((atual) =>
      atual.map((item) =>
        item.preset === p.preset
          ? { ...item, testes: { ...item.testes, [modelo]: resultado } }
          : item
      )
    );
    setOcupado(null);
  };

  const alternarModelo = (p: ProvedorEmEdicao, modelo: string) =>
    atualizar(p.preset, {
      modelos: p.modelos.includes(modelo)
        ? p.modelos.filter((m) => m !== modelo)
        : [...p.modelos, modelo],
    });

  const adicionarModelo = (p: ProvedorEmEdicao) => {
    const modelo = p.novoModelo.trim();
    if (!modelo) return;
    atualizar(p.preset, {
      modelos: p.modelos.includes(modelo) ? p.modelos : [...p.modelos, modelo],
      novoModelo: '',
    });
  };

  const salvar = async () => {
    const semModelo = selecionados.find((p) => p.modelos.length === 0);
    if (semModelo) {
      toast.error(
        `Escolha ao menos um modelo de ${presetPor(semModelo.preset)?.nome ?? semModelo.preset}, ou desmarque o provedor.`
      );
      return;
    }
    if (ordemPreenchida.length === 0) {
      toast.error('Escolha ao menos o 1º modelo da ordem de uso.');
      return;
    }
    setOcupado('salvar');
    try {
      const r = await json<Omit<Resposta, 'presets'>>(
        await fetch('/api/admin/ia', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provedores: selecionados.map((p) => ({
              ...corpoDoProvedor(p),
              modelos: p.modelos,
            })),
            ordem: ordemPreenchida.map(eloDaChave),
          }),
        })
      );
      aplicar({ ...r, presets: dados.presets });
      toast.success('Modelos de IA salvos.', {
        description:
          r.ordem[0]?.tipo === 'lyra'
            ? 'O "Seu dia" é escrito pelo motor da Lyra.'
            : 'Os próximos "Seu dia" seguem a ordem de uso escolhida.',
      });
    } catch (falha) {
      toast.error('Não foi possível salvar.', {
        description: falha instanceof Error ? falha.message : undefined,
      });
    } finally {
      setOcupado(null);
    }
  };

  const presetLyra = dados.presets.find((p) => p.tipo === 'lyra_local');
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
      // O motor da Lyra também aparece aqui, para montar a ordem só com
      // modelos em nuvem e o motor.
      itens: [
        ...(presetLyra ? [presetLyra] : []),
        ...dados.presets.filter((p) => !p.local),
      ],
    },
  ];

  const temNuvem = selecionados.some((p) => {
    const preset = presetPor(p.preset);
    return !(
      preset?.tipo === 'openai_compativel' && urlEhLocal(p.baseUrl.trim())
    );
  });
  const resumoSalvo = dados.ordem
    .map((elo, i) =>
      elo.tipo === 'lyra'
        ? `${i + 1}º Motor da Lyra`
        : `${i + 1}º ${presetPor(elo.preset)?.nome ?? elo.preset} · ${elo.modelo}`
    )
    .join(', ');

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
              Marque quantos provedores e modelos quiser, locais e em nuvem, e
              defina a ordem de uso. Se o modelo da vez falhar ou ficar sem
              tokens, o seguinte continua de onde ele parou, sem a pessoa
              perceber; no fim da fila, o motor da Lyra sempre responde.
            </CardDescription>
          </div>
          <span
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
            aria-label={`Ordem em uso: ${resumoSalvo}`}
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                dados.ordem[0]?.tipo === 'lyra' ? 'bg-cosmic' : 'bg-success'
              )}
            />
            <span className="truncate">Em uso: {resumoSalvo}</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-7">
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-3 text-sm font-semibold text-foreground">
            Provedores (marque um ou mais)
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
                  const ehLyra = p.tipo === 'lyra_local';
                  const marcado = ehLyra
                    ? lyraNaOrdem
                    : Boolean(selecionado(p.id));
                  const idDoItem = `${titulo === 'Em nuvem' ? 'nuvem' : 'local'}-${p.id}`;
                  return (
                    <label
                      key={idDoItem}
                      className={cn(
                        'relative flex min-h-11 cursor-pointer flex-col gap-1 rounded-xl border bg-background p-3 transition-colors hover:border-primary/60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                        marcado
                          ? 'border-primary bg-sidebar-accent'
                          : 'border-border'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Checkbox
                          checked={marcado}
                          onCheckedChange={(v) =>
                            alternarProvedor(p, v === true)
                          }
                          aria-labelledby={`provedor-${idDoItem}-nome`}
                          aria-describedby={`provedor-${idDoItem}-descricao`}
                        />
                        <span
                          id={`provedor-${idDoItem}-nome`}
                          className="text-sm font-semibold text-foreground"
                        >
                          {ehLyra ? 'Motor da Lyra' : p.nome}
                        </span>
                        {!ehLyra && selecionado(p.id) ? (
                          <span className="ml-auto rounded-full bg-success-light px-2 py-px text-[0.6875rem] font-semibold text-foreground">
                            {selecionado(p.id)?.modelos.length ?? 0} modelo(s)
                          </span>
                        ) : null}
                      </span>
                      <span
                        id={`provedor-${idDoItem}-descricao`}
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

        {selecionados.map((p) => {
          const preset = presetPor(p.preset);
          if (!preset) return null;
          const salvo = salvoPor(p.preset);
          const usaUrl = preset.tipo === 'openai_compativel';
          const exigeChave =
            preset.exigeChave ||
            preset.tipo === 'gemini' ||
            preset.tipo === 'anthropic';
          const ehLocal = usaUrl && urlEhLocal(p.baseUrl);
          const idBase = `ia-${p.preset}`;
          const sugestoes = [
            ...new Set([...p.encontrados, ...p.modelos]),
          ].slice(0, 40);
          return (
            <section
              key={p.preset}
              aria-labelledby={`${idBase}-titulo`}
              className="grid gap-5 rounded-2xl border border-border bg-background/60 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  id={`${idBase}-titulo`}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground"
                >
                  {preset.local || ehLocal ? (
                    <Cpu className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Cloud className="h-4 w-4" aria-hidden="true" />
                  )}
                  {preset.nome}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => alternarProvedor(preset, false)}
                >
                  <X aria-hidden="true" />
                  Remover provedor
                </Button>
              </div>

              {usaUrl ? (
                <div className="grid gap-2">
                  <Label htmlFor={`${idBase}-url`}>URL base da API</Label>
                  <Input
                    id={`${idBase}-url`}
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="http://localhost:11434/v1"
                    value={p.baseUrl}
                    onChange={(e) =>
                      atualizar(p.preset, { baseUrl: e.target.value })
                    }
                    aria-describedby={`${idBase}-url-ajuda`}
                  />
                  <p
                    id={`${idBase}-url-ajuda`}
                    className="text-xs leading-relaxed text-muted-foreground"
                  >
                    Endereço visto pelo servidor da Lyra, terminando em /v1. Com
                    a Lyra em contêiner, troque localhost por
                    host.docker.internal.
                    {ehLocal
                      ? ' Endereço local: os dados não saem da sua rede.'
                      : ''}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor={`${idBase}-chave`}>
                  Chave de API {exigeChave ? '' : '(opcional)'}
                </Label>
                <div className="relative">
                  <KeyRound
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id={`${idBase}-chave`}
                    type="password"
                    autoComplete="new-password"
                    spellCheck={false}
                    className="pl-9"
                    placeholder={
                      salvo?.temChave
                        ? `Chave salva terminada em ${salvo.finalDaChave ?? '••••'}`
                        : exigeChave
                          ? 'Cole a chave deste provedor'
                          : 'Só se o servidor exigir'
                    }
                    value={p.chave}
                    onChange={(e) =>
                      atualizar(p.preset, {
                        chave: e.target.value,
                        ...(e.target.value ? { apagarChave: false } : {}),
                      })
                    }
                  />
                </div>
                {salvo?.chaveIlegivel ? (
                  <p
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    A chave salva não pode mais ser lida (o AUTH_SECRET mudou).
                    Informe a chave de novo.
                  </p>
                ) : null}
                {salvo?.temChave && !exigeChave ? (
                  <label className="flex min-h-8 items-center gap-2 text-xs text-foreground">
                    <Checkbox
                      checked={p.apagarChave}
                      onCheckedChange={(v) =>
                        atualizar(p.preset, { apagarChave: v === true })
                      }
                    />
                    Remover a chave salva
                  </label>
                ) : null}
              </div>

              <div className="grid gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    id={`${idBase}-modelos`}
                    className="text-sm font-medium leading-none"
                  >
                    Modelos (marque um ou mais)
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void buscarModelos(p)}
                    disabled={ocupado !== null}
                  >
                    {ocupado === `modelos:${p.preset}` ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                      <ListRestart aria-hidden="true" />
                    )}
                    Buscar modelos
                  </Button>
                </div>
                {sugestoes.length > 0 ? (
                  <ul
                    className="flex flex-wrap gap-1.5"
                    aria-labelledby={`${idBase}-modelos`}
                  >
                    {sugestoes.map((m) => {
                      const ativo = p.modelos.includes(m);
                      return (
                        <li key={m}>
                          <button
                            type="button"
                            aria-pressed={ativo}
                            onClick={() => alternarModelo(p, m)}
                            className={cn(
                              'min-h-8 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                              ativo
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-foreground hover:border-primary/60'
                            )}
                          >
                            {m}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Busque os modelos do servidor ou informe o nome abaixo.
                  </p>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    aria-label={`Adicionar modelo de ${preset.nome} pelo nome`}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="ex.: qwen2.5:7b-instruct"
                    value={p.novoModelo}
                    onChange={(e) =>
                      atualizar(p.preset, { novoModelo: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        adicionarModelo(p);
                      }
                    }}
                    className="min-w-0 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => adicionarModelo(p)}
                    disabled={!p.novoModelo.trim()}
                  >
                    <Plus aria-hidden="true" />
                    Adicionar
                  </Button>
                </div>
                {p.modelos.length > 0 ? (
                  <ul
                    className="mt-1 grid gap-2"
                    aria-label="Modelos escolhidos"
                  >
                    {p.modelos.map((m) => {
                      const teste = p.testes[m];
                      return (
                        <li
                          key={m}
                          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center"
                        >
                          <span className="min-w-0 flex-1 break-all text-sm font-medium text-foreground">
                            {m}
                          </span>
                          {teste ? (
                            <span
                              role="status"
                              className={cn(
                                'flex min-w-0 items-center gap-1.5 text-xs',
                                teste.ok ? 'text-success' : 'text-destructive'
                              )}
                            >
                              {teste.ok ? (
                                <CheckCircle2
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                />
                              ) : (
                                <XCircle
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="min-w-0 break-words text-foreground">
                                {teste.ok
                                  ? `Funcionando · ${segundos(teste.milissegundos)}`
                                  : teste.error}
                              </span>
                            </span>
                          ) : null}
                          <span className="flex shrink-0 gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void testarModelo(p, m)}
                              disabled={ocupado !== null}
                              aria-label={`Testar ${m}`}
                            >
                              {ocupado === `testar:${p.preset}|${m}` ? (
                                <Loader2
                                  className="animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlugZap aria-hidden="true" />
                              )}
                              Testar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => alternarModelo(p, m)}
                              aria-label={`Tirar ${m}`}
                            >
                              <X aria-hidden="true" />
                            </Button>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label id={`${idBase}-temperatura`}>
                      Criatividade (temperatura)
                    </Label>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {p.temperatura.toLocaleString('pt-BR', {
                        minimumFractionDigits: 1,
                      })}
                    </span>
                  </div>
                  <Slider
                    aria-labelledby={`${idBase}-temperatura`}
                    min={0}
                    max={2}
                    step={0.1}
                    value={[p.temperatura]}
                    onValueChange={([v]) =>
                      atualizar(p.preset, {
                        temperatura: Math.round(v * 10) / 10,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    0,6 a 0,9 equilibra variedade e fidelidade aos fatos.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`${idBase}-tempo`}>
                    Tempo máximo de resposta (s)
                  </Label>
                  <Input
                    id={`${idBase}-tempo`}
                    type="number"
                    min={10}
                    max={600}
                    step={5}
                    value={p.tempoMaximo}
                    onChange={(e) =>
                      atualizar(p.preset, {
                        tempoMaximo: Math.min(
                          600,
                          Math.max(10, Number(e.target.value) || 10)
                        ),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Ao passar do tempo, o próximo da ordem assume.
                  </p>
                </div>
              </div>
            </section>
          );
        })}

        {selecionados.length === 0 ? (
          <p className="rounded-2xl border border-border bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground">
            Sem provedores marcados, o motor védico da Lyra escreve a leitura
            com regras do Jyotish e do Ayurveda, sem modelo generativo e sem
            enviar dados para fora.
          </p>
        ) : null}

        <div
          className={cn(
            'flex gap-3 rounded-2xl border p-4 text-xs leading-relaxed',
            temNuvem
              ? 'border-cosmic/30 bg-cosmic-light/50 text-foreground'
              : 'border-success/30 bg-success-light/50 text-foreground'
          )}
        >
          <ShieldCheck
            className={cn(
              'mt-0.5 h-4 w-4 shrink-0',
              temNuvem ? 'text-cosmic' : 'text-success'
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

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ListOrdered className="h-4 w-4" aria-hidden="true" />
            Ordem de uso dos modelos
          </legend>
          <p className="text-xs leading-relaxed text-muted-foreground">
            O 1º responde primeiro. Se ele falhar, demorar além do tempo máximo
            ou ficar sem tokens, o 2º assume do ponto em que o 1º parou, e assim
            por diante. O chat usa só os modelos locais desta ordem.
          </p>
          <ol className="grid gap-2">
            {ordemValida.map((valor, indice) => {
              const usadosEmOutras = new Set(
                ordemValida.filter((v, i) => i !== indice && v !== VAZIO)
              );
              const idDoSeletor = `ia-ordem-${indice + 1}`;
              return (
                <li
                  key={idDoSeletor}
                  className="grid items-center gap-2 sm:grid-cols-[7rem_minmax(0,1fr)]"
                >
                  <Label htmlFor={idDoSeletor}>{indice + 1}º modelo</Label>
                  <Select
                    value={valor}
                    onValueChange={(novo) =>
                      setOrdem((atual) =>
                        atual.map((v, i) => (i === indice ? novo : v))
                      )
                    }
                  >
                    <SelectTrigger id={idDoSeletor} className="w-full">
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VAZIO}>Nenhum</SelectItem>
                      {opcoesDaOrdem.length > 0 ? (
                        <SelectGroup>
                          <SelectLabel>Modelos marcados</SelectLabel>
                          {opcoesDaOrdem.map((opcao) => (
                            <SelectItem
                              key={opcao.chave}
                              value={opcao.chave}
                              disabled={usadosEmOutras.has(opcao.chave)}
                            >
                              {opcao.rotulo}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ) : null}
                    </SelectContent>
                  </Select>
                </li>
              );
            })}
          </ol>
          {ordemPreenchida.length === 0 ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              Escolha ao menos o 1º modelo.
            </p>
          ) : !ordemPreenchida.includes(LYRA) ? (
            <p className="text-xs text-muted-foreground">
              Se todos os modelos da ordem falharem, o motor da Lyra responde.
            </p>
          ) : null}
        </fieldset>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
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
            Salvar modelos e ordem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
