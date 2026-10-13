import { asyncRouter } from '../utils/asyncRouter';
import { loginAdmin, getCurrentAdmin, updateAdminProfile } from '../controllers/authController';
import { authenticateAdmin, requireSuperadmin } from '../middleware/authMiddleware';
import { loginRateLimiter } from '../middleware/rateLimiter';

import { Admin } from '../models/Admin';
import bcrypt from 'bcryptjs';
const router = asyncRouter();
router.post('/logout', (_req, res) => {
  res.clearCookie('studio_session', { path: '/' });
  res.json({ success: true });
});
router.get('/users', authenticateAdmin, requireSuperadmin, async (_req, res) => {
  res.json({ success: true, data: await Admin.find().select('-passwordHash') });
});
router.post('/users', authenticateAdmin, requireSuperadmin, async (req, res) => {
  const user = await Admin.create({
    email: req.body.email,
    fullName: req.body.fullName,
    role: req.body.role,
    passwordHash: await bcrypt.hash(req.body.password, 12),
  });
  res
    .status(201)
    .json({ success: true, data: { id: user._id, email: user.email, role: user.role } });
});

router.post('/login', loginRateLimiter, loginAdmin);
router.get('/me', authenticateAdmin, getCurrentAdmin);
router.put('/profile', authenticateAdmin, updateAdminProfile);

export default router;
