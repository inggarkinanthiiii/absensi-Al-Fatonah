import { notificationRepository } from '../repositories/notificationRepository.js';
import { NOTIFICATION_TYPE, NOTIFICATION_RELATED_TYPE } from '../constants/status.js';

export const notificationService = {
  async createNotification(notificationData) {
    return await notificationRepository.create(notificationData);
  },

  async getAllNotifications(userId) {
    return await notificationRepository.findByUserId(userId);
  },

  async getNotificationById(id) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notifikasi tidak ditemukan');
    }
    return notification;
  },

  async markAsRead(id, userId) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notifikasi tidak ditemukan');
    }
    if (notification.userId.toString() !== userId.toString()) {
      throw new Error('Anda tidak memiliki akses');
    }
    return await notificationRepository.markAsRead(id);
  },

  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  },

  async deleteNotification(id, userId) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notifikasi tidak ditemukan');
    }
    if (notification.userId.toString() !== userId.toString()) {
      throw new Error('Anda tidak memiliki akses');
    }
    return await notificationRepository.delete(id);
  },

  async getUnreadCount(userId) {
    return await notificationRepository.countUnread(userId);
  },

  async createAbsensiNotification(userId, jamaahNama, kajianJudul, waktu, absensiId) {
    return await notificationRepository.create({
      userId,
      type: NOTIFICATION_TYPE.ABSENSI,
      title: 'Absensi Baru',
      message: `${jamaahNama} melakukan absensi pada ${kajianJudul} pukul ${waktu}`,
      isRead: false,
      relatedId: absensiId,
      relatedType: NOTIFICATION_RELATED_TYPE.ABSENSI,
    });
  },
};
