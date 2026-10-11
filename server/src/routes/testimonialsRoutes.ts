import { Router } from 'express';
import {
  getApprovedTestimonials,
  submitReview,
  getAllTestimonialsAdmin,
  toggleApproveTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialsController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get('/', getApprovedTestimonials);
router.post('/', formSubmissionRateLimiter, submitReview);

// Admin protected routes
router.get('/admin/all', authenticateAdmin, getAllTestimonialsAdmin);
router.put('/:id/approve', authenticateAdmin, toggleApproveTestimonial);
router.delete('/:id', authenticateAdmin, deleteTestimonial);

export default router;
