import { describe, expect, it } from 'vitest';

import { destinoObrigatorio } from '@/lib/auth/destino-de-acesso';
import type { AppSession } from '@/types/app-session';

function sessao(onboardingConcluido: boolean, role = 'patient'): AppSession {
  return {
    user: {
      id: '7b0c5d8e-3f4a-4b6c-9d2e-1a2b3c4d5e6f',
      email: 'pessoa@exemplo.com',
      role,
      onboarding_completed: onboardingConcluido,
      user_metadata: {
        first_name: 'Pessoa',
        last_name: null,
        full_name: 'Pessoa',
      },
    },
  };
}

const ROTAS_DO_APP = [
  '/',
  '/plan',
  '/goals',
  '/appointments',
  '/monitoring',
  '/chat',
  '/connect',
  '/profile',
  '/billing/success',
  '/admin/dashboard',
];

describe('destinoObrigatorio', () => {
  it('visitante só acessa a landing e o login', () => {
    expect(destinoObrigatorio(null, '/')).toBeNull();
    expect(destinoObrigatorio(null, '/login')).toBeNull();
    expect(destinoObrigatorio(null, '/onboarding')).toBe('/login');
    expect(destinoObrigatorio(null, '/plan')).toBe('/login');
    expect(destinoObrigatorio(null, '/admin/users')).toBe('/login');
  });

  it('conta nova vai ao onboarding a partir de qualquer rota', () => {
    const nova = sessao(false);
    for (const rota of [...ROTAS_DO_APP, '/login']) {
      expect(destinoObrigatorio(nova, rota)).toBe('/onboarding');
    }
    expect(destinoObrigatorio(nova, '/onboarding')).toBeNull();
  });

  it('política de privacidade e termos ficam abertos para todos', () => {
    for (const rota of ['/privacidade', '/termos']) {
      expect(destinoObrigatorio(null, rota)).toBeNull();
      expect(destinoObrigatorio(sessao(false), rota)).toBeNull();
      expect(destinoObrigatorio(sessao(true), rota)).toBeNull();
    }
  });

  it('administrador sem onboarding também passa pelo onboarding', () => {
    expect(destinoObrigatorio(sessao(false, 'admin'), '/admin/users')).toBe(
      '/onboarding'
    );
  });

  it('conta com onboarding concluído usa o app e sai do login e do onboarding', () => {
    const pronta = sessao(true);
    for (const rota of ROTAS_DO_APP) {
      expect(destinoObrigatorio(pronta, rota)).toBeNull();
    }
    expect(destinoObrigatorio(pronta, '/login')).toBe('/');
    expect(destinoObrigatorio(pronta, '/onboarding')).toBe('/');
  });
});
