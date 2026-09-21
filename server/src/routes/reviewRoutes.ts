import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { createReview, getJobReviews, myReviews } from '../controllers/reviewController';

const router = Router();

router.post('/', requireAuth, requireRole(['worker']), createReview);
router.get('/job/:jobId', getJobReviews);
router.get('/me', requireAuth, myReviews);

export default router;