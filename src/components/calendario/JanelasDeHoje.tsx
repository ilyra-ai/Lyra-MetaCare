'use client';

import * as React from 'react';
import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  ExternalLink,
  KeyRound,
  Link2Off,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import type {
  EstadoDaAssinatura,
  JanelaDeHoje,
  JanelasDeHoje as DadosDasJanelas,
} from '@/lib/calendario/servico';
import { cn } from '@/lib/utils';

/**
 * "Janelas de hoje" (tarefa 44): Brahma Muhurta, Abhijit, Rahu Kalam e o pôr
 * do sol da cidade da pessoa, com o arquivo .ics de hoje e o link de
 * assinatura privado que mantém o calendário dela atualizado.
 */

const SENTIDO: Record<
  JanelaDeHoje['tipo'],
  { acao: string; ponto: string; rotulo: string }
> = {
  brahma_muhurta: { acao: 'meditar', ponto: 'bg-success', rotulo: 'Favorável' },
  abhijit: {
    acao: 'o mais importante',
    ponto: 'bg-success',
    rotulo: 'Favorável',
  },
  rahu_kalam: { acao: 'sem começos', ponto: 'bg-warning', rotulo: 'Cautela' },
  sandhya: { acao: 'pausa de gratidão', ponto: 'bg-cosmic', rotulo: 'Pausa' },
};

function nomeDaJanela(janela: JanelaDeHoje) {
  return janela.titulo.split(' · ')[0];
}

async function lerErro(resposta: Response, padrao: string) {
  const corpo = (await resposta.json().catch(() => null)) as {
    error?: string;
  } | null;
  return corpo?.error ?? padrao;
}

async function lerJanelas(): Promise<DadosDasJanelas> {
  const resposta = await fetch('/api/calendario/janelas', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!resposta.ok) {
    throw new Error(
      await lerErro(resposta, 'Não foi possível calcular as janelas de hoje.')
    );
  }
  return (await resposta.json()) as DadosDasJanelas;
}

