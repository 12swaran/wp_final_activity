import { listRecords } from '../utils/listRecords';
import { asyncRouter } from '../utils/asyncRouter';
import { Service } from '../models/Service';
import {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
} from '../controllers/servicesController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = asyncRouter();

// Public routes
router.get('/', getServices);
router.get('/admin/all', authenticateAdmin, async (_req, res) => {
  await listRecords(_req, res, Service, ['title', 'shortDescription'], {}, { orderIndex: 1 });
});
router.get('/:slug', getServiceBySlug);

// Admin protected routes
router.post('/', authenticateAdmin, createService);
router.put('/:id', authenticateAdmin, updateService);
router.delete('/:id', authenticateAdmin, deleteService);

export default router;
