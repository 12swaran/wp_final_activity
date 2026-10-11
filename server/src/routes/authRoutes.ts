import { Router } from 'express';
import { loginAdmin, getCurrentAdmin, updateAdminProfile } from '../controllers/authController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginRateLimiter, loginAdmin);
router.get('/me', authenticateAdmin, getCurrentAdmin);
router.put('/profile', authenticateAdmin, updateAdminProfile);

export default router;
