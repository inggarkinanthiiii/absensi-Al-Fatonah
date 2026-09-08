import express from 'express';
import { absensiController } from '../controllers/absensiController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, absensiController.getAllAbsensi);
router.post('/', protect, absensiController.createAbsensi);
router.get('/kajian/:kajianId', protect, absensiController.getAbsensiByKajian);
router.get('/user/:userId', protect, absensiController.getAbsensiByUser);
router.get('/stats/:kajianId', protect, absensiController.getAbsensiStats);
router.get('/rekap/:kajianId', protect, authorize('admin'), absensiController.getAttendanceRekap);
router.delete('/:id', protect, authorize('admin'), absensiController.deleteAbsensi);

export default router;
