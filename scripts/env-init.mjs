#!/usr/bin/env node
/**
 * Cria ou completa o `.env.local` a partir do `.env.example` (fonte única de
 * configuração do projeto). Idempotente: nunca altera valores existentes e
 * nunca imprime segredos.
 *
 * Uso: pnpm env:init
 */
import { chmod, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { completarEnv } from './lib/env-file.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arquivoExemplo = path.join(raiz, '.env.example');
const arquivoLocal = path.join(raiz, '.env.local');

async function lerSeExistir(arquivo) {
  try {
    return await readFile(arquivo, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function main() {
  const exemplo = await lerSeExistir(arquivoExemplo);
  if (exemplo === null) {
    throw new Error(`Arquivo não encontrado: ${arquivoExemplo}`);
  }

  const atual = await lerSeExistir(arquivoLocal);
  const resultado = completarEnv(atual, exemplo);

  if (resultado.adicionadas.length > 0 || resultado.preenchidas.length > 0) {
    // 0600: apenas o dono lê e escreve (o arquivo guarda segredos).
    await writeFile(arquivoLocal, resultado.conteudo, { mode: 0o600 });
  }
  if (process.platform !== 'win32') {
    await chmod(arquivoLocal, 0o600);
  }

  if (atual === null) {
    console.log(
      `[env:init] .env.local criado com ${resultado.adicionadas.length} variáveis.`
    );
  } else if (resultado.adicionadas.length > 0) {
    console.log(
      `[env:init] Variáveis acrescentadas: ${resultado.adicionadas.join(', ')}.`
    );
  }
  if (resultado.preenchidas.length > 0) {
    console.log(
      `[env:init] Segredos vazios gerados: ${resultado.preenchidas.join(', ')}.`
    );
  }
  if (
    atual !== null &&
    resultado.adicionadas.length === 0 &&
    resultado.preenchidas.length === 0
  ) {
    console.log('[env:init] .env.local já está completo; nada foi alterado.');
  }
  if (
    resultado.adicionadas.includes('ADMIN_BOOTSTRAP_PASSWORD') ||
    resultado.preenchidas.includes('ADMIN_BOOTSTRAP_PASSWORD')
  ) {
    console.log(
      '[env:init] A senha do administrador inicial foi gerada: veja ADMIN_BOOTSTRAP_PASSWORD no .env.local.'
    );
  }

  if (resultado.erros.length > 0) {
    for (const erro of resultado.erros) {
      console.error(`[env:init] ERRO: ${erro}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    `[env:init] ERRO: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
