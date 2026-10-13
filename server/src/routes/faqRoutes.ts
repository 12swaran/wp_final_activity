import { asyncRouter } from '../utils/asyncRouter';
import {
  getActiveFAQs,
  getAllFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../controllers/faqController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = asyncRouter();

// Public routes
router.get('/', getActiveFAQs);

// Admin protected routes
router.get('/admin/all', authenticateAdmin, getAllFAQsAdmin);
router.post('/', authenticateAdmin, createFAQ);
router.put('/:id', authenticateAdmin, updateFAQ);
router.delete('/:id', authenticateAdmin, deleteFAQ);

export default router;
