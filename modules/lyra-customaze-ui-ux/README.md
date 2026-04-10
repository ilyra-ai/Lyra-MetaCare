# Lyra Customaze UI UX

## Objetivo

Este modulo concentra a base reutilizavel do construtor visual administrativo da Lyra, inspirado nas capacidades reais auditadas do ecossistema Elementor, mas adaptado para apps React/Next.js sem dependencia de WordPress.

## Principios

- Reutilizavel entre apps
- Persistencia real
- Sem simulacoes
- Sem placeholders funcionais
- Sem acoplamento indevido ao dominio da Lyra no nucleo
- Acesso administrativo

## Estrutura inicial

- `module.manifest.json`: contrato declarativo do modulo
- `src/site-page-config/schema.ts`: schemas, tipos e defaults do builder
- `src/site-page-config/ui.ts`: metadados de icones, tons e mapeamentos visuais
- `src/contracts/integration.ts`: contratos de integracao, superfícies editáveis e relatório de instalação

## Compatibilidade real desta primeira entrega

- Next.js com App Router
- React
- TypeScript
- Estrutura com `src/app` ou `app`
- Integração inicial por reexports em `lib/site-page-config`

## Instalacao portavel

1. Copie a pasta `modules/lyra-customaze-ui-ux` para a raiz do projeto-alvo.
2. Copie o script `implement_elementor_lyra.py` para a raiz do projeto-alvo.
3. Execute `python implement_elementor_lyra.py`.
4. O instalador vai:
   - validar se o projeto-alvo é compatível;
   - sincronizar o módulo em `modules/lyra-customaze-ui-ux`;
   - criar ou alinhar `schema.ts`, `ui.ts` e `index.ts` em `lib/site-page-config`;
   - registrar o script `lyra-customaze:install` no `package.json`.

## Limites honestos desta etapa

- O instalador atual cobre projetos compatíveis com Next.js App Router + TypeScript.
- O núcleo reutilizável já foi separado, mas o builder administrativo completo ainda continua em evolução dentro da Lyra.
- A extração das próximas camadas seguirá para:
  - renderer
  - admin builder
  - adapters de armazenamento
  - publicação e revisões

## Estrategia de integracao

1. O modulo expõe o nucleo reutilizavel.
2. O app consumidor cria ou usa um adapter proprio.
3. A Lyra atua como primeiro consumidor real.
4. O script `implement_elementor_lyra.py` sera a camada final de instalacao automatizada em outros apps.

## Estado atual

- Nucleo de schema segregado do app principal.
- Reexports mantidos em `src/lib/site-page-config/` para nao quebrar a Lyra.
- Contrato de integracao criado para suportar apps consumidores.
- Instalador portavel `implement_elementor_lyra.py` criado na raiz do projeto.
- Proxima etapa: ampliar a segregacao para renderer, admin builder e adapters.
