import { asyncRouter } from '../utils/asyncRouter';
import {
  initOrGetSession,
  getSessionMessages,
  sendClientMessage,
  getAdminConversations,
  sendAdminReply,
  closeConversation,
} from '../controllers/chatController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = asyncRouter();

// Public routes for client chat box widget
router.post('/session', initOrGetSession);
router.get('/:sessionId/messages', getSessionMessages);
router.post('/:sessionId/message', sendClientMessage);

// Admin protected routes
router.get('/admin/conversations', authenticateAdmin, getAdminConversations);
router.post('/admin/:sessionId/reply', authenticateAdmin, sendAdminReply);
router.put('/admin/:sessionId/close', authenticateAdmin, closeConversation);

export default router;
