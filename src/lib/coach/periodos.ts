import type {
  Intervalo,
  Panchang,
  PeriodoDoChoghadiya,
} from '@/lib/astrology/panchang';
import { horaLocal, localParaUtc } from '@/lib/astrology/tempo';

import { NOME_DA_JANELA, NOME_DO_CHOGHADIYA } from './linguagem-simples';
import type { Janela, Periodo, Qualidade } from './tipos';

/**
 * Os quatro períodos do dia no relógio local (madrugada até o nascer do sol,
 * manhã até o meio-dia, tarde até o pôr do sol e noite até a meia-noite), com
 * as janelas védicas que caem em cada um e uma nota de 0 a 100.
 */

const PESO_DA_QUALIDADE: Record<Qualidade, number> = {
  favoravel: 1,
  neutro: 0.5,
  desfavoravel: 0,
};

// Desconto na nota pela fração do período coberta por cada janela de cautela
// e acréscimo pelo Abhijit.
const PENALIDADE = { rahu_kalam: 0.6, yamaganda: 0.4, gulika: 0.3 } as const;
const BONUS_DO_ABHIJIT = 0.3;

function sobreposicao(a: Intervalo, b: Intervalo) {
  return Math.max(
    0,
    Math.min(a.fim.getTime(), b.fim.getTime()) -
      Math.max(a.inicio.getTime(), b.inicio.getTime())
  );
}

function recortar(janela: Intervalo, periodo: Intervalo): Intervalo | null {
  const inicio = Math.max(janela.inicio.getTime(), periodo.inicio.getTime());
  const fim = Math.min(janela.fim.getTime(), periodo.fim.getTime());
  return fim > inicio ? { inicio: new Date(inicio), fim: new Date(fim) } : null;
}

function horario(intervalo: Intervalo, fuso: string) {
  return `${horaLocal(intervalo.inicio, fuso)}–${horaLocal(intervalo.fim, fuso)}`;
}

function janela(
  tipo: Janela['tipo'],
  nome: string,
  qualidade: Qualidade,
  intervalo: Intervalo,
  sentido: string,
  fuso: string
): Janela {
  return {
    tipo,
    nome,
    qualidade,
    inicio: intervalo.inicio.toISOString(),
    fim: intervalo.fim.toISOString(),
    horario: horario(intervalo, fuso),
    sentido,
  };
}

export interface EntradaDosPeriodos {
  data: string;
  fuso: string;
  hoje: Panchang;
  /** Panchang da véspera: a noite dela cobre a madrugada de hoje. */
  ontem: Panchang;
  /** Mudança de nakshatra durante o dia, com o efeito para a pessoa. */
  trocaDeNakshatra: { instante: Date; descricao: string } | null;
}

