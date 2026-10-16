import type { LyraPuckData, LyraPuckDocumentKey } from '@/lib/puck/types';
import { lyraPuckDocuments } from '@/lib/puck/types';

/**
 * Dados iniciais de cada documento do Puck: sem blocos (tarefa 53). Antes a
 * landing, o login e o app shell nasciam com blocos de demonstração escritos
 * para desenvolvedores; como essas páginas passaram a exibir o documento
 * publicado, um documento novo não pode trazer conteúdo que ninguém
 * escreveu. Os blocos antigos ficaram em
 * src/lib/puck/migrations/documentos-de-demonstracao.ts, só para a migração
 * de leitura reconhecê-los e retirá-los.
 *
 * A raiz traz os metadados de edição do documento (título interno,
 * superfície e tema); nenhum deles é exibido fora do editor.
 */

const temaPorSuperficie = {
  landing: 'aurora',
  login: 'serene',
  'app-shell': 'shell',
  'admin-panel': 'shell',
  'patient-portal': 'serene',
  billing: 'serene',
} as const;

const notasDeVisibilidadePorSuperficie = {
  landing: 'Página pública (qualquer visitante)',
  login: 'Página pública de acesso',
  'app-shell': 'Pessoas com sessão ativa',
  'admin-panel': 'Somente administradores',
  'patient-portal': 'Pessoas com sessão ativa',
  billing: 'Pessoas com sessão ativa',
} as const;

const dadosIniciaisPorDocumento = lyraPuckDocuments.reduce(
  (acc, doc) => {
    acc[doc.key] = {
      content: [],
      root: {
        props: {
          title: doc.label,
          surfaceKey: doc.surfaceKey,
          surfaceTitle: doc.label,
          surfaceDescription: doc.description,
          themeVariant: temaPorSuperficie[doc.surfaceKey],
          visibilityRules: notasDeVisibilidadePorSuperficie[doc.surfaceKey],
        },
      },
    };
    return acc;
  },
  {} as Record<LyraPuckDocumentKey, LyraPuckData>
);

export function getInitialPuckData(
  documentKey: LyraPuckDocumentKey
): LyraPuckData {
  return JSON.parse(
    JSON.stringify(dadosIniciaisPorDocumento[documentKey])
  ) as LyraPuckData;
}
