import { asyncRouter } from '../utils/asyncRouter';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = asyncRouter();

router.get('/stats', authenticateAdmin, getDashboardStats);

export default router;
