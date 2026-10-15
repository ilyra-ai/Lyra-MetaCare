'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Wind,
} from 'lucide-react';

import { PageIntro } from '@/components/layout/PageIntro';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  useMovimentoReduzido,
  useVibracaoDisponivel,
  useVozDisponivel,
} from '@/hooks/use-recursos-do-navegador';
import { useResumoDaRespiracao } from '@/hooks/use-resumo-da-respiracao';
import type { ResumoDaRespiracao } from '@/lib/respiracao/servico';
import {
  ciclosParaMinutos,
  DEFINICOES,
  DURACOES_EM_MINUTOS,
  duracaoDoCiclo,
  posicaoNaSessao,
  SEGUNDOS_MINIMOS,
  TECNICAS,
  type Fase,
  type Tecnica,
} from '@/lib/respiracao/tecnicas';
import { cn } from '@/lib/utils';

/**
 * Respiração guiada (tarefa 44): escolha da técnica e da duração, orbe que
 * cresce e encolhe no ritmo real de cada fase, voz e vibração opcionais e o
 * registro automático dos minutos na meditação do dia ao terminar.
 */

type Execucao =
  | { etapa: 'escolha' }
  | {
      etapa: 'rodando';
      tecnica: Tecnica;
      ciclos: number;
      /** `performance.now()` do início, já descontadas as pausas. */
      inicio: number;
    }
  | { etapa: 'pausada'; tecnica: Tecnica; ciclos: number; decorrido: number }
  | {
      etapa: 'registrando';
      tecnica: Tecnica;
      ciclos: number;
      segundos: number;
    }
  | {
      etapa: 'fim';
      tecnica: Tecnica;
      /** Ciclos e segundos enviados (para tentar de novo em caso de falha). */
      envio: { ciclos: number; segundos: number } | null;
      resumo: ResumoDaRespiracao | null;
      minutos: number | null;
      mensagem: string;
      falhou: boolean;
    };

const ESCALA_CHEIA = 1;
const ESCALA_VAZIA = 0.56;

function ehTecnica(valor: string | null): valor is Tecnica {
  return valor !== null && (TECNICAS as readonly string[]).includes(valor);
}

function minutosValidos(valor: string | null) {
  const numero = Number(valor);
  return (DURACOES_EM_MINUTOS as readonly number[]).includes(numero)
    ? numero
    : null;
}

/** Escala do orbe no fim da fase anterior a `indice` (para as retenções). */
function escalaAntesDa(fases: Fase[], indice: number) {
  for (let i = indice - 1; i >= 0; i -= 1) {
    if (fases[i].movimento === 'inspirar') return ESCALA_CHEIA;
    if (fases[i].movimento === 'soltar') return ESCALA_VAZIA;
  }
  // Primeira fase do ciclo: o ciclo anterior terminou com os pulmões vazios.
  return ESCALA_VAZIA;
}

function formatarDuracao(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = Math.round(segundos % 60);
  return m > 0 ? `${m} min ${String(s).padStart(2, '0')} s` : `${s} s`;
}

