import { criarLyraRootConfig } from '@/lib/puck/config/root/shared';

export const lyraLoginRootConfig = criarLyraRootConfig({
  tituloPadrao: 'Login Lyra validado task 03',
  surfaceKey: 'login',
  surfaceTitle: 'Experiência de login',
  surfaceDescription:
    'Superfície de autenticação com contexto acolhedor, linguagem clara e foco em confiança operacional.',
  themeVariant: 'serene',
  visibilityRules: 'Pública\nAutenticação\nAcesso controlado',
  rotuloBadge: 'root login',
});
