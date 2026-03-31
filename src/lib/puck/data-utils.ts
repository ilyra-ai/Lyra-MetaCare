import type { LyraPuckData } from '@/lib/puck/types';

type LyraPuckRootDataProps = NonNullable<LyraPuckData['root']['props']>;

function parseValorArmazenado(value: unknown): Record<string, unknown> | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  if (typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return null;
}

export function clonarDadosPuck(data: LyraPuckData): LyraPuckData {
  return JSON.parse(JSON.stringify(data)) as LyraPuckData;
}

export function normalizarDadosPuck(
  input: unknown,
  fallback: LyraPuckData
): LyraPuckData {
  const parsed = parseValorArmazenado(input);

  if (!parsed) {
    return clonarDadosPuck(fallback);
  }

  const content = Array.isArray(parsed.content)
    ? (parsed.content as LyraPuckData['content'])
    : fallback.content;

  const zones =
    parsed.zones && typeof parsed.zones === 'object'
      ? (parsed.zones as LyraPuckData['zones'])
      : fallback.zones;

  const rootRecord =
    parsed.root && typeof parsed.root === 'object'
      ? (parsed.root as Record<string, unknown>)
      : {};

  const rootPropsRecord: Partial<LyraPuckRootDataProps> =
    rootRecord.props && typeof rootRecord.props === 'object'
      ? (rootRecord.props as Partial<LyraPuckRootDataProps>)
      : {};
  const fallbackRootProps = fallback.root?.props;

  const fallbackRootRecord =
    fallback.root && typeof fallback.root === 'object'
      ? (fallback.root as Record<string, unknown>)
      : {};

  if (!fallbackRootProps) {
    return clonarDadosPuck(fallback);
  }

  return {
    content,
    zones,
    root: {
      ...fallbackRootRecord,
      ...rootRecord,
      props: {
        title: rootPropsRecord.title ?? fallbackRootProps.title,
        surfaceKey: rootPropsRecord.surfaceKey ?? fallbackRootProps.surfaceKey,
        surfaceTitle:
          rootPropsRecord.surfaceTitle ?? fallbackRootProps.surfaceTitle,
        surfaceDescription:
          rootPropsRecord.surfaceDescription ??
          fallbackRootProps.surfaceDescription,
        themeVariant:
          rootPropsRecord.themeVariant ?? fallbackRootProps.themeVariant,
        visibilityRules:
          rootPropsRecord.visibilityRules ?? fallbackRootProps.visibilityRules,
      },
    },
  };
}
