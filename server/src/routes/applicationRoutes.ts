import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  applyToJob,
  myApplications,
  hiredWorkers,
  jobApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';

const router = Router();

router.post('/', requireAuth, requireRole(['worker']), applyToJob);
router.get('/mine', requireAuth, myApplications);
router.get('/hired', requireAuth, requireRole(['employer']), hiredWorkers);
router.get('/job/:jobId', requireAuth, requireRole(['employer']), jobApplications);
router.patch('/:id', requireAuth, updateApplicationStatus);

export default router;