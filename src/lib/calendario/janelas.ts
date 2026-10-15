import type { Panchang } from '@/lib/astrology/panchang';

import type { EventoDoCalendario } from './ics';

/**
 * Janelas do dia que vão para o calendário (tarefa 44), a partir do
 * Panchang da cidade da pessoa: Brahma Muhurta, Abhijit Muhurta (fora de
 * quarta-feira, como manda a tradição), Rahu Kalam e o pôr do sol (Sandhya,
 * com a duração de um ghati, 24 minutos).
 */

export type TipoDeJanela =
  'brahma_muhurta' | 'abhijit' | 'rahu_kalam' | 'sandhya';

export const MINUTOS_DE_LEMBRETE = 10;
const GHATI_MS = 24 * 60_000;

export type JanelaDoCalendario = EventoDoCalendario & { tipo: TipoDeJanela };

export function eventosDoDia(
  panchang: Panchang,
  opcoes: {
    /** Cidade, para a descrição ("Calculado para São Paulo, SP"). */
    lugar: string;
    /** Parte estável e não identificável do UID (ex.: hash curto da pessoa). */
    chaveDoUid: string;
    lembretes: boolean;
  }
): JanelaDoCalendario[] {
  const lembrete = opcoes.lembretes ? MINUTOS_DE_LEMBRETE : null;
  const origem = `Calculado pela Lyra MetaCare com o Panchang de ${opcoes.lugar}.`;
  const uid = (tipo: TipoDeJanela) =>
    `${tipo}-${panchang.data}-${opcoes.chaveDoUid}@lyra-metacare`;

  const eventos: JanelaDoCalendario[] = [
    {
      tipo: 'brahma_muhurta',
      uid: uid('brahma_muhurta'),
      inicio: panchang.brahmaMuhurta.inicio,
      fim: panchang.brahmaMuhurta.fim,
      titulo: 'Brahma Muhurta · meditar',
      descricao: `Janela antes do nascer do sol para meditar e firmar a intenção do dia. ${origem}`,
      lembreteMinutos: lembrete,
    },
  ];
  if (panchang.abhijitMuhurta.valido) {
    eventos.push({
      tipo: 'abhijit',
      uid: uid('abhijit'),
      inicio: panchang.abhijitMuhurta.inicio,
      fim: panchang.abhijitMuhurta.fim,
      titulo: 'Abhijit Muhurta · o mais importante',
      descricao: `Janela forte para começos e decisões (o 8º muhurta do dia). ${origem}`,
      lembreteMinutos: lembrete,
    });
  }
  eventos.push(
    {
      tipo: 'rahu_kalam',
      uid: uid('rahu_kalam'),
      inicio: panchang.rahuKalam.inicio,
      fim: panchang.rahuKalam.fim,
      titulo: 'Rahu Kalam · sem começos',
      descricao: `Evite começar coisas novas e assinar compromissos nesta janela. ${origem}`,
      lembreteMinutos: lembrete,
    },
    {
      tipo: 'sandhya',
      uid: uid('sandhya'),
      inicio: panchang.porDoSol,
      fim: new Date(panchang.porDoSol.getTime() + GHATI_MS),
      titulo: 'Pôr do sol · Sandhya',
      descricao: `Pausa de gratidão na passagem do dia para a noite. ${origem}`,
      lembreteMinutos: lembrete,
    }
  );
  return eventos;
}
