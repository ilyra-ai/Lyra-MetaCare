import type { MetadataRoute } from 'next';

import { COR_DA_BARRA_DO_NAVEGADOR } from '@/components/theme/tema';

/*
  Manifesto do aplicativo web (tarefa 47): nome, cores e ícones oficiais da
  Lyra, usados quando a pessoa adiciona o app à tela inicial. Os ícones em
  `public/icones/` são gerados a partir do logo oficial, com fundo branco; o
  `maskable` deixa a marca dentro da área segura de 80% exigida pelos
  sistemas que recortam o ícone em círculo ou gota.
*/
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lyra MetaCare',
    short_name: 'Lyra',
    description:
      'Bem-estar, longevidade e autoconhecimento com biometria, IA e astrologia védica.',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: COR_DA_BARRA_DO_NAVEGADOR.light,
    theme_color: COR_DA_BARRA_DO_NAVEGADOR.light,
    icons: [
      {
        src: '/icones/lyra-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icones/lyra-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icones/lyra-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
