//src/features/auth/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';

// -----------------------------
// 1️⃣ Register (Phone + Password, Supabase handles OTP internally)
// -----------------------------
export const useRegister = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phone,
      password,
    }: {
      phone: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
      });
      if (error) throw error;
      return data.user; // Supabase sends OTP automatically
    },
    onSuccess: () => {
      // don't set user yet, OTP pending
      qc.clear();
    },
  });
};

// -----------------------------
// 2️⃣ Login (Phone + Password)
// -----------------------------
export const useLogin = () => {
  const qc = useQueryClient();
  const setUser = useAuthStore(s => s.setUser);

  return useMutation({
    mutationFn: async ({
      phone,
      password,
    }: {
      phone: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });
      if (error) throw error;

      qc.clear();
      return data.user;
    },
    onSuccess: user => {
      if (user) setUser(user);
    },
  });
};

// -----------------------------
// 3️⃣ Forgot Password (Send OTP)
// -----------------------------
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async ({ phone }: { phone: string }) => {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return { message: 'OTP sent for password reset' };
    },
  });
};

// -----------------------------
// 4️⃣ Reset Password (Verify OTP + Update Password)
// -----------------------------
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({
      phone,
      otp,
      newPassword,
    }: {
      phone: string;
      otp: string;
      newPassword: string;
    }) => {
      // Verify OTP (logs user in)
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;

      // Then update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      return { message: 'Password reset successful' };
    },
  });
};

// -----------------------------
// 5️⃣ Logout
// -----------------------------
export const useLogout = () => {
  const qc = useQueryClient();
  const setUser = useAuthStore(s => s.setUser);

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      qc.clear();
      return { message: 'Logged out successfully' };
    },
  });
};

export const useVerifyOtp = () => {
  const setUser = useAuthStore(s => s.setUser);

  return useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      return data.user;
    },
    onSuccess: user => {
      if (user) setUser(user);
    },
  });
};
