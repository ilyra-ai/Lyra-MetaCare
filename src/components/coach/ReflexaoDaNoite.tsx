'use client';

import * as React from 'react';
import { MoonStar, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import {
  DIMENSOES_DA_REFLEXAO,
  LIMITE_DA_FRASE,
  reflexaoSchema,
  SIGNIFICADO_DA_NOTA,
  type DimensaoDaReflexao,
  type EstadoDaReflexao,
} from '@/lib/reflexao/esquema';
import { avisarReflexaoAtualizada } from '@/lib/reflexao/evento';
import { cn } from '@/lib/utils';

import { dataPorExtenso } from './partes';

/**
 * Reflexão da noite (tarefa 44): a pessoa fecha o dia com uma nota de 1 a 5
 * para a parte emocional, o corpo e a parte espiritual (as mesmas dimensões
 * da leitura do "Seu dia") e uma frase opcional. Fica junto da avaliação da
 * leitura ("a leitura de hoje te ajudou?"), que fecha o mesmo ciclo.
 */

type Notas = Record<DimensaoDaReflexao, number | null>;

async function lerErro(resposta: Response, padrao: string) {
  const corpo = (await resposta.json().catch(() => null)) as {
    error?: string;
  } | null;
  return corpo?.error ?? padrao;
}

function horaLocal(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function Escala({
  dimensao,
  valor,
  onChange,
  desabilitada,
}: {
  dimensao: (typeof DIMENSOES_DA_REFLEXAO)[number];
  valor: number | null;
  onChange: (nota: number) => void;
  desabilitada: boolean;
}) {
  const idDaDescricao = React.useId();
  return (
    <fieldset className="min-w-0" aria-describedby={idDaDescricao}>
      <legend className="text-sm font-semibold text-foreground">
        {dimensao.rotulo}
      </legend>
      <p id={idDaDescricao} className="text-xs text-muted-foreground">
        {dimensao.descricao}
      </p>
      <div className="mt-2.5 grid grid-cols-5 gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((nota) => (
          <label key={nota} className="relative block">
            <input
              type="radio"
              name={`reflexao-${dimensao.chave}`}
              value={nota}
              checked={valor === nota}
              disabled={desabilitada}
              onChange={() => onChange(nota)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                'flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-border bg-card text-sm font-semibold tabular-nums text-foreground transition-colors duration-150 motion-reduce:transition-none',
                'hover:border-primary/60 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground',
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-60'
              )}
            >
              {nota}
            </span>
            <span className="sr-only">
              {nota}: {SIGNIFICADO_DA_NOTA[nota]}
            </span>
          </label>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="mt-1 flex justify-between text-[0.6875rem] text-muted-foreground"
      >
        <span>{SIGNIFICADO_DA_NOTA[1]}</span>
        <span>{SIGNIFICADO_DA_NOTA[5]}</span>
      </div>
    </fieldset>
  );
}

function AvaliacaoDaLeitura({
  data,
  inicial,
}: {
  data: string;
  inicial: 1 | -1 | null;
}) {
  const [valor, setValor] = React.useState(inicial);
  const [enviando, setEnviando] = React.useState(false);

  const avaliar = async (util: boolean) => {
    setEnviando(true);
    try {
      const resposta = await fetch('/api/coach/feedback', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, util }),
      });
      if (!resposta.ok) {
        throw new Error(
          await lerErro(resposta, 'Não foi possível registrar a sua avaliação.')
        );
      }
      setValor(util ? 1 : -1);
      toast.success('Obrigado! A sua avaliação ajuda o coach a melhorar.');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Falha ao avaliar.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-3"
      role="group"
      aria-labelledby="pergunta-da-avaliacao"
    >
      <p
        id="pergunta-da-avaliacao"
        className="text-sm font-medium text-foreground"
      >
        A leitura de hoje te ajudou?
      </p>
      <Button
        type="button"
        variant={valor === 1 ? 'default' : 'outline'}
        size="sm"
        aria-pressed={valor === 1}
        disabled={enviando}
        onClick={() => void avaliar(true)}
      >
        <ThumbsUp aria-hidden="true" />
        Sim
      </Button>
      <Button
        type="button"
        variant={valor === -1 ? 'default' : 'outline'}
        size="sm"
        aria-pressed={valor === -1}
        disabled={enviando}
        onClick={() => void avaliar(false)}
      >
        <ThumbsDown aria-hidden="true" />
        Não
      </Button>
    </div>
  );
}