export function RespiracaoGuiada() {
  const parametros = useSearchParams();
  const { resumo, carregando, erro, substituir } = useResumoDaRespiracao();
  const movimentoReduzido = useMovimentoReduzido();
  const vibracaoDisponivel = useVibracaoDisponivel();
  const vozDisponivel = useVozDisponivel();

  const [tecnicaEscolhida, setTecnicaEscolhida] =
    React.useState<Tecnica | null>(null);
  const [minutosEscolhidos, setMinutosEscolhidos] = React.useState<
    number | null
  >(null);
  const [voz, setVoz] = React.useState(false);
  const [vibracao, setVibracao] = React.useState(false);
  const [execucao, setExecucao] = React.useState<Execucao>({
    etapa: 'escolha',
  });
  const [agora, setAgora] = React.useState(0);
  const [anuncio, setAnuncio] = React.useState('');

  const execucaoRef = React.useRef(execucao);
  const faseAnunciadaRef = React.useRef('');
  const travaDeTelaRef = React.useRef<WakeLockSentinel | null>(null);
  const preferenciasRef = React.useRef({ voz, vibracao });
  React.useEffect(() => {
    execucaoRef.current = execucao;
  }, [execucao]);
  React.useEffect(() => {
    preferenciasRef.current = { voz, vibracao };
  }, [voz, vibracao]);

  const parametroDeTecnica = parametros.get('tecnica');
  const tecnica: Tecnica =
    tecnicaEscolhida ??
    (ehTecnica(parametroDeTecnica) ? parametroDeTecnica : null) ??
    resumo?.recomendacao.tecnica ??
    'quadrada';
  const minutos =
    minutosEscolhidos ??
    minutosValidos(parametros.get('minutos')) ??
    resumo?.recomendacao.minutos ??
    3;

  const anunciar = React.useCallback((fase: Fase) => {
    setAnuncio(fase.instrucao);
    const { voz: comVoz, vibracao: comVibracao } = preferenciasRef.current;
    if (comVoz && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const fala = new SpeechSynthesisUtterance(fase.instrucao);
      fala.lang = 'pt-BR';
      fala.rate = 0.9;
      window.speechSynthesis.speak(fala);
    }
    if (comVibracao && typeof navigator.vibrate === 'function') {
      navigator.vibrate(fase.movimento === 'segurar' ? [60, 80, 60] : 120);
    }
  }, []);

  const soltarTravaDeTela = React.useCallback(() => {
    void travaDeTelaRef.current?.release().catch(() => undefined);
    travaDeTelaRef.current = null;
  }, []);

  const registrar = React.useCallback(
    async (alvo: Tecnica, ciclos: number, segundos: number) => {
      setExecucao({ etapa: 'registrando', tecnica: alvo, ciclos, segundos });
      try {
        const resposta = await fetch('/api/respiracao', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tecnica: alvo, ciclos, segundos }),
        });
        const corpo = (await resposta.json().catch(() => null)) as
          | (ResumoDaRespiracao & { error?: undefined })
          | { error?: string }
          | null;
        if (!resposta.ok || !corpo || !('sessoes' in corpo)) {
          throw new Error(
            (corpo && 'error' in corpo && corpo.error) ||
              'Não foi possível registrar a sessão.'
          );
        }
        substituir(corpo);
        const ultima = corpo.sessoes[corpo.sessoes.length - 1];
        setExecucao({
          etapa: 'fim',
          tecnica: alvo,
          envio: null,
          resumo: corpo,
          minutos: ultima?.minutos ?? null,
          mensagem: `${formatarDuracao(segundos)} de ${DEFINICOES[alvo].nome}, ${ciclos} ${ciclos === 1 ? 'ciclo' : 'ciclos'}.`,
          falhou: false,
        });
        setAnuncio('Sessão concluída e registrada na sua meditação de hoje.');
      } catch (falha) {
        setExecucao({
          etapa: 'fim',
          tecnica: alvo,
          envio: { ciclos, segundos },
          resumo: null,
          minutos: null,
          mensagem:
            falha instanceof Error
              ? falha.message
              : 'Sem conexão para registrar a sessão.',
          falhou: true,
        });
      }
    },
    [substituir]
  );

  // Relógio da sessão: a posição vem do tempo decorrido, não de contadores.
  const rodando = execucao.etapa === 'rodando';
  React.useEffect(() => {
    if (!rodando) return;
    const intervalo = window.setInterval(() => {
      const atual = execucaoRef.current;
      if (atual.etapa !== 'rodando') return;
      const instante = performance.now();
      const decorrido = (instante - atual.inicio) / 1000;
      const posicao = posicaoNaSessao(atual.tecnica, atual.ciclos, decorrido);
      setAgora(instante);
      if (posicao.concluida) {
        soltarTravaDeTela();
        void registrar(
          atual.tecnica,
          atual.ciclos,
          atual.ciclos * duracaoDoCiclo(atual.tecnica)
        );
        return;
      }
      const chave = `${posicao.ciclo}:${posicao.indiceDaFase}`;
      if (chave !== faseAnunciadaRef.current) {
        faseAnunciadaRef.current = chave;
        anunciar(posicao.fase);
      }
    }, 100);
    return () => window.clearInterval(intervalo);
  }, [rodando, anunciar, registrar, soltarTravaDeTela]);

  // Ao sair da página no meio da sessão: sem voz, vibração ou tela presa.
  React.useEffect(
    () => () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      void travaDeTelaRef.current?.release().catch(() => undefined);
    },
    []
  );

  const iniciar = () => {
    const ciclos = ciclosParaMinutos(tecnica, minutos);
    const inicio = performance.now();
    faseAnunciadaRef.current = '1:0';
    setAgora(inicio);
    setExecucao({ etapa: 'rodando', tecnica, ciclos, inicio });
    anunciar(DEFINICOES[tecnica].fases[0]);
    if ('wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((trava) => {
          travaDeTelaRef.current = trava;
        })
        .catch(() => undefined);
    }
  };

  const pausar = () => {
    if (execucao.etapa !== 'rodando') return;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setExecucao({
      etapa: 'pausada',
      tecnica: execucao.tecnica,
      ciclos: execucao.ciclos,
      decorrido: (performance.now() - execucao.inicio) / 1000,
    });
    setAnuncio('Sessão pausada.');
  };

  const retomar = () => {
    if (execucao.etapa !== 'pausada') return;
    const inicio = performance.now() - execucao.decorrido * 1000;
    setAgora(performance.now());
    setExecucao({
      etapa: 'rodando',
      tecnica: execucao.tecnica,
      ciclos: execucao.ciclos,
      inicio,
    });
    setAnuncio('Sessão retomada.');
  };

  const encerrar = () => {
    if (execucao.etapa !== 'rodando' && execucao.etapa !== 'pausada') return;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    soltarTravaDeTela();
    const decorrido =
      execucao.etapa === 'rodando'
        ? (performance.now() - execucao.inicio) / 1000
        : execucao.decorrido;
    const posicao = posicaoNaSessao(
      execucao.tecnica,
      execucao.ciclos,
      decorrido
    );
    if (posicao.ciclosCompletos >= 1 && decorrido >= SEGUNDOS_MINIMOS) {
      void registrar(
        execucao.tecnica,
        posicao.ciclosCompletos,
        Math.floor(decorrido)
      );
      return;
    }
    setExecucao({
      etapa: 'fim',
      tecnica: execucao.tecnica,
      envio: null,
      resumo: null,
      minutos: null,
      mensagem: `Sessão curta: nada foi registrado. Para entrar na meditação do dia, faça ao menos um ciclo completo e ${SEGUNDOS_MINIMOS} segundos.`,
      falhou: false,
    });
  };

  const recomecar = () => setExecucao({ etapa: 'escolha' });

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageIntro
        eyebrow="Pausa guiada"
        title="Respiração"
        description="Escolha a técnica e a duração e siga o orbe: ele cresce, para e encolhe no tempo real de cada fase. Ao terminar, os minutos entram na sua meditação de hoje e nas metas."
      />
      <p aria-live="polite" className="sr-only">
        {anuncio}
      </p>

      {execucao.etapa === 'escolha' ? (
        <Escolha
          resumo={resumo}
          carregando={carregando}
          erro={erro}
          tecnica={tecnica}
          minutos={minutos}
          voz={voz}
          vibracao={vibracao}
          vozDisponivel={vozDisponivel}
          vibracaoDisponivel={vibracaoDisponivel}
          onTecnica={setTecnicaEscolhida}
          onMinutos={setMinutosEscolhidos}
          onVoz={setVoz}
          onVibracao={setVibracao}
          onIniciar={iniciar}
        />
      ) : execucao.etapa === 'fim' ? (
        <Final
          execucao={execucao}
          onRecomecar={recomecar}
          onTentarDeNovo={() => {
            if (execucao.envio) {
              void registrar(
                execucao.tecnica,
                execucao.envio.ciclos,
                execucao.envio.segundos
              );
            }
          }}
        />
      ) : (
        <Sessao
          execucao={execucao}
          agora={agora}
          movimentoReduzido={movimentoReduzido}
          onPausar={pausar}
          onRetomar={retomar}
          onEncerrar={encerrar}
        />
      )}

      <ResumoDeHoje resumo={resumo} carregando={carregando} />
    </div>
  );
}

