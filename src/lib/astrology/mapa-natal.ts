import {
  ascendenteSideral,
  type Graha,
  longitudeSideral,
  NOME_DO_GRAHA,
  normalizarGraus,
  posicao,
  type Posicao,
  REGENTE_DO_SIGNO,
} from './sideral';
import { localParaUtc } from './tempo';
import {
  calcularVimshottari,
  dashaVigente,
  type DashaAtual,
  senhorDoNakshatra,
} from './vimshottari';

/**
 * Mapa natal védico (Rashi/D1, casas por signo inteiro a partir do Lagna).
 */

export interface DadosDeNascimento {
  /** AAAA-MM-DD local. */
  data: string;
  /** HH:mm local; sem hora o Lagna e as casas não são calculados. */
  hora: string | null;
  latitude: number;
  longitude: number;
  /** Fuso IANA do local de nascimento. */
  fuso: string;
}

export interface PlanetaNoMapa extends Posicao {
  graha: Graha;
  nome: string;
  /** Casa (1 a 12) contada do Lagna; null sem hora de nascimento. */
  casa: number | null;
  retrogrado: boolean;
}

export interface MapaNatal {
  nascimentoUtc: Date;
  /** Sem hora de nascimento, o mapa usa 12:00 local e não tem Lagna. */
  horaConhecida: boolean;
  lagna: (Posicao & { regente: Graha; nomeDoRegente: string }) | null;
  planetas: PlanetaNoMapa[];
  lua: PlanetaNoMapa;
  /** Senhor do nakshatra da Lua natal (início do Vimshottari). */
  senhorDoNakshatraNatal: Graha;
  dasha: DashaAtual | null;
}

const GRAHAS: Graha[] = [
  'sol',
  'lua',
  'marte',
  'mercurio',
  'jupiter',
  'venus',
  'saturno',
  'rahu',
  'ketu',
];

function retrogrado(graha: Graha, instante: Date) {
  // Sol e Lua nunca retrogradam; os nodos médios estão sempre em movimento
  // retrógrado.
  if (graha === 'sol' || graha === 'lua') return false;
  if (graha === 'rahu' || graha === 'ketu') return true;
  const antes = longitudeSideral(
    graha,
    new Date(instante.getTime() - 43_200_000)
  );
  const depois = longitudeSideral(
    graha,
    new Date(instante.getTime() + 43_200_000)
  );
  return normalizarGraus(depois - antes + 180) - 180 < 0;
}

export function calcularMapaNatal(
  nascimento: DadosDeNascimento,
  agora: Date = new Date()
): MapaNatal {
  const horaConhecida = Boolean(nascimento.hora);
  const instante = localParaUtc(
    nascimento.data,
    nascimento.hora ?? '12:00',
    nascimento.fuso
  );

  const lagnaLongitude = horaConhecida
    ? ascendenteSideral(instante, nascimento.latitude, nascimento.longitude)
    : null;
  const signoDoLagna =
    lagnaLongitude === null ? null : Math.floor(lagnaLongitude / 30);

  const planetas = GRAHAS.map((graha): PlanetaNoMapa => {
    const pos = posicao(longitudeSideral(graha, instante));
    return {
      ...pos,
      graha,
      nome: NOME_DO_GRAHA[graha],
      casa:
        signoDoLagna === null
          ? null
          : ((pos.signo - signoDoLagna + 12) % 12) + 1,
      retrogrado: retrogrado(graha, instante),
    };
  });
  const lua = planetas.find((p) => p.graha === 'lua') as PlanetaNoMapa;

  return {
    nascimentoUtc: instante,
    horaConhecida,
    lagna:
      lagnaLongitude === null
        ? null
        : (() => {
            const pos = posicao(lagnaLongitude);
            const regente = REGENTE_DO_SIGNO[pos.signo];
            return { ...pos, regente, nomeDoRegente: NOME_DO_GRAHA[regente] };
          })(),
    planetas,
    lua,
    senhorDoNakshatraNatal: senhorDoNakshatra(lua.nakshatra),
    dasha: dashaVigente(calcularVimshottari(lua.longitude, instante), agora),
  };
}
