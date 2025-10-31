import { useMutation } from '@tanstack/react-query';
import { registerFcmToken, RegisterFcmTokenResponse } from '../api/api';

export function useRegisterFcmToken() {
  return useMutation<RegisterFcmTokenResponse, Error, string>({
    mutationFn: async (token: string) => registerFcmToken(token),
  });
}


