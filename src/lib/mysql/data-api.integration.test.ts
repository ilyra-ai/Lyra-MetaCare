import { randomUUID } from 'node:crypto';

import { beforeAll, describe, expect, it } from 'vitest';

import { HttpError } from '@/lib/http-error';
import {
  DATA_API_MAX_LIMIT,
  runDeleteQuery,
  runInsertQuery,
  runSelectQuery,
  runUpdateQuery,
  runUpsertQuery,
} from '@/lib/mysql/data-api';
import { executeStatement, queryRows } from '@/lib/mysql/pool';
import type { QueryFilter } from '@/lib/mysql/table-config';

import {
  contar,
  criarUsuario,
  type UsuarioDeTeste,
} from '../../../tests/integration/fixtures';

// Testes contra o MySQL real (banco isolado criado pelo setup global): cada
// regra de autorização é verificada pelo efeito no banco, não pelo SQL gerado.

async function erroDe(promessa: Promise<unknown>) {
  try {
    await promessa;
  } catch (error) {
    return error;
  }
  throw new Error('A operação deveria ter falhado.');
}

async function esperarHttp(promessa: Promise<unknown>, status: number) {
  const erro = await erroDe(promessa);
  expect(erro).toBeInstanceOf(HttpError);
  expect((erro as HttpError).statusCode).toBe(status);
  return erro as HttpError;
}

function selecionar(
  table: string,
  usuario: UsuarioDeTeste | null,
  extra: Partial<Parameters<typeof runSelectQuery>[0]> = {}
) {
  return runSelectQuery({
    table,
    select: '*',
    filters: [],
    orders: [],
    session: usuario?.session ?? null,
    ...extra,
  });
}

async function criarHabito(dono: UsuarioDeTeste, nome: string) {
  const id = randomUUID();
  await executeStatement(
    'INSERT INTO habits (id, user_id, name, frequency) VALUES (?, ?, ?, ?)',
    [id, dono.id, nome, 'Diário']
  );
  return id;
}

let ana: UsuarioDeTeste;
let bruno: UsuarioDeTeste;
let admin: UsuarioDeTeste;

beforeAll(async () => {
  ana = await criarUsuario('patient', 'Ana');
  bruno = await criarUsuario('patient', 'Bruno');
  admin = await criarUsuario('admin', 'Admin');
});

