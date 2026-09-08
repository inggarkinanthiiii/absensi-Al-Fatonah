import express from 'express';
import { faceDataController } from '../controllers/faceDataController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/user/:userId', protect, faceDataController.getFaceDataByUserId);
router.post('/', protect, faceDataController.createFaceData);
router.put('/:id', protect, faceDataController.updateFaceData);
router.delete('/user/:userId', protect, faceDataController.deactivateFaceData);
router.delete('/:id', protect, faceDataController.deleteFaceData);

export default router;
