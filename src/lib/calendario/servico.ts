import { createHash, randomBytes } from 'node:crypto';

import {
  calcularPanchang,
  LocalSemNascerDoSolError,
} from '@/lib/astrology/panchang';
import { lerPerfilAstrologico } from '@/lib/astrology/perfil-astrologico';
import { dataLocal } from '@/lib/astrology/tempo';
import { HttpError } from '@/lib/http-error';
import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { cifrar, decifrar } from '@/lib/security/cifra';

import { gerarCalendario } from './ics';
import { eventosDoDia, type JanelaDoCalendario } from './janelas';

/**
 * Agenda védica no calendário (tarefa 44): o arquivo .ics de hoje e o link de
 * assinatura privado, que o app de calendário da pessoa relê sozinho e que
 * sempre traz hoje e os próximos dias, recalculados com o Panchang da cidade
 * da pessoa no momento da leitura.
 */

/** Dias publicados no link de assinatura (hoje e os 6 seguintes). */
export const DIAS_DA_ASSINATURA = 7;
const FINALIDADE_DA_CIFRA = 'agenda-no-calendario';
const NOME_DO_CALENDARIO = 'Lyra · Janelas do dia';
export const FORMATO_DO_TOKEN = /^[A-Za-z0-9_-]{43}$/;

function somarDias(data: string, dias: number) {
  const instante = new Date(`${data}T12:00:00Z`);
  instante.setUTCDate(instante.getUTCDate() + dias);
  return instante.toISOString().slice(0, 10);
}

function hashDoToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

/** Parte do UID dos eventos: estável por pessoa, sem revelar o id da conta. */
function chaveDoUid(userId: string) {
  return createHash('sha256')
    .update(`lyra-agenda:${userId}`)
    .digest('hex')
    .slice(0, 16);
}

export interface AgendaDaPessoa {
  /** Data local do primeiro dia. */
  inicio: string;
  lugar: string;
  /** Fuso IANA da cidade (para exibir os horários na tela). */
  fuso: string;
  eventos: JanelaDoCalendario[];
}

/** Janela de hoje como a tela recebe (datas em ISO 8601). */
export interface JanelaDeHoje {
  tipo: JanelaDoCalendario['tipo'];
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
}

export interface JanelasDeHoje {
  data: string;
  lugar: string;
  fuso: string;
  janelas: JanelaDeHoje[];
}

/** Eventos de `dias` dias a partir de hoje, no fuso da cidade da pessoa. */
export async function agendaDaPessoa(
  userId: string,
  dias: number,
  opcoes: { lembretes: boolean },
  agora = new Date()
): Promise<AgendaDaPessoa> {
  const perfil = await lerPerfilAstrologico(userId);
  const lugar = perfil.localDoDia;
  if (!lugar) {
    throw new HttpError(
      'Defina no perfil a cidade onde você mora para calcular as janelas do dia.',
      409
    );
  }
  const hoje = dataLocal(agora, lugar.fuso);
  const eventos: JanelaDoCalendario[] = [];
  for (let d = 0; d < dias; d += 1) {
    const data = somarDias(hoje, d);
    try {
      const panchang = calcularPanchang({
        data,
        latitude: lugar.latitude,
        longitude: lugar.longitude,
        fuso: lugar.fuso,
      });
      eventos.push(
        ...eventosDoDia(panchang, {
          lugar: lugar.rotulo,
          chaveDoUid: chaveDoUid(userId),
          lembretes: opcoes.lembretes,
        })
      );
    } catch (error) {
      // Dia ou noite polar: sem nascer ou pôr do sol, não há janelas.
      if (!(error instanceof LocalSemNascerDoSolError)) throw error;
    }
  }
  return { inicio: hoje, lugar: lugar.rotulo, fuso: lugar.fuso, eventos };
}

/** As janelas de hoje para o cartão do "Meu dia" (mesma fonte do .ics). */
export async function janelasDeHoje(
  userId: string,
  agora = new Date()
): Promise<JanelasDeHoje> {
  const agenda = await agendaDaPessoa(userId, 1, { lembretes: false }, agora);
  return {
    data: agenda.inicio,
    lugar: agenda.lugar,
    fuso: agenda.fuso,
    janelas: agenda.eventos.map((evento) => ({
      tipo: evento.tipo,
      titulo: evento.titulo,
      descricao: evento.descricao,
      inicio: evento.inicio.toISOString(),
      fim: evento.fim.toISOString(),
    })),
  };
}

export function calendarioDaAgenda(
  agenda: AgendaDaPessoa,
  geradoEm = new Date()
) {
  return gerarCalendario({
    nome: NOME_DO_CALENDARIO,
    descricao: `Hora do silêncio, horário mais forte do dia, pausa para começos e pôr do sol de ${agenda.lugar}, calculados pela Lyra MetaCare.`,
    atualizarACadaHoras: 12,
    eventos: agenda.eventos,
    geradoEm,
  });
}

