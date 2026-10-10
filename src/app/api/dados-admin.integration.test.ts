import { randomUUID } from 'node:crypto';

import { beforeAll, describe, expect, it } from 'vitest';

import { queryRows } from '@/lib/mysql/pool';

import {
  criarUsuario,
  type UsuarioDeTeste,
} from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as paginaAdmin from './admin/page-config/[pageKey]/route';
import * as planoAdmin from './admin/plans/[planKey]/route';
import * as planosAdmin from './admin/plans/route';
import * as puckAdmin from './admin/puck/documents/[documentKey]/route';
import * as assinaturaAdmin from './admin/users/[userId]/subscription/route';
import * as usuariosAdmin from './admin/users/route';
import * as dados from './data/[table]/route';
import * as paginaPublica from './public/page-config/[pageKey]/route';
import * as planosPublicos from './public/plans/route';
import * as puckPublico from './public/puck/documents/[documentKey]/route';
import * as rpcSaude from './rpc/get-data-health-metrics/route';

let ana: UsuarioDeTeste;
let admin: UsuarioDeTeste;

beforeAll(async () => {
  ana = await criarUsuario('patient', 'Ana');
  admin = await criarUsuario('admin', 'Admin');
});

function consultarTabela(
  tabela: string,
  usuario: UsuarioDeTeste | null,
  busca: Record<string, string> = {}
) {
  const query = new URLSearchParams(busca).toString();
  return chamar(dados.GET, {
    path: `/api/data/${tabela}${query ? `?${query}` : ''}`,
    params: { table: tabela },
    usuario,
  });
}

describe('/api/data/[table] · CRUD real', () => {
  it('cria, lista, filtra, pagina, atualiza e exclui com confirmação no banco', async () => {
    const criado = await chamar(dados.POST, {
      method: 'POST',
      params: { table: 'goals' },
      body: {
        values: { title: 'Dormir 8h', target_value: 8, unit: 'h' },
      },
      usuario: ana,
    });
    expect(criado.status).toBe(200);
    const id = (criado.json as { data: { id: string } }).data.id;
    const noBanco = await queryRows<{ user_id: string; title: string }>(
      'SELECT user_id, title FROM goals WHERE id = ?',
      [id]
    );
    expect(noBanco).toEqual([{ user_id: ana.id, title: 'Dormir 8h' }]);

    await chamar(dados.POST, {
      method: 'POST',
      params: { table: 'goals' },
      body: {
        values: { title: 'Caminhar', target_value: 10000, unit: 'passos' },
      },
      usuario: ana,
    });

    const busca = await consultarTabela('goals', ana, {
      filters: JSON.stringify([
        { type: 'or', expression: 'title.ilike.%dormir%' },
      ]),
      count: 'exact',
    });
    expect(busca.status).toBe(200);
    expect(busca.json).toMatchObject({ count: 1 });

    const pagina = await consultarTabela('goals', ana, {
      orders: JSON.stringify([{ column: 'title', ascending: true }]),
      rangeFrom: '0',
      rangeTo: '0',
    });
    expect(
      (pagina.json as { data: { title: string }[] }).data.map((g) => g.title)
    ).toEqual(['Caminhar']);

    const atualizado = await chamar(dados.PATCH, {
      method: 'PATCH',
      params: { table: 'goals' },
      body: {
        values: { current_value: 7.5, status: 'in_progress' },
        filters: [{ type: 'eq', column: 'id', value: id }],
      },
      usuario: ana,
    });
    expect(atualizado.status).toBe(200);
    expect(
      await queryRows<{ current_value: number }>(
        'SELECT current_value FROM goals WHERE id = ?',
        [id]
      )
    ).toEqual([{ current_value: 7.5 }]);

    const excluido = await chamar(dados.DELETE, {
      method: 'DELETE',
      params: { table: 'goals' },
      body: { filters: [{ type: 'eq', column: 'id', value: id }] },
      usuario: ana,
    });
    expect(excluido.json).toEqual({ data: { deleted: 1 }, error: null });
    expect(await queryRows('SELECT id FROM goals WHERE id = ?', [id])).toEqual(
      []
    );
  });

  it('responde 400 (não 500) para parâmetros e corpos malformados', async () => {
    const casos = [
      await consultarTabela('goals', ana, { filters: '{' }),
      await consultarTabela('goals', ana, { filters: '{"type":"eq"}' }),
      await consultarTabela('goals', ana, { orders: '[1]' }),
      await consultarTabela('goals', ana, { limit: 'abc' }),
      await consultarTabela('goals', ana, { limit: '-5' }),
      await consultarTabela('goals', ana, { count: 'todos' }),
      await chamar(dados.POST, {
        method: 'POST',
        params: { table: 'goals' },
        rawBody: 'nao-json',
        usuario: ana,
      }),
      await chamar(dados.PATCH, {
        method: 'PATCH',
        params: { table: 'goals' },
        body: { values: { title: 'x' } },
        usuario: ana,
      }),
      await chamar(dados.DELETE, {
        method: 'DELETE',
        params: { table: 'goals' },
        body: { filters: [] },
        usuario: ana,
      }),
      await chamar(dados.POST, {
        method: 'POST',
        params: { table: 'goals' },
        body: { values: { title: null } },
        usuario: ana,
      }),
    ];
    for (const resposta of casos) {
      expect(resposta.status).toBe(400);
      expect(resposta.json).toMatchObject({ data: null });
    }
  });

  it('não expõe detalhes internos do banco nas mensagens de erro', async () => {
    const resposta = await chamar(dados.POST, {
      method: 'POST',
      params: { table: 'goals' },
      body: { values: { title: null } },
      usuario: ana,
    });
    const mensagem = (resposta.json as { error: { message: string } }).error
      .message;
    expect(mensagem).not.toMatch(/ER_|cannot be null|SQL|goals/i);
  });

  it('exige sessão, respeita o escopo e bloqueia a autopromoção', async () => {
    expect((await consultarTabela('goals', null)).status).toBe(401);
    expect((await consultarTabela('users', ana)).status).toBe(400);
    const promocao = await chamar(dados.PATCH, {
      method: 'PATCH',
      params: { table: 'profiles' },
      body: {
        values: { role: 'admin' },
        filters: [{ type: 'eq', column: 'id', value: ana.id }],
      },
      usuario: ana,
    });
    expect(promocao.status).toBe(403);
  });
});

