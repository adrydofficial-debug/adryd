// src/features/auth/api.ts
import apiClient from '../../services/apiClient';
import {
  ForgotPasswordRequest,
  LoginCredentials,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyRegistrationRequest,
} from './types';
import {
  AuthResponse,
  GenericResponse,
  RegisterResponse,
} from './types/responses';

// 🔹 Login
export const loginRequest = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return res.data; // ✅ returns envelope with tokens + user
};

// 🔹 Register
export const registerRequest = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const res = await apiClient.post<RegisterResponse>('/auth/register', data);
  return res.data;
};

// 🔹 Verify Registration
export const verifyRegistrationRequest = async (
  data: VerifyRegistrationRequest,
): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/auth/register/verify', data);
  return res.data;
};

// 🔹 Forgot Password
export const forgotPasswordRequest = async (
  data: ForgotPasswordRequest,
): Promise<GenericResponse> => {
  const res = await apiClient.post<GenericResponse>(
    '/auth/forgot-password',
    data,
  );
  return res.data;
};

// 🔹 Reset Password
export const resetPasswordRequest = async (
  data: ResetPasswordRequest,
): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/auth/reset-password', data);
  return res.data;
};

// 🔹 Logout (local only since backend doesn’t track tokens)
export const logoutRequest = async (): Promise<GenericResponse> => {
  const {clearAuth} = await import('../../services/storage');
  await clearAuth();
  return {
    success: true,
    message: 'Logged out',
    timestamp: new Date().toISOString(),
    data: null,
  };
};
