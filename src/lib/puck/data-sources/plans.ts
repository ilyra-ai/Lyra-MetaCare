import type { LyraExternalPlanData } from '@/lib/puck/types';

/**
 * Catálogo público de planos para os blocos do Puck. Uma falha é lançada
 * com a causa (antes virava uma lista vazia em silêncio, e o editor dizia
 * apenas que não havia planos): quem chama decide como exibir o erro.
 */
export async function fetchListPlanos(): Promise<LyraExternalPlanData[]> {
  const res = await fetch('/api/public/plans', { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(
      `O catálogo de planos respondeu com o status ${res.status}.`
    );
  }

  const json = (await res.json()) as { plans?: unknown[] };

  return (json.plans ?? []).map(mapPlanoExterno);
}

function mapPlanoExterno(raw: unknown): LyraExternalPlanData {
  const p = raw as Record<string, unknown>;

  return {
    id: String(p.id ?? ''),
    key: String(p.key ?? ''),
    name: String(p.name ?? ''),
    tagline: String(p.tagline ?? ''),
    monthlyPrice: Number(p.monthlyPrice ?? 0),
    annualPrice: Number(p.annualPrice ?? 0),
    currencyCode: String(p.currencyCode ?? 'BRL'),
    highlightText: p.highlightText != null ? String(p.highlightText) : null,
  };
}