export function JanelasDeHoje({ agora }: { agora: number }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [erro, setErro] = React.useState<string | null>(null);
  const aoFalhar = React.useCallback((falha: unknown) => {
    setErro(
      falha instanceof Error ? falha.message : 'Sem conexão com o servidor.'
    );
  }, []);
  const { data, loading } = useKeyedResource<DadosDasJanelas | null>(
    userId ? `janelas:${userId}` : null,
    lerJanelas,
    aoFalhar,
    null
  );

  const hora = React.useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: data?.fuso,
      }).format(new Date(iso)),
    [data?.fuso]
  );

  return (
    <section
      id="janelas"
      aria-labelledby="titulo-janelas"
      className="flex h-full scroll-mt-24 flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Agenda védica
          </p>
          <h3
            id="titulo-janelas"
            className="mt-1 font-display text-lg font-semibold text-foreground"
          >
            Janelas de hoje
          </h3>
        </div>
        {data ? (
          <p className="text-xs text-muted-foreground">{data.lugar}</p>
        ) : null}
      </div>

      {loading && !data ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : data ? (
        <ol className="flex flex-col gap-2">
          {data.janelas.map((janela) => {
            const sentido = SENTIDO[janela.tipo];
            const ativa =
              agora >= Date.parse(janela.inicio) &&
              agora < Date.parse(janela.fim);
            return (
              <li
                key={janela.tipo}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-3 py-2.5',
                  ativa
                    ? 'border-primary/40 bg-sidebar-accent'
                    : 'border-transparent bg-muted'
                )}
              >
                <span className="w-12 shrink-0 font-display text-base font-semibold tabular-nums text-foreground">
                  {hora(janela.inicio)}
                </span>
                <span
                  aria-hidden="true"
                  className={cn('h-2 w-2 shrink-0 rounded-full', sentido.ponto)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {nomeDaJanela(janela)}
                    {ativa ? (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] font-semibold text-primary-foreground">
                        Agora
                      </span>
                    ) : null}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    até {hora(janela.fim)} · {sentido.acao}
                    <span className="sr-only"> ({sentido.rotulo})</span>
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      ) : erro ? (
        <p role="alert" className="text-sm text-muted-foreground">
          {erro}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2">
        {data ? (
          <Button asChild variant="outline">
            <a href="/api/calendario/hoje" download>
              <Download aria-hidden="true" />
              Baixar .ics
            </a>
          </Button>
        ) : null}
        <AssinarAgenda disponivel={Boolean(data)} />
      </div>
    </section>
  );
}

function comLembretes(url: string, lembretes: boolean) {
  return lembretes ? url : `${url}?lembretes=nao`;
}

function AssinarAgenda({ disponivel }: { disponivel: boolean }) {
  const [aberto, setAberto] = React.useState(false);
  const [estado, setEstado] = React.useState<EstadoDaAssinatura | null>(null);
  const [lembretes, setLembretes] = React.useState(true);
  const [ocupado, setOcupado] = React.useState(false);
  const [copiado, setCopiado] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const chamar = async (metodo: 'GET' | 'POST' | 'DELETE') => {
    setOcupado(true);
    setErro(null);
    try {
      const resposta = await fetch('/api/calendario/assinatura', {
        method: metodo,
        credentials: 'include',
        cache: 'no-store',
      });
      if (!resposta.ok) {
        throw new Error(
          await lerErro(resposta, 'Não foi possível atualizar o link.')
        );
      }
      const novo = (await resposta.json()) as EstadoDaAssinatura;
      setEstado(novo);
      setCopiado(false);
      if (metodo === 'POST') toast.success('Link privado da agenda criado.');
      if (metodo === 'DELETE') toast.success('Link da agenda desativado.');
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : 'Sem conexão com o servidor.'
      );
    } finally {
      setOcupado(false);
    }
  };

  const url = estado?.url ? comLembretes(estado.url, lembretes) : null;
  const webcal = estado?.webcal ? comLembretes(estado.webcal, lembretes) : null;

  const copiar = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      toast.success('Link copiado.');
    } catch {
      toast.error('Não foi possível copiar: selecione o link e copie.');
    }
  };

  const data = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat('pt-BR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(iso))
      : null;

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        setAberto(valor);
        if (valor && !estado) void chamar('GET');
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" disabled={!disponivel}>
          <CalendarPlus aria-hidden="true" />
          Assinar agenda
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Janelas do dia no seu calendário</DialogTitle>
          <DialogDescription>
            Um link privado que o seu app de calendário relê sozinho: hoje e os
            próximos 6 dias, sempre recalculados para a sua cidade.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2">
          <Checkbox
            id="lembretes-da-agenda"
            checked={lembretes}
            onCheckedChange={(valor) => setLembretes(valor === true)}
          />
          <Label
            htmlFor="lembretes-da-agenda"
            className="flex flex-col gap-0.5"
          >
            <span>Lembrete 10 minutos antes</span>
            <span className="text-xs font-normal text-muted-foreground">
              Alguns apps, como o Google Agenda, não usam os lembretes de
              agendas assinadas.
            </span>
          </Label>
        </div>

        {erro ? (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        ) : null}

        {!estado ? (
          <Skeleton className="h-24" />
        ) : !estado.ativa ? (
          <Button
            type="button"
            onClick={() => void chamar('POST')}
            disabled={ocupado}
          >
            <KeyRound aria-hidden="true" />
            Criar link privado
          </Button>
        ) : (
          <div className="flex flex-col gap-4">
            {url ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="link-da-agenda">Link de assinatura</Label>
                <div className="flex gap-2">
                  <Input
                    id="link-da-agenda"
                    readOnly
                    value={url}
                    onFocus={(evento) => evento.currentTarget.select()}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void copiar()}
                    aria-label="Copiar link"
                  >
                    {copiado ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <Copy aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                O link anterior não pode mais ser exibido (a chave do servidor
                mudou). Troque o link para gerar um novo.
              </p>
            )}

            {estado.enderecoLocal ? (
              <p className="flex gap-2 rounded-xl bg-warning-light p-3 text-xs text-foreground">
                <TriangleAlert
                  className="h-4 w-4 shrink-0 text-warning"
                  aria-hidden="true"
                />
                Este endereço é local (localhost): funciona no calendário deste
                computador, mas Google e Outlook na nuvem só conseguem ler o
                link quando o app estiver publicado num endereço da internet
                (APP_BASE_URL).
              </p>
            ) : null}

            {webcal ? (
              <Button asChild variant="outline">
                <a href={webcal}>
                  <ExternalLink aria-hidden="true" />
                  Abrir no app de calendário
                </a>
              </Button>
            ) : null}

            <div className="flex flex-col gap-2 text-sm">
              <p className="font-medium text-foreground">Como assinar</p>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Google Agenda:</strong> no
                  computador, em &quot;Outras agendas&quot;, toque em + →
                  &quot;Do URL&quot; e cole o link. O Google pode levar algumas
                  horas para mostrar mudanças.
                </li>
                <li>
                  <strong className="text-foreground">Apple Calendário:</strong>{' '}
                  use &quot;Abrir no app de calendário&quot; ou Arquivo → Nova
                  Assinatura de Calendário e cole o link.
                </li>
                <li>
                  <strong className="text-foreground">Outlook:</strong>{' '}
                  Adicionar calendário → Assinar da Web, cole o link e dê um
                  nome.
                </li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              Quem tiver o link vê os horários, que revelam a sua cidade
              aproximada: não compartilhe. Se ele vazar, troque o link.
              {estado.criadaEm ? ` Criado em ${data(estado.criadaEm)}.` : ''}
              {estado.ultimoAcesso
                ? ` Última leitura pelo calendário: ${data(estado.ultimoAcesso)}.`
                : ' Ainda não foi lido por nenhum calendário.'}
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void chamar('POST')}
                disabled={ocupado}
              >
                <RefreshCw aria-hidden="true" />
                Trocar link
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => void chamar('DELETE')}
                disabled={ocupado}
              >
                <Link2Off aria-hidden="true" />
                Desativar link
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
