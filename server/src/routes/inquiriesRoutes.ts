import { Router } from 'express';
import {
  submitInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  replyToInquiry,
  deleteInquiry,
} from '../controllers/inquiriesController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';
import { checkHoneypotAndDuplicate } from '../middleware/idempotency';

const router = Router();

// Public submission
router.post('/', formSubmissionRateLimiter, checkHoneypotAndDuplicate, submitInquiry);

// Admin management
router.get('/', authenticateAdmin, getInquiries);
router.get('/:id', authenticateAdmin, getInquiryById);
router.put('/:id/status', authenticateAdmin, updateInquiryStatus);
router.post('/:id/reply', authenticateAdmin, replyToInquiry);
router.delete('/:id', authenticateAdmin, deleteInquiry);

export default router;
