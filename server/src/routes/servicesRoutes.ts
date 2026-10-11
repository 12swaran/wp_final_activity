import { Router } from 'express';
import { getServices, getServiceBySlug, createService, updateService, deleteService } from '../controllers/servicesController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getServices);
router.get('/:slug', getServiceBySlug);

// Admin protected routes
router.post('/', authenticateAdmin, createService);
router.put('/:id', authenticateAdmin, updateService);
router.delete('/:id', authenticateAdmin, deleteService);

export default router;
