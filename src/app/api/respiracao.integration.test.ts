import { describe, expect, it } from 'vitest';

import { gravarRegistroDoDia } from '@/lib/metricas/gravacao';
import { queryRows } from '@/lib/mysql/pool';
import type { ResumoDaRespiracao } from '@/lib/respiracao/servico';

import { contar, criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as metas from './metas/route';
import * as respiracao from './respiracao/route';

// Sem cidade no perfil, o "hoje" da pessoa é o dia UTC.
const hoje = () => new Date().toISOString().slice(0, 10);

async function meditacaoDoDia(userId: string) {
  const [linha] = await queryRows<{ meditation_minutes: number | null }>(
    'SELECT meditation_minutes FROM daily_metrics WHERE user_id = ? AND date = ?',
    [userId, hoje()]
  );
  return linha?.meditation_minutes ?? null;
}

describe('respiração guiada (/api/respiracao)', () => {
  it('exige sessão', async () => {
    expect((await chamar(respiracao.GET, { usuario: null })).status).toBe(401);
    const post = await chamar(respiracao.POST, {
      method: 'POST',
      body: { tecnica: 'quadrada', ciclos: 2, segundos: 32 },
      usuario: null,
    });
    expect(post.status).toBe(401);
  });

  it('registra a sessão, soma à meditação do dia e move a meta automática', async () => {
    const pessoa = await criarUsuario('patient', 'Respira');
    const meta = await chamar(metas.POST, {
      method: 'POST',
      body: { metrica: 'meditacao', alvo: 10 },
      usuario: pessoa,
    });
    expect(meta.status).toBe(201);
    const idDaMeta = (meta.json as { meta: { id: string } }).meta.id;

    const vazio = await chamar(respiracao.GET, { usuario: pessoa });
    expect(vazio.status).toBe(200);
    expect(vazio.headers.get('cache-control')).toBe('private, no-store');
    expect(vazio.json).toMatchObject({
      data: hoje(),
      sessoes: [],
      minutosGuiados: 0,
      minutosDeMeditacaoNoDia: null,
    });

    // Check-in já tinha 4 min de meditação: a sessão soma, não substitui.
    await gravarRegistroDoDia(pessoa.id, {
      data: hoje(),
      valores: { meditacao: 4 },
    });
    const primeira = await chamar(respiracao.POST, {
      method: 'POST',
      // Nadi Shodhana, 15 ciclos de 20 s = 5 min.
      body: { tecnica: 'nadi_shodhana', ciclos: 15, segundos: 300 },
      usuario: pessoa,
    });
    expect(primeira.status).toBe(201);
    const resumo = primeira.json as ResumoDaRespiracao;
    expect(resumo.sessoes).toHaveLength(1);
    expect(resumo.sessoes[0]).toMatchObject({
      tecnica: 'nadi_shodhana',
      ciclos: 15,
      segundos: 300,
      minutos: 5,
    });
    expect(resumo.minutosGuiados).toBe(5);
    expect(resumo.minutosDeMeditacaoNoDia).toBe(9);
    expect(await meditacaoDoDia(pessoa.id)).toBe(9);

    // Sessão interrompida: 2 ciclos completos da quadrada e parte do 3º.
    const interrompida = await chamar(respiracao.POST, {
      method: 'POST',
      body: { tecnica: 'quadrada', ciclos: 2, segundos: 40 },
      usuario: pessoa,
    });
    expect(interrompida.status).toBe(201);
    expect((interrompida.json as ResumoDaRespiracao).minutosGuiados).toBe(6);
    expect(await meditacaoDoDia(pessoa.id)).toBe(10);

    const [linhaDaMeta] = await queryRows<{
      current_value: number;
      status: string;
    }>('SELECT current_value, status FROM goals WHERE id = ?', [idDaMeta]);
    expect(linhaDaMeta).toMatchObject({
      current_value: 10,
      status: 'completed',
    });
    expect(
      await contar(
        'SELECT COUNT(*) AS total FROM breathing_sessions WHERE user_id = ? AND session_date = ?',
        [pessoa.id, hoje()]
      )
    ).toBe(2);
  });

  it('recusa duração incoerente, técnica desconhecida e prática curta', async () => {
    const pessoa = await criarUsuario('patient', 'Incoerente');
    const casos: Array<[unknown, RegExp]> = [
      [
        { tecnica: '4-7-8', ciclos: 1, segundos: 300 },
        /não corresponde aos ciclos/,
      ],
      [
        { tecnica: 'kapalabhati', ciclos: 3, segundos: 60 },
        /Técnica de respiração desconhecida/,
      ],
      [
        { tecnica: 'quadrada', ciclos: 1, segundos: 16 },
        /ao menos 30 segundos/,
      ],
      [{ tecnica: 'quadrada', ciclos: 0, segundos: 30 }, /ao menos um ciclo/],
      [
        { tecnica: 'quadrada', ciclos: 2, segundos: 32, minutos: 30 },
        /minutos/,
      ],
    ];
    for (const [body, mensagem] of casos) {
      const resposta = await chamar(respiracao.POST, {
        method: 'POST',
        body,
        usuario: pessoa,
      });
      expect(resposta.status).toBe(400);
      expect(JSON.stringify(resposta.json)).toMatch(mensagem);
    }
    expect(
      await contar(
        'SELECT COUNT(*) AS total FROM breathing_sessions WHERE user_id = ?',
        [pessoa.id]
      )
    ).toBe(0);
    expect(await meditacaoDoDia(pessoa.id)).toBeNull();
  });

  it('a meditação do dia não passa do máximo do check-in (600 min)', async () => {
    const pessoa = await criarUsuario('patient', 'Limite');
    await gravarRegistroDoDia(pessoa.id, {
      data: hoje(),
      valores: { meditacao: 595 },
    });
    const resposta = await chamar(respiracao.POST, {
      method: 'POST',
      body: { tecnica: 'quadrada', ciclos: 38, segundos: 608 },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(201);
    expect(await meditacaoDoDia(pessoa.id)).toBe(600);
  });

  it('recomenda pelo estresse registrado hoje e explica o motivo', async () => {
    const pessoa = await criarUsuario('patient', 'Tensa');
    await gravarRegistroDoDia(pessoa.id, {
      data: hoje(),
      valores: { estresse: 80 },
    });
    const resposta = await chamar(respiracao.GET, { usuario: pessoa });
    expect((resposta.json as ResumoDaRespiracao).recomendacao).toMatchObject({
      tecnica: '4-7-8',
    });
    expect((resposta.json as ResumoDaRespiracao).recomendacao.porque).toContain(
      '80/100'
    );
  });

  it('cada pessoa vê só as próprias sessões', async () => {
    const ana = await criarUsuario('patient', 'Ana');
    const bia = await criarUsuario('patient', 'Bia');
    await chamar(respiracao.POST, {
      method: 'POST',
      body: { tecnica: '4-7-8', ciclos: 4, segundos: 76 },
      usuario: ana,
    });
    const daBia = await chamar(respiracao.GET, { usuario: bia });
    expect((daBia.json as ResumoDaRespiracao).sessoes).toEqual([]);
  });
});