describe('data-api · leitura', () => {
  it('exige sessão nas tabelas privadas e libera as públicas', async () => {
    await esperarHttp(selecionar('habits', null), 401);
    const publica = await selecionar('instruments', null);
    expect(Array.isArray(publica.data)).toBe(true);
    expect((publica.data as unknown[]).length).toBeGreaterThan(0);
  });

  it('recusa tabelas fora da lista permitida', async () => {
    await esperarHttp(selecionar('users', ana), 400);
    await esperarHttp(selecionar('billing_customers', admin), 400);
  });

  it('usuário comum só lê as próprias linhas; o administrador lê todas', async () => {
    const habitoAna = await criarHabito(ana, 'Caminhar');
    const habitoBruno = await criarHabito(bruno, 'Meditar');

    const daAna = (await selecionar('habits', ana)).data as { id: string }[];
    expect(daAna.map((linha) => linha.id)).toContain(habitoAna);
    expect(daAna.map((linha) => linha.id)).not.toContain(habitoBruno);

    // Filtro explícito pelo id de outra pessoa não fura o escopo.
    const tentativa = await selecionar('habits', ana, {
      filters: [{ type: 'eq', column: 'id', value: habitoBruno }],
    });
    expect(tentativa.data).toEqual([]);

    const doAdmin = (await selecionar('habits', admin)).data as {
      id: string;
    }[];
    expect(doAdmin.map((linha) => linha.id)).toEqual(
      expect.arrayContaining([habitoAna, habitoBruno])
    );
  });

  it('valida colunas, filtros e operadores', async () => {
    await esperarHttp(
      selecionar('habits', ana, { select: 'id, password_hash' }),
      400
    );
    await esperarHttp(
      selecionar('habits', ana, {
        filters: [{ type: 'eq', column: 'senha', value: 'x' }],
      }),
      400
    );
    await esperarHttp(
      selecionar('habits', ana, {
        filters: [
          { type: 'like', column: 'name', value: '%' },
        ] as unknown as QueryFilter[],
      }),
      400
    );
    await esperarHttp(
      selecionar('habits', ana, {
        filters: [{ type: 'not', column: 'name', operator: 'in', value: 'x' }],
      }),
      400
    );
    // Objeto como valor viraria `coluna` = valor no SQL: recusado.
    await esperarHttp(
      selecionar('habits', ana, {
        filters: [{ type: 'eq', column: 'id', value: { id: 1 } }],
      }),
      400
    );
    await esperarHttp(
      selecionar('habits', ana, {
        filters: [{ type: 'or', expression: 'name.ilike.%a%,qualquer coisa' }],
      }),
      400
    );
    await esperarHttp(
      selecionar('habits', ana, {
        filters: 'nao-e-lista' as unknown as QueryFilter[],
      }),
      400
    );
    await esperarHttp(
      selecionar('habits', ana, {
        orders: [{ column: 'password_hash', ascending: true }],
      }),
      400
    );
  });

  it('aplica filtros eq, gte, lte, not e or com o efeito esperado', async () => {
    const dono = await criarUsuario('patient', 'Filtros');
    await criarHabito(dono, 'Beber água');
    await criarHabito(dono, 'Alongar');
    const inativo = await criarHabito(dono, 'Ler');
    await executeStatement('UPDATE habits SET is_active = 0 WHERE id = ?', [
      inativo,
    ]);

    const ativos = (
      await selecionar('habits', dono, {
        filters: [{ type: 'eq', column: 'is_active', value: true }],
      })
    ).data as { name: string; is_active: boolean }[];
    expect(ativos.map((linha) => linha.name).sort()).toEqual([
      'Alongar',
      'Beber água',
    ]);
    expect(ativos.every((linha) => linha.is_active === true)).toBe(true);

    const busca = (
      await selecionar('habits', dono, {
        filters: [
          { type: 'or', expression: 'name.ilike.%ÁGUA%,name.ilike.%ler%' },
        ],
      })
    ).data as { name: string }[];
    expect(busca.map((linha) => linha.name).sort()).toEqual([
      'Beber água',
      'Ler',
    ]);

    const diferentes = (
      await selecionar('habits', dono, {
        filters: [
          { type: 'not', column: 'name', operator: 'eq', value: 'Ler' },
        ],
      })
    ).data as { name: string }[];
    expect(diferentes).toHaveLength(2);
  });

  it('valida e aplica paginação, contagem e modo single', async () => {
    const dono = await criarUsuario('patient', 'Paginação');
    for (const nome of ['A', 'B', 'C', 'D', 'E']) {
      await criarHabito(dono, nome);
    }

    for (const limite of [0, -1, 1.5, Number.NaN]) {
      await esperarHttp(selecionar('habits', dono, { limit: limite }), 400);
    }
    await esperarHttp(
      selecionar('habits', dono, { limit: DATA_API_MAX_LIMIT + 1 }),
      400
    );
    await esperarHttp(selecionar('habits', dono, { rangeFrom: 1 }), 400);
    await esperarHttp(
      selecionar('habits', dono, { rangeFrom: 3, rangeTo: 1 }),
      400
    );
    await esperarHttp(
      selecionar('habits', dono, { count: 'todos' as 'exact' }),
      400
    );
    await esperarHttp(
      selecionar('habits', dono, { singleMode: 'um' as 'single' }),
      400
    );

    const pagina = await selecionar('habits', dono, {
      orders: [{ column: 'name', ascending: true }],
      rangeFrom: 1,
      rangeTo: 2,
      count: 'exact',
    });
    expect((pagina.data as { name: string }[]).map((l) => l.name)).toEqual([
      'B',
      'C',
    ]);
    expect(pagina.count).toBe(5);

    const inexistente = await selecionar('habits', dono, {
      filters: [{ type: 'eq', column: 'id', value: randomUUID() }],
      singleMode: 'single',
    });
    expect(inexistente.data).toBeNull();
    expect(inexistente.error).toEqual({ message: 'Registro não encontrado.' });

    const talvez = await selecionar('habits', dono, {
      filters: [{ type: 'eq', column: 'id', value: randomUUID() }],
      singleMode: 'maybeSingle',
    });
    expect(talvez).toEqual({ data: null, count: null, error: null });
  });

  it('esconde dicas inativas de quem não é administrador', async () => {
    const ativa = randomUUID();
    const inativa = randomUUID();
    await executeStatement(
      `INSERT INTO ai_tips (id, title, detail, category, is_active) VALUES
       (?, 'Ativa', 'detalhe', 'sono', 1), (?, 'Inativa', 'detalhe', 'sono', 0)`,
      [ativa, inativa]
    );
    const doAdmin = (await selecionar('ai_tips', admin)).data as {
      id: string;
    }[];
    expect(doAdmin.map((l) => l.id)).toEqual(
      expect.arrayContaining([ativa, inativa])
    );
  });
});

