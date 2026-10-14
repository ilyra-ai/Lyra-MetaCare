'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CHAVES_DAS_METRICAS,
  type ChaveDaMetrica,
  METRICAS_DAS_METAS,
  type MetricaDaMeta,
} from '@/lib/metas/catalogo';

const COMO_MEDE: Record<MetricaDaMeta['modo'], string> = {
  media7: 'Progresso pela média dos dias com registro nos últimos 7 dias.',
  ultimo30: 'Progresso pelo registro mais recente dos últimos 30 dias.',
};

interface CreateAutoGoalModalProps {
  children: React.ReactNode;
  onCreated: () => void;
}

/**
 * Meta automática (tarefa 43): a pessoa escolhe a métrica e o alvo; o
 * progresso vem do registro do dia e é recalculado pelo servidor.
 */
export function CreateAutoGoalModal({
  children,
  onCreated,
}: CreateAutoGoalModalProps) {
  const [aberto, setAberto] = React.useState(false);
  const [chave, setChave] = React.useState<ChaveDaMetrica>('passos');
  const [alvo, setAlvo] = React.useState(
    String(METRICAS_DAS_METAS.passos.sugestao)
  );
  const [prazo, setPrazo] = React.useState('');
  const [erro, setErro] = React.useState<string | null>(null);
  const [salvando, setSalvando] = React.useState(false);
  const metrica: MetricaDaMeta = METRICAS_DAS_METAS[chave];

  const reiniciar = () => {
    setChave('passos');
    setAlvo(String(METRICAS_DAS_METAS.passos.sugestao));
    setPrazo('');
    setErro(null);
  };

  const salvar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const numero = Number(alvo.replace(',', '.'));
    if (!alvo.trim() || !Number.isFinite(numero)) {
      setErro('Informe o alvo em número.');
      return;
    }
    if (numero < metrica.minimo || numero > metrica.maximo) {
      setErro(
        `Use um alvo entre ${metrica.minimo.toLocaleString('pt-BR')} e ${metrica.maximo.toLocaleString('pt-BR')} ${metrica.unidade}.`
      );
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const resposta = await fetch('/api/metas', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrica: chave,
          alvo: numero,
          prazo: prazo || null,
        }),
      });
      if (!resposta.ok) {
        const corpo = (await resposta.json().catch(() => null)) as {
          error?: string;
        } | null;
        setErro(corpo?.error ?? 'Não foi possível criar a meta.');
        return;
      }
      toast.success('Meta automática criada: ela se atualiza com o seu dia.');
      setAberto(false);
      reiniciar();
      onCreated();
    } catch {
      setErro('Sem conexão com o servidor. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={(proximo) => {
        setAberto(proximo);
        if (!proximo) reiniciar();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            Meta automática
          </DialogTitle>
          <DialogDescription>
            Escolha o que acompanhar e o alvo. O progresso vem do seu registro
            do dia e da pulseira, sem digitar nada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="meta-auto-metrica">O que acompanhar</Label>
            <Select
              value={chave}
              onValueChange={(valor) => {
                const nova = valor as ChaveDaMetrica;
                setChave(nova);
                setAlvo(String(METRICAS_DAS_METAS[nova].sugestao));
                setErro(null);
              }}
            >
              <SelectTrigger id="meta-auto-metrica">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAVES_DAS_METRICAS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {METRICAS_DAS_METAS[item].rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {COMO_MEDE[metrica.modo]}
              {metrica.direcao === null
                ? ' Alvo abaixo do valor atual vira meta de redução.'
                : ''}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meta-auto-alvo">Alvo ({metrica.unidade})</Label>
              <Input
                id="meta-auto-alvo"
                inputMode="decimal"
                autoComplete="off"
                value={alvo}
                onChange={(e) => setAlvo(e.target.value)}
                aria-invalid={erro ? true : undefined}
                aria-describedby={erro ? 'meta-auto-erro' : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-auto-prazo">Prazo (opcional)</Label>
              <Input
                id="meta-auto-prazo"
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />
            </div>
          </div>
          {erro ? (
            <p
              id="meta-auto-erro"
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {erro}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={salvando}>
            {salvando ? 'Criando meta...' : 'Criar meta automática'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
