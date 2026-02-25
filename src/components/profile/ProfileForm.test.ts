import { describe, it, expect } from 'vitest';
import { profileSchema } from './ProfileForm';

describe('profileSchema', () => {
  const validData = {
    first_name: 'John',
    last_name: 'Doe',
    age: 30,
    gender: 'male',
    birth_date: new Date('1994-01-01'),
    birth_time: '14:30',
    birth_location: 'New York, USA',
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
      birth_location: '',
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
        expect(result.error.issues[0].message).toBe('O nome deve ter pelo menos 2 caracteres.');
      }
    });
  });

  describe('last_name', () => {
    it('should fail if last_name is shorter than 2 characters', () => {
      const result = profileSchema.safeParse({ ...validData, last_name: 'B' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O sobrenome deve ter pelo menos 2 caracteres.');
      }
    });
  });

  describe('age', () => {
    it('should fail if age is less than 13', () => {
      const result = profileSchema.safeParse({ ...validData, age: 12 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Você deve ter pelo menos 13 anos.');
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
      const result = profileSchema.safeParse({ ...validData, gender: 'invalid' });
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
        const result = profileSchema.safeParse({ ...validData, birth_time: time });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Formato de hora inválido (HH:MM).');
        }
      });
    });

    it('should allow valid HH:MM times', () => {
      const validTimes = ['00:00', '23:59', '09:05', '12:30'];
      validTimes.forEach((time) => {
        const result = profileSchema.safeParse({ ...validData, birth_time: time });
        expect(result.success).toBe(true);
      });
    });
  });
});
