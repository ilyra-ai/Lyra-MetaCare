import type {
  LyraDecorativeIcon,
  LyraPuckDocumentKey,
  LyraPuckSurfaceKey,
  LyraPuckThemeVariant,
  LyraTrendDirection,
} from '@/lib/puck/types';
import { lyraPuckDocuments } from '@/lib/puck/types';

type OpcaoCampo<T extends string> = {
  label: string;
  value: T;
};

export function obterOpcoesDestinoPublicoLyra(): Array<
  OpcaoCampo<LyraPuckDocumentKey>
> {
  return lyraPuckDocuments.map((documento) => ({
    label: `${documento.publicLabel} (${documento.publicRoute})`,
    value: documento.key,
  }));
}

export function obterOpcoesTemaPorSuperficie(
  surfaceKey: LyraPuckSurfaceKey
): Array<OpcaoCampo<LyraPuckThemeVariant>> {
  if (surfaceKey === 'app-shell') {
    return [
      { label: 'Shell', value: 'shell' },
      { label: 'Sereno', value: 'serene' },
    ];
  }

  if (surfaceKey === 'login') {
    return [
      { label: 'Sereno', value: 'serene' },
      { label: 'Aurora', value: 'aurora' },
      { label: 'Shell', value: 'shell' },
    ];
  }

  return [
    { label: 'Aurora', value: 'aurora' },
    { label: 'Sereno', value: 'serene' },
    { label: 'Shell', value: 'shell' },
  ];
}

export function obterOpcoesIconePorTendencia(
  trendDirection: LyraTrendDirection
): Array<OpcaoCampo<LyraDecorativeIcon>> {
  if (trendDirection === 'up') {
    return [
      { label: 'Coração', value: 'heart' },
      { label: 'Atividade', value: 'activity' },
      { label: 'Sparkles', value: 'sparkles' },
      { label: 'CPU', value: 'cpu' },
    ];
  }

  if (trendDirection === 'down') {
    return [
      { label: 'Escudo', value: 'shield' },
      { label: 'Calendário', value: 'calendar' },
      { label: 'Atividade', value: 'activity' },
      { label: 'Mensagem', value: 'message' },
    ];
  }

  return [
    { label: 'Atividade', value: 'activity' },
    { label: 'Sparkles', value: 'sparkles' },
    { label: 'Mensagem', value: 'message' },
    { label: 'Calendário', value: 'calendar' },
    { label: 'CPU', value: 'cpu' },
  ];
}

export function obterRotuloSuperficie(surfaceKey: LyraPuckSurfaceKey) {
  if (surfaceKey === 'app-shell') {
    return 'shell autenticado';
  }

  if (surfaceKey === 'login') {
    return 'experiência de login';
  }

  return 'landing pública';
}
