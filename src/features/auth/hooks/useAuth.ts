//src/features/auth/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlayInstallReferrer,
  PlayInstallReferrerInfo,
} from 'react-native-play-install-referrer';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';
import { checkUserExistsRequest, logAppEvent } from '../api/api';

// ----------------------------------------------------------
// 1️⃣ Register (Phone + Password + fullName → full_name)
// ----------------------------------------------------------
export const useRegister = () => {
  return useMutation({
    mutationFn: async ({
      phone,
      fullName,
    }: {
      phone: string;
      fullName: string;
    }) => {
      await logAppEvent({
        level: 'INFO',
        tag: 'Register',
        message: `Starting registration for phone: ${phone}`,
      });

      // 1️⃣ Check if user already exists
      const { exists } = await checkUserExistsRequest(phone);
      await logAppEvent({
        level: 'INFO',
        tag: 'Register',
        message: 'Checked if user exists',
        data: { phone, exists },
      });

      if (exists) {
        await logAppEvent({
          level: 'WARN',
          tag: 'Register',
          message: 'User already exists',
          data: { phone },
        });
        throw new Error('User already exists with this phone');
      }

      // 2️⃣ Fetch referral code from Install Referrer
      let referrerCode: string | null = null;
      try {
        const { referrer } = await getInstallReferrer();
        if (referrer) {
          const urlParams = new URLSearchParams(referrer);
          referrerCode = urlParams.get('referrer');
        }
        await logAppEvent({
          level: 'INFO',
          tag: 'Register',
          message: 'Parsed referrer code',
          data: { referrerCode },
        });
      } catch (err) {
        await logAppEvent({
          level: 'ERROR',
          tag: 'Register',
          message: 'Failed to get install referrer',
          data: err,
        });
      }
      // 3️⃣ Kick off OTP (creates auth user if doesn't exist)
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
        await logAppEvent({
          level: 'ERROR',
          tag: 'Register',
          message: 'Registration failed',
          data: { phone, message: otpError.message },
        });
        throw new Error(`Registration failed: ${otpError.message}`);
      }

      await logAppEvent({
        level: 'INFO',
        tag: 'Register',
        message: 'OTP sent successfully',
        data: { phone },
      });

      return data;
    },
  });
};

export function getInstallReferrer(): Promise<{ referrer: string | null }> {
  return new Promise(resolve => {
    logAppEvent({
      level: 'INFO',
      tag: 'InstallReferrer',
      message: 'Calling PlayInstallReferrer',
    });

    PlayInstallReferrer.getInstallReferrerInfo(
      async (info: PlayInstallReferrerInfo | null, error: any) => {
        if (error) {
          await logAppEvent({
            level: 'ERROR',
            tag: 'InstallReferrer',
            message: 'Failed to fetch install referrer',
            data: error,
          });
          resolve({ referrer: null });
          return;
        }

        await logAppEvent({
          level: 'INFO',
          tag: 'InstallReferrer',
          message: 'Fetched install referrer',
          data: info,
        });

        resolve({ referrer: info?.installReferrer ?? null });
      },
    );
  });
}

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
