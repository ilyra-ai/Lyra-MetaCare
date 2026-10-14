'use client';

import * as React from 'react';
import { Orbit } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import type { MapaNatalJson } from '@/lib/astrology/serializacao';
import { ouvirMapaAtualizado } from '@/lib/astrology/evento-do-mapa';

interface RespostaDoMapa {
  mapa: MapaNatalJson | null;
  faltando: Array<'data' | 'hora' | 'local'>;
  localDeNascimento: string | null;
}

const VAZIO: RespostaDoMapa | null = null;

const ROTULO_DO_QUE_FALTA = {
  data: 'a data de nascimento',
  hora: 'a hora de nascimento',
  local: 'a cidade de nascimento (escolhida na lista)',
} as const;

function dataBr(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}

function avisarFalha(falha: unknown) {
  console.error('Falha ao carregar o mapa natal:', falha);
}

/**
 * Mapa natal védico (tarefa 41): Lagna, Lua natal, Vimshottari vigente e a
 * posição dos nove grahas, calculados no servidor a partir da data, hora e
 * cidade de nascimento.
 */
export function MapaVedicoCard() {
  const [versao, setVersao] = React.useState(0);
  React.useEffect(() => ouvirMapaAtualizado(() => setVersao((v) => v + 1)), []);
  const ler = React.useCallback(async () => {
    const resposta = await fetch('/api/astrologia/mapa', {
      credentials: 'include',
    });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return (await resposta.json()) as RespostaDoMapa;
  }, []);
  const { data, loading } = useKeyedResource(
    `mapa-natal:${versao}`,
    ler,
    avisarFalha,
    VAZIO
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Orbit className="h-5 w-5 text-cosmic" aria-hidden="true" />
          Meu mapa védico
        </CardTitle>
        <CardDescription>
          Zodíaco sideral (ayanamsha Lahiri), casas por signo inteiro e
          Vimshottari Dasha. Base do coach diário.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : !data ? (
          <p className="text-sm text-destructive">
            Não foi possível calcular o mapa agora.
          </p>
        ) : !data.mapa ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Para calcular o seu mapa, complete no perfil:{' '}
            {data.faltando
              .filter((item) => item !== 'hora')
              .map((item) => ROTULO_DO_QUE_FALTA[item])
              .join(' e ')}
            .
          </p>
        ) : (
          <>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <dt className="text-xs text-muted-foreground">
                  Ascendente (Lagna)
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold text-foreground">
                  {data.mapa.lagna
                    ? `${data.mapa.lagna.signo} ${data.mapa.lagna.grau}`
                    : 'Sem hora de nascimento'}
                </dd>
                {data.mapa.lagna ? (
                  <dd className="text-xs text-muted-foreground">
                    {data.mapa.lagna.rashi} · regente {data.mapa.lagna.regente}
                  </dd>
                ) : null}
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <dt className="text-xs text-muted-foreground">Lua natal</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-foreground">
                  {data.mapa.lua.signo}
                </dd>
                <dd className="text-xs text-muted-foreground">
                  {data.mapa.lua.nakshatra}, pada {data.mapa.lua.pada}
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <dt className="text-xs text-muted-foreground">Dasha atual</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-foreground">
                  {data.mapa.dasha
                    ? `${data.mapa.dasha.mahadasha.nome.split(' (')[0]} / ${data.mapa.dasha.antardasha.nome.split(' (')[0]}`
                    : '—'}
                </dd>
                {data.mapa.dasha ? (
                  <dd className="text-xs text-muted-foreground">
                    Antardasha até {dataBr(data.mapa.dasha.antardasha.fim)}
                  </dd>
                ) : null}
              </div>
            </dl>

            {!data.mapa.horaConhecida ? (
              <p className="rounded-md border border-warning/30 bg-warning-light px-3 py-2 text-xs leading-5 text-warning">
                Sem a hora de nascimento, o mapa usa 12:00: não há ascendente
                nem casas, e a Lua e o dasha podem variar algumas horas.
              </p>
            ) : null}

            <Table scrollLabel="Posição dos grahas no mapa natal (rolável)">
              <TableHeader>
                <TableRow>
                  <TableHead>Graha</TableHead>
                  <TableHead>Signo</TableHead>
                  <TableHead>Nakshatra</TableHead>
                  <TableHead className="text-right">Casa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.mapa.planetas.map((p) => (
                  <TableRow key={p.graha}>
                    <TableCell className="font-medium">
                      {p.nome}
                      {p.retrogrado &&
                      p.graha !== 'rahu' &&
                      p.graha !== 'ketu' ? (
                        <Badge variant="secondary" className="ml-2">
                          retrógrado
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {p.signo} {p.grau}
                    </TableCell>
                    <TableCell>
                      {p.nakshatra} ({p.pada})
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.casa ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.localDeNascimento ? (
              <p className="text-xs text-muted-foreground">
                Nascimento em {data.localDeNascimento}.
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
