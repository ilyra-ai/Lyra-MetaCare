import { readFileSync } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

/**
 * Base local de cidades (GeoNames, CC BY 4.0) para o local de nascimento e de
 * moradia do mapa védico. A busca é feita no próprio servidor: o local da
 * pessoa não vai para nenhum serviço externo.
 */
export interface Cidade {
  id: number;
  nome: string;
  /** Código ISO do país (ex.: BR). */
  pais: string;
  estado: string;
  latitude: number;
  longitude: number;
  /** Fuso IANA (ex.: America/Sao_Paulo). */
  fuso: string;
  populacao: number;
  /** "Campinas, São Paulo, Brasil". */
  rotulo: string;
}

interface ArquivoDaBase {
  fusos: string[];
  cidades: Array<
    [number, string, string, string, number, number, number, number, string[]]
  >;
}

interface Indice {
  porId: Map<number, Cidade>;
  /**
   * `chaves`: nome e nomes alternativos normalizados; `local`: estado, UF e
   * país normalizados.
   */
  lista: Array<{ cidade: Cidade; chaves: string[]; local: string }>;
}

const ARQUIVO = path.join(process.cwd(), 'data', 'geo', 'cidades.json.gz');
let indice: Indice | null = null;

const nomesDePaises = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

/** Siglas das UFs (o GeoNames traz o nome do estado, e o DF em inglês). */
const UFS: Record<string, { nome: string; sigla: string }> = {
  Acre: { nome: 'Acre', sigla: 'AC' },
  Alagoas: { nome: 'Alagoas', sigla: 'AL' },
  Amapá: { nome: 'Amapá', sigla: 'AP' },
  Amazonas: { nome: 'Amazonas', sigla: 'AM' },
  Bahia: { nome: 'Bahia', sigla: 'BA' },
  Ceará: { nome: 'Ceará', sigla: 'CE' },
  'Federal District': { nome: 'Distrito Federal', sigla: 'DF' },
  'Espírito Santo': { nome: 'Espírito Santo', sigla: 'ES' },
  Goiás: { nome: 'Goiás', sigla: 'GO' },
  Maranhão: { nome: 'Maranhão', sigla: 'MA' },
  'Mato Grosso': { nome: 'Mato Grosso', sigla: 'MT' },
  'Mato Grosso do Sul': { nome: 'Mato Grosso do Sul', sigla: 'MS' },
  'Minas Gerais': { nome: 'Minas Gerais', sigla: 'MG' },
  Pará: { nome: 'Pará', sigla: 'PA' },
  Paraíba: { nome: 'Paraíba', sigla: 'PB' },
  Paraná: { nome: 'Paraná', sigla: 'PR' },
  Pernambuco: { nome: 'Pernambuco', sigla: 'PE' },
  Piauí: { nome: 'Piauí', sigla: 'PI' },
  'Rio de Janeiro': { nome: 'Rio de Janeiro', sigla: 'RJ' },
  'Rio Grande do Norte': { nome: 'Rio Grande do Norte', sigla: 'RN' },
  'Rio Grande do Sul': { nome: 'Rio Grande do Sul', sigla: 'RS' },
  Rondônia: { nome: 'Rondônia', sigla: 'RO' },
  Roraima: { nome: 'Roraima', sigla: 'RR' },
  'Santa Catarina': { nome: 'Santa Catarina', sigla: 'SC' },
  'São Paulo': { nome: 'São Paulo', sigla: 'SP' },
  Sergipe: { nome: 'Sergipe', sigla: 'SE' },
  Tocantins: { nome: 'Tocantins', sigla: 'TO' },
};

/** Minúsculas, sem acentos e sem pontuação, para comparar nomes. */
export function normalizarNome(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

function nomeDoPais(codigo: string) {
  try {
    return nomesDePaises.of(codigo) ?? codigo;
  } catch {
    return codigo;
  }
}

function carregar(): Indice {
  if (indice) return indice;
  const base = JSON.parse(
    gunzipSync(readFileSync(ARQUIVO)).toString('utf8')
  ) as ArquivoDaBase;
  const porId = new Map<number, Cidade>();
  const lista: Indice['lista'] = [];
  for (const [
    id,
    nome,
    pais,
    estadoOriginal,
    latitude,
    longitude,
    fuso,
    pop,
    alternativos,
  ] of base.cidades) {
    const uf = pais === 'BR' ? UFS[estadoOriginal] : undefined;
    const estado = uf?.nome ?? estadoOriginal;
    const cidade: Cidade = {
      id,
      nome,
      pais,
      estado,
      latitude,
      longitude,
      fuso: base.fusos[fuso],
      populacao: pop,
      rotulo: [nome, estado, nomeDoPais(pais)].filter(Boolean).join(', '),
    };
    porId.set(id, cidade);
    lista.push({
      cidade,
      chaves: [...new Set([nome, ...alternativos].map(normalizarNome))],
      local: normalizarNome(
        `${estado} ${uf?.sigla ?? ''} ${pais} ${nomeDoPais(pais)}`
      ),
    });
  }
  indice = { porId, lista };
  return indice;
}

export function cidadePorId(id: number): Cidade | null {
  return carregar().porId.get(id) ?? null;
}

/**
 * Busca por nome: igual vem antes de "começa com", que vem antes de "contém";
 * em cada grupo, as mais populosas primeiro. Aceita "Campinas, SP" ou
 * "Porto, Portugal": o texto depois da vírgula filtra (pelo início das
 * palavras) estado, UF ou país.
 */
export function buscarCidades(termo: string, limite = 8): Cidade[] {
  const [parteDoNome, ...resto] = termo.split(',');
  const nome = normalizarNome(parteDoNome ?? '');
  const filtro = normalizarNome(resto.join(' '));
  if (nome.length < 2) return [];

  const pontuadas: Array<{ cidade: Cidade; nota: number }> = [];
  for (const { cidade, chaves, local } of carregar().lista) {
    let nota = 0;
    for (const chave of chaves) {
      if (chave === nome) nota = Math.max(nota, 3);
      else if (chave.startsWith(nome)) nota = Math.max(nota, 2);
      else if (chave.includes(nome)) nota = Math.max(nota, 1);
    }
    if (nota === 0) continue;
    if (filtro && !` ${local} `.includes(` ${filtro}`)) continue;
    pontuadas.push({ cidade, nota });
  }
  return pontuadas
    .sort((a, b) => b.nota - a.nota || b.cidade.populacao - a.cidade.populacao)
    .slice(0, limite)
    .map(({ cidade }) => cidade);
}
