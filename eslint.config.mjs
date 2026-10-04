import { fixupConfigRules } from '@eslint/compat';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// Configuração flat do ESLint (formato único suportado a partir do ESLint 10).
// Substitui o antigo .eslintrc.json ("next/core-web-vitals") e o .eslintignore.
//
// O eslint-config-next 16 ainda depende de eslint-plugin-react 7.37,
// eslint-plugin-import 2.32 e eslint-plugin-jsx-a11y 6.10, que usam APIs de
// contexto removidas no ESLint 10 (ex.: `context.getFilename()`). O ESLint 9
// chegou ao fim de vida em 2026-08-06, então o caminho oficial é o
// `fixupConfigRules` do @eslint/compat, mantido pelo time do ESLint, que
// recoloca essas APIs nos plugins legados sem alterar as regras.
const eslintConfig = defineConfig([
  ...fixupConfigRules([...nextVitals, ...nextTypescript]),
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'output/**',
    'coverage/**',
    'venv/**',
    '.playwright-cli/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
