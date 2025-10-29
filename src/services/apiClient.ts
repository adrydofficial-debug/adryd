// src/services/apiClient.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { supabase } from './supabase';

// 🔹 Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🔹 Request interceptor: add Supabase token if present
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Allow requests to opt-out of auth via custom flag
    const skipAuth = (config as any).skipAuth;
    if (skipAuth) {
      return config;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token && config.headers) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.warn('Failed to get Supabase session:', error);
    }

    return config;
  },
  error => Promise.reject(error),
);

// 🔹 Response interceptor: handle 401 & refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError): Promise<AxiosResponse | never> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If this request opted out of auth, don't attempt refresh
    const skipAuth = (originalRequest as any)?.skipAuth;
    if (skipAuth) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check if user is logged in first
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.warn('No user found, skipping token refresh');
          return Promise.reject(new Error('User not authenticated'));
        }

        // Try to refresh the Supabase session
        const {
          data: { session },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.warn('Token refresh error:', refreshError.message);
          return Promise.reject(
            new Error(`Authentication failed: ${refreshError.message}`),
          );
        }

        if (!session?.access_token) {
          console.warn('No access token after refresh');
          return Promise.reject(
            new Error('Authentication failed: No access token'),
          );
        }

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return apiClient(originalRequest);
      } catch (err: any) {
        console.warn('Token refresh failed:', err);
        // Return the original error instead of the refresh error
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
