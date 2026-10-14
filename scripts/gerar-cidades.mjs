#!/usr/bin/env node
/**
 * Gera `data/geo/cidades.json.gz`, a base de cidades usada para escolher o
 * local de nascimento e de moradia (coordenadas e fuso horário) no mapa
 * védico (tarefa 41).
 *
 * Fonte: GeoNames (https://www.geonames.org), licença CC BY 4.0.
 * - `cities5000`: cidades com mais de 5.000 habitantes no mundo;
 * - `cities1000`: no Brasil, também as com mais de 1.000 habitantes e as
 *   sedes de município;
 * - `admin1CodesASCII`: nome do estado/província.
 *
 * Uso: `pnpm geo:cidades` (precisa de acesso a download.geonames.org).
 * O arquivo gerado é versionado; rode de novo só para atualizar a base.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, inflateRawSync } from 'node:zlib';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = path.join(RAIZ, 'data', 'geo', 'cidades.json.gz');
const BASE = 'https://download.geonames.org/export/dump';

async function baixar(nome) {
  const resposta = await fetch(`${BASE}/${nome}`);
  if (!resposta.ok) {
    throw new Error(`Falha ao baixar ${nome}: HTTP ${resposta.status}`);
  }
  return Buffer.from(await resposta.arrayBuffer());
}

/**
 * Extrai um arquivo de um ZIP pelo diretório central (os ZIPs do GeoNames têm
 * um único arquivo, comprimido com deflate).
 */
function extrairDoZip(zip, nomeDoArquivo) {
  const ASSINATURA_DO_FIM = 0x06054b50;
  let fim = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65_557); i--) {
    if (zip.readUInt32LE(i) === ASSINATURA_DO_FIM) {
      fim = i;
      break;
    }
  }
  if (fim < 0) throw new Error('ZIP sem diretório central.');
  const entradas = zip.readUInt16LE(fim + 10);
  let cursor = zip.readUInt32LE(fim + 16);
  for (let i = 0; i < entradas; i++) {
    if (zip.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error('Entrada inválida no diretório central do ZIP.');
    }
    const metodo = zip.readUInt16LE(cursor + 10);
    const tamanhoComprimido = zip.readUInt32LE(cursor + 20);
    const tamanhoDoNome = zip.readUInt16LE(cursor + 28);
    const tamanhoExtra = zip.readUInt16LE(cursor + 30);
    const tamanhoDoComentario = zip.readUInt16LE(cursor + 32);
    const deslocamentoLocal = zip.readUInt32LE(cursor + 42);
    const nome = zip.toString('utf8', cursor + 46, cursor + 46 + tamanhoDoNome);
    if (nome === nomeDoArquivo) {
      const nomeLocal = zip.readUInt16LE(deslocamentoLocal + 26);
      const extraLocal = zip.readUInt16LE(deslocamentoLocal + 28);
      const inicio = deslocamentoLocal + 30 + nomeLocal + extraLocal;
      const dados = zip.subarray(inicio, inicio + tamanhoComprimido);
      if (metodo === 0) return dados;
      if (metodo === 8) return inflateRawSync(dados);
      throw new Error(`Método de compressão ${metodo} não suportado.`);
    }
    cursor += 46 + tamanhoDoNome + tamanhoExtra + tamanhoDoComentario;
  }
  throw new Error(`${nomeDoArquivo} não está no ZIP.`);
}

function linhas(texto) {
  return texto.split('\n').filter((linha) => linha.trim() !== '');
}

async function main() {
  console.log('Baixando a base do GeoNames...');
  const [zip5000, zip1000, admin1] = await Promise.all([
    baixar('cities5000.zip'),
    baixar('cities1000.zip'),
    baixar('admin1CodesASCII.txt'),
  ]);

  const estados = new Map();
  for (const linha of linhas(admin1.toString('utf8'))) {
    const [codigo, nome] = linha.split('\t');
    estados.set(codigo, nome);
  }

  // Colunas do GeoNames: 0 id, 1 nome, 4 lat, 5 lon, 8 país, 10 admin1,
  // 14 população, 17 fuso.
  const cidades = new Map();
  const incluir = (texto, filtro) => {
    for (const linha of linhas(texto)) {
      const c = linha.split('\t');
      if (filtro && !filtro(c)) continue;
      cidades.set(Number(c[0]), c);
    }
  };
  incluir(extrairDoZip(zip5000, 'cities5000.txt').toString('utf8'));
  incluir(
    extrairDoZip(zip1000, 'cities1000.txt').toString('utf8'),
    (c) => c[8] === 'BR'
  );

  // Nomes alternativos em alfabeto latino (ex.: "Lisboa", "Nova Iorque",
  // "Londres") das cidades com 50 mil habitantes ou mais fora do Brasil, para
  // a busca aceitar o nome em português.
  const LATINO = /^[\p{Script=Latin}\s'’.-]+$/u;
  const alternativos = (c) =>
    c[8] === 'BR' || Number(c[14]) < 50_000
      ? []
      : [
          ...new Set(
            c[3]
              .split(',')
              .map((nome) => nome.trim())
              .filter((nome) => nome && nome !== c[1] && LATINO.test(nome))
          ),
        ].slice(0, 20);

  const fusos = [...new Set([...cidades.values()].map((c) => c[17]))].sort();
  const indiceDoFuso = new Map(fusos.map((fuso, i) => [fuso, i]));
  const registros = [...cidades.values()]
    .map((c) => [
      Number(c[0]),
      c[1],
      c[8],
      estados.get(`${c[8]}.${c[10]}`) ?? '',
      Math.round(Number(c[4]) * 1e4) / 1e4,
      Math.round(Number(c[5]) * 1e4) / 1e4,
      indiceDoFuso.get(c[17]),
      Number(c[14]) || 0,
      alternativos(c),
    ])
    .sort((a, b) => a[0] - b[0]);

  const conteudo = JSON.stringify({
    fonte: 'GeoNames (https://www.geonames.org), CC BY 4.0',
    gerado_em: new Date().toISOString().slice(0, 10),
    colunas: [
      'id',
      'nome',
      'pais',
      'estado',
      'latitude',
      'longitude',
      'fuso',
      'populacao',
      'alternativos',
    ],
    fusos,
    cidades: registros,
  });
  await mkdir(path.dirname(DESTINO), { recursive: true });
  await writeFile(DESTINO, gzipSync(conteudo, { level: 9 }));
  console.log(
    `Base gerada: ${registros.length} cidades, ${fusos.length} fusos → ${path.relative(RAIZ, DESTINO)}`
  );
}

main().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
