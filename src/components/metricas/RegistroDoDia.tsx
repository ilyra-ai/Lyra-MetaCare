'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import { avisarMetricasAtualizadas } from '@/lib/metricas/evento-de-atualizacao';
import {
  CAMPOS_DO_REGISTRO,
  NOMES_DOS_CAMPOS,
  registroDoDiaSchema,
  type CampoDoRegistro,
} from '@/lib/metricas/registro-do-dia';
import { cn } from '@/lib/utils';

type LinhaDoRegistro = Record<string, string | number | null>;

type Rascunho = Record<CampoDoRegistro, string> & {
  sonoHoras: string;
  sonoMinutos: string;
};

const RASCUNHO_VAZIO: Rascunho = {
  ...(Object.fromEntries(
    NOMES_DOS_CAMPOS.map((campo) => [campo, ''])
  ) as Record<CampoDoRegistro, string>),
  sonoHoras: '',
  sonoMinutos: '',
};

const ESCALA_DE_HUMOR = ['Exausto', 'Baixo', 'Neutro', 'Bom', 'Radiante'];
const ESCALA_DE_ENERGIA = ['Sem energia', 'Baixa', 'Média', 'Boa', 'Plena'];

/** Grupos do formulário, na ordem em que aparecem. */
const GRUPOS: Array<{ titulo: string; campos: CampoDoRegistro[] }> = [
  { titulo: 'Movimento', campos: ['passos', 'minutosAtivos'] },
  {
    titulo: 'Alimentação e hidratação',
    campos: ['agua', 'cafeina', 'proteina'],
  },
  {
    titulo: 'Corpo',
    campos: [
      'peso',
      'fcRepouso',
      'glicemia',
      'pressaoSistolica',
      'pressaoDiastolica',
    ],
  },
  { titulo: 'Mente', campos: ['meditacao'] },
];

const ID_DO_FORMULARIO = 'form-registro-do-dia';

function textoDoValor(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined || valor === '') return '';
  const numero = Number(valor);
  return Number.isFinite(numero) ? String(numero) : '';
}

function rascunhoDoRegistro(registro: LinhaDoRegistro | null): Rascunho {
  if (!registro) return RASCUNHO_VAZIO;
  const rascunho = { ...RASCUNHO_VAZIO };
  for (const campo of NOMES_DOS_CAMPOS) {
    rascunho[campo] = textoDoValor(registro[CAMPOS_DO_REGISTRO[campo].coluna]);
  }
  const sono = Number(registro.sleep_duration_minutes);
  if (registro.sleep_duration_minutes !== null && Number.isFinite(sono)) {
    rascunho.sonoHoras = String(Math.floor(sono / 60));
    rascunho.sonoMinutos = String(sono % 60);
  }
  return rascunho;
}

function numero(texto: string) {
  const normalizado = texto.trim().replace(',', '.');
  if (normalizado === '') return undefined;
  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : Number.NaN;
}

const SEM_REGISTRO: LinhaDoRegistro | null = null;

function avisarFalhaDeLeitura(falha: unknown) {
  console.error('Falha ao ler o registro do dia:', falha);
  toast.error('Não foi possível ler o que já foi registrado hoje.');
}

/**
 * Check-in do dia (tarefa 40): humor, energia, estresse, sono e as métricas
 * que a pessoa quiser registrar. Campos vazios não alteram o que já foi
 * gravado no dia; a validação é a mesma do servidor.
 */
