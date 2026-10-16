'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, MapPin, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { paginaSaindo } from '@/lib/navegador/saida-da-pagina';
import { cn } from '@/lib/utils';

export interface CidadeEscolhida {
  id: number;
  rotulo: string;
}

interface ResultadoDaBusca extends CidadeEscolhida {
  fuso: string;
}

/**
 * Escolha de cidade na base local (GeoNames) para o mapa védico: o local vira
 * coordenadas e fuso no servidor. A busca começa com 2 letras e aceita
 * "Cidade, UF" ou "Cidade, País".
 */
export function SeletorDeCidade({
  id,
  valor,
  aoEscolher,
  textoVazio = 'Escolha a cidade',
  invalido,
  descritoPor,
  permitirLimpar = false,
  desativado = false,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
}: {
  id?: string;
  /** Repassados pelo FormControl do formulário (rótulo, erro e descrição). */
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  valor: CidadeEscolhida | null;
  aoEscolher: (cidade: CidadeEscolhida | null) => void;
  textoVazio?: string;
  invalido?: boolean;
  descritoPor?: string;
  permitirLimpar?: boolean;
  desativado?: boolean;
}) {
  const [aberto, setAberto] = React.useState(false);
  const [termo, setTermo] = React.useState('');
  const [resultado, setResultado] = React.useState<{
    termo: string;
    cidades: ResultadoDaBusca[];
    erro: boolean;
  } | null>(null);

  // Busca com espera de 250 ms entre as teclas; respostas antigas são
  // descartadas pelo termo.
  React.useEffect(() => {
    const consulta = termo.trim();
    if (!aberto || consulta.length < 2) return;
    const controle = new AbortController();
    const espera = window.setTimeout(() => {
      fetch(`/api/geo/cidades?q=${encodeURIComponent(consulta)}`, {
        credentials: 'include',
        signal: controle.signal,
      })
        .then(async (resposta) => {
          if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
          const corpo = (await resposta.json()) as {
            cidades: ResultadoDaBusca[];
          };
          setResultado({
            termo: consulta,
            cidades: corpo.cidades,
            erro: false,
          });
        })
        .catch((falha: unknown) => {
          // Busca trocada por outra (AbortError) ou página saindo: o
          // navegador cancelou a requisição, não é falha.
          if (
            (falha instanceof DOMException && falha.name === 'AbortError') ||
            paginaSaindo()
          ) {
            return;
          }
          console.error('Falha na busca de cidades:', falha);
          setResultado({ termo: consulta, cidades: [], erro: true });
        });
    }, 250);
    return () => {
      window.clearTimeout(espera);
      controle.abort();
    };
  }, [aberto, termo]);

  const consulta = termo.trim();
  const atual = resultado?.termo === consulta ? resultado : null;
  const buscando = consulta.length >= 2 && !atual;

  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={aberto}
            aria-invalid={
              invalido || ariaInvalid === true || ariaInvalid === 'true'
                ? true
                : undefined
            }
            aria-describedby={ariaDescribedby ?? descritoPor}
            disabled={desativado}
            className={cn(
              // flex-1 (e não w-full): divide a linha com o botão de limpar
              // sem estourar a largura no celular.
              'h-11 min-w-0 flex-1 justify-between gap-2 px-3.5 font-normal',
              !valor && 'text-muted-foreground',
              (invalido || ariaInvalid === true || ariaInvalid === 'true') &&
                'border-destructive'
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-cosmic" aria-hidden />
              <span className="truncate">{valor?.rotulo ?? textoVazio}</span>
            </span>
            <ChevronsUpDown
              className="h-4 w-4 shrink-0 opacity-60"
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(26rem,calc(100vw-2rem))] p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Digite a cidade (ex.: Campinas, SP)"
              value={termo}
              onValueChange={setTermo}
              aria-label="Buscar cidade"
            />
            <CommandList>
              {consulta.length < 2 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">
                  Digite ao menos 2 letras do nome da cidade.
                </p>
              ) : buscando ? (
                <p className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Buscando cidades...
                </p>
              ) : atual?.erro ? (
                <p className="px-3 py-4 text-sm text-destructive">
                  Não foi possível buscar agora. Tente de novo.
                </p>
              ) : (
                <>
                  <CommandEmpty>
                    Nenhuma cidade encontrada. Tente o nome sem abreviações ou a
                    cidade grande mais próxima.
                  </CommandEmpty>
                  <CommandGroup>
                    {atual?.cidades.map((cidade) => (
                      <CommandItem
                        key={cidade.id}
                        value={String(cidade.id)}
                        onSelect={() => {
                          aoEscolher({ id: cidade.id, rotulo: cidade.rotulo });
                          setAberto(false);
                          setTermo('');
                        }}
                      >
                        <Check
                          className={cn(
                            'h-4 w-4 shrink-0',
                            valor?.id === cidade.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                          aria-hidden
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{cidade.rotulo}</span>
                          <span className="text-xs text-muted-foreground">
                            Fuso {cidade.fuso.replaceAll('_', ' ')}
                          </span>
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
          <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
            Dados de cidades © GeoNames (CC BY 4.0)
          </p>
        </PopoverContent>
      </Popover>
      {permitirLimpar && valor ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => aoEscolher(null)}
          aria-label="Remover cidade"
          disabled={desativado}
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
