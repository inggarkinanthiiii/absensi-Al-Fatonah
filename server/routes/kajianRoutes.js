import express from 'express';
import { kajianController } from '../controllers/kajianController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateKajian } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.get('/location/main', protect, authorize('admin'), kajianController.getMainLocation);
router.put('/location/main', protect, authorize('admin'), kajianController.saveMainLocation);
router.get('/', protect, kajianController.getAllKajian);
router.get('/:id', protect, kajianController.getKajianById);
router.post('/', protect, authorize('admin'), validateKajian, kajianController.createKajian);
router.put('/:id', protect, authorize('admin'), validateKajian, kajianController.updateKajian);
router.delete('/:id', protect, authorize('admin'), kajianController.deleteKajian);
router.patch('/:id/status', protect, authorize('admin'), kajianController.toggleKajianStatus);

export default router;