function Escolha({
  resumo,
  carregando,
  erro,
  tecnica,
  minutos,
  voz,
  vibracao,
  vozDisponivel,
  vibracaoDisponivel,
  onTecnica,
  onMinutos,
  onVoz,
  onVibracao,
  onIniciar,
}: {
  resumo: ResumoDaRespiracao | null;
  carregando: boolean;
  erro: string | null;
  tecnica: Tecnica;
  minutos: number;
  voz: boolean;
  vibracao: boolean;
  vozDisponivel: boolean;
  vibracaoDisponivel: boolean;
  onTecnica: (tecnica: Tecnica) => void;
  onMinutos: (minutos: number) => void;
  onVoz: (ativa: boolean) => void;
  onVibracao: (ativa: boolean) => void;
  onIniciar: () => void;
}) {
  const recomendacao = resumo?.recomendacao ?? null;
  const ciclos = ciclosParaMinutos(tecnica, minutos);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <section
        aria-labelledby="titulo-escolha"
        className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-5 sm:p-6"
      >
        <h3 id="titulo-escolha" className="sr-only">
          Escolha da sessão
        </h3>
        {carregando && !recomendacao ? (
          <Skeleton className="h-20 w-full" />
        ) : recomendacao ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-cosmic/25 bg-cosmic-light p-4 sm:flex-row sm:items-center">
            <Sparkles
              className="h-5 w-5 shrink-0 text-cosmic-strong"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Recomendada agora: {DEFINICOES[recomendacao.tecnica].nome} ·{' '}
                {recomendacao.minutos} min
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {recomendacao.porque}
              </p>
            </div>
            {tecnica !== recomendacao.tecnica ||
            minutos !== recomendacao.minutos ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start sm:self-center"
                onClick={() => {
                  onTecnica(recomendacao.tecnica);
                  onMinutos(recomendacao.minutos);
                }}
              >
                Usar recomendação
              </Button>
            ) : null}
          </div>
        ) : erro ? (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        ) : null}

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-semibold text-foreground">
            Técnica
          </legend>
          <div className="grid gap-3 md:grid-cols-3">
            {TECNICAS.map((id) => {
              const definicao = DEFINICOES[id];
              return (
                <label key={id} className="relative block h-full">
                  <input
                    type="radio"
                    name="tecnica-de-respiracao"
                    value={id}
                    checked={tecnica === id}
                    onChange={() => onTecnica(id)}
                    className="peer sr-only"
                  />
                  <span className="flex h-full cursor-pointer flex-col gap-1.5 rounded-2xl border border-border bg-background p-4 transition-colors duration-150 hover:border-primary/60 peer-checked:border-primary peer-checked:bg-sidebar-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring motion-reduce:transition-none">
                    <span className="font-display text-base font-semibold text-foreground">
                      {definicao.nome}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {definicao.resumo}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {definicao.indicacao}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <p
            id="rotulo-duracao"
            className="text-sm font-semibold text-foreground"
          >
            Duração
          </p>
          <ToggleGroup
            type="single"
            value={String(minutos)}
            onValueChange={(valor) => {
              if (valor) onMinutos(Number(valor));
            }}
            aria-labelledby="rotulo-duracao"
            className="flex w-full flex-wrap justify-start gap-2"
          >
            {DURACOES_EM_MINUTOS.map((opcao) => (
              <ToggleGroupItem
                key={opcao}
                value={String(opcao)}
                className="h-10 min-w-16 rounded-[10px] border border-border px-4 data-[state=on]:border-primary data-[state=on]:bg-sidebar-accent data-[state=on]:text-sidebar-accent-foreground"
              >
                {opcao} min
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">
            {ciclos} {ciclos === 1 ? 'ciclo' : 'ciclos'} de{' '}
            {duracaoDoCiclo(tecnica)} s ·{' '}
            {formatarDuracao(ciclos * duracaoDoCiclo(tecnica))}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border p-4">
            <Label htmlFor="voz-guiada" className="flex flex-col gap-0.5">
              <span>Voz guiada</span>
              <span className="text-xs font-normal text-muted-foreground">
                {vozDisponivel
                  ? 'Anuncia cada fase em voz alta.'
                  : 'Este navegador não oferece voz.'}
              </span>
            </Label>
            <Switch
              id="voz-guiada"
              checked={voz && vozDisponivel}
              disabled={!vozDisponivel}
              onCheckedChange={onVoz}
            />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border p-4">
            <Label htmlFor="vibracao" className="flex flex-col gap-0.5">
              <span>Vibração</span>
              <span className="text-xs font-normal text-muted-foreground">
                {vibracaoDisponivel
                  ? 'Um toque a cada troca de fase.'
                  : 'Disponível em celulares Android.'}
              </span>
            </Label>
            <Switch
              id="vibracao"
              checked={vibracao && vibracaoDisponivel}
              disabled={!vibracaoDisponivel}
              onCheckedChange={onVibracao}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Respire sem forçar. Se sentir tontura ou falta de ar, volte à
            respiração natural. Na gestação ou com condições respiratórias ou
            cardíacas, prefira a Nadi Shodhana (sem retenção) e converse com um
            profissional de saúde.
          </p>
          <Button type="button" size="lg" onClick={onIniciar}>
            <Play aria-hidden="true" />
            Começar {DEFINICOES[tecnica].nome}
          </Button>
        </div>
      </section>
      <aside className="hidden lg:block">
        <OrboEstatico tecnica={tecnica} />
      </aside>
    </div>
  );
}

/** Prévia do orbe na escolha: mostra o desenho do ciclo da técnica. */
function OrboEstatico({ tecnica }: { tecnica: Tecnica }) {
  const fases = DEFINICOES[tecnica].fases;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-3xl border border-border bg-card p-6 text-center">
      <div
        aria-hidden="true"
        className="flex h-40 w-40 items-center justify-center rounded-full bg-sidebar-accent"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Wind className="h-8 w-8" />
        </div>
      </div>
      <ol className="flex w-full flex-col gap-2 text-left">
        {fases.map((fase, indice) => (
          <li
            key={`${fase.instrucao}-${indice}`}
            className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2 text-sm"
          >
            <span className="text-foreground">{fase.instrucao}</span>
            <span className="tabular-nums text-muted-foreground">
              {fase.segundos} s
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Sessao({
  execucao,
  agora,
  movimentoReduzido,
  onPausar,
  onRetomar,
  onEncerrar,
}: {
  execucao: Extract<Execucao, { etapa: 'rodando' | 'pausada' | 'registrando' }>;
  agora: number;
  movimentoReduzido: boolean;
  onPausar: () => void;
  onRetomar: () => void;
  onEncerrar: () => void;
}) {
  const titulo = React.useRef<HTMLHeadingElement>(null);
  // A escolha some e a sessão aparece no lugar: o foco vai para o título
  // (leitor de tela anuncia a troca e, no celular, a sessão entra na tela).
  React.useEffect(() => {
    titulo.current?.focus({ preventScroll: true });
    // `auto` segue o `scroll-behavior` do CSS global: suave, exceto com
    // movimento reduzido.
    titulo.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }, []);
  const definicao = DEFINICOES[execucao.tecnica];
  const decorrido =
    execucao.etapa === 'rodando'
      ? Math.max(0, (agora - execucao.inicio) / 1000)
      : execucao.etapa === 'pausada'
        ? execucao.decorrido
        : execucao.segundos;
  const posicao = posicaoNaSessao(execucao.tecnica, execucao.ciclos, decorrido);
  const { fase } = posicao;
  const pausada = execucao.etapa !== 'rodando';

  const inicial = escalaAntesDa(definicao.fases, posicao.indiceDaFase);
  const alvo =
    fase.movimento === 'inspirar'
      ? ESCALA_CHEIA
      : fase.movimento === 'soltar'
        ? ESCALA_VAZIA
        : inicial;
  const fracao = Math.min(1, posicao.decorridoNaFase / fase.segundos);
  // Escala calculada pelo relógio a cada atualização (100 ms), com curva
  // suave de respiração; a transição curta só liga um passo ao outro. Assim
  // o orbe já começa vazio na primeira inspiração e acompanha pausas.
  const suavizada = 0.5 - Math.cos(Math.PI * fracao) / 2;
  const atual = inicial + (alvo - inicial) * suavizada;
  const transicao = pausada ? 'none' : 'transform 100ms linear';
  const total = execucao.ciclos * duracaoDoCiclo(execucao.tecnica);

  return (
    <section
      aria-labelledby="titulo-sessao"
      className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card px-5 py-8 sm:px-8"
    >
      <h3
        id="titulo-sessao"
        ref={titulo}
        tabIndex={-1}
        className="scroll-mt-24 text-center font-display text-lg font-semibold text-foreground focus-visible:outline-none"
      >
        {definicao.nome}
        <span className="block text-sm font-normal text-muted-foreground">
          Ciclo {posicao.ciclo} de {execucao.ciclos}
        </span>
      </h3>

      <div
        className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80"
        role="img"
        aria-label={`${fase.instrucao}: ${posicao.restanteNaFase} segundos`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-primary/20 bg-sidebar-accent"
        />
        {movimentoReduzido ? (
          <AnelDaFase fracao={fracao} />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-[6%] rounded-full bg-primary/20 will-change-transform"
            style={{ transform: `scale(${atual})`, transition: transicao }}
          />
        )}
        <div
          aria-hidden="true"
          className={cn(
            'relative flex h-36 w-36 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md',
            !movimentoReduzido && 'will-change-transform'
          )}
          style={
            movimentoReduzido
              ? undefined
              : {
                  transform: `scale(${0.75 + 0.25 * atual})`,
                  transition: transicao,
                }
          }
        >
          <span className="text-sm font-semibold uppercase tracking-[0.12em]">
            {fase.rotulo}
          </span>
          <span className="font-display text-5xl font-semibold tabular-nums leading-none">
            {posicao.restanteNaFase}
          </span>
        </div>
      </div>

      <p className="text-center text-lg font-medium text-foreground">
        {pausada && execucao.etapa === 'pausada' ? 'Pausada · ' : ''}
        {fase.instrucao}
      </p>

      <div className="w-full max-w-md">
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Progresso da sessão"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(posicao.progresso * 100)}
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${posicao.progresso * 100}%` }}
          />
        </div>
        <p className="mt-1.5 flex justify-between text-xs tabular-nums text-muted-foreground">
          <span>{formatarDuracao(decorrido)}</span>
          <span>{formatarDuracao(total)}</span>
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {execucao.etapa === 'rodando' ? (
          <Button type="button" variant="outline" onClick={onPausar}>
            <Pause aria-hidden="true" />
            Pausar
          </Button>
        ) : execucao.etapa === 'pausada' ? (
          <Button type="button" onClick={onRetomar}>
            <Play aria-hidden="true" />
            Retomar
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          onClick={onEncerrar}
          disabled={execucao.etapa === 'registrando'}
        >
          <Square aria-hidden="true" />
          {execucao.etapa === 'registrando' ? 'Registrando…' : 'Encerrar'}
        </Button>
      </div>
    </section>
  );
}

/** Movimento reduzido: o orbe fica parado e um anel mostra a fase. */
function AnelDaFase({ fracao }: { fracao: number }) {
  const raio = 46;
  const circunferencia = 2 * Math.PI * raio;
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="absolute inset-[4%] -rotate-90"
    >
      <circle
        cx="50"
        cy="50"
        r={raio}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circunferencia}
        strokeDashoffset={circunferencia * (1 - fracao)}
      />
    </svg>
  );
}

function Final({
  execucao,
  onRecomecar,
  onTentarDeNovo,
}: {
  execucao: Extract<Execucao, { etapa: 'fim' }>;
  onRecomecar: () => void;
  onTentarDeNovo: () => void;
}) {
  const total = execucao.resumo?.minutosDeMeditacaoNoDia ?? null;
  return (
    <section
      aria-labelledby="titulo-final"
      className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-5 py-10 text-center sm:px-8"
    >
      {execucao.minutos !== null ? (
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
      ) : null}
      <h3
        id="titulo-final"
        className="font-display text-2xl font-semibold text-foreground"
      >
        {execucao.minutos !== null
          ? `+${execucao.minutos} min na sua meditação de hoje`
          : execucao.falhou
            ? 'A sessão não foi registrada'
            : 'Sessão encerrada'}
      </h3>
      <p
        className={cn(
          'max-w-lg text-sm',
          execucao.falhou ? 'text-destructive' : 'text-muted-foreground'
        )}
        role={execucao.falhou ? 'alert' : undefined}
      >
        {execucao.mensagem}
        {total !== null ? ` Meditação do dia: ${total} min.` : ''}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {execucao.falhou && execucao.envio ? (
          <Button type="button" onClick={onTentarDeNovo}>
            Tentar registrar de novo
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onRecomecar}>
          <RotateCcw aria-hidden="true" />
          Nova sessão
        </Button>
        {execucao.minutos !== null ? (
          <Button asChild variant="ghost">
            <Link href="/goals">
              Ver metas
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function ResumoDeHoje({
  resumo,
  carregando,
}: {
  resumo: ResumoDaRespiracao | null;
  carregando: boolean;
}) {
  if (carregando && !resumo) {
    return <Skeleton className="h-20 w-full rounded-3xl" />;
  }
  if (!resumo) return null;
  return (
    <section
      aria-labelledby="titulo-hoje"
      className="rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <h3
        id="titulo-hoje"
        className="font-display text-lg font-semibold text-foreground"
      >
        Hoje
      </h3>
      <dl className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">Sessões guiadas</dt>
          <dd className="font-display text-2xl font-semibold tabular-nums text-foreground">
            {resumo.sessoes.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Minutos guiados</dt>
          <dd className="font-display text-2xl font-semibold tabular-nums text-foreground">
            {resumo.minutosGuiados}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            Meditação do dia (com o check-in)
          </dt>
          <dd className="font-display text-2xl font-semibold tabular-nums text-foreground">
            {resumo.minutosDeMeditacaoNoDia ?? '—'}
            {resumo.minutosDeMeditacaoNoDia !== null ? (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                min
              </span>
            ) : null}
          </dd>
        </div>
      </dl>
      {resumo.sessoes.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {resumo.sessoes.map((sessao) => (
            <li
              key={sessao.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2 text-sm"
            >
              <span className="text-foreground">
                {DEFINICOES[sessao.tecnica].nome} · {sessao.ciclos}{' '}
                {sessao.ciclos === 1 ? 'ciclo' : 'ciclos'}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {new Intl.DateTimeFormat('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(sessao.registradaEm))}{' '}
                · {sessao.minutos} min
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
