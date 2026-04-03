import type { LyraExternalPlanData } from '@/lib/puck/types';

export async function fetchListPlanos(): Promise<LyraExternalPlanData[]> {
  try {
    const res = await fetch('/api/public/plans', { cache: 'no-store' });

    if (!res.ok) return [];

    const json = (await res.json()) as { plans?: unknown[] };

    return (json.plans ?? []).map(mapPlanoExterno);
  } catch {
    return [];
  }
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
