// src/features/auth/types/responses.ts

import {AuthData} from './auth';
import {ApiResponse} from '../../../types/responses/base';

// 🔹 Login / Reset Password / Verify Registration
export type AuthResponse = ApiResponse<AuthData>;

// 🔹 Register (probably just success + message, no tokens)
export type RegisterResponse = ApiResponse<null>;

// 🔹 Generic (for forgot password, logout, etc.)
export type GenericResponse = ApiResponse<null>;
