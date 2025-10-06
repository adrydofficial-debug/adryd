// src/services/apiClient.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {RefreshResponse} from '../types/responses/refresh';
import {clearAuth, getAuth, setAuth} from './storage';

// 🔹 Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://adryd-backend-production.up.railway.app/api/v1/',
  timeout: 10000,
  headers: {'Content-Type': 'application/json'},
});

// 🔹 Request interceptor: add token if present
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const {accessToken} = await getAuth();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// 🔹 Token refresh queue
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// 🔹 Refresh token request
const refreshTokenRequest = async (
  refreshToken: string,
): Promise<AxiosResponse<RefreshResponse>> => {
  return apiClient.post<RefreshResponse>('/auth/refresh', {refreshToken});
};

// 🔹 Response interceptor: handle 401 & refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError): Promise<AxiosResponse | never> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({resolve, reject});
        }).then(token => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const {refreshToken, user: oldUser} = await getAuth();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        if (!oldUser) {
          throw new Error('No user available in storage');
        }
        const {data} = await refreshTokenRequest(refreshToken);

        // Save new tokens, keep existing user
        await setAuth(data.accessToken, data.refreshToken, oldUser);

        // Update default header for future requests
        apiClient.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await clearAuth();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
