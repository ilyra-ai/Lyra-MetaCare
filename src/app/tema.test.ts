import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { COR_DA_BARRA_DO_NAVEGADOR } from '@/components/theme/tema';

// Contraste dos tokens de cor dos dois temas (tarefa 34), lidos do próprio
// `globals.css`: qualquer ajuste de cor que derrube um par abaixo do mínimo
// da WCAG quebra este teste.

type Hsl = [number, number, number];

const css = readFileSync(new URL('./globals.css', import.meta.url), 'utf8');

function tokensDoBloco(seletor: string): Record<string, Hsl> {
  const inicio = css.indexOf(`  ${seletor} {`);
  if (inicio < 0) throw new Error(`Bloco ${seletor} não encontrado`);
  const fim = css.indexOf('\n  }', inicio);
  const tokens: Record<string, Hsl> = {};
  for (const m of css
    .slice(inicio, fim)
    .matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%;/g)) {
    tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return tokens;
}

function paraRgb([h, s0, l0]: Hsl): [number, number, number] {
  const s = s0 / 100;
  const l = l0 / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

function luminancia(cor: Hsl) {
  const [r, g, b] = paraRgb(cor).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: Hsl, b: Hsl) {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (maior + 0.05) / (menor + 0.05);
}

function hex(cor: Hsl) {
  return `#${paraRgb(cor)
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

const claro = tokensDoBloco(':root');
const escuro = { ...claro, ...tokensDoBloco('.dark') };

const SUPERFICIES = [
  'background',
  'card',
  'muted',
  'secondary',
  'popover',
  'sidebar-background',
  'sidebar-accent',
];
const TEXTOS = [
  'foreground',
  'muted-foreground',
  'primary',
  'accent',
  'destructive',
  'success',
  'warning',
  'info',
  'cosmic',
  'cosmic-strong',
  'golden',
];
const CORES_COM_TEXTO_POR_CIMA = [
  'primary',
  'accent',
  'destructive',
  'success',
  'warning',
  'info',
  'cosmic',
  'golden',
];
const CORES_COM_TOM_CLARO = [
  'destructive',
  'success',
  'warning',
  'info',
  'cosmic',
  'golden',
];

// Os mesmos pares valem nos dois temas (o nome do tema só identifica a
// falha na mensagem do teste).
function paresDoTema(tokens: Record<string, Hsl>) {
  const pares: Array<[string, string, number]> = [];
  for (const fundo of SUPERFICIES) {
    for (const texto of TEXTOS) pares.push([texto, fundo, 4.5]);
    // Contorno de checkbox e trilho do switch (WCAG 1.4.11).
    pares.push(['control', fundo, 3]);
  }
  for (const cor of CORES_COM_TEXTO_POR_CIMA) {
    pares.push([`${cor}-foreground`, cor, 4.5]);
  }
  for (const cor of CORES_COM_TOM_CLARO) {
    pares.push([cor, `${cor}-light`, 4.5]);
  }
  pares.push(
    ['cosmic-strong', 'cosmic-light', 4.5],
    ['sidebar-accent-foreground', 'sidebar-accent', 4.5],
    ['primary-foreground', 'primary-hover', 4.5],
    ['accent-foreground', 'accent-hover', 4.5],
    ['destructive-foreground', 'destructive-hover', 4.5],
    ['ring', 'background', 3],
    ['ring', 'card', 3]
  );
  // Nos dois temas o contorno dos campos é o que os separa do cartão
  // (WCAG 1.4.11; tarefa 59: no claro dava 1,37:1). Vale também para o
  // contorno dos controles (caixa de seleção, trilho do switch).
  for (const fundo of ['card', 'popover', 'muted', 'secondary', 'background']) {
    pares.push(['input', fundo, 3]);
    pares.push(['control', fundo, 3]);
  }
  return pares.map(([texto, fundo, minimo]) => {
    const a = tokens[texto];
    const b = tokens[fundo];
    if (!a || !b) throw new Error(`Token ausente: ${!a ? texto : fundo}`);
    return { texto, fundo, minimo, valor: contraste(a, b), a, b };
  });
}

describe.each([
  ['claro', claro],
  ['escuro', escuro],
] as const)('tema %s', (nome, tokens) => {
  it('todos os pares de texto e contorno atingem o mínimo da WCAG', () => {
    const falhas = paresDoTema(tokens)
      .filter((par) => par.valor < par.minimo)
      .map(
        (par) =>
          `${par.texto} ${hex(par.a)} sobre ${par.fundo} ${hex(par.b)}: ${par.valor.toFixed(2)} (mínimo ${par.minimo})`
      );
    expect(falhas).toEqual([]);
  });

  it('a cor da barra do navegador é o fundo do tema', () => {
    const chave = nome === 'claro' ? 'light' : 'dark';
    expect(COR_DA_BARRA_DO_NAVEGADOR[chave]).toBe(hex(tokens.background));
  });
});

describe('tema escuro', () => {
  it('declara color-scheme escuro para os controles nativos', () => {
    const bloco = css.slice(css.indexOf('  .dark {'));
    expect(bloco.slice(0, bloco.indexOf('\n  }'))).toContain(
      'color-scheme: dark;'
    );
  });
});
