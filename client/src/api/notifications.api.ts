import client from './client';

export interface Notification {
  id: string;
  userId: string;
  type: 'TASK_ASSIGNED' | 'COMMENT_ADDED' | 'MENTIONED' | 'PROJECT_INVITATION' | 'TASK_DUE_SOON' | 'TASK_MOVED' | 'TASK_COMPLETED';
  payload: any;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const { data } = await client.get('/notifications');
  return data.notifications;
};

export const markAsRead = async (id: string): Promise<Notification> => {
  const { data } = await client.patch(`/notifications/${id}/read`);
  return data.notification;
};

export const markAllAsRead = async (): Promise<void> => {
  await client.patch('/notifications/read-all');
};
