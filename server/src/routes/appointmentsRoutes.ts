import { asyncRouter } from '../utils/asyncRouter';
import {
  manageAppointment,
  rotateAppointmentCode,
  getAvailableSlots,
  bookAppointment,
  getAppointmentsAdmin,
  updateAppointment,
  cancelAppointment,
} from '../controllers/appointmentsController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';
import { checkHoneypotAndDuplicate } from '../middleware/idempotency';

const router = asyncRouter();

// Public routes
router.post('/manage', formSubmissionRateLimiter, manageAppointment);
router.post('/:id/management-code', authenticateAdmin, rotateAppointmentCode);
router.get('/available-slots', getAvailableSlots);
router.post('/', formSubmissionRateLimiter, checkHoneypotAndDuplicate, bookAppointment);

// Admin protected routes
router.get('/', authenticateAdmin, getAppointmentsAdmin);
router.put('/:id', authenticateAdmin, updateAppointment);
router.delete('/:id', authenticateAdmin, cancelAppointment);

export default router;