export function calcularPeriodos(entrada: EntradaDosPeriodos): Periodo[] {
  const { data, fuso, hoje, ontem } = entrada;
  const meiaNoite = localParaUtc(data, '00:00', fuso);
  const meioDia = localParaUtc(data, '12:00', fuso);
  const proximaMeiaNoite = new Date(
    localParaUtc(data, '23:59', fuso).getTime() + 60_000
  );

  const limites: Array<{
    chave: Periodo['chave'];
    nome: string;
    intervalo: Intervalo;
  }> = [
    {
      chave: 'madrugada',
      nome: 'Madrugada',
      intervalo: { inicio: meiaNoite, fim: hoje.nascerDoSol },
    },
    {
      chave: 'manha',
      nome: 'Manhã',
      intervalo: { inicio: hoje.nascerDoSol, fim: meioDia },
    },
    {
      chave: 'tarde',
      nome: 'Tarde',
      intervalo: { inicio: meioDia, fim: hoje.porDoSol },
    },
    {
      chave: 'noite',
      nome: 'Noite',
      intervalo: { inicio: hoje.porDoSol, fim: proximaMeiaNoite },
    },
  ];

  const choghadiyas: PeriodoDoChoghadiya[] = [
    ...ontem.choghadiyaDaNoite,
    ...hoje.choghadiyaDoDia,
    ...hoje.choghadiyaDaNoite,
  ];
  const cautelas = [
    {
      tipo: 'rahu_kalam' as const,
      nome: NOME_DA_JANELA.rahu_kalam,
      intervalo: hoje.rahuKalam,
      sentido:
        'evite começar algo importante, assinar ou tomar decisões grandes',
    },
    {
      tipo: 'yamaganda' as const,
      nome: NOME_DA_JANELA.yamaganda,
      intervalo: hoje.yamaganda,
      sentido: 'energia de perda: poupe esforços e riscos',
    },
    {
      tipo: 'gulika' as const,
      nome: NOME_DA_JANELA.gulika,
      intervalo: hoje.gulikaKalam,
      sentido:
        'o que começa aqui tende a se repetir: bom para rotina, não para começos',
    },
  ];

  return limites
    .filter(({ intervalo }) => intervalo.fim > intervalo.inicio)
    .map(({ chave, nome, intervalo }): Periodo => {
      const duracao = intervalo.fim.getTime() - intervalo.inicio.getTime();
      const destaques: Janela[] = [];
      const cuidados: Janela[] = [];

      let soma = 0;
      for (const c of choghadiyas) {
        const tempo = sobreposicao(c, intervalo);
        if (tempo === 0) continue;
        soma += PESO_DA_QUALIDADE[c.qualidade] * tempo;
        const recorte = recortar(c, intervalo);
        if (
          !recorte ||
          recorte.fim.getTime() - recorte.inicio.getTime() < 10 * 60_000
        ) {
          continue;
        }
        const item = janela(
          'choghadiya',
          NOME_DO_CHOGHADIYA[c.nome] ?? c.nome,
          c.qualidade,
          recorte,
          c.significado,
          fuso
        );
        if (c.qualidade === 'favoravel') destaques.push(item);
        else if (c.qualidade === 'desfavoravel') cuidados.push(item);
      }
      let nota = (soma / duracao) * 100;

      for (const cautela of cautelas) {
        const tempo = sobreposicao(cautela.intervalo, intervalo);
        if (tempo === 0) continue;
        nota -= PENALIDADE[cautela.tipo] * (tempo / duracao) * 100;
        const recorte = recortar(cautela.intervalo, intervalo);
        if (recorte) {
          cuidados.unshift(
            janela(
              cautela.tipo,
              cautela.nome,
              'desfavoravel',
              recorte,
              cautela.sentido,
              fuso
            )
          );
        }
      }

      if (hoje.abhijitMuhurta.valido) {
        const tempo = sobreposicao(hoje.abhijitMuhurta, intervalo);
        if (tempo > 0) {
          nota += BONUS_DO_ABHIJIT * (tempo / duracao) * 100;
          const recorte = recortar(hoje.abhijitMuhurta, intervalo);
          if (recorte) {
            destaques.unshift(
              janela(
                'abhijit',
                NOME_DA_JANELA.abhijit,
                'favoravel',
                recorte,
                'o momento mais forte do dia para começar e decidir',
                fuso
              )
            );
          }
        }
      }

      const brahma = recortar(hoje.brahmaMuhurta, intervalo);
      if (brahma) {
        destaques.unshift(
          janela(
            'brahma_muhurta',
            NOME_DA_JANELA.brahma_muhurta,
            'favoravel',
            brahma,
            'silêncio da madrugada: meditação, respiração e intenção do dia',
            fuso
          )
        );
      }

      const troca = entrada.trocaDeNakshatra;
      if (
        troca &&
        troca.instante >= intervalo.inicio &&
        troca.instante < intervalo.fim
      ) {
        destaques.push(
          janela(
            'troca_de_nakshatra',
            NOME_DA_JANELA.troca_de_nakshatra,
            'neutro',
            { inicio: troca.instante, fim: troca.instante },
            troca.descricao,
            fuso
          )
        );
      }

      const notaFinal = Math.round(Math.max(0, Math.min(100, nota)));
      return {
        chave,
        nome,
        inicio: intervalo.inicio.toISOString(),
        fim: intervalo.fim.toISOString(),
        horario: horario(intervalo, fuso),
        qualidade:
          notaFinal >= 60
            ? 'favoravel'
            : notaFinal >= 40
              ? 'neutro'
              : 'desfavoravel',
        nota: notaFinal,
        destaques: destaques.sort((a, b) => a.inicio.localeCompare(b.inicio)),
        cuidados: cuidados.sort((a, b) => a.inicio.localeCompare(b.inicio)),
        // Preenchida pelo gerador, que conhece a prontidão e o mapa.
        sugestao: '',
      };
    });
}
