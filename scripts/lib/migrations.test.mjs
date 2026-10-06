import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildBootstrapAdmins,
  buildChecksumCandidates,
  buildStableChecksum,
  normalizeMigrationContents,
  parseAdditionalBootstrapAdmins,
  sortMigrationFiles,
} from './migrations.mjs';

const raiz = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);

describe('ordem das migrations', () => {
  it('ordena por código de caractere e ignora arquivos que não são .sql', () => {
    expect(
      sortMigrationFiles([
        '010_b.sql',
        'LEIA-ME.md',
        '002_a.sql',
        '005_ui.sql',
        '005_add.sql',
        '005_Z.sql',
      ])
    ).toEqual([
      '002_a.sql',
      '005_Z.sql',
      '005_add.sql',
      '005_ui.sql',
      '010_b.sql',
    ]);
  });

  it('o repositório tem migrations numeradas, sem nomes repetidos', async () => {
    const arquivos = sortMigrationFiles(
      await readdir(path.join(raiz, 'mysql', 'migrations'))
    );
    expect(arquivos.length).toBeGreaterThan(0);
    for (const arquivo of arquivos) {
      expect(arquivo).toMatch(/^\d{3}_[a-z0-9_]+\.sql$/);
    }
    expect(new Set(arquivos).size).toBe(arquivos.length);
  });
});

describe('checksum', () => {
  it('não depende de BOM nem do fim de linha', () => {
    const lf = 'CREATE TABLE a (id INT);\nSELECT 1;\n';
    const crlf = '﻿CREATE TABLE a (id INT);\r\nSELECT 1;\r\n';
    expect(normalizeMigrationContents(crlf)).toBe(lf);
    expect(buildStableChecksum(crlf)).toBe(buildStableChecksum(lf));
    expect(buildStableChecksum(lf)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('aceita os formatos já registrados, mas não conteúdo alterado', () => {
    const conteudo = 'SELECT 1;\nSELECT 2;\n';
    const candidatos = buildChecksumCandidates(conteudo);
    expect(candidatos).toContain(buildStableChecksum(conteudo));
    expect(candidatos).toContain(
      buildStableChecksum(conteudo.replace(/\n/g, '\r\n'))
    );
    expect(candidatos).not.toContain(
      buildStableChecksum('SELECT 1;\nSELECT 3;\n')
    );
  });

  it('cada migration do repositório tem checksum estável', async () => {
    const pasta = path.join(raiz, 'mysql', 'migrations');
    for (const arquivo of sortMigrationFiles(await readdir(pasta))) {
      const sql = await readFile(path.join(pasta, arquivo), 'utf8');
      expect(buildChecksumCandidates(sql)).toContain(buildStableChecksum(sql));
    }
  });
});

describe('administradores de bootstrap', () => {
  const SENHA = 'senha-forte-123';

  it('sem e-mail e senha o bootstrap fica desativado', () => {
    // Nome e sobrenome têm padrão e não ativam o bootstrap sozinhos.
    expect(
      buildBootstrapAdmins({
        ADMIN_BOOTSTRAP_FIRST_NAME: 'Admin',
        ADMIN_BOOTSTRAP_LAST_NAME: 'Lyra',
      })
    ).toEqual([]);
    expect(buildBootstrapAdmins({})).toEqual([]);
  });

  it('normaliza o administrador principal', () => {
    expect(
      buildBootstrapAdmins({
        ADMIN_BOOTSTRAP_EMAIL: '  Admin@Lyra.Local ',
        ADMIN_BOOTSTRAP_PASSWORD: ` ${SENHA} `,
      })
    ).toEqual([
      {
        email: 'admin@lyra.local',
        password: SENHA,
        firstName: 'Admin',
        lastName: 'Local',
      },
    ]);
  });

  it('exige e-mail e senha juntos e senha com 8+ caracteres', () => {
    expect(() =>
      buildBootstrapAdmins({ ADMIN_BOOTSTRAP_EMAIL: 'a@b.c' })
    ).toThrow(/incompleta/);
    expect(() =>
      buildBootstrapAdmins({ ADMIN_BOOTSTRAP_PASSWORD: SENHA })
    ).toThrow(/incompleta/);
    expect(() =>
      buildBootstrapAdmins({
        ADMIN_BOOTSTRAP_EMAIL: 'a@b.c',
        ADMIN_BOOTSTRAP_PASSWORD: 'curta',
      })
    ).toThrow(/pelo menos 8/);
  });

  it('aceita administradores adicionais em JSON e recusa duplicados', () => {
    const extras = JSON.stringify([
      { email: 'Ana@Exemplo.com', password: SENHA, firstName: 'Ana' },
    ]);
    expect(
      buildBootstrapAdmins({
        ADMIN_BOOTSTRAP_EMAIL: 'admin@lyra.local',
        ADMIN_BOOTSTRAP_PASSWORD: SENHA,
        ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS: extras,
      }).map((admin) => admin.email)
    ).toEqual(['admin@lyra.local', 'ana@exemplo.com']);

    expect(() =>
      buildBootstrapAdmins({
        ADMIN_BOOTSTRAP_EMAIL: 'ana@exemplo.com',
        ADMIN_BOOTSTRAP_PASSWORD: SENHA,
        ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS: extras,
      })
    ).toThrow(/duplicado/);
  });

  it('recusa JSON inválido ou fora do formato', () => {
    expect(() => parseAdditionalBootstrapAdmins('{')).toThrow(/JSON valido/);
    expect(() => parseAdditionalBootstrapAdmins('{"email":"x"}')).toThrow(
      /array/
    );
    expect(() => parseAdditionalBootstrapAdmins('[1]')).toThrow(/objeto/);
    expect(() =>
      buildBootstrapAdmins({
        ADMIN_BOOTSTRAP_ADDITIONAL_ADMINS: '[{"email":"sem-senha@x.com"}]',
      })
    ).toThrow(/email e password/);
  });
});
