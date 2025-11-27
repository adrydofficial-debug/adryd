//src/features/auth/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';
import { checkUserExistsRequest } from '../api/api';

// -----------------------------
// 1️⃣ Register (Phone + Password + fullName → full_name)
// -----------------------------
export const useRegister = () => {
  return useMutation({
    mutationFn: async ({
      phone,
      fullName,
    }: {
      phone: string;
      fullName: string;
    }) => {
      console.log('📱 checking phone', phone);

      // 1) Check if user already exists using public lookup table
      const { exists } = await checkUserExistsRequest(phone);
      if (exists) {
        throw new Error('User already exists with this phone');
      }

      // 2) Get referral code from authStore
      const { referrerCode, setReferrerCode } = useAuthStore.getState();

      // 3) Kick off OTP (creates auth user if doesn't exist)
      const { data, error: otpError } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          data: {
            full_name: fullName,
            ...(referrerCode ? { referred_by: referrerCode } : {}),
          },
        },
      });

      if (otpError) {
        throw new Error(`Registration failed: ${otpError.message}`);
      }

      // 4) Clear referral code after sending
      if (referrerCode) {
        setReferrerCode(null);
      }

      return data;
    },
  });
};

// -----------------------------
// 2️⃣ Set Password + Mark User Verified
// -----------------------------
export const useSetPassword = () => {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      return data.user;
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
      console.log('🔐 [Login] Attempting to sign in with phone:', phone);
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });
      if (error) {
        console.error('❌ [Login] Sign in error:', error.message);
        throw error;
      }

      console.log('✅ [Login] Sign in successful!');
      console.log('👤 [Login] User ID:', data.user?.id);

      // Get session to check token
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionData?.session?.access_token) {
        const tokenPreview =
          sessionData.session.access_token.substring(0, 20) + '...';
        console.log('🔑 [Login] Access token available:', tokenPreview);
        console.log(
          '✅ [Login] Token will be added to API requests automatically',
        );
      } else {
        console.warn('⚠️ [Login] No access token in session after login');
        if (sessionError) {
          console.error('❌ [Login] Session error:', sessionError);
        }
      }

      qc.clear();
      return data.user;
    },
    onSuccess: user => {
      console.log('✅ [Login] onSuccess called, setting user in store');
      if (user) {
        setUser(user);
        console.log('✅ [Login] User set in auth store');
      } else {
        console.warn('⚠️ [Login] No user to set in store');
      }
    },
  });
};

// -----------------------------
// 3️⃣ Forgot Password (Send OTP)
// -----------------------------
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async ({ phone }: { phone: string }) => {
      console.log('📱 [useForgotPassword] Sending OTP to phone:', phone);
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: false },
      });
      if (error) {
        console.error(
          '❌ [useForgotPassword] Error sending OTP:',
          error.message,
        );
        throw error;
      }
      console.log('✅ [useForgotPassword] OTP sent successfully : ', data);
      return { message: 'OTP sent for password reset' };
    },
  });
};

// -----------------------------
// 4️⃣ Change Password (Old → New)
// -----------------------------
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => {
      // 1️⃣ Get the current logged-in user
      const { data: currentUserData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !currentUserData.user?.phone) {
        throw userError || new Error('No user or phone found');
      }

      const phone = currentUserData.user.phone;

      // 2️⃣ Reauthenticate using old password
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        phone,
        password: oldPassword,
      });
      if (reauthError) {
        throw new Error('Incorrect current password');
      }

      // 3️⃣ Update password
      const { data: passwordData, error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });
      if (updateError || !passwordData.user)
        throw updateError || new Error('Failed to update password');

      return {
        message: 'Password updated successfully',
        user: passwordData.user,
      };
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
      if (user) {
        setUser(user);
      }
    },
  });
};
