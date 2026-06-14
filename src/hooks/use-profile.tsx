'use client';

import { useAuth } from '@/context/AuthContext';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  refresh: () => void;
}

const PROFILE_SELECT =
  'first_name, last_name, age, gender, birth_date, tracks_menstrual_cycle, last_menstrual_period, menstrual_cycle_length, menstrual_period_length, menstrual_life_stage';

export function useProfile(enabled = true): UseProfileResult {
  const { db, session } = useAuth();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const disposedRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (!enabled || !session?.user) {
      if (!disposedRef.current) {
        setProfile(null);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    const { data, error } = await db
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', session.user.id)
      .maybeSingle();

    if (disposedRef.current) return;

    if (error) {
      console.error('Erro ao carregar perfil (use-profile):', error);
      setProfile(null);
    } else {
      setProfile((data as ProfileSummary) ?? null);
    }
    setLoading(false);
  }, [db, enabled, session]);

  useEffect(() => {
    disposedRef.current = false;
    void fetchProfile();
    return () => {
      disposedRef.current = true;
    };
  }, [fetchProfile]);

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
