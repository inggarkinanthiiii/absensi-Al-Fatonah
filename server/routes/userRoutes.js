import express from 'express';
import { userController } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.get('/:id', protect, userController.getUserById);
router.post('/', protect, authorize('admin'), userController.createUser);
router.put('/:id', protect, authorize('admin'), userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);
router.patch('/:id/status', protect, authorize('admin'), userController.toggleUserStatus);

export default router;
