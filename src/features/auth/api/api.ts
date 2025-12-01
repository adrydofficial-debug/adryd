import apiClient from '../../../services/apiClient';

// 🔹 Check if user exists
export const checkUserExistsRequest = async (
  phone: string,
): Promise<{ exists: boolean }> => {
  const res = await apiClient.get<{ exists: boolean }>(
    '/api/users/user-exists',
    {
      params: { phone },
    },
  );
  return res.data;
};

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface AppLogPayload {
  level?: LogLevel;
  tag?: string;
  message: string;
  data?: any;
}

/**
 * Send a log to the backend `/log` endpoint.
 */
export async function logAppEvent(payload: AppLogPayload) {
  const { level = 'INFO', tag, message, data } = payload;

  try {
    await apiClient.post('/api/logger', {
      level,
      tag,
      message,
      data,
    });
    console.log(`📝 Log sent: [${level}] ${tag ?? ''} - ${message}`);
  } catch (err) {
    console.warn('Failed to send log:', err);
  }
}
