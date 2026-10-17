import { NextResponse } from 'next/server';
import { z } from 'zod';

import { respostaDeErro } from '@/lib/http/api';
import { queryRows } from '@/lib/mysql/pool';
import { requireAdminSession } from '@/lib/mysql/server-auth';
import { NUMERIC_METRIC_COLUMNS } from '@/lib/mysql/table-config';

export const runtime = 'nodejs';

/**
 * Saúde dos dados para o administrador (tarefa 58), calculada no MySQL.
 *
 * Antes a tela baixava todos os perfis (nome e e-mail) e todas as métricas
 * para contar no navegador, e a API analítica lia a tabela inteira de
 * métricas na memória do servidor. Agora só agregados saem do banco
 * (minimização da LGPD) e a lista de inativos é paginada.
 */

const consultaSchema = z.object({
  pagina: z.coerce.number().int().min(1).max(10_000).default(1),
});

const POR_PAGINA = 20;

interface LinhaDeAgregados {
  total: number | string;
  [coluna: string]: number | string | null;
}

function numero(valor: unknown): number | null {
  if (valor === null || valor === undefined) return null;
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : null;
}

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { pagina } = consultaSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    // Nomes de coluna vêm da configuração da tabela (identificadores fixos).
    const expressoes = NUMERIC_METRIC_COLUMNS.flatMap((coluna) => [
      `COUNT(${coluna}) AS n__${coluna}`,
      `AVG(${coluna}) AS media__${coluna}`,
      `MIN(${coluna}) AS minimo__${coluna}`,
      `MAX(${coluna}) AS maximo__${coluna}`,
    ]);
    const [agregados] = await queryRows<LinhaDeAgregados>(
      `SELECT COUNT(*) AS total, ${expressoes.join(', ')} FROM daily_metrics`
    );
    const total = numero(agregados?.total) ?? 0;
    const metricas = NUMERIC_METRIC_COLUMNS.map((coluna) => {
      const preenchidos = numero(agregados?.[`n__${coluna}`]) ?? 0;
      return {
        metrica: coluna,
        preenchimento: total === 0 ? 0 : (preenchidos / total) * 100,
        media: numero(agregados?.[`media__${coluna}`]),
        minimo: numero(agregados?.[`minimo__${coluna}`]),
        maximo: numero(agregados?.[`maximo__${coluna}`]),
      };
    }).sort((a, b) => a.preenchimento - b.preenchimento);

    const [ativos] = await queryRows<{ total: number | string }>(
      `SELECT COUNT(DISTINCT user_id) AS total
         FROM daily_metrics
        WHERE date >= UTC_DATE() - INTERVAL 1 DAY`
    );

    // Inativos: sem nenhum registro ou com o último há mais de 7 dias.
    const filtroDeInativos = `
      FROM profiles p
      LEFT JOIN (
        SELECT user_id, MAX(date) AS ultimo
          FROM daily_metrics GROUP BY user_id
      ) m ON m.user_id = p.id
      WHERE m.ultimo IS NULL OR m.ultimo < UTC_DATE() - INTERVAL 7 DAY`;
    const [contagem] = await queryRows<{ total: number | string }>(
      `SELECT COUNT(*) AS total ${filtroDeInativos}`
    );
    const inativos = await queryRows<{
      id: string;
      first_name: string | null;
      email: string | null;
      ultimo: string | Date | null;
    }>(
      `SELECT p.id, p.first_name, p.email, m.ultimo ${filtroDeInativos}
        ORDER BY m.ultimo IS NULL, m.ultimo DESC, p.created_at DESC
        LIMIT ${POR_PAGINA} OFFSET ${(pagina - 1) * POR_PAGINA}`
    );

    return NextResponse.json({
      totalDeRegistros: total,
      ativosHojeOuOntem: numero(ativos?.total) ?? 0,
      metricas,
      inativos: {
        total: numero(contagem?.total) ?? 0,
        pagina,
        porPagina: POR_PAGINA,
        itens: inativos.map((linha) => ({
          id: linha.id,
          nome: linha.first_name,
          email: linha.email,
          ultimoRegistro:
            linha.ultimo instanceof Date
              ? linha.ultimo.toISOString().slice(0, 10)
              : linha.ultimo
                ? String(linha.ultimo).slice(0, 10)
                : null,
        })),
      },
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao calcular a saúde dos dados.');
  }
}
