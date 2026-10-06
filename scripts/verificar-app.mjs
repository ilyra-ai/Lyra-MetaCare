#!/usr/bin/env node
/**
 * Verificação de saúde ponta a ponta da aplicação em execução, usada pelo
 * run.sh (e, por delegação, pelo run_windows.py); o run.py tem implementação
 * equivalente em Python:
 *   1. GET /api/health → 200 com todas as migrations do repositório aplicadas;
 *   2. GET / e GET /login → 200 (páginas renderizadas);
 *   3. POST /api/auth/login com o administrador inicial do .env.local → 200.
 *
 * Uso: node scripts/verificar-app.mjs <porta>
 * Saída: uma linha [OK]/[ERRO] por verificação; exit 1 se alguma falhar.
 * Nunca imprime segredos.
 */
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { loadEnvFile } from './lib/env-file.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function requisitar(url, opcoes = {}, tempoMs = 60_000) {
  try {
    const resposta = await fetch(url, {
      ...opcoes,
      signal: AbortSignal.timeout(tempoMs),
    });
    return { status: resposta.status, corpo: await resposta.text() };
  } catch {
    return { status: 0, corpo: '' };
  }
}

async function main() {
  const porta = Number(process.argv[2]);
  if (!Number.isInteger(porta) || porta <= 0) {
    console.error('Uso: node scripts/verificar-app.mjs <porta>');
    process.exitCode = 2;
    return;
  }

  await loadEnvFile(raiz, '.env.local');
  const base = `http://127.0.0.1:${porta}`;
  const falhas = [];

  const esperado = (
    await readdir(path.join(raiz, 'mysql', 'migrations'))
  ).filter((arquivo) => arquivo.endsWith('.sql')).length;
  const saude = await requisitar(`${base}/api/health`, {}, 15_000);
  let aplicadas = null;
  if (saude.status === 200) {
    try {
      aplicadas = JSON.parse(saude.corpo).migrationsApplied;
    } catch {
      aplicadas = null;
    }
  }
  if (saude.status === 200 && aplicadas === esperado) {
    console.log(
      `[OK] /api/health: banco ok, ${esperado} migrations aplicadas.`
    );
  } else if (saude.status === 200) {
    falhas.push(
      `/api/health informa ${aplicadas} migrations (esperado ${esperado})`
    );
  } else {
    falhas.push(`/api/health respondeu ${saude.status || 'sem resposta'}`);
  }

  for (const rota of ['/', '/login']) {
    const pagina = await requisitar(`${base}${rota}`);
    if (pagina.status === 200) {
      console.log(`[OK] Página ${rota} renderizada (HTTP 200).`);
    } else {
      falhas.push(
        `página ${rota} respondeu ${pagina.status || 'sem resposta'}`
      );
    }
  }

  const login = await requisitar(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_BOOTSTRAP_EMAIL ?? '',
      password: process.env.ADMIN_BOOTSTRAP_PASSWORD ?? '',
      remember: false,
    }),
  });
  if (login.status === 200) {
    console.log('[OK] Login do administrador inicial funcionando.');
  } else {
    falhas.push(
      `login do administrador respondeu ${login.status || 'sem resposta'}`
    );
  }

  for (const falha of falhas) {
    console.log(`[ERRO] ${falha}`);
  }
  if (falhas.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    `[ERRO] ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