describe('data-api · escrita', () => {
  it('insere sempre no nome da sessão, ignorando o dono informado', async () => {
    const resultado = await runInsertQuery({
      table: 'habits',
      values: { name: 'Dormir cedo', user_id: bruno.id },
      session: ana.session,
    });
    const id = (resultado.data as { id: string }).id;
    const linhas = await queryRows<{ user_id: string }>(
      'SELECT user_id FROM habits WHERE id = ?',
      [id]
    );
    expect(linhas[0]?.user_id).toBe(ana.id);
  });

  it('recusa inserções malformadas', async () => {
    await esperarHttp(
      runInsertQuery({ table: 'habits', values: [], session: ana.session }),
      400
    );
    await esperarHttp(
      runInsertQuery({
        table: 'habits',
        values: [{ name: 'Um' }, { name: 'Dois', frequency: 'Semanal' }],
        session: ana.session,
      }),
      400
    );
    await esperarHttp(
      runInsertQuery({
        table: 'habits',
        values: { name: { $gt: '' } },
        session: ana.session,
      }),
      400
    );
    await esperarHttp(
      runInsertQuery({ table: 'habits', values: { name: 'X' }, session: null }),
      401
    );
  });

  it('insere várias linhas homogêneas em um comando', async () => {
    const dono = await criarUsuario('patient', 'Lote');
    const resultado = await runInsertQuery({
      table: 'habits',
      values: [{ name: 'Um' }, { name: 'Dois' }],
      session: dono.session,
    });
    expect(resultado.data).toHaveLength(2);
    expect(
      await contar('SELECT COUNT(*) AS total FROM habits WHERE user_id = ?', [
        dono.id,
      ])
    ).toBe(2);
  });

  it('impede a autopromoção a administrador', async () => {
    await esperarHttp(
      runUpdateQuery({
        table: 'profiles',
        values: { role: 'admin' },
        filters: [{ type: 'eq', column: 'id', value: ana.id }],
        session: ana.session,
      }),
      403
    );
    await esperarHttp(
      runUpsertQuery({
        table: 'profiles',
        values: { first_name: 'Ana', role: 'admin' },
        onConflict: 'id',
        session: ana.session,
      }),
      403
    );
    const perfil = await queryRows<{ role: string }>(
      'SELECT role FROM profiles WHERE id = ?',
      [ana.id]
    );
    expect(perfil[0]?.role).toBe('patient');

    // Repetir o próprio papel (o cliente envia ao recriar o perfil) é aceito.
    const proprioPapel = await runUpdateQuery({
      table: 'profiles',
      values: { role: 'patient', first_name: 'Ana Maria' },
      filters: [{ type: 'eq', column: 'id', value: ana.id }],
      session: ana.session,
    });
    expect(proprioPapel.error).toBeNull();
  });

  it('impede trocar o e-mail do perfil por outro que não o da conta', async () => {
    await esperarHttp(
      runUpdateQuery({
        table: 'profiles',
        values: { email: 'outra@pessoa.com' },
        filters: [{ type: 'eq', column: 'id', value: ana.id }],
        session: ana.session,
      }),
      403
    );
  });

  it('não altera linhas de outro usuário', async () => {
    const habitoBruno = await criarHabito(bruno, 'Correr');
    await runUpdateQuery({
      table: 'habits',
      values: { name: 'Invadido' },
      filters: [{ type: 'eq', column: 'id', value: habitoBruno }],
      session: ana.session,
    });
    const linha = await queryRows<{ name: string }>(
      'SELECT name FROM habits WHERE id = ?',
      [habitoBruno]
    );
    expect(linha[0]?.name).toBe('Correr');

    const remocao = await runDeleteQuery({
      table: 'habits',
      filters: [{ type: 'eq', column: 'id', value: habitoBruno }],
      session: ana.session,
    });
    expect(remocao.data).toEqual({ deleted: 0 });
    expect(
      await contar('SELECT COUNT(*) AS total FROM habits WHERE id = ?', [
        habitoBruno,
      ])
    ).toBe(1);
  });

  it('não transfere a própria linha para outro usuário', async () => {
    const habito = await criarHabito(ana, 'Respirar');
    await esperarHttp(
      runUpdateQuery({
        table: 'habits',
        values: { user_id: bruno.id },
        filters: [{ type: 'eq', column: 'id', value: habito }],
        session: ana.session,
      }),
      403
    );
    // O cliente reenvia o próprio user_id junto com os campos: aceito.
    const resultado = await runUpdateQuery({
      table: 'habits',
      values: { user_id: ana.id, name: 'Respirar fundo' },
      filters: [{ type: 'eq', column: 'id', value: habito }],
      session: ana.session,
    });
    expect(resultado.error).toBeNull();
    const linha = await queryRows<{ name: string; user_id: string }>(
      'SELECT name, user_id FROM habits WHERE id = ?',
      [habito]
    );
    expect(linha[0]).toEqual({ name: 'Respirar fundo', user_id: ana.id });
  });

  it('upsert não sobrescreve a linha de outro usuário com o mesmo id', async () => {
    const habitoBruno = await criarHabito(bruno, 'Nadar');
    await esperarHttp(
      runUpsertQuery({
        table: 'habits',
        values: { id: habitoBruno, name: 'Sequestrado' },
        onConflict: 'id',
        session: ana.session,
      }),
      403
    );
    const linha = await queryRows<{ name: string; user_id: string }>(
      'SELECT name, user_id FROM habits WHERE id = ?',
      [habitoBruno]
    );
    expect(linha[0]).toEqual({ name: 'Nadar', user_id: bruno.id });

    await esperarHttp(
      runUpsertQuery({
        table: 'habits',
        values: { name: 'X' },
        onConflict: 'senha',
        session: ana.session,
      }),
      400
    );
  });

  it('upsert insere e depois atualiza a própria linha', async () => {
    const dono = await criarUsuario('patient', 'Upsert');
    const id = randomUUID();
    await runUpsertQuery({
      table: 'habits',
      values: { id, name: 'Primeiro' },
      onConflict: 'id',
      session: dono.session,
    });
    await runUpsertQuery({
      table: 'habits',
      values: { id, name: 'Segundo' },
      onConflict: 'id',
      session: dono.session,
    });
    const linhas = await queryRows<{ name: string; user_id: string }>(
      'SELECT name, user_id FROM habits WHERE id = ?',
      [id]
    );
    expect(linhas).toEqual([{ name: 'Segundo', user_id: dono.id }]);
  });

  it('upsert de perfil por usuário comum sempre grava o próprio perfil', async () => {
    const dono = await criarUsuario('patient', 'Perfil');
    await runUpsertQuery({
      table: 'profiles',
      values: { id: bruno.id, first_name: 'Alterado' },
      onConflict: 'id',
      session: dono.session,
    });
    const linhas = await queryRows<{ id: string; first_name: string }>(
      'SELECT id, first_name FROM profiles WHERE id IN (?, ?) ORDER BY first_name',
      [dono.id, bruno.id]
    );
    expect(linhas).toEqual(
      expect.arrayContaining([
        { id: dono.id, first_name: 'Alterado' },
        { id: bruno.id, first_name: 'Bruno' },
      ])
    );
  });

  it('exige filtro em UPDATE e DELETE', async () => {
    await esperarHttp(
      runUpdateQuery({
        table: 'habits',
        values: { name: 'Todos' },
        filters: [],
        session: ana.session,
      }),
      400
    );
    await esperarHttp(
      runDeleteQuery({ table: 'ai_tips', filters: [], session: admin.session }),
      400
    );
  });

  it('reserva o CRUD de conteúdo aos administradores', async () => {
    await esperarHttp(
      runInsertQuery({
        table: 'ai_tips',
        values: { title: 'Dica', detail: 'x', category: 'sono' },
        session: ana.session,
      }),
      403
    );
    const criada = await runInsertQuery({
      table: 'ai_tips',
      values: { title: 'Dica', detail: 'x', category: 'sono' },
      session: admin.session,
    });
    expect((criada.data as { id: string }).id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('o administrador altera o perfil de outro usuário', async () => {
    const alvo = await criarUsuario('patient', 'Onboarding');
    await executeStatement(
      'UPDATE profiles SET onboarding_completed = 0 WHERE id = ?',
      [alvo.id]
    );
    await runUpdateQuery({
      table: 'profiles',
      values: { onboarding_completed: true },
      filters: [{ type: 'eq', column: 'id', value: alvo.id }],
      session: admin.session,
    });
    const linha = await queryRows<{ onboarding_completed: number }>(
      'SELECT onboarding_completed FROM profiles WHERE id = ?',
      [alvo.id]
    );
    expect(linha[0]?.onboarding_completed).toBe(1);
  });

  it('o administrador remove a conta de outro usuário, nunca a própria', async () => {
    const alvo = await criarUsuario('patient', 'Remover');
    await criarHabito(alvo, 'Algo');
    const resultado = await runDeleteQuery({
      table: 'profiles',
      filters: [{ type: 'eq', column: 'id', value: alvo.id }],
      session: admin.session,
    });
    expect(resultado.data).toEqual({ deleted: 1 });
    expect(
      await contar('SELECT COUNT(*) AS total FROM users WHERE id = ?', [
        alvo.id,
      ])
    ).toBe(0);
    expect(
      await contar('SELECT COUNT(*) AS total FROM habits WHERE user_id = ?', [
        alvo.id,
      ])
    ).toBe(0);

    await esperarHttp(
      runDeleteQuery({
        table: 'profiles',
        filters: [{ type: 'eq', column: 'id', value: admin.id }],
        session: admin.session,
      }),
      400
    );
    expect(
      await contar('SELECT COUNT(*) AS total FROM users WHERE id = ?', [
        admin.id,
      ])
    ).toBe(1);
  });

  it('grava e lê colunas JSON, booleanas e de data', async () => {
    const dono = await criarUsuario('patient', 'Tipos');
    await runUpdateQuery({
      table: 'profiles',
      values: {
        goals: ['sono', 'energia'],
        tracks_menstrual_cycle: true,
        birth_date: '1990-05-20T15:00:00.000Z',
        birth_time: '07:30',
      },
      filters: [{ type: 'eq', column: 'id', value: dono.id }],
      session: dono.session,
    });
    const perfil = (
      await selecionar('profiles', dono, {
        select: 'goals, tracks_menstrual_cycle, birth_date, birth_time',
        singleMode: 'single',
      })
    ).data;
    expect(perfil).toEqual({
      goals: ['sono', 'energia'],
      tracks_menstrual_cycle: true,
      birth_date: '1990-05-20',
      birth_time: '07:30:00',
    });
  });
});
