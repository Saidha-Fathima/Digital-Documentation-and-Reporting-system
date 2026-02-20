import api from './axiosConfig';
import type { User } from './types/index';  // ✅ correct (assuming types/index.ts exports User)

export const login = async (email: string, password: string): Promise<User> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};