import { asyncRouter } from '../utils/asyncRouter';
import {
  getPricingPlans,
  getAllPricingPlansAdmin,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
} from '../controllers/pricingController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = asyncRouter();

// Public routes
router.get('/', getPricingPlans);

// Admin protected routes
router.get('/admin/all', authenticateAdmin, getAllPricingPlansAdmin);
router.post('/', authenticateAdmin, createPricingPlan);
router.put('/:id', authenticateAdmin, updatePricingPlan);
router.delete('/:id', authenticateAdmin, deletePricingPlan);

export default router;