/**
 * Formulário de uma data. É montado de novo (pela `key`) a cada estado vindo
 * do servidor, então as notas e a frase iniciais saem direto das props.
 */
function FormularioDaReflexao({
  estado,
  onAtualizada,
}: {
  estado: EstadoDaReflexao;
  onAtualizada: (novo: EstadoDaReflexao) => void;
}) {
  const existente = estado.reflexao;
  const [notas, setNotas] = React.useState<Notas>(() => ({
    emocional: existente?.emocional ?? null,
    corpo: existente?.corpo ?? null,
    espiritual: existente?.espiritual ?? null,
  }));
  const [frase, setFrase] = React.useState(existente?.frase ?? '');
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const idDoContador = React.useId();
  const idDoErro = React.useId();

  const salvar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const validacao = reflexaoSchema.safeParse({
      data: estado.data,
      emocional: notas.emocional ?? undefined,
      corpo: notas.corpo ?? undefined,
      espiritual: notas.espiritual ?? undefined,
      frase,
    });
    if (!validacao.success) {
      setErro(validacao.error.issues[0]?.message ?? 'Revise a reflexão.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch('/api/reflexao', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validacao.data),
      });
      if (!resposta.ok) {
        throw new Error(
          await lerErro(resposta, 'Não foi possível guardar a reflexão.')
        );
      }
      const novo = (await resposta.json()) as EstadoDaReflexao;
      toast.success('Reflexão guardada.');
      avisarReflexaoAtualizada();
      onAtualizada(novo);
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : 'Falha ao guardar a reflexão.'
      );
    } finally {
      // Gravar as mesmas notas não muda `atualizadaEm`: o formulário não é
      // remontado e precisa sair do estado "salvando" por conta própria.
      setSalvando(false);
    }
  };

  const apagar = async () => {
    setSalvando(true);
    try {
      const resposta = await fetch(`/api/reflexao?data=${estado.data}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!resposta.ok) {
        throw new Error(
          await lerErro(resposta, 'Não foi possível apagar a reflexão.')
        );
      }
      const novo = (await resposta.json()) as EstadoDaReflexao;
      toast.success('Reflexão apagada.');
      avisarReflexaoAtualizada();
      onAtualizada(novo);
    } catch (falha) {
      toast.error(
        falha instanceof Error ? falha.message : 'Falha ao apagar a reflexão.'
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form className="mt-5 flex flex-col gap-5" onSubmit={salvar} noValidate>
      <p className="text-xs text-muted-foreground first-letter:uppercase">
        {dataPorExtenso(estado.data)}
        {existente ? ` · guardada às ${horaLocal(existente.atualizadaEm)}` : ''}
      </p>
      <div className="grid gap-5 md:grid-cols-3">
        {DIMENSOES_DA_REFLEXAO.map((dimensao) => (
          <Escala
            key={dimensao.chave}
            dimensao={dimensao}
            valor={notas[dimensao.chave]}
            desabilitada={salvando}
            onChange={(nota) => {
              setNotas((atual) => ({ ...atual, [dimensao.chave]: nota }));
              setErro(null);
            }}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="frase-da-reflexao">
          Uma frase sobre hoje{' '}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="frase-da-reflexao"
          value={frase}
          maxLength={LIMITE_DA_FRASE}
          rows={2}
          disabled={salvando}
          placeholder="O que ficou de hoje…"
          aria-describedby={erro ? `${idDoContador} ${idDoErro}` : idDoContador}
          onChange={(evento) => setFrase(evento.target.value)}
        />
        <p
          id={idDoContador}
          className="self-end text-xs tabular-nums text-muted-foreground"
        >
          {frase.length}/{LIMITE_DA_FRASE} caracteres
        </p>
      </div>
      {erro ? (
        <p id={idDoErro} role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={salvando}>
          {existente ? 'Atualizar reflexão' : 'Guardar reflexão'}
        </Button>
        {existente ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" disabled={salvando}>
                <Trash2 aria-hidden="true" />
                Apagar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apagar esta reflexão?</AlertDialogTitle>
                <AlertDialogDescription>
                  As notas e a frase de {dataPorExtenso(existente.data)} serão
                  apagadas. Você pode registrar de novo depois.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => void apagar()}>
                  Apagar reflexão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </form>
  );
}

export function ReflexaoDaNoite({
  dataDoBriefing,
  feedbackInicial,
}: {
  /** Data do "Seu dia" avaliado na mesma seção. */
  dataDoBriefing: string;
  feedbackInicial: 1 | -1 | null;
}) {
  // `null` = hoje da pessoa (decidido pelo servidor); senão, a data escolhida.
  const [dataPedida, setDataPedida] = React.useState<string | null>(null);
  const [tentativa, setTentativa] = React.useState(0);
  const [erroDeLeitura, setErroDeLeitura] = React.useState<string | null>(null);
  // Resposta da última gravação ou remoção, válida só para a mesma chave.
  const [atualizado, setAtualizado] = React.useState<{
    chave: string;
    estado: EstadoDaReflexao;
  } | null>(null);

  const chave = `reflexao:${dataPedida ?? 'hoje'}:${tentativa}`;

  const ler = React.useCallback(async () => {
    const resposta = await fetch(
      dataPedida ? `/api/reflexao?data=${dataPedida}` : '/api/reflexao',
      { credentials: 'include', cache: 'no-store' }
    );
    if (!resposta.ok) {
      throw new Error(
        await lerErro(resposta, 'Não foi possível abrir a sua reflexão.')
      );
    }
    return (await resposta.json()) as EstadoDaReflexao;
  }, [dataPedida]);

  const aoFalhar = React.useCallback((falha: unknown) => {
    setErroDeLeitura(
      falha instanceof Error
        ? falha.message
        : 'Sem conexão para abrir a sua reflexão.'
    );
  }, []);

  const { data: carregado } = useKeyedResource<EstadoDaReflexao | null>(
    chave,
    ler,
    aoFalhar,
    null
  );
  const estado =
    atualizado && atualizado.chave === chave ? atualizado.estado : carregado;
  const [hoje, ontem] = estado?.datasPermitidas ?? [];

  return (
    <section
      id="reflexao"
      aria-labelledby="titulo-reflexao"
      className="scroll-mt-24 rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-medium text-cosmic-strong">
            <MoonStar className="h-4 w-4" aria-hidden="true" />
            Reflexão da noite
          </p>
          <h3
            id="titulo-reflexao"
            className="mt-1 font-display text-xl font-semibold text-foreground"
          >
            Como foi o seu dia?
          </h3>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Feche o ciclo com as mesmas três dimensões da leitura de hoje.
          </p>
        </div>
        {hoje && ontem ? (
          <ToggleGroup
            type="single"
            value={estado?.data ?? hoje}
            onValueChange={(valor) => {
              if (!valor || valor === estado?.data) return;
              setAtualizado(null);
              setErroDeLeitura(null);
              setDataPedida(valor === hoje ? null : valor);
            }}
            aria-label="Dia da reflexão"
            className="rounded-[10px] border border-border p-0.5"
          >
            <ToggleGroupItem value={hoje} className="h-9 px-3 text-xs">
              Hoje
            </ToggleGroupItem>
            <ToggleGroupItem value={ontem} className="h-9 px-3 text-xs">
              Ontem
            </ToggleGroupItem>
          </ToggleGroup>
        ) : null}
      </div>

      {erroDeLeitura && !estado ? (
        <div role="alert" className="mt-5 flex flex-wrap items-center gap-3">
          <p className="text-sm text-destructive">{erroDeLeitura}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setErroDeLeitura(null);
              setTentativa((t) => t + 1);
            }}
          >
            Tentar de novo
          </Button>
        </div>
      ) : !estado ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-3" aria-busy="true">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <FormularioDaReflexao
          key={`${estado.data}:${estado.reflexao?.atualizadaEm ?? 'nova'}`}
          estado={estado}
          onAtualizada={(novo) => setAtualizado({ chave, estado: novo })}
        />
      )}

      <div className="mt-6 border-t border-border pt-5">
        <AvaliacaoDaLeitura
          key={dataDoBriefing}
          data={dataDoBriefing}
          inicial={feedbackInicial}
        />
      </div>
    </section>
  );
}
