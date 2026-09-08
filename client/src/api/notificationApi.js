import axios from './axios';

export const notificationApi = {
  getAllNotifications: () => axios.get('/notifications'),
  getUnreadCount: () => axios.get('/notifications/unread-count'),
  getNotificationById: (id) => axios.get(`/notifications/${id}`),
  markAsRead: (id) => axios.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axios.patch('/notifications/read-all'),
  deleteNotification: (id) => axios.delete(`/notifications/${id}`),
};
