import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import jobRoutes from './jobRoutes';
import walletRoutes from './walletRoutes';
import applicationRoutes from './applicationRoutes';
import messageRoutes from './messageRoutes';
import notificationRoutes from './notificationRoutes';
import reviewRoutes from './reviewRoutes';

const router = Router();

// Health Check
router.use('/health', healthRoutes);

// Auth
router.use('/auth', authRoutes);

// Jobs
router.use('/jobs', jobRoutes);

// Wallet
router.use('/wallet', walletRoutes);

// Applications
router.use('/applications', applicationRoutes);

// Messages
router.use('/messages', messageRoutes);

// Notifications
router.use('/notifications', notificationRoutes);

// Reviews
router.use('/reviews', reviewRoutes);

// Root API ping
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to WorkGo API v1. "Work nearby. Earn today."',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      jobs: '/api/v1/jobs',
      applications: '/api/v1/applications',
      bookings: '/api/v1/bookings',
      users: '/api/v1/users',
      categories: '/api/v1/categories',
      reviews: '/api/v1/reviews',
      notifications: '/api/v1/notifications',
      reports: '/api/v1/reports',
    },
  });
});

export default router;
