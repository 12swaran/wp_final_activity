import { Inquiry } from '../models/Inquiry';
import { csvCell, escapeRegex } from '../utils/security';
import { asyncRouter } from '../utils/asyncRouter';
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

const router = asyncRouter();

// Public submission
router.post('/', formSubmissionRateLimiter, checkHoneypotAndDuplicate, submitInquiry);

// Admin management
router.get('/', authenticateAdmin, getInquiries);
router.get('/export', authenticateAdmin, async (req, res) => {
  const query: any = {};
  if (req.query.status && req.query.status !== 'all') query.status = String(req.query.status);
  if (req.query.search)
    query.$or = ['name', 'email', 'subject'].map((field) => ({
      [field]: { $regex: escapeRegex(String(req.query.search)), $options: 'i' },
    }));
  res.type('text/csv').attachment('inquiries.csv');
  res.write('Name,Email,Phone,Business type,Service,Budget,Subject,Message,Status,Created\r\n');
  for await (const row of Inquiry.find(query).sort({ createdAt: -1 }).cursor()) {
    if (res.destroyed) break;
    const written = res.write(
      [
        row.name,
        row.email,
        row.phone,
        row.businessType,
        row.service,
        row.budget,
        row.subject,
        row.message,
        row.status,
        row.createdAt.toISOString(),
      ]
        .map(csvCell)
        .join(',') + '\r\n',
    );
    if (!written && !res.destroyed)
      await new Promise<void>((resolve) => {
        const done = () => {
          res.off('drain', done);
          res.off('close', done);
          resolve();
        };
        res.once('drain', done);
        res.once('close', done);
      });
  }
  res.end();
});
router.get('/:id', authenticateAdmin, getInquiryById);
router.put('/:id/status', authenticateAdmin, updateInquiryStatus);
router.post('/:id/reply', authenticateAdmin, replyToInquiry);
router.delete('/:id', authenticateAdmin, deleteInquiry);

export default router;
