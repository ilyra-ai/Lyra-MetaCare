'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

import {
  type CidadeEscolhida,
  SeletorDeCidade,
} from '@/components/geo/SeletorDeCidade';
import { Label } from '@/components/ui/label';
import { avisarMapaAtualizado } from '@/lib/astrology/evento-do-mapa';

type Tipo = 'nascimento' | 'moradia';

/**
 * Cidade de nascimento e de moradia no perfil. Cada escolha é gravada na hora
 * pela rota de localização (coordenadas e fuso vêm do servidor); por isso
 * fica fora do botão "Salvar" do formulário.
 */
export function LocaisDoPerfil({
  nascimentoInicial,
  moradiaInicial,
  localAntigo,
}: {
  nascimentoInicial: CidadeEscolhida | null;
  moradiaInicial: CidadeEscolhida | null;
  /** Texto livre gravado antes da base de cidades, sem coordenadas. */
  localAntigo: string | null;
}) {
  const [locais, setLocais] = React.useState<
    Record<Tipo, CidadeEscolhida | null>
  >({ nascimento: nascimentoInicial, moradia: moradiaInicial });
  const [salvando, setSalvando] = React.useState<Tipo | null>(null);

  async function gravar(tipo: Tipo, cidade: CidadeEscolhida | null) {
    const anterior = locais[tipo];
    setLocais((atual) => ({ ...atual, [tipo]: cidade }));
    setSalvando(tipo);
    try {
      const resposta = await fetch('/api/perfil/localizacao', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, cidadeId: cidade?.id ?? null }),
      });
      const corpo = (await resposta.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!resposta.ok) {
        throw new Error(corpo?.error ?? `HTTP ${resposta.status}`);
      }
      toast.success(
        tipo === 'nascimento'
          ? 'Cidade de nascimento salva. O seu mapa védico foi recalculado.'
          : cidade
            ? 'Cidade onde você mora salva. Os horários do seu dia usam este lugar.'
            : 'Cidade de moradia removida: o dia volta a usar a cidade de nascimento.'
      );
      avisarMapaAtualizado();
    } catch (falha: unknown) {
      setLocais((atual) => ({ ...atual, [tipo]: anterior }));
      toast.error('Não foi possível salvar a cidade.', {
        description: falha instanceof Error ? falha.message : undefined,
      });
    } finally {
      setSalvando(null);
    }
  }

  return (
    <div className="grid gap-5 md:col-span-2 md:grid-cols-2">
      <div className="space-y-2.5">
        <Label
          htmlFor="perfil-cidade-nascimento"
          className="flex items-center gap-1"
        >
          <MapPin
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          Cidade de nascimento
        </Label>
        <SeletorDeCidade
          id="perfil-cidade-nascimento"
          valor={locais.nascimento}
          aoEscolher={(cidade) => void gravar('nascimento', cidade)}
          textoVazio="Escolha na lista"
          descritoPor="perfil-cidade-nascimento-ajuda"
          desativado={salvando !== null}
        />
        <p
          id="perfil-cidade-nascimento-ajuda"
          className="text-xs leading-5 text-muted-foreground"
        >
          {!locais.nascimento && localAntigo
            ? `Registrado antes como "${localAntigo}", sem coordenadas. Escolha a cidade na lista para calcular o seu mapa védico.`
            : 'Salva na hora. Coordenadas e fuso calculam o seu mapa védico.'}
        </p>
      </div>
      <div className="space-y-2.5">
        <Label
          htmlFor="perfil-cidade-moradia"
          className="flex items-center gap-1"
        >
          <MapPin
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          Cidade onde você mora
        </Label>
        <SeletorDeCidade
          id="perfil-cidade-moradia"
          valor={locais.moradia}
          aoEscolher={(cidade) => void gravar('moradia', cidade)}
          textoVazio="A mesma do nascimento"
          descritoPor="perfil-cidade-moradia-ajuda"
          permitirLimpar
          desativado={salvando !== null}
        />
        <p
          id="perfil-cidade-moradia-ajuda"
          className="text-xs leading-5 text-muted-foreground"
        >
          O nascer do sol, os horários bons e de cautela e os períodos do seu
          dia são calculados para este lugar.
        </p>
      </div>
    </div>
  );
}