// ---------------------------------------------------------------------------
// Link de assinatura
// ---------------------------------------------------------------------------

interface LinhaDaAssinatura {
  token_ciphertext: string;
  created_at: string;
  last_access_at: string | null;
}

export interface EstadoDaAssinatura {
  ativa: boolean;
  /** Endereço https do feed (null sem link ativo ou se o segredo mudou). */
  url: string | null;
  /** O mesmo endereço com `webcal://`, que abre o app de calendário. */
  webcal: string | null;
  criadaEm: string | null;
  ultimoAcesso: string | null;
  /** O endereço é local (localhost): serviços na nuvem não conseguem lê-lo. */
  enderecoLocal: boolean;
}

function isoDoBanco(valor: string | null) {
  return valor ? new Date(`${valor.replace(' ', 'T')}Z`).toISOString() : null;
}

/** Origem pública do app: APP_BASE_URL, NEXT_PUBLIC_APP_URL ou a da requisição. */
export function origemPublica(origemDaRequisicao: string) {
  const configurada =
    process.env.APP_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  try {
    return new URL(configurada || origemDaRequisicao).origin;
  } catch {
    return new URL(origemDaRequisicao).origin;
  }
}

function enderecos(origem: string, token: string, lembretes: boolean) {
  const caminho = `/api/calendario/feed/${token}.ics${lembretes ? '' : '?lembretes=nao'}`;
  const url = `${origem}${caminho}`;
  return { url, webcal: url.replace(/^https?:\/\//, 'webcal://') };
}

function ehLocal(origem: string) {
  const host = new URL(origem).hostname;
  return (
    host === 'localhost' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.localhost') ||
    /^127\./.test(host)
  );
}

export async function lerAssinatura(
  userId: string,
  origem: string,
  lembretes = true
): Promise<EstadoDaAssinatura> {
  const [linha] = await queryRows<LinhaDaAssinatura>(
    `SELECT token_ciphertext, created_at, last_access_at
       FROM calendar_feeds WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  const local = ehLocal(origem);
  if (!linha) {
    return {
      ativa: false,
      url: null,
      webcal: null,
      criadaEm: null,
      ultimoAcesso: null,
      enderecoLocal: local,
    };
  }
  const token = decifrar(linha.token_ciphertext, FINALIDADE_DA_CIFRA);
  const links = token ? enderecos(origem, token, lembretes) : null;
  return {
    ativa: true,
    url: links?.url ?? null,
    webcal: links?.webcal ?? null,
    criadaEm: isoDoBanco(linha.created_at),
    ultimoAcesso: isoDoBanco(linha.last_access_at),
    enderecoLocal: local,
  };
}

/** Cria o link (ou troca o anterior, que deixa de funcionar na hora). */
export async function criarAssinatura(
  userId: string,
  origem: string,
  lembretes = true
) {
  const perfil = await lerPerfilAstrologico(userId);
  if (!perfil.localDoDia) {
    throw new HttpError(
      'Defina no perfil a cidade onde você mora antes de assinar a agenda.',
      409
    );
  }
  const token = randomBytes(32).toString('base64url');
  await executeStatement(
    `INSERT INTO calendar_feeds (user_id, token_hash, token_ciphertext)
     VALUES (?, ?, ?)
     AS novo
     ON DUPLICATE KEY UPDATE
       token_hash = novo.token_hash,
       token_ciphertext = novo.token_ciphertext,
       created_at = CURRENT_TIMESTAMP,
       last_access_at = NULL`,
    [userId, hashDoToken(token), cifrar(token, FINALIDADE_DA_CIFRA)]
  );
  return lerAssinatura(userId, origem, lembretes);
}

export async function apagarAssinatura(userId: string, origem: string) {
  const resultado = await executeStatement(
    'DELETE FROM calendar_feeds WHERE user_id = ?',
    [userId]
  );
  if (resultado.affectedRows === 0) {
    throw new HttpError('Não há link de agenda ativo para desativar.', 404);
  }
  return lerAssinatura(userId, origem);
}

/** Dono do link (e registro do acesso), ou null para token inexistente. */
export async function donoDoToken(token: string): Promise<string | null> {
  if (!FORMATO_DO_TOKEN.test(token)) return null;
  const hash = hashDoToken(token);
  const [linha] = await queryRows<{ user_id: string }>(
    'SELECT user_id FROM calendar_feeds WHERE token_hash = ? LIMIT 1',
    [hash]
  );
  if (!linha) return null;
  await executeStatement(
    'UPDATE calendar_feeds SET last_access_at = UTC_TIMESTAMP() WHERE token_hash = ?',
    [hash]
  );
  return linha.user_id;
}

export { hashDoToken };
