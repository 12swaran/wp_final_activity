import { asyncRouter } from '../utils/asyncRouter';
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectsController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = asyncRouter();

// Public routes
router.get('/', getProjects);
router.get('/:slug', getProjectBySlug);

// Admin protected routes
router.post('/', authenticateAdmin, createProject);
router.put('/:id', authenticateAdmin, updateProject);
router.delete('/:id', authenticateAdmin, deleteProject);

export default router;
