// src/services/apiClient.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// 🔹 Determine base URL based on environment and platform
// For Android emulator: use 10.0.2.2 to access host machine's localhost
// For physical Android device: use your computer's local IP address
// For iOS simulator: localhost works fine

// 🔧 IMPORTANT: If you're using a PHYSICAL Android device, 
// change USE_PHYSICAL_DEVICE to true and set your IP below
const USE_PHYSICAL_DEVICE = false; // Set to true if using physical Android device
const YOUR_COMPUTER_IP = '192.168.18.110'; // Your IP from ipconfig

const getBaseURL = () => {
  if (!__DEV__) {
    return 'https://adryd-backend.onrender.com'; // Production
  }

  // Development mode
  if (Platform.OS === 'android') {
    if (USE_PHYSICAL_DEVICE) {
      // Physical Android device - use your computer's local IP
      const url = `http://${YOUR_COMPUTER_IP}:3000`;
      console.log('📱 Using physical device URL:', url);
      return url;
    } else {
      // Android emulator - try localhost first (works with adb reverse)
      // If adb reverse is set up: adb reverse tcp:3000 tcp:3000
      // Then we can use localhost instead of 10.0.2.2
      // Fallback to 10.0.2.2 if localhost doesn't work
      return 'http://localhost:3000';
      // Alternative: return 'http://10.0.2.2:3000';
    }
  } else {
    // iOS simulator - localhost works
    return 'http://localhost:3000';
  }
};

const BASE_URL = getBaseURL();

console.log('🌐 API Base URL:', BASE_URL, `(Platform: ${Platform.OS}, DEV: ${__DEV__})`);

// 🔹 Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased timeout for development
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

    // Log request details for debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token && config.headers) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('🔑 Authorization header added');
      } else {
        console.warn('⚠️ No access token found in session');
      }
    } catch (error) {
      console.warn('Failed to get Supabase session:', error);
    }

    return config;
  },
  error => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// 🔹 Response interceptor: handle 401 & refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error: AxiosError): Promise<AxiosResponse | never> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Enhanced error logging
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      console.error('❌ NETWORK ERROR - Cannot connect to backend server');
      console.error('   Backend URL:', BASE_URL);
      console.error('   Error Code:', error.code);
      console.error('   Error Message:', error.message);
      console.error('   Troubleshooting:');
      console.error('   1. Is your backend running on port 3000?');
      if (Platform.OS === 'android') {
        if (USE_PHYSICAL_DEVICE) {
          console.error(`   2. Is your device connected to same WiFi?`);
          console.error(`   3. Try accessing: http://${YOUR_COMPUTER_IP}:3000 in device browser`);
        } else {
          console.error('   2. For Android emulator, run this command:');
          console.error('      adb reverse tcp:3000 tcp:3000');
          console.error('   3. Then restart your app');
          console.error('   4. Alternative: Change line 36 to use 10.0.2.2:3000');
        }
      }
      console.error('   4. Check firewall settings');
    } else {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
    }

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
