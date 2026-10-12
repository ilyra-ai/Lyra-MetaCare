/**
 * Cor da barra do navegador (meta `theme-color`) para cada tema, igual ao
 * `--background` de `globals.css`. Fica fora do módulo de cliente porque o
 * layout raiz (componente de servidor) também a usa no `viewport`.
 */
export const COR_DA_BARRA_DO_NAVEGADOR = {
  light: '#f6f6f8',
  dark: '#0c0c13',
} as const;
