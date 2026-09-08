import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import kajianRoutes from './routes/kajianRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import faceDataRoutes from './routes/faceDataRoutes.js';
import absensiRoutes from './routes/absensiRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kajian', kajianRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/facedata', faceDataRoutes);
app.use('/api/absensi', absensiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
