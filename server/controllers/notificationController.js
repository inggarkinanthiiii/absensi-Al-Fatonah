import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async getAllNotifications(req, res) {
    try {
      const notifications = await notificationService.getAllNotifications(req.user._id);
      res.status(200).json({
        success: true,
        count: notifications.length,
        data: { notifications },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getNotificationById(req, res) {
    try {
      const notification = await notificationService.getNotificationById(req.params.id);
      res.status(200).json({
        success: true,
        data: { notification },
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user._id);
      res.status(200).json({
        success: true,
        message: 'Notifikasi ditandai sudah dibaca',
        data: { notification },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async markAllAsRead(req, res) {
    try {
      await notificationService.markAllAsRead(req.user._id);
      res.status(200).json({
        success: true,
        message: 'Semua notifikasi ditandai sudah dibaca',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteNotification(req, res) {
    try {
      await notificationService.deleteNotification(req.params.id, req.user._id);
      res.status(200).json({
        success: true,
        message: 'Notifikasi dihapus',
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const count = await notificationService.getUnreadCount(req.user._id);
      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
