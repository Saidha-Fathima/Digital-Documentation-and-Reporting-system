import api from './axiosConfig';
import type { Notification } from './types';

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};
