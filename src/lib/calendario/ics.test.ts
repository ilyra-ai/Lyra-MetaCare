import { describe, expect, it } from 'vitest';

import { calcularPanchang } from '@/lib/astrology/panchang';
import { termoTecnicoEm } from '@/lib/coach/linguagem-simples';
import { buscarCidades } from '@/lib/geo/cidades';

import { dobrarLinha, escaparTexto, formatarUtc, gerarCalendario } from './ics';
import { eventosDoDia } from './janelas';

const saoPaulo = buscarCidades('sao paulo, sp')[0];

function horaEmSaoPaulo(instante: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(instante);
}

function panchangDe(data: string) {
  return calcularPanchang({
    data,
    latitude: saoPaulo.latitude,
    longitude: saoPaulo.longitude,
    fuso: saoPaulo.fuso,
  });
}

describe('iCalendar (RFC 5545)', () => {
  it('escapa barra, ponto e vírgula, vírgula e quebras de linha', () => {
    expect(escaparTexto('a\\b; c, d\ne\r\nf')).toBe('a\\\\b\\; c\\, d\\ne\\nf');
  });

  it('formata instantes em UTC sem milissegundos', () => {
    expect(formatarUtc(new Date('2026-10-15T07:02:09.512Z'))).toBe(
      '20261015T070209Z'
    );
  });

  it('dobra em 75 octetos sem partir caracteres UTF-8', () => {
    const linha = `DESCRIPTION:${'ção '.repeat(40)}`;
    const dobrada = dobrarLinha(linha);
    const partes = dobrada.split('\r\n');
    expect(partes.length).toBeGreaterThan(1);
    for (const [indice, parte] of partes.entries()) {
      expect(Buffer.byteLength(parte, 'utf8')).toBeLessThanOrEqual(75);
      if (indice > 0) expect(parte.startsWith(' ')).toBe(true);
      // Nenhum caractere de substituição: nenhum ç ou ã foi partido.
      expect(parte).not.toContain('�');
    }
    // Desdobrar devolve exatamente a linha original.
    expect(dobrada.replace(/\r\n /g, '')).toBe(linha);
    expect(dobrarLinha('SUMMARY:curta')).toBe('SUMMARY:curta');
  });

  it('gera o calendário com CRLF, eventos em UTC e lembrete', () => {
    const texto = gerarCalendario({
      nome: 'Lyra · Janelas do dia',
      descricao: 'Teste',
      atualizarACadaHoras: 12,
      geradoEm: new Date('2026-10-15T10:00:00Z'),
      eventos: [
        {
          uid: 'abhijit-2026-10-15-x@lyra-metacare',
          inicio: new Date('2026-10-15T14:27:00Z'),
          fim: new Date('2026-10-15T15:17:00Z'),
          titulo: 'Abhijit Muhurta · o mais importante',
          descricao: 'Começos, decisões',
          lembreteMinutos: 10,
        },
      ],
    });
    expect(texto.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(texto.split('\r\n').every((l) => !l.includes('\n'))).toBe(true);
    for (const linha of [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//iLyra AI//Lyra MetaCare//PT-BR',
      'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
      'X-PUBLISHED-TTL:PT12H',
      'DTSTAMP:20261015T100000Z',
      'DTSTART:20261015T142700Z',
      'DTEND:20261015T151700Z',
      'DESCRIPTION:Começos\\, decisões',
      'TRANSP:TRANSPARENT',
      'TRIGGER:-PT10M',
    ]) {
      expect(texto).toContain(`${linha}\r\n`);
    }
  });
});

describe('janelas do dia no calendário', () => {
  it('confere os horários reais de São Paulo em 15/10/2026 (quinta-feira)', () => {
    const eventos = eventosDoDia(panchangDe('2026-10-15'), {
      lugar: 'São Paulo, SP',
      chaveDoUid: 'abc',
      lembretes: true,
    });
    const porTitulo = Object.fromEntries(
      eventos.map((e) => [
        e.titulo,
        `${horaEmSaoPaulo(e.inicio)}–${horaEmSaoPaulo(e.fim)}`,
      ])
    );
    expect(porTitulo).toEqual({
      'Hora do silêncio · meditar': '04:02–04:48',
      'Horário mais forte · o mais importante': '11:27–12:17',
      'Pausa para começos · só rotina': '13:27–15:01',
      'Pôr do sol · pausa de gratidão': '18:11–18:35',
    });
    expect(eventos.every((e) => e.lembreteMinutos === 10)).toBe(true);
    expect(eventos[0].uid).toBe('brahma_muhurta-2026-10-15-abc@lyra-metacare');
    expect(eventos[0].descricao).toContain('céu de São Paulo, SP');
    // Linguagem simples (tarefa 49): nada de termos técnicos no calendário.
    for (const evento of eventos) {
      expect(termoTecnicoEm(`${evento.titulo} ${evento.descricao}`)).toBeNull();
    }
  });

  it('na quarta-feira não há Abhijit, e sem lembretes não há alarme', () => {
    const eventos = eventosDoDia(panchangDe('2026-10-14'), {
      lugar: 'São Paulo, SP',
      chaveDoUid: 'abc',
      lembretes: false,
    });
    expect(eventos.map((e) => e.titulo)).toEqual([
      'Hora do silêncio · meditar',
      'Pausa para começos · só rotina',
      'Pôr do sol · pausa de gratidão',
    ]);
    expect(eventos.every((e) => e.lembreteMinutos === null)).toBe(true);
  });
});
