import { describe, it, expect, vi } from 'vitest';
import { useIsAdmin } from './use-is-admin';
import { useAuth } from '@/context/AuthContext';

// Mock do hook useAuth: o useIsAdmin só lê `userRole` e `session.user.role`.
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

type AuthContextValue = ReturnType<typeof useAuth>;

function mockAuth(
  value: Pick<Partial<AuthContextValue>, 'userRole' | 'session'>
) {
  vi.mocked(useAuth).mockReturnValue({
    userRole: null,
    session: null,
    ...value,
  } as AuthContextValue);
}

function buildSession(role: string): NonNullable<AuthContextValue['session']> {
  return {
    user: { role },
  } as NonNullable<AuthContextValue['session']>;
}

describe('useIsAdmin', () => {
  it('should return true when userRole is "admin"', () => {
    mockAuth({ userRole: 'admin' });
    expect(useIsAdmin()).toBe(true);
  });

  it('should return false when userRole is "patient"', () => {
    mockAuth({ userRole: 'patient' });
    expect(useIsAdmin()).toBe(false);
  });

  it('should return false when userRole is null', () => {
    mockAuth({ userRole: null });
    expect(useIsAdmin()).toBe(false);
  });

  it('should return false when userRole is an unexpected string', () => {
    mockAuth({ userRole: 'unexpected' });
    expect(useIsAdmin()).toBe(false);
  });

  it('should fall back to the session role when userRole is not loaded', () => {
    mockAuth({ userRole: null, session: buildSession('admin') });
    expect(useIsAdmin()).toBe(true);
  });

  it('should prefer the profile role over the session role', () => {
    mockAuth({ userRole: 'patient', session: buildSession('admin') });
    expect(useIsAdmin()).toBe(false);
  });
});
