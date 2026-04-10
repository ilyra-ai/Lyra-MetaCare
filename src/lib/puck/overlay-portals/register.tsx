'use client';

import { registerOverlayPortal } from '@puckeditor/core';
import { useEffect, useRef } from 'react';

/**
 * useOverlayPortal registra um elemento HTML como portal de overlay no editor Puck.
 * Isso permite que elementos interativos (acordeões, tooltips, selects) funcionem
 * corretamente dentro do canvas do editor sem que os eventos sejam interceptados
 * pelo sistema de drag-and-drop do Puck.
 *
 * Fora do contexto do editor (preview público, SSR), o registro é ignorado
 * silenciosamente — o componente funciona normalmente em ambos os ambientes.
 */
export function useOverlayPortal<T extends HTMLElement>(
  enabled = true
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    let cleanup: (() => void) | undefined;

    try {
      cleanup = registerOverlayPortal(ref.current);
    } catch {
      // Fora do contexto do editor Puck — ignora silenciosamente.
    }

    return () => {
      cleanup?.();
    };
  }, [enabled]);

  return ref;
}
