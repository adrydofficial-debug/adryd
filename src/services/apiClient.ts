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
  // baseURL: 'http://192.168.18.78:3000',
  baseURL: 'https://adryd-backend.onrender.com',
  // baseURL: 'http://192.168.18.110:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🔹 Request interceptor: add Supabase token if present
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = `${config.baseURL || ''}${config.url || ''}`;
    console.log('🔵 [API Client] Request:', config.method?.toUpperCase(), url);

    // Allow requests to opt-out of auth via custom flag
    const skipAuth = (config as any).skipAuth;
    if (skipAuth) {
      console.log('⏭️ [API Client] Skipping auth for this request');
      return config;
    }

    try {
      console.log('🔍 [API Client] Getting Supabase session...');
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        const tokenPreview = session.access_token.substring(0, 20) + '...';
        console.log('✅ [API Client] Token found! Adding to request');
        console.log('🔑 [API Client] Token preview:', tokenPreview);
        console.log('👤 [API Client] User ID:', session.user?.id);

        if (config.headers) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
          console.log(
            '✅ [API Client] Authorization header added successfully',
          );
        } else {
          console.warn('⚠️ [API Client] Config headers not available');
        }
      } else {
        console.warn('⚠️ [API Client] No access token found in session');
        console.log('📋 [API Client] Session data:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasToken: !!session?.access_token,
        });
      }
    } catch (error) {
      console.error('❌ [API Client] Failed to get Supabase session:', error);
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
