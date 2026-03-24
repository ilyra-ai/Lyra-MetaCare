import { describe, it, expect, vi } from 'vitest';
import { useIsAdmin } from './use-is-admin';
import { useAuth } from '@/context/AuthContext';

// Mock useAuth hook
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('useIsAdmin', () => {
  it('should return true when userRole is "admin"', () => {
    vi.mocked(useAuth).mockReturnValue({
      userRole: 'admin',
    } as any);

    const isAdmin = useIsAdmin();
    expect(isAdmin).toBe(true);
  });

  it('should return false when userRole is "patient"', () => {
    vi.mocked(useAuth).mockReturnValue({
      userRole: 'patient',
    } as any);

    const isAdmin = useIsAdmin();
    expect(isAdmin).toBe(false);
  });

  it('should return false when userRole is null', () => {
    vi.mocked(useAuth).mockReturnValue({
      userRole: null,
    } as any);

    const isAdmin = useIsAdmin();
    expect(isAdmin).toBe(false);
  });

  it('should return false when userRole is an unexpected string', () => {
    vi.mocked(useAuth).mockReturnValue({
      userRole: 'unexpected',
    } as any);

    const isAdmin = useIsAdmin();
    expect(isAdmin).toBe(false);
  });
});
