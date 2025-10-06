// src/features/auth/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearAuth, setAuth } from '../../../services/storage';
import {
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  resetPasswordRequest,
  verifyRegistrationRequest,
} from '../api';

import {
  ForgotPasswordRequest,
  LoginCredentials,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyRegistrationRequest,
} from '../types';
import {
  AuthResponse,
  GenericResponse,
  RegisterResponse,
} from '../types/responses';

// ------------------
// Login
// ------------------
export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: loginRequest, // ✅ return full response (ApiResponse<AuthData>)
    onSuccess: async res => {
      const { accessToken, refreshToken, user } = res.data;
      if (accessToken && refreshToken && user) {
        await setAuth(accessToken, refreshToken, user);
      }
    },
  });
};

// ------------------
// Logout
// ------------------
export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation<GenericResponse, Error, void>({
    mutationFn: logoutRequest,
    onSuccess: async () => {
      await clearAuth();
      qc.clear();
    },
  });
};

// ------------------
// Register
// ------------------
export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: registerRequest,
  });
};

// ------------------
// Verify Registration
// ------------------
export const useVerifyRegistration = () => {
  return useMutation<AuthResponse, Error, VerifyRegistrationRequest>({
    mutationFn: verifyRegistrationRequest,
    onSuccess: async res => {
      const { accessToken, refreshToken, user } = res.data;
      if (accessToken && refreshToken && user) {
        await setAuth(accessToken, refreshToken, user);
      }
    },
  });
};

// ------------------
// Forgot Password
// ------------------
export const useForgotPassword = () => {
  return useMutation<GenericResponse, Error, ForgotPasswordRequest>({
    mutationFn: forgotPasswordRequest,
  });
};

// ------------------
// Reset Password
// ------------------
export const useResetPassword = () => {
  return useMutation<AuthResponse, Error, ResetPasswordRequest>({
    mutationFn: resetPasswordRequest,
    onSuccess: async res => {
      const { accessToken, refreshToken, user } = res.data;
      if (accessToken && refreshToken && user) {
        await setAuth(accessToken, refreshToken, user);
      }
    },
  });
};
