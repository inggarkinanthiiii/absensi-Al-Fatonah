import express from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, notificationController.getAllNotifications);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.get('/:id', protect, notificationController.getNotificationById);
router.patch('/:id/read', protect, notificationController.markAsRead);
router.patch('/read-all', protect, notificationController.markAllAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);

export default router;
