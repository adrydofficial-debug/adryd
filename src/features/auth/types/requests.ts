// src/features/auth/types/requests.ts
export interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  name?: string;
}

export interface VerifyRegistrationRequest {
  phoneNumber: string;
  code: string;
}

export interface ForgotPasswordRequest {
  phoneNumber: string;
}

export interface ResetPasswordRequest {
  phoneNumber: string;
  otp: string;
  newPassword: string;
}
