import { describe, expect, it } from 'vitest';

import { buscarCidades } from '@/lib/geo/cidades';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import { criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as dia from './astrologia/dia/route';
import * as mapa from './astrologia/mapa/route';
import * as dados from './data/[table]/route';
import * as cidades from './geo/cidades/route';
import * as localizacao from './perfil/localizacao/route';

const saoPaulo = buscarCidades('sao paulo, sp')[0];
const delhi = buscarCidades('new delhi')[0];

async function locais(userId: string) {
  const [linha] = await queryRows<Record<string, string | number | null>>(
    `SELECT birth_location, birth_city_id, birth_latitude, birth_longitude,
            birth_timezone, residence_location, residence_city_id,
            residence_timezone
       FROM profiles WHERE id = ?`,
    [userId]
  );
  return linha;
}

describe('busca de cidades (GET /api/geo/cidades)', () => {
  it('busca na base local, com UF', async () => {
    const pessoa = await criarUsuario('patient', 'Cidade');
    const resposta = await chamar(cidades.GET, {
      path: '/api/geo/cidades?q=campinas%2C%20sp',
      usuario: pessoa,
    });
    expect(resposta.status).toBe(200);
    const corpo = resposta.json as {
      cidades: Array<{ rotulo: string; fuso: string }>;
    };
    expect(corpo.cidades[0]).toMatchObject({
      rotulo: 'Campinas, São Paulo, Brasil',
      fuso: 'America/Sao_Paulo',
    });
  });

  it('exige sessão', async () => {
    const resposta = await chamar(cidades.GET, {
      path: '/api/geo/cidades?q=campinas',
      usuario: null,
    });
    expect(resposta.status).toBe(401);
  });
});

describe('local de nascimento e de moradia (PATCH /api/perfil/localizacao)', () => {
  it('grava nome, coordenadas e fuso vindos da base, e limpa com null', async () => {
    const pessoa = await criarUsuario('patient', 'Local');
    const gravar = (tipo: string, cidadeId: number | null) =>
      chamar(localizacao.PATCH, {
        method: 'PATCH',
        body: { tipo, cidadeId },
        usuario: pessoa,
      });

    expect((await gravar('nascimento', saoPaulo.id)).status).toBe(200);
    // Repetir o mesmo valor também responde 200.
    expect((await gravar('nascimento', saoPaulo.id)).status).toBe(200);
    expect((await gravar('moradia', delhi.id)).status).toBe(200);

    let linha = await locais(pessoa.id);
    expect(linha).toMatchObject({
      birth_location: 'São Paulo, São Paulo, Brasil',
      birth_city_id: saoPaulo.id,
      birth_timezone: 'America/Sao_Paulo',
      residence_city_id: delhi.id,
      residence_timezone: 'Asia/Kolkata',
    });
    expect(Number(linha?.birth_latitude)).toBeCloseTo(saoPaulo.latitude, 4);
    expect(Number(linha?.birth_longitude)).toBeCloseTo(saoPaulo.longitude, 4);

    expect((await gravar('moradia', null)).status).toBe(200);
    linha = await locais(pessoa.id);
    expect(linha?.residence_city_id).toBeNull();
    expect(linha?.residence_timezone).toBeNull();
  });

  it('recusa cidade inexistente e campos extras', async () => {
    const pessoa = await criarUsuario('patient', 'Invalida');
    expect(
      (
        await chamar(localizacao.PATCH, {
          method: 'PATCH',
          body: { tipo: 'nascimento', cidadeId: 999_999_999 },
          usuario: pessoa,
        })
      ).status
    ).toBe(404);
    expect(
      (
        await chamar(localizacao.PATCH, {
          method: 'PATCH',
          body: { tipo: 'nascimento', cidadeId: saoPaulo.id, latitude: 0 },
          usuario: pessoa,
        })
      ).status
    ).toBe(400);
  });

  it('a API genérica de dados não grava o local', async () => {
    const pessoa = await criarUsuario('patient', 'Generica');
    const resposta = await chamar(dados.PATCH, {
      method: 'PATCH',
      params: { table: 'profiles' },
      body: {
        values: { birth_location: 'Qualquer texto' },
        filters: [{ type: 'eq', column: 'id', value: pessoa.id }],
      },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(403);
    expect(resposta.texto).toContain('/api/perfil/localizacao');
  });
});

describe('mapa natal e dia védico', () => {
  it('sem data e cidade de nascimento, diz o que falta', async () => {
    const pessoa = await criarUsuario('patient', 'SemMapa');
    const resposta = await chamar(mapa.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    expect(resposta.json).toEqual({
      mapa: null,
      leitura: null,
      faltando: ['data', 'hora', 'local'],
      localDeNascimento: null,
    });
    const doDia = await chamar(dia.GET, {
      path: '/api/astrologia/dia',
      usuario: pessoa,
    });
    expect(doDia.json).toEqual({ dia: null, faltando: ['local'] });
  });

  it('calcula mapa, dasha e o dia no local de moradia', async () => {
    const pessoa = await criarUsuario('patient', 'Mapa');
    await executeStatement(
      `UPDATE profiles SET birth_date = '1990-12-01', birth_time = '10:30:00'
        WHERE id = ?`,
      [pessoa.id]
    );
    for (const [tipo, cidadeId] of [
      ['nascimento', saoPaulo.id],
      ['moradia', delhi.id],
    ] as const) {
      await chamar(localizacao.PATCH, {
        method: 'PATCH',
        body: { tipo, cidadeId },
        usuario: pessoa,
      });
    }

    const resposta = await chamar(mapa.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    const corpo = resposta.json as {
      mapa: {
        lagna: { signo: string };
        lua: { signo: string; nakshatra: string };
        planetas: unknown[];
        dasha: { mahadasha: { nome: string } };
      };
      faltando: string[];
    };
    expect(corpo.faltando).toEqual([]);
    expect(corpo.mapa.lagna.signo).toBe('Capricórnio');
    expect(corpo.mapa.lua).toMatchObject({
      signo: 'Touro',
      nakshatra: 'Krittika',
    });
    expect(corpo.mapa.planetas).toHaveLength(9);
    expect(corpo.mapa.dasha.mahadasha.nome).toBe('Rahu');

    // Leitura do motor da Lyra (tarefa 55), separada por tipo de mapa.
    const leitura = (
      resposta.json as {
        leitura: {
          tipos: Array<{ tipo: string }>;
          vedico: { lagna: string; lua: string };
          samadhi: { terrestre: string };
          quantum: { indisponivel: string[] };
          percepcoes: string[];
        };
      }
    ).leitura;
    expect(leitura.tipos.map((t) => t.tipo)).toEqual([
      'vedico',
      'samadhi',
      'quantum',
    ]);
    expect(leitura.vedico.lagna).toMatch(
      /^Ascendente \(Lagna\) em Capricórnio/
    );
    expect(leitura.vedico.lua).toMatch(/Krittika/);
    expect(leitura.samadhi.terrestre).toMatch(/Roda de Cura/);
    expect(leitura.quantum.indisponivel.join(' ')).toMatch(/Desenho Humano/);
    expect(leitura.percepcoes.length).toBeGreaterThanOrEqual(3);

    // Nova Délhi, 12/10/2026: nascer do sol às 06:19 IST (00:49:46 UTC no
    // Swiss Ephemeris), Dvitiya, Swati; Krittika natal → Swati é Kshema.
    const doDia = await chamar(dia.GET, {
      path: '/api/astrologia/dia?data=2026-10-12',
      usuario: pessoa,
    });
    expect(doDia.status).toBe(200);
    const vedico = (
      doDia.json as {
        dia: {
          local: { fuso: string };
          nascerDoSol: string;
          vara: string;
          tithi: { nome: string };
          nakshatra: { nome: string };
          rahuKalam: { horario: string };
          choghadiya: { dia: Array<{ nome: string }> };
          pessoal: { tara: { nome: string }; chandra: { casa: number } };
        };
      }
    ).dia;
    expect(vedico.local.fuso).toBe('Asia/Kolkata');
    expect(['06:19', '06:20']).toContain(vedico.nascerDoSol);
    expect(vedico.vara).toMatch(/^Segunda/);
    expect(vedico.tithi.nome).toBe('Dvitiya');
    expect(vedico.nakshatra.nome).toBe('Swati');
    expect(vedico.rahuKalam.horario).toMatch(/^\d{2}:\d{2}–\d{2}:\d{2}$/);
    expect(vedico.choghadiya.dia[0].nome).toBe('Amrit');
    expect(vedico.pessoal.tara.nome).toBe('Kshema');
    // Lua do dia em Libra (6), natal em Touro (1): 6ª casa.
    expect(vedico.pessoal.chandra.casa).toBe(6);
  });

  it('data inválida responde 400', async () => {
    const pessoa = await criarUsuario('patient', 'DataRuim');
    for (const data of ['2026-02-30', '12-10-2026']) {
      const resposta = await chamar(dia.GET, {
        path: `/api/astrologia/dia?data=${data}`,
        usuario: pessoa,
      });
      expect(resposta.status).toBe(400);
    }
  });
});
