# Elementor Lyra Builder

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

## Estrategia de integracao

1. O modulo expõe o nucleo reutilizavel.
2. O app consumidor cria ou usa um adapter proprio.
3. A Lyra atua como primeiro consumidor real.
4. O script `implement_elementor_lyra.py` sera a camada final de instalacao automatizada em outros apps.

## Estado atual

- Nucleo de schema segregado do app principal.
- Reexports mantidos em `src/lib/site-page-config/` para nao quebrar a Lyra.
- Proxima etapa: ampliar a segregacao para renderer, admin builder e instalador.
