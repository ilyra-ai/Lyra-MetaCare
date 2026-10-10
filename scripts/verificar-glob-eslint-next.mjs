#!/usr/bin/env node
/*
  Verifica a substituição do fast-glob pelo tinyglobby no
  @next/eslint-plugin-next (override em pnpm-workspace.yaml, que elimina o
  `braces` vulnerável, GHSA-vfj7-8cjw-p6xm).

  O plugin só usa o glob em `getRootDirs`, para expandir `settings.next.rootDir`
  em diretórios. Este script chama a função real do plugin com um padrão e
  compara o resultado com a listagem do sistema de arquivos: os mesmos
  diretórios, sem arquivos, e caminhos utilizáveis em `path.join` (como o
  plugin faz nas regras `no-html-link-for-pages` e afins).

  Uso: node scripts/verificar-glob-eslint-next.mjs
*/
import { readdirSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
// O eslint-config-next não exporta o package.json; o diretório real do pacote
// (link simbólico do pnpm) é o ponto de partida para achar o plugin dele.
const raizConfig = realpathSync(
  path.join('node_modules', 'eslint-config-next')
);
const raizPlugin = path.dirname(
  require.resolve('@next/eslint-plugin-next/package.json', {
    paths: [raizConfig],
  })
);
const { getRootDirs } = require(
  path.join(raizPlugin, 'dist/utils/get-root-dirs.js')
);
const globResolvido = require.resolve('fast-glob', { paths: [raizPlugin] });

const normalizar = (dir) => path.normalize(dir).replace(/[\\/]+$/, '');
const esperado = readdirSync('src', { withFileTypes: true })
  .filter((entrada) => entrada.isDirectory())
  .map((entrada) => normalizar(path.join('src', entrada.name)))
  .sort();

const obtido = getRootDirs({
  cwd: process.cwd(),
  settings: { next: { rootDir: ['src/*'] } },
})
  .map(normalizar)
  .sort();

const falhas = [];
if (!globResolvido.includes('tinyglobby')) {
  falhas.push(`o plugin ainda resolve "fast-glob" para ${globResolvido}`);
}
if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
  falhas.push(
    `diretórios divergentes:\n  esperado ${JSON.stringify(esperado)}\n  obtido   ${JSON.stringify(obtido)}`
  );
}
if (getRootDirs({ cwd: process.cwd(), settings: {} })[0] !== process.cwd()) {
  falhas.push('sem rootDir configurado, o plugin deveria usar o cwd');
}

if (falhas.length > 0) {
  console.error(`✖ ${falhas.join('\n✖ ')}`);
  process.exit(1);
}
console.log(
  `✔ getRootDirs do @next/eslint-plugin-next com tinyglobby: ${obtido.length} diretórios de src/* idênticos ao sistema de arquivos.`
);
