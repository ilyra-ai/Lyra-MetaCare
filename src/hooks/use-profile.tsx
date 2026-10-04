'use client';

import { useAuth } from '@/context/AuthContext';
import { useCallback } from 'react';
import { useKeyedResource } from '@/hooks/use-keyed-resource';
import { differenceInYears, parseISO } from 'date-fns';

export interface ProfileSummary {
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  gender: string | null;
  birth_date: string | null;
  tracks_menstrual_cycle: boolean;
  last_menstrual_period: string | null;
  menstrual_cycle_length: number | null;
  menstrual_period_length: number | null;
  menstrual_life_stage: string | null;
}

interface UseProfileResult {
  profile: ProfileSummary | null;
  /** Idade cronológica real (de age ou derivada de birth_date). */
  chronologicalAge: number | null;
  isFemale: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PROFILE_SELECT =
  'first_name, last_name, age, gender, birth_date, tracks_menstrual_cycle, last_menstrual_period, menstrual_cycle_length, menstrual_period_length, menstrual_life_stage';

export function useProfile(enabled = true): UseProfileResult {
  const { db, session } = useAuth();
  const userId = enabled && session?.user ? session.user.id : null;

  const requestProfile =
    useCallback(async (): Promise<ProfileSummary | null> => {
      if (!userId) {
        return null;
      }

      const { data, error } = await db
        .from('profiles')
        .select(PROFILE_SELECT)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return (data as ProfileSummary) ?? null;
    }, [db, userId]);

  const logError = useCallback((error: unknown) => {
    console.error('Erro ao carregar perfil (use-profile):', error);
  }, []);

  const {
    data: profile,
    loading,
    refresh: fetchProfile,
  } = useKeyedResource<ProfileSummary | null>(
    userId,
    requestProfile,
    logError,
    null
  );

  const chronologicalAge = (() => {
    if (!profile) return null;
    if (typeof profile.age === 'number' && profile.age > 0) {
      return profile.age;
    }
    if (profile.birth_date) {
      const parsed = parseISO(profile.birth_date);
      if (!Number.isNaN(parsed.getTime())) {
        return differenceInYears(new Date(), parsed);
      }
    }
    return null;
  })();

  const isFemale = (profile?.gender ?? '').toLowerCase() === 'female';

  return {
    profile,
    chronologicalAge,
    isFemale,
    loading,
    refresh: fetchProfile,
  };
}