export function RegistroDoDiaDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (aberto: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,52rem)] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-5 pb-4 pt-5 sm:px-6">
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
            Registrar meu dia
          </DialogTitle>
          <DialogDescription>
            Leva menos de um minuto. Preencha só o que souber: campos vazios não
            apagam o que já foi registrado hoje.
          </DialogDescription>
        </DialogHeader>
        {/* O conteúdo só monta com o diálogo aberto: cada abertura lê o
            registro atual do dia e começa sem erros antigos. */}
        <ConteudoDoRegistro aoConcluir={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ConteudoDoRegistro({ aoConcluir }: { aoConcluir: () => void }) {
  const [data] = React.useState(() => format(new Date(), 'yyyy-MM-dd'));
  const lerRegistro = React.useCallback(async () => {
    const resposta = await fetch(`/api/metricas/dia?data=${data}`, {
      credentials: 'include',
    });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const corpo = (await resposta.json()) as {
      registro: LinhaDoRegistro | null;
    };
    return corpo.registro;
  }, [data]);
  const { data: registro, loading } = useKeyedResource(
    `registro-do-dia:${data}`,
    lerRegistro,
    avisarFalhaDeLeitura,
    SEM_REGISTRO
  );

  if (loading) {
    return (
      <>
        <div className="flex-1 space-y-4 px-5 py-5 sm:px-6" aria-busy="true">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <RodapeDoRegistro salvando={false} desativado aoCancelar={aoConcluir} />
      </>
    );
  }

  return (
    <FormularioDoRegistro
      data={data}
      inicial={rascunhoDoRegistro(registro)}
      aoConcluir={aoConcluir}
    />
  );
}

function RodapeDoRegistro({
  salvando,
  desativado,
  aoCancelar,
}: {
  salvando: boolean;
  desativado: boolean;
  aoCancelar: () => void;
}) {
  return (
    <DialogFooter className="gap-2 border-t border-border px-5 py-4 sm:px-6">
      <Button type="button" variant="outline" onClick={aoCancelar}>
        Cancelar
      </Button>
      <Button type="submit" form={ID_DO_FORMULARIO} disabled={desativado}>
        {salvando ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {salvando ? 'Salvando...' : 'Salvar meu dia'}
      </Button>
    </DialogFooter>
  );
}

function FormularioDoRegistro({
  data,
  inicial,
  aoConcluir,
}: {
  data: string;
  inicial: Rascunho;
  aoConcluir: () => void;
}) {
  const [rascunho, setRascunho] = React.useState<Rascunho>(inicial);
  const [salvando, setSalvando] = React.useState(false);
  const [erros, setErros] = React.useState<Record<string, string>>({});

  const alterar = (campo: keyof Rascunho, valor: string) => {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
    setErros((atuais) => {
      if (!atuais[campo]) return atuais;
      const restantes = { ...atuais };
      delete restantes[campo];
      return restantes;
    });
  };

  async function salvar(evento: React.SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    const valores: Partial<Record<CampoDoRegistro, number>> = {};
    for (const campo of NOMES_DOS_CAMPOS) {
      if (campo === 'sono') continue;
      const valor = numero(rascunho[campo]);
      if (valor !== undefined) valores[campo] = valor;
    }
    const horas = numero(rascunho.sonoHoras);
    const minutos = numero(rascunho.sonoMinutos);
    if (horas !== undefined || minutos !== undefined) {
      valores.sono = (horas ?? 0) * 60 + (minutos ?? 0);
    }

    const validacao = registroDoDiaSchema.safeParse({ data, valores });
    if (!validacao.success) {
      const porCampo: Record<string, string> = {};
      for (const problema of validacao.error.issues) {
        const campo = String(problema.path[1] ?? problema.path[0] ?? 'geral');
        const chave = campo === 'sono' ? 'sonoHoras' : campo;
        porCampo[chave] ??= problema.message;
      }
      setErros(porCampo);
      toast.error('Revise os campos destacados.');
      return;
    }

    setSalvando(true);
    try {
      const resposta = await fetch('/api/metricas/dia', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validacao.data),
      });
      const corpo = (await resposta.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!resposta.ok) {
        throw new Error(corpo?.error ?? `HTTP ${resposta.status}`);
      }
      toast.success('Seu dia foi registrado.', {
        description: 'Painel, scores e coach já usam os novos dados.',
      });
      avisarMetricasAtualizadas();
      aoConcluir();
    } catch (falha: unknown) {
      toast.error('Não foi possível salvar o registro.', {
        description: falha instanceof Error ? falha.message : undefined,
      });
    } finally {
      setSalvando(false);
    }
  }

  const campoNumerico = (campo: CampoDoRegistro) => {
    const definicao: { rotulo: string; unidade?: string; casas: number } =
      CAMPOS_DO_REGISTRO[campo];
    const id = `registro-${campo}`;
    const erro = erros[campo];
    return (
      <div key={campo} className="space-y-1.5">
        <Label htmlFor={id} className="text-sm">
          {definicao.rotulo}
          {definicao.unidade ? (
            <span className="ml-1 font-normal text-muted-foreground">
              ({definicao.unidade})
            </span>
          ) : null}
        </Label>
        <Input
          id={id}
          inputMode={definicao.casas > 0 ? 'decimal' : 'numeric'}
          autoComplete="off"
          value={rascunho[campo]}
          onChange={(e) => alterar(campo, e.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
        />
        {erro ? (
          <p id={`${id}-erro`} className="text-xs font-medium text-destructive">
            {erro}
          </p>
        ) : null}
      </div>
    );
  };

  const escala = (
    campo: 'humor' | 'energia',
    rotulos: string[],
    titulo: string
  ) => (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{titulo}</legend>
      <ToggleGroup
        type="single"
        variant="outline"
        value={rascunho[campo]}
        onValueChange={(valor) => alterar(campo, valor)}
        className="grid grid-cols-5 gap-1.5"
        aria-label={titulo}
      >
        {rotulos.map((rotulo, indice) => (
          <ToggleGroupItem
            key={rotulo}
            value={String(indice + 1)}
            className="h-auto min-h-11 flex-col gap-0.5 px-1 py-2 text-xs leading-tight data-[state=on]:border-primary data-[state=on]:bg-sidebar-accent data-[state=on]:text-sidebar-accent-foreground"
          >
            <span className="font-display text-base font-semibold">
              {indice + 1}
            </span>
            {rotulo}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {erros[campo] ? (
        <p className="text-xs font-medium text-destructive">{erros[campo]}</p>
      ) : null}
    </fieldset>
  );

  const estresse = numero(rascunho.estresse);
  const estresseInformado = estresse !== undefined && !Number.isNaN(estresse);

  return (
    <>
      <form
        id={ID_DO_FORMULARIO}
        onSubmit={salvar}
        className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6"
        noValidate
      >
        <section className="space-y-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Como você está
          </h3>
          {escala('humor', ESCALA_DE_HUMOR, 'Humor')}
          {escala('energia', ESCALA_DE_ENERGIA, 'Energia')}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label id="registro-estresse-rotulo" className="text-sm">
                Estresse
              </Label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {estresseInformado ? `${estresse}/100` : 'não informado'}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[estresseInformado ? estresse : 50]}
              onValueChange={([valor]) => alterar('estresse', String(valor))}
              aria-labelledby="registro-estresse-rotulo"
              className={cn(!estresseInformado && 'opacity-60')}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tranquilo</span>
              <span>Muito estressado</span>
            </div>
          </div>
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium text-foreground">
              Sono da última noite
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="registro-sono-horas"
                  className="text-xs text-muted-foreground"
                >
                  Horas
                </Label>
                <Input
                  id="registro-sono-horas"
                  inputMode="numeric"
                  autoComplete="off"
                  value={rascunho.sonoHoras}
                  onChange={(e) => alterar('sonoHoras', e.target.value)}
                  aria-invalid={erros.sonoHoras ? true : undefined}
                  aria-describedby={
                    erros.sonoHoras ? 'registro-sono-erro' : undefined
                  }
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="registro-sono-minutos"
                  className="text-xs text-muted-foreground"
                >
                  Minutos
                </Label>
                <Input
                  id="registro-sono-minutos"
                  inputMode="numeric"
                  autoComplete="off"
                  value={rascunho.sonoMinutos}
                  onChange={(e) => alterar('sonoMinutos', e.target.value)}
                />
              </div>
            </div>
            {erros.sonoHoras ? (
              <p
                id="registro-sono-erro"
                className="text-xs font-medium text-destructive"
              >
                {erros.sonoHoras}
              </p>
            ) : null}
          </fieldset>
        </section>

        {GRUPOS.map((grupo) => (
          <section key={grupo.titulo} className="space-y-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {grupo.titulo}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {grupo.campos.map(campoNumerico)}
            </div>
          </section>
        ))}

        {erros.valores ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {erros.valores}
          </p>
        ) : null}
      </form>
      <RodapeDoRegistro
        salvando={salvando}
        desativado={salvando}
        aoCancelar={aoConcluir}
      />
    </>
  );
}

/** Botão que abre o check-in do dia. */
export function BotaoRegistroDoDia({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'secondary' | 'outline';
}) {
  const [aberto, setAberto] = React.useState(false);
  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={() => setAberto(true)}
      >
        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
        Registrar meu dia
      </Button>
      <RegistroDoDiaDialog open={aberto} onOpenChange={setAberto} />
    </>
  );
}
