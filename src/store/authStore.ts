// src/store/authStore.ts
import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

// --------------------
// Types
// --------------------
interface AuthState {
  user: User | null;
  loading: boolean;
  referrerCode: string | null;
  setUser: (user: User | null) => void;
  setReferrerCode: (code: string | null) => void;
  initializeSession: () => Promise<void>;
  logout: () => Promise<void>;
}

// --------------------
// Store
// --------------------
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      loading: true,
      referrerCode: null,

      // ✅ Set user manually (after login/register)
      setUser: user => set({ user }),

      // ✅ Set referral code when user comes via referral link
      setReferrerCode: code => set({ referrerCode: code }),

      // ✅ Load Supabase session on app startup
      initializeSession: async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) console.error('Session error:', error);

          const session = data.session;
          const user = session?.user ?? null;

          // Must be verified
          const isVerified = user?.user_metadata?.isVerified === true;

          // Must have completed password setup
          const hasPassword = user?.user_metadata?.hasPassword === true;

          // User is considered "logged in" only if BOTH conditions are satisfied
          const isFullyOnboarded = isVerified && hasPassword;

          set({
            user: isFullyOnboarded ? user : null,
            loading: false,
          });
        } catch (err) {
          console.error('initializeSession error:', err);
          set({ user: null, loading: false });
        }
      },

      // ✅ Logout user
      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          set({ user: null, referrerCode: null });
        }
      },
    }),
    {
      name: 'auth-storage', // key in AsyncStorage / localStorage
      partialize: state => ({
        user: state.user,
        referrerCode: state.referrerCode,
      }), // persist user + referral code
    },
  ),
);
