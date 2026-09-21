import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  listJobs,
  getJob,
  myJobs,
  createJob,
  updateJob,
  deleteJob,
  listCategories,
} from '../controllers/jobController';

const router = Router();

router.get('/', listJobs);
router.get('/categories', listCategories);
router.get('/mine', requireAuth, myJobs);
router.get('/:id', getJob);
router.post('/', requireAuth, requireRole(['employer']), createJob);
router.patch('/:id', requireAuth, requireRole(['employer']), updateJob);
router.delete('/:id', requireAuth, requireRole(['employer']), deleteJob);

export default router;