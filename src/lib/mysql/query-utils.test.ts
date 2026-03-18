import { describe, it, expect } from 'vitest';
import {
  getTableConfig,
  assertKnownTable,
  assertColumn,
  isAdmin,
  ensureCanReadTable,
  ensureCanWriteTable,
  parseJsonQueryParam,
} from './query-utils';
import { AppSession } from '@/types/app-session';
import { TableName } from './table-config';

describe('query-utils', () => {
  const adminSession: AppSession = {
    access_token: 'token',
    user: {
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'admin',
      user_metadata: {},
    },
  };

  const userSession: AppSession = {
    access_token: 'token',
    user: {
      id: 'user-id',
      email: 'user@example.com',
      role: 'user',
      user_metadata: {},
    },
  };

  describe('getTableConfig', () => {
    it('should return config for a known table', () => {
      const config = getTableConfig('profiles');
      expect(config).toBeDefined();
      expect(config.columns).toContain('email');
    });

    it('should return undefined for an unknown table', () => {
      const config = getTableConfig('unknown_table' as any);
      expect(config).toBeUndefined();
    });
  });

  describe('assertKnownTable', () => {
    it('should not throw for a known table', () => {
      expect(() => assertKnownTable('profiles')).not.toThrow();
    });

    it('should throw for an unknown table', () => {
      expect(() => assertKnownTable('unknown_table' as any)).toThrow(
        'Tabela não suportada pela camada MySQL: unknown_table'
      );
    });
  });

  describe('assertColumn', () => {
    it('should not throw for a valid column', () => {
      expect(() => assertColumn('profiles', 'email')).not.toThrow();
    });

    it('should throw for an invalid column', () => {
      expect(() => assertColumn('profiles', 'invalid_col')).toThrow(
        'Coluna não permitida em profiles: invalid_col'
      );
    });
  });

  describe('isAdmin', () => {
    it('should return true if session user role is admin', () => {
      expect(isAdmin(adminSession)).toBe(true);
    });

    it('should return false if session user role is not admin', () => {
      expect(isAdmin(userSession)).toBe(false);
    });

    it('should return false if session is null', () => {
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('ensureCanReadTable', () => {
    it('should allow reading public tables without a session', () => {
      expect(() => ensureCanReadTable('instruments', null)).not.toThrow();
    });

    it('should allow reading private tables with a session', () => {
      expect(() => ensureCanReadTable('profiles', userSession)).not.toThrow();
    });

    it('should throw when reading private tables without a session', () => {
      expect(() => ensureCanReadTable('profiles', null)).toThrow(
        'Sessão autenticada obrigatória para esta consulta.'
      );
    });
  });

  describe('ensureCanWriteTable', () => {
    it('should throw if session is null', () => {
      expect(() => ensureCanWriteTable('profiles', null)).toThrow(
        'Sessão autenticada obrigatória para esta operação.'
      );
    });

    it('should allow non-admin write to standard tables', () => {
      expect(() => ensureCanWriteTable('profiles', userSession)).not.toThrow();
    });

    it('should allow admin write to admin-only tables', () => {
      expect(() => ensureCanWriteTable('ai_tips', adminSession)).not.toThrow();
    });

    it('should throw if non-admin attempts to write to admin-only tables', () => {
      expect(() => ensureCanWriteTable('ai_tips', userSession)).toThrow(
        'Apenas administradores podem alterar este recurso.'
      );
    });
  });

  describe('parseJsonQueryParam', () => {
    it('should parse valid JSON', () => {
      const result = parseJsonQueryParam('{"foo": "bar"}', {});
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return fallback if value is null', () => {
      const result = parseJsonQueryParam(null, { fallback: true });
      expect(result).toEqual({ fallback: true });
    });

    it('should return fallback if value is an empty string', () => {
      const result = parseJsonQueryParam('', { fallback: true });
      expect(result).toEqual({ fallback: true });
    });
  });
});
