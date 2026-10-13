import { asyncRouter } from '../utils/asyncRouter';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticateAdmin, requireSuperadmin } from '../middleware/authMiddleware';

const router = asyncRouter();

router.get('/', getSettings);
router.put('/', authenticateAdmin, requireSuperadmin, updateSettings);

export default router;
