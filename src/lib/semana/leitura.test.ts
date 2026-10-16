import { describe, expect, it } from 'vitest';

import {
  mapaDoPerfil,
  type PerfilAstrologico,
} from '@/lib/astrology/perfil-astrologico';
import { termoTecnicoEm } from '@/lib/coach/linguagem-simples';
import { diasAntes } from '@/lib/metas/catalogo';

import { lerLeituraDaSemana } from './leitura';

const SAO_PAULO = {
  rotulo: 'São Paulo, São Paulo, Brasil',
  latitude: -23.5475,
  longitude: -46.63611,
  fuso: 'America/Sao_Paulo',
};
const AGORA = new Date('2026-10-16T15:00:00Z');

function perfil(
  nascimento: Partial<PerfilAstrologico['nascimento']> = {},
  comCidade = true
): PerfilAstrologico {
  return {
    nascimento: {
      data: '1990-05-15',
      hora: '08:30',
      local: SAO_PAULO,
      ...nascimento,
    },
    moradia: comCidade ? SAO_PAULO : null,
    localDoDia: comCidade ? SAO_PAULO : null,
    faltando: [],
  };
}

function semana(hoje: string, p: PerfilAstrologico) {
  return lerLeituraDaSemana({
    perfil: p,
    mapa: mapaDoPerfil(p, AGORA),
    passados: Array.from({ length: 7 }, (_, i) => diasAntes(hoje, 6 - i)),
    proximos: Array.from({ length: 7 }, (_, i) => diasAntes(hoje, -(i + 1))),
    agora: AGORA,
  });
}

describe('leitura da semana (motor da Lyra)', () => {
  it('com mapa: a semana que passou, a que vem, a fase da vida e os trânsitos', () => {
    const leitura = semana('2026-10-16', perfil());
    expect(leitura.temMapa).toBe(true);
    expect(leitura.faltando).toBeNull();
    expect(leitura.passados).toHaveLength(7);
    expect(leitura.proxima.dias).toHaveLength(7);
    expect(leitura.proxima.dias[0].data).toBe('2026-10-17');
    for (const dia of [...leitura.passados, ...leitura.proxima.dias]) {
      expect(dia.paraVoce).not.toBeNull();
      expect(dia.luaEm.length).toBeGreaterThan(2);
    }
    // A contagem fecha em 7 dias (o ponto sensível conta como cuidado).
    const cuidado = leitura.passados.filter(
      (d) =>
        d.paraVoce?.qualidade === 'desfavoravel' || d.paraVoce?.pontoSensivel
    ).length;
    const favor = leitura.passados.filter(
      (d) => d.paraVoce?.qualidade === 'favoravel' && !d.paraVoce.pontoSensivel
    ).length;
    const neutro = 7 - favor - cuidado;
    expect(neutro).toBeGreaterThanOrEqual(0);
    expect(leitura.resumo).toContain(
      `teve ${favor} ${favor === 1 ? 'dia' : 'dias'} a seu favor, ${neutro} ${neutro === 1 ? 'neutro' : 'neutros'} e ${cuidado} pedindo cuidado.`
    );
    expect(leitura.fase).toMatch(/^Nesta fase da sua vida/);
    expect(leitura.transitos).toHaveLength(2);
  });

  it('sem mapa, lê só o céu; sem cidade, diz o que falta', () => {
    const soCeu = semana('2026-10-16', perfil({ data: null, local: null }));
    expect(soCeu.temMapa).toBe(false);
    expect(soCeu.passados.every((d) => d.paraVoce === null)).toBe(true);
    expect(soCeu.resumo).toMatch(/^Nos últimos 7 dias, a Lua passou por/);
    expect(soCeu.faltando).toContain('data, a hora e a cidade de nascimento');

    const semCidade = semana(
      '2026-10-16',
      perfil({ data: null, local: null }, false)
    );
    expect(semCidade.passados).toEqual([]);
    expect(semCidade.faltando).toContain('cidade onde você mora');
  });

  it('usa "no sábado" e "na segunda-feira" e marca as fases da Lua', () => {
    let comFase: string | null = null;
    for (let i = 0; i < 30 && !comFase; i++) {
      const hoje = diasAntes('2026-12-31', i * 7);
      const leitura = semana(hoje, perfil());
      const texto = `${leitura.resumo} ${leitura.proxima.resumo}`;
      if (/Lua (cheia|nova) (no|na) /.test(texto)) comFase = texto;
    }
    expect(comFase).not.toBeNull();
    expect(comFase).not.toMatch(/na (sábado|domingo)/);
    expect(comFase).not.toMatch(/no (segunda|terça|quarta|quinta|sexta)/);
  });

  it('nenhum texto da semana usa termos técnicos, em 26 semanas e 3 perfis', () => {
    const perfis = [
      perfil(),
      perfil({ data: '1972-12-03', hora: '23:40' }),
      perfil({ data: null, local: null }),
    ];
    const achados: string[] = [];
    for (const p of perfis) {
      for (let i = 0; i < 26; i++) {
        const leitura = semana(diasAntes('2026-12-31', i * 7), p);
        const textos = [
          leitura.resumo,
          leitura.proxima.resumo,
          leitura.fase ?? '',
          leitura.faltando ?? '',
          ...leitura.transitos,
          ...[...leitura.passados, ...leitura.proxima.dias].flatMap((d) => [
            d.luaEm,
            d.clima,
            d.favorece,
            d.diaDaLua,
            d.paraVoce?.tema ?? '',
            d.paraVoce?.conselho ?? '',
            d.paraVoce?.area ?? '',
          ]),
        ];
        for (const texto of textos) {
          const termo = termoTecnicoEm(texto);
          if (termo) achados.push(`"${termo}" em "${texto}"`);
        }
      }
    }
    expect(achados).toEqual([]);
  });
});
