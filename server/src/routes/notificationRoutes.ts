import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listNotifications,
  markRead,
  markAllRead,
} from '../controllers/notificationController';

const router = Router();

router.get('/', requireAuth, listNotifications);
router.patch('/read-all', requireAuth, markAllRead);
router.patch('/:id/read', requireAuth, markRead);

export default router;