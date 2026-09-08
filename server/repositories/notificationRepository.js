import Notification from '../models/Notification.js';

export const notificationRepository = {
  async findById(id) {
    return await Notification.findById(id);
  },

  async findAll(filters = {}) {
    return await Notification.find(filters).sort({ createdAt: -1 });
  },

  async create(notificationData) {
    return await Notification.create(notificationData);
  },

  async update(id, notificationData) {
    return await Notification.findByIdAndUpdate(id, notificationData, { new: true, runValidators: true });
  },

  async delete(id) {
    return await Notification.findByIdAndDelete(id);
  },

  async findByUserId(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  },

  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  },

  async markAllAsRead(userId) {
    return await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  },

  async countUnread(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  },
};
