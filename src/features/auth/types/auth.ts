import {User} from '../../../types/user';

// 🔹 Auth data (login, reset password, verify registration)
export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: User;
}