describe('rotas administrativas', () => {
  it('recusam visitante (401) e paciente (403)', async () => {
    for (const [usuario, status] of [
      [null, 401],
      [ana, 403],
    ] as const) {
      expect((await chamar(planosAdmin.GET, { usuario })).status).toBe(status);
      expect(
        (await chamar(usuariosAdmin.GET, { path: '/api/admin/users', usuario }))
          .status
      ).toBe(status);
      expect((await chamar(rpcSaude.GET, { usuario })).status).toBe(status);
    }
  });

  it('lista usuários com paginação validada', async () => {
    const lista = await chamar(usuariosAdmin.GET, {
      path: '/api/admin/users?pageSize=5&sortColumn=email&ascending=true',
      usuario: admin,
    });
    expect(lista.status).toBe(200);
    expect(lista.json).toMatchObject({ page: 0, pageSize: 5 });

    for (const busca of ['pageSize=0', 'page=-1', 'sortColumn=password_hash']) {
      const invalida = await chamar(usuariosAdmin.GET, {
        path: `/api/admin/users?${busca}`,
        usuario: admin,
      });
      expect(invalida.status).toBe(400);
    }
  });

  it('troca o plano de um usuário e valida id, plano e existência', async () => {
    const pessoa = await criarUsuario('patient', 'Plano');
    const troca = await chamar(assinaturaAdmin.PATCH, {
      method: 'PATCH',
      params: { userId: pessoa.id },
      body: { planKey: 'meta', billingInterval: 'annual' },
      usuario: admin,
    });
    expect(troca.status).toBe(200);
    expect(troca.json).toMatchObject({
      userId: pessoa.id,
      subscription: { plan: { key: 'meta' }, billingInterval: 'annual' },
    });

    expect(
      (
        await chamar(assinaturaAdmin.PATCH, {
          method: 'PATCH',
          params: { userId: pessoa.id },
          body: { planKey: 'vip' },
          usuario: admin,
        })
      ).status
    ).toBe(400);
    expect(
      (
        await chamar(assinaturaAdmin.GET, {
          params: { userId: 'nao-e-uuid' },
          usuario: admin,
        })
      ).status
    ).toBe(400);
    expect(
      (
        await chamar(assinaturaAdmin.PATCH, {
          method: 'PATCH',
          params: { userId: randomUUID() },
          body: { planKey: 'meta' },
          usuario: admin,
        })
      ).status
    ).toBe(404);
  });

  it('valida a edição da matriz de planos', async () => {
    const matriz = (await chamar(planosAdmin.GET, { usuario: admin })).json as {
      plans: Array<
        Record<string, unknown> & {
          key: string;
          features: Array<Record<string, unknown>>;
        }
      >;
    };
    const free = matriz.plans.find((plano) => plano.key === 'free');
    expect(free).toBeDefined();
    const corpo = {
      name: free?.name,
      tagline: free?.tagline,
      description: free?.description,
      monthlyPrice: free?.monthlyPrice,
      annualPrice: free?.annualPrice,
      currencyCode: free?.currencyCode,
      highlightText: free?.highlightText,
      accentFrom: free?.accentFrom,
      accentTo: free?.accentTo,
      isActive: free?.isActive,
      isPublic: free?.isPublic,
      externalProductId: free?.externalProductId,
      externalMonthlyPriceId: free?.externalMonthlyPriceId,
      externalAnnualPriceId: free?.externalAnnualPriceId,
      features: free?.features.map((recurso) => ({
        key: recurso.key,
        enabled: recurso.enabled,
        quotaValue: recurso.quotaValue,
        resetInterval: recurso.resetInterval,
      })),
    };
    const salvo = await chamar(planoAdmin.PATCH, {
      method: 'PATCH',
      params: { planKey: 'free' },
      body: corpo,
      usuario: admin,
    });
    expect(salvo.status).toBe(200);

    for (const alteracao of [
      { accentFrom: 'red;background:url(x)' },
      { monthlyPrice: -1 },
      { currencyCode: 'REAL' },
    ]) {
      const invalido = await chamar(planoAdmin.PATCH, {
        method: 'PATCH',
        params: { planKey: 'free' },
        body: { ...corpo, ...alteracao },
        usuario: admin,
      });
      expect(invalido.status).toBe(400);
    }
    expect(
      (
        await chamar(planoAdmin.PATCH, {
          method: 'PATCH',
          params: { planKey: 'vip' },
          body: corpo,
          usuario: admin,
        })
      ).status
    ).toBe(400);
  });

  it('páginas e documentos Puck: chave inválida 404, corpo inválido 400, válido persiste', async () => {
    expect(
      (await chamar(paginaPublica.GET, { params: { pageKey: 'nada' } })).status
    ).toBe(404);
    expect(
      (
        await chamar(paginaAdmin.GET, {
          params: { pageKey: 'nada' },
          usuario: admin,
        })
      ).status
    ).toBe(404);
    expect(
      (
        await chamar(paginaAdmin.PUT, {
          method: 'PUT',
          params: { pageKey: 'landing' },
          body: { config: { hero: 'texto solto' } },
          usuario: admin,
        })
      ).status
    ).toBe(400);
    expect(
      (
        await chamar(paginaAdmin.POST, {
          method: 'POST',
          params: { pageKey: 'landing' },
          body: { action: 'apagar-tudo' },
          usuario: admin,
        })
      ).status
    ).toBe(400);

    expect(
      (await chamar(puckPublico.GET, { params: { documentKey: 'nada' } }))
        .status
    ).toBe(404);
    expect(
      (
        await chamar(puckAdmin.PUT, {
          method: 'PUT',
          params: { documentKey: 'landing-home' },
          body: { draftData: { content: 'nao-e-lista' } },
          usuario: admin,
        })
      ).status
    ).toBe(400);

    const rascunho = {
      root: { props: { title: 'Teste' } },
      content: [
        { type: 'LyraHeadingBlock', props: { id: 'h-teste', text: 'Olá' } },
      ],
    };
    const salvo = await chamar(puckAdmin.PUT, {
      method: 'PUT',
      params: { documentKey: 'landing-home' },
      body: { draftData: rascunho },
      usuario: admin,
    });
    expect(salvo.status).toBe(200);
    const linha = await queryRows<{ draft_data: { content: unknown[] } }>(
      "SELECT draft_data FROM puck_documents WHERE document_key = 'landing-home'"
    );
    expect(JSON.stringify(linha[0]?.draft_data)).toContain('h-teste');

    // O admin vê o nome legível de quem salvou (e não só o UUID)…
    expect(salvo.json).toMatchObject({
      updatedByUserId: admin.id,
      updatedByName: 'Admin Teste',
    });
    // …e a rota pública não identifica o administrador.
    const publico = await chamar(puckPublico.GET, {
      params: { documentKey: 'landing-home' },
    });
    expect(publico.status).toBe(200);
    expect(publico.json).toMatchObject({
      updatedByUserId: null,
      updatedByName: null,
    });
  });

  it('catálogo público só traz planos ativos e públicos', async () => {
    const resposta = await chamar(planosPublicos.GET);
    expect(resposta.status).toBe(200);
    const planos = (
      resposta.json as { plans: { isActive: boolean; isPublic: boolean }[] }
    ).plans;
    expect(planos.length).toBeGreaterThan(0);
    expect(planos.every((plano) => plano.isActive && plano.isPublic)).toBe(
      true
    );
  });
});
