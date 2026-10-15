/**
 * Gerador de iCalendar (RFC 5545, com as propriedades de calendário da RFC
 * 7986) para a agenda védica (tarefa 44). Sem dependências: o formato usado
 * aqui é pequeno e cada regra está coberta por teste.
 *
 * - Linhas terminadas em CRLF e dobradas em no máximo 75 octetos (seção
 *   3.1), sem partir um caractere UTF-8 no meio; a continuação começa com
 *   um espaço.
 * - Textos com `\`, `;`, `,` e quebras de linha escapados (seção 3.3.11).
 * - Horários sempre em UTC (`AAAAMMDDTHHMMSSZ`), então não é preciso
 *   VTIMEZONE: o app de calendário mostra no fuso de quem assina.
 */

export interface EventoDoCalendario {
  /** Identificador estável (o mesmo evento em leituras diferentes do feed). */
  uid: string;
  inicio: Date;
  fim: Date;
  titulo: string;
  descricao: string;
  /** Minutos antes do início para o lembrete; `null` sem lembrete. */
  lembreteMinutos: number | null;
}

export interface Calendario {
  nome: string;
  descricao: string;
  /** Intervalo sugerido de atualização para quem assina (horas). */
  atualizarACadaHoras: number;
  eventos: EventoDoCalendario[];
  geradoEm: Date;
}

const CRLF = '\r\n';
const LIMITE_DE_OCTETOS = 75;

export function escaparTexto(texto: string) {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

export function formatarUtc(instante: Date) {
  return instante
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Dobra a linha em partes de até 75 octetos (a primeira) e 74 octetos mais o
 * espaço inicial (as seguintes), sempre entre caracteres completos.
 */
export function dobrarLinha(linha: string) {
  const partes: string[] = [];
  let atual = '';
  let octetos = 0;
  let limite = LIMITE_DE_OCTETOS;
  for (const caractere of linha) {
    const tamanho = Buffer.byteLength(caractere, 'utf8');
    if (octetos + tamanho > limite) {
      partes.push(atual);
      atual = '';
      octetos = 0;
      limite = LIMITE_DE_OCTETOS - 1;
    }
    atual += caractere;
    octetos += tamanho;
  }
  partes.push(atual);
  return partes.join(`${CRLF} `);
}

function propriedade(nome: string, valor: string) {
  return dobrarLinha(`${nome}:${valor}`);
}

export function gerarCalendario(calendario: Calendario) {
  const carimbo = formatarUtc(calendario.geradoEm);
  const ttl = `PT${calendario.atualizarACadaHoras}H`;
  const linhas: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//iLyra AI//Lyra MetaCare//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    propriedade('NAME', escaparTexto(calendario.nome)),
    propriedade('X-WR-CALNAME', escaparTexto(calendario.nome)),
    propriedade('DESCRIPTION', escaparTexto(calendario.descricao)),
    propriedade('X-WR-CALDESC', escaparTexto(calendario.descricao)),
    `REFRESH-INTERVAL;VALUE=DURATION:${ttl}`,
    `X-PUBLISHED-TTL:${ttl}`,
  ];
  for (const evento of calendario.eventos) {
    linhas.push(
      'BEGIN:VEVENT',
      propriedade('UID', evento.uid),
      `DTSTAMP:${carimbo}`,
      `DTSTART:${formatarUtc(evento.inicio)}`,
      `DTEND:${formatarUtc(evento.fim)}`,
      propriedade('SUMMARY', escaparTexto(evento.titulo)),
      propriedade('DESCRIPTION', escaparTexto(evento.descricao)),
      // Janela informativa: não ocupa a agenda (livre/ocupado).
      'TRANSP:TRANSPARENT',
      'STATUS:CONFIRMED'
    );
    if (evento.lembreteMinutos !== null) {
      linhas.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        propriedade('DESCRIPTION', escaparTexto(evento.titulo)),
        `TRIGGER:-PT${evento.lembreteMinutos}M`,
        'END:VALARM'
      );
    }
    linhas.push('END:VEVENT');
  }
  linhas.push('END:VCALENDAR');
  return `${linhas.join(CRLF)}${CRLF}`;
}
