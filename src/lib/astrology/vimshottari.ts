import { type Graha, NOME_DO_GRAHA } from './sideral';

/**
 * Vimshottari Dasha: ciclo de 120 anos dividido entre os nove grahas na ordem
 * dos senhores dos nakshatras. O período do nascimento é o do senhor do
 * nakshatra da Lua natal, com o saldo proporcional ao que falta da Lua
 * percorrer naquele nakshatra. Ano do dasha = 365,25 dias (ano juliano),
 * convenção mais usada pelos softwares de Jyotish.
 */

export const SEQUENCIA_VIMSHOTTARI: ReadonlyArray<{
  graha: Graha;
  anos: number;
}> = [
  { graha: 'ketu', anos: 7 },
  { graha: 'venus', anos: 20 },
  { graha: 'sol', anos: 6 },
  { graha: 'lua', anos: 10 },
  { graha: 'marte', anos: 7 },
  { graha: 'rahu', anos: 18 },
  { graha: 'jupiter', anos: 16 },
  { graha: 'saturno', anos: 19 },
  { graha: 'mercurio', anos: 17 },
];

const ANO_EM_MS = 365.25 * 86_400_000;
const EXTENSAO_DO_NAKSHATRA = 360 / 27;

export interface PeriodoDoDasha {
  graha: Graha;
  nome: string;
  inicio: Date;
  fim: Date;
}

export interface MahadashaComAntardashas extends PeriodoDoDasha {
  antardashas: PeriodoDoDasha[];
}

/** Senhor do nakshatra (Ashwini = Ketu, Bharani = Vênus...). */
export function senhorDoNakshatra(indice: number): Graha {
  return SEQUENCIA_VIMSHOTTARI[indice % 9].graha;
}

/** Todos os Mahadashas (com Antardashas) a partir do nascimento. */
export function calcularVimshottari(
  longitudeDaLuaNatal: number,
  nascimento: Date
): MahadashaComAntardashas[] {
  const nakshatra = Math.floor(longitudeDaLuaNatal / EXTENSAO_DO_NAKSHATRA);
  const percorrido =
    (longitudeDaLuaNatal - nakshatra * EXTENSAO_DO_NAKSHATRA) /
    EXTENSAO_DO_NAKSHATRA;
  const primeiro = nakshatra % 9;

  // O primeiro Mahadasha começou antes do nascimento: recua a parte já
  // percorrida para que as Antardashas fiquem nas datas corretas.
  const duracaoDoPrimeiro = SEQUENCIA_VIMSHOTTARI[primeiro].anos * ANO_EM_MS;
  let inicio = nascimento.getTime() - percorrido * duracaoDoPrimeiro;

  const mahadashas: MahadashaComAntardashas[] = [];
  for (let i = 0; i < 9; i++) {
    const { graha, anos } = SEQUENCIA_VIMSHOTTARI[(primeiro + i) % 9];
    const fim = inicio + anos * ANO_EM_MS;
    const antardashas: PeriodoDoDasha[] = [];
    let inicioDaAntar = inicio;
    for (let j = 0; j < 9; j++) {
      const sub = SEQUENCIA_VIMSHOTTARI[(primeiro + i + j) % 9];
      const fimDaAntar = inicioDaAntar + ((anos * sub.anos) / 120) * ANO_EM_MS;
      antardashas.push({
        graha: sub.graha,
        nome: NOME_DO_GRAHA[sub.graha],
        inicio: new Date(inicioDaAntar),
        fim: new Date(fimDaAntar),
      });
      inicioDaAntar = fimDaAntar;
    }
    mahadashas.push({
      graha,
      nome: NOME_DO_GRAHA[graha],
      inicio: new Date(inicio),
      fim: new Date(fim),
      antardashas,
    });
    inicio = fim;
  }
  return mahadashas;
}

export interface DashaAtual {
  mahadasha: PeriodoDoDasha;
  antardasha: PeriodoDoDasha;
  proximaAntardasha: PeriodoDoDasha | null;
}

/** Mahadasha e Antardasha vigentes no instante (null fora dos 120 anos). */
export function dashaVigente(
  mahadashas: MahadashaComAntardashas[],
  agora: Date
): DashaAtual | null {
  const t = agora.getTime();
  for (let i = 0; i < mahadashas.length; i++) {
    const md = mahadashas[i];
    if (t < md.inicio.getTime() || t >= md.fim.getTime()) continue;
    const indice = md.antardashas.findIndex(
      (ad) => t >= ad.inicio.getTime() && t < ad.fim.getTime()
    );
    const proxima =
      md.antardashas[indice + 1] ?? mahadashas[i + 1]?.antardashas[0] ?? null;
    return {
      mahadasha: {
        graha: md.graha,
        nome: md.nome,
        inicio: md.inicio,
        fim: md.fim,
      },
      antardasha: md.antardashas[indice],
      proximaAntardasha: proxima,
    };
  }
  return null;
}
