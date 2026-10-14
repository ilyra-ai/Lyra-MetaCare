import { describe, it, expect } from 'vitest';
import {
  buildProfileUpdatePayload,
  horaParaCampo,
  profileSchema,
  type ProfileValues,
} from './ProfileForm';

describe('horaParaCampo', () => {
  it('converte o TIME do MySQL (HH:MM:SS) para o campo HH:MM', () => {
    expect(horaParaCampo('06:45:00')).toBe('06:45');
    expect(horaParaCampo('23:59:59.000')).toBe('23:59');
    expect(horaParaCampo('12:00')).toBe('12:00');
    expect(horaParaCampo(null)).toBe('');
    expect(horaParaCampo(undefined)).toBe('');
  });

  it('o valor convertido passa na validação do perfil', () => {
    const resultado = profileSchema.safeParse({
      first_name: 'Ana',
      last_name: 'Lima',
      age: 30,
      gender: 'female',
      birth_time: horaParaCampo('06:45:00'),
    });
    expect(resultado.success).toBe(true);
  });
});

describe('profileSchema', () => {
  const validData: ProfileValues = {
    first_name: 'John',
    last_name: 'Doe',
    age: 30,
    gender: 'male',
    birth_date: new Date(1994, 0, 1),
    birth_time: '14:30',
  };

  it('should validate correct data', () => {
    const result = profileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate data with optional fields missing', () => {
    const minimalData = {
      first_name: 'John',
      last_name: 'Doe',
      age: 30,
      gender: 'male',
    };
    const result = profileSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  it('should validate data with empty optional strings', () => {
    const dataWithEmptyStrings = {
      ...validData,
      birth_time: '',
    };
    const result = profileSchema.safeParse(dataWithEmptyStrings);
    expect(result.success).toBe(true);
  });

  it('should validate data with nullable birth_date', () => {
    const dataWithNullDate = {
      ...validData,
      birth_date: null,
    };
    const result = profileSchema.safeParse(dataWithNullDate);
    expect(result.success).toBe(true);
  });

  describe('first_name', () => {
    it('should fail if first_name is shorter than 2 characters', () => {
      const result = profileSchema.safeParse({ ...validData, first_name: 'A' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'O nome deve ter pelo menos 2 caracteres.'
        );
      }
    });
  });

  describe('last_name', () => {
    it('should fail if last_name is shorter than 2 characters', () => {
      const result = profileSchema.safeParse({ ...validData, last_name: 'B' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'O sobrenome deve ter pelo menos 2 caracteres.'
        );
      }
    });
  });

  describe('age', () => {
    it('should fail if age is less than 13', () => {
      const result = profileSchema.safeParse({ ...validData, age: 12 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Você deve ter pelo menos 13 anos.'
        );
      }
    });

    it('should fail if age is greater than 120', () => {
      const result = profileSchema.safeParse({ ...validData, age: 121 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Idade inválida.');
      }
    });

    it('should coerce string age to number', () => {
      const result = profileSchema.safeParse({ ...validData, age: '25' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.age).toBe(25);
      }
    });
  });

  describe('gender', () => {
    it('should fail if gender is not in the enum', () => {
      const result = profileSchema.safeParse({
        ...validData,
        gender: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should allow all enum values', () => {
      const genders = ['male', 'female', 'other', 'prefer_not-to-say'];
      genders.forEach((gender) => {
        const result = profileSchema.safeParse({ ...validData, gender });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('birth_time', () => {
    it('should fail if birth_time is in wrong format', () => {
      const invalidTimes = ['25:00', '12:60', '9:30', '12-30', 'abc'];
      invalidTimes.forEach((time) => {
        const result = profileSchema.safeParse({
          ...validData,
          birth_time: time,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Formato de hora inválido (HH:MM).'
          );
        }
      });
    });

    it('should allow valid HH:MM times', () => {
      const validTimes = ['00:00', '23:59', '09:05', '12:30'];
      validTimes.forEach((time) => {
        const result = profileSchema.safeParse({
          ...validData,
          birth_time: time,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('buildProfileUpdatePayload', () => {
    it('should convert empty optional profile fields to null', () => {
      const payload = buildProfileUpdatePayload({
        ...validData,
        birth_date: null,
        birth_time: '',
      });

      expect(payload.birth_date).toBeNull();
      expect(payload.birth_time).toBeNull();
    });

    it('should keep filled optional profile fields intact', () => {
      const payload = buildProfileUpdatePayload(validData);

      expect(payload.birth_date).toBe('1994-01-01');
      expect(payload.birth_time).toBe('14:30');
    });

    it('não envia o local de nascimento (muda pela rota de localização)', () => {
      expect(buildProfileUpdatePayload(validData)).not.toHaveProperty(
        'birth_location'
      );
    });

    it('grava nível de atividade e metas do onboarding (sem metas → nulo)', () => {
      expect(
        buildProfileUpdatePayload({
          ...validData,
          activity_level: 4,
          goals: ['reduce_stress', 'optimize_hrv'],
        })
      ).toMatchObject({
        activity_level: 4,
        goals: ['reduce_stress', 'optimize_hrv'],
      });
      expect(
        buildProfileUpdatePayload({ ...validData, goals: [] })
      ).toMatchObject({ activity_level: null, goals: null });
    });
  });

  describe('campos do onboarding no perfil', () => {
    it('aceita nível de 1 a 5 e recusa fora da escala', () => {
      for (const nivel of [1, 3, 5]) {
        expect(
          profileSchema.safeParse({ ...validData, activity_level: nivel })
            .success
        ).toBe(true);
      }
      for (const nivel of [0, 6, 2.5]) {
        expect(
          profileSchema.safeParse({ ...validData, activity_level: nivel })
            .success
        ).toBe(false);
      }
    });

    it('aceita só metas da lista do onboarding', () => {
      expect(
        profileSchema.safeParse({ ...validData, goals: ['lose_weight'] })
          .success
      ).toBe(true);
      const invalida = profileSchema.safeParse({
        ...validData,
        goals: ['meta_inventada'],
      });
      expect(invalida.success).toBe(false);
      if (!invalida.success) {
        expect(invalida.error.issues[0].message).toBe('Meta desconhecida.');
      }
    });
  });
});
