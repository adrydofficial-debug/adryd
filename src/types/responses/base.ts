// 🔹 Base response envelope used by all endpoints
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
}
