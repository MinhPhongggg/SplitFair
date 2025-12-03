import axios from '@/utils/axios.customize';
import { Notification } from '@/types/notification.types';

export const getMyNotifications = (): Promise<Notification[]> => {
  return axios.get('/api/notifications');
};

export const getUnreadCount = (): Promise<number> => {
  return axios.get('/api/notifications/unread-count');
};

export const markAsRead = (id: string): Promise<void> => {
  return axios.put(`/api/notifications/${id}/read`);
};

export const markAllAsRead = (): Promise<void> => {
  return axios.put('/api/notifications/read-all');
};

export const sendDebtReminder = (fromUserId: string, toUserId: string, amount: number, groupId?: string): Promise<void> => {
  return axios.post(`/api/notifications/remind`, null, {
    params: { fromUserId, toUserId, amount, groupId }
  });
};
