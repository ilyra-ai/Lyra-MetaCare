import { describe, expect, it } from 'vitest';

import type {
  EstadoDaAssinatura,
  JanelasDeHoje,
} from '@/lib/calendario/servico';
import { buscarCidades } from '@/lib/geo/cidades';
import { queryRows } from '@/lib/mysql/pool';

import { criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as exportacao from './account/export/route';
import * as assinatura from './calendario/assinatura/route';
import * as feed from './calendario/feed/[arquivo]/route';
import * as hoje from './calendario/hoje/route';
import * as janelas from './calendario/janelas/route';
import * as localizacao from './perfil/localizacao/route';

const saoPaulo = buscarCidades('sao paulo, sp')[0];

async function pessoaEmSaoPaulo(nome: string) {
  const pessoa = await criarUsuario('patient', nome);
  const resposta = await chamar(localizacao.PATCH, {
    method: 'PATCH',
    body: { tipo: 'moradia', cidadeId: saoPaulo.id },
    usuario: pessoa,
  });
  expect(resposta.status).toBe(200);
  return pessoa;
}

function tokenDe(url: string) {
  const achado = /\/api\/calendario\/feed\/([A-Za-z0-9_-]{43})\.ics/.exec(url);
  if (!achado) throw new Error(`URL sem token: ${url}`);
  return achado[1];
}

async function lerFeed(token: string, query = '') {
  return chamar(feed.GET, {
    path: `/api/calendario/feed/${token}.ics${query}`,
    params: { arquivo: `${token}.ics` },
    usuario: null,
  });
}

describe('agenda no calendário (/api/calendario)', () => {
  it('exige sessão para o download e para gerir o link', async () => {
    expect((await chamar(hoje.GET, { usuario: null })).status).toBe(401);
    expect((await chamar(assinatura.GET, { usuario: null })).status).toBe(401);
    expect(
      (await chamar(assinatura.POST, { method: 'POST', usuario: null })).status
    ).toBe(401);
  });

  it('sem cidade no perfil, explica o que falta', async () => {
    const pessoa = await criarUsuario('patient', 'SemCidade');
    const download = await chamar(hoje.GET, { usuario: pessoa });
    expect(download.status).toBe(409);
    expect(download.json).toEqual({
      error:
        'Defina no perfil a cidade onde você mora para calcular as janelas do dia.',
    });
    const criar = await chamar(assinatura.POST, {
      method: 'POST',
      usuario: pessoa,
    });
    expect(criar.status).toBe(409);
  });

  it('baixa o .ics de hoje com as janelas da cidade', async () => {
    const pessoa = await pessoaEmSaoPaulo('Baixa');
    const resposta = await chamar(hoje.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get('content-type')).toBe(
      'text/calendar; charset=utf-8'
    );
    expect(resposta.headers.get('content-disposition')).toMatch(
      /^attachment; filename="lyra-janelas-\d{4}-\d{2}-\d{2}\.ics"$/
    );
    expect(resposta.texto.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(resposta.texto).toContain('SUMMARY:Hora do silêncio · meditar');
    expect(resposta.texto).toContain('SUMMARY:Pausa para começos · só rotina');
    expect(resposta.texto).toContain('TRIGGER:-PT10M');
    const semLembrete = await chamar(hoje.GET, {
      path: '/api/calendario/hoje?lembretes=nao',
      usuario: pessoa,
    });
    expect(semLembrete.texto).not.toContain('BEGIN:VALARM');
  });

  it('cria, mostra de novo, lê pelo app, troca e desativa o link', async () => {
    const pessoa = await pessoaEmSaoPaulo('Assina');

    const vazio = await chamar(assinatura.GET, { usuario: pessoa });
    expect(vazio.json).toMatchObject({ ativa: false, url: null });

    const criada = await chamar(assinatura.POST, {
      method: 'POST',
      usuario: pessoa,
    });
    expect(criada.status).toBe(201);
    const estado = criada.json as EstadoDaAssinatura;
    expect(estado.ativa).toBe(true);
    expect(estado.webcal).toBe(estado.url?.replace(/^https?:/, 'webcal:'));
    const token = tokenDe(estado.url!);

    // O token não fica legível no banco: só o hash e o texto cifrado.
    const [linha] = await queryRows<{
      token_hash: string;
      token_ciphertext: string;
    }>(
      'SELECT token_hash, token_ciphertext FROM calendar_feeds WHERE user_id = ?',
      [pessoa.id]
    );
    expect(linha.token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(linha.token_ciphertext).not.toContain(token);
    expect(linha.token_hash).not.toContain(token);

    // A própria pessoa vê o mesmo link depois.
    const relida = await chamar(assinatura.GET, { usuario: pessoa });
    expect((relida.json as EstadoDaAssinatura).url).toBe(estado.url);

    const lido = await lerFeed(token);
    expect(lido.status).toBe(200);
    expect(lido.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(lido.texto.match(/BEGIN:VEVENT/g)?.length).toBeGreaterThanOrEqual(
      7 * 3
    );
    expect(lido.texto).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT12H');
    const [acesso] = await queryRows<{ last_access_at: string | null }>(
      'SELECT last_access_at FROM calendar_feeds WHERE user_id = ?',
      [pessoa.id]
    );
    expect(acesso.last_access_at).not.toBeNull();

    const trocada = await chamar(assinatura.POST, {
      method: 'POST',
      usuario: pessoa,
    });
    const novoToken = tokenDe((trocada.json as EstadoDaAssinatura).url!);
    expect(novoToken).not.toBe(token);
    expect((await lerFeed(token)).status).toBe(404);
    expect((await lerFeed(novoToken)).status).toBe(200);

    const desativada = await chamar(assinatura.DELETE, {
      method: 'DELETE',
      usuario: pessoa,
    });
    expect(desativada.status).toBe(200);
    expect((desativada.json as EstadoDaAssinatura).ativa).toBe(false);
    expect((await lerFeed(novoToken)).status).toBe(404);
    const deNovo = await chamar(assinatura.DELETE, {
      method: 'DELETE',
      usuario: pessoa,
    });
    expect(deNovo.status).toBe(404);
  });

  it('janelas de hoje para a tela, iguais às do arquivo', async () => {
    const pessoa = await pessoaEmSaoPaulo('Janelas');
    const resposta = await chamar(janelas.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    const corpo = resposta.json as JanelasDeHoje;
    expect(corpo.fuso).toBe('America/Sao_Paulo');
    expect(corpo.janelas.map((j) => j.tipo)).toContain('brahma_muhurta');
    expect(corpo.janelas.map((j) => j.tipo)).toContain('sandhya');
    const arquivo = await chamar(hoje.GET, { usuario: pessoa });
    for (const janela of corpo.janelas) {
      const inicio = janela.inicio
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z');
      expect(arquivo.texto).toContain(`DTSTART:${inicio}`);
    }
    expect((await chamar(janelas.GET, { usuario: null })).status).toBe(401);
  });

  it('link inválido ou forjado responde 404 sem detalhes', async () => {
    for (const arquivo of [
      'nao-existe.ics',
      `${'a'.repeat(43)}.ics`,
      `${'a'.repeat(43)}.txt`,
      '../../etc/passwd',
    ]) {
      const resposta = await chamar(feed.GET, {
        params: { arquivo },
        usuario: null,
      });
      expect(resposta.status).toBe(404);
      expect(resposta.json).toEqual({ error: 'Agenda não encontrada.' });
    }
  });

  it('exportação LGPD traz o link sem o hash nem o token', async () => {
    const pessoa = await pessoaEmSaoPaulo('Exporta');
    const criada = await chamar(assinatura.POST, {
      method: 'POST',
      usuario: pessoa,
    });
    const token = tokenDe((criada.json as EstadoDaAssinatura).url!);
    const resposta = await chamar(exportacao.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    const corpo = resposta.json as {
      agenda_no_calendario: Array<Record<string, unknown>>;
    };
    expect(corpo.agenda_no_calendario).toHaveLength(1);
    expect(Object.keys(corpo.agenda_no_calendario[0]).sort()).toEqual([
      'created_at',
      'last_access_at',
    ]);
    expect(resposta.texto).not.toContain(token);
  });
});
