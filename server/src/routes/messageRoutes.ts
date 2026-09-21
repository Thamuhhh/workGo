import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listThreads,
  getThread,
  sendMessage,
  markThreadRead,
  readAllThreads,
} from '../controllers/messageController';

const router = Router();

router.get('/threads', requireAuth, listThreads);
router.get('/read-all', requireAuth, readAllThreads);
router.get('/:jobId', requireAuth, getThread);
router.post('/:jobId', requireAuth, sendMessage);
router.patch('/:jobId/read', requireAuth, markThreadRead);

export default router;