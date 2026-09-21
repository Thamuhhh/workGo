import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getWallet,
  addMoney,
  withdraw,
  setUpi,
  credit,
} from '../controllers/walletController';

const router = Router();

router.get('/', requireAuth, getWallet);
router.post('/add', requireAuth, addMoney);
router.post('/credit', requireAuth, credit);
router.post('/withdraw', requireAuth, withdraw);
router.patch('/upi', requireAuth, setUpi);

export default router;