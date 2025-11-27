// src/features/users/hooks/hooks.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { referralApi } from '../api/api';

/* -------------------------------------------------------------------------- */
/* 🔗 REFERRAL HOOKS                                                          */
/* -------------------------------------------------------------------------- */

export const useReferredCount = () => {
  return useQuery<number>({
    queryKey: ['referredCount'],
    queryFn: referralApi.getReferredCount,
    staleTime: 60_000,
  });
};

export const useReferralCode = () => {
  return useQuery<string>({
    queryKey: ['referralCode'],
    queryFn: async () => {
      // 1️⃣ Get the current logged-in user
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user?.id) {
        throw error || new Error('No logged-in user found');
      }

      // 2️⃣ Return the user ID as a placeholder referral code
      return data.user.id;
    },
    staleTime: 60_000, // 1 minute
  });
};
