import { Router } from 'express';
import {
  submitQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
} from '../controllers/quotationsController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';
import { checkHoneypotAndDuplicate } from '../middleware/idempotency';

const router = Router();

// Public submission
router.post('/', formSubmissionRateLimiter, checkHoneypotAndDuplicate, submitQuotation);

// Admin management
router.get('/', authenticateAdmin, getQuotations);
router.get('/:id', authenticateAdmin, getQuotationById);
router.put('/:id', authenticateAdmin, updateQuotation);
router.delete('/:id', authenticateAdmin, deleteQuotation);

export default router;
