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
