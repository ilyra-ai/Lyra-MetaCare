'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useKeyedResource } from '@/hooks/use-keyed-resource';

interface EstadoDaIaExterna {
  ativo: boolean;
  desde: string | null;
  disponivel: boolean;
}

async function lerEstado(): Promise<EstadoDaIaExterna | null> {
  const resposta = await fetch('/api/perfil/coach-ia', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return (await resposta.json()) as EstadoDaIaExterna;
}

function avisarFalha(falha: unknown) {
  console.error('Falha ao ler a preferência do coach:', falha);
}

/**
 * Consentimento específico e revogável para o texto do "Seu dia" ser
 * reescrito pelo Google Gemini (tarefa 43). Explica o que vai e o que não
 * vai para o serviço externo antes de a pessoa ligar.
 */
export function CoachIaExterna({ aoMudar }: { aoMudar: () => void }) {
  const [versao, setVersao] = React.useState(0);
  const [salvando, setSalvando] = React.useState(false);
  const { data, loading } = useKeyedResource(
    `coach-ia:${versao}`,
    lerEstado,
    avisarFalha,
    null
  );

  const alterar = async (ativo: boolean) => {
    setSalvando(true);
    try {
      const resposta = await fetch('/api/perfil/coach-ia', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo }),
      });
      const corpo = (await resposta.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!resposta.ok) {
        throw new Error(corpo?.error ?? 'Não foi possível salvar.');
      }
      toast.success(
        ativo
          ? 'Ativado: o próximo "Seu dia" terá o texto escrito pelo Gemini.'
          : 'Revogado: o coach volta a usar só o motor da Lyra.'
      );
      setVersao((v) => v + 1);
      aoMudar();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section
      aria-labelledby="titulo-coach-ia"
      className="rounded-md border border-border p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            id="titulo-coach-ia"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <Sparkles className="h-4 w-4 text-cosmic" aria-hidden="true" />
            Texto do coach por IA generativa (Google Gemini)
          </h3>
          <p
            id="descricao-coach-ia"
            className="mt-1 text-xs leading-relaxed text-muted-foreground"
          >
            Opcional. Vão para o Gemini só o texto já pronto do seu dia
            (manchete, resumo, sugestões e horários dos períodos, focos,
            cuidados e os nomes do céu). Não vão o seu nome, e-mail, cidade,
            data de nascimento, métricas, ciclo nem sinais do corpo. Os horários
            continuam sendo calculados pela Lyra e você pode revogar quando
            quiser.
          </p>
        </div>
        {loading || !data ? (
          <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
        ) : (
          <Switch
            checked={data.ativo}
            disabled={salvando || (!data.disponivel && !data.ativo)}
            onCheckedChange={(valor) => void alterar(valor)}
            aria-labelledby="titulo-coach-ia"
            aria-describedby="descricao-coach-ia"
            className="shrink-0"
          />
        )}
      </div>
      {data && !data.disponivel ? (
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Indisponível nesta instalação: a chave do Gemini não está configurada
          no servidor.
        </p>
      ) : null}
      {data?.ativo && data.desde ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Ativo desde{' '}
          {new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date(data.desde))}
          .
        </p>
      ) : null}
    </section>
  );
}
