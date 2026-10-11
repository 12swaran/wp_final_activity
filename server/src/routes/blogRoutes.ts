import { Router } from 'express';
import {
  getPublishedPosts,
  getPostBySlug,
  getAllPostsAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../controllers/blogController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getPublishedPosts);
router.get('/:slug', getPostBySlug);

// Admin protected routes
router.get('/admin/all', authenticateAdmin, getAllPostsAdmin);
router.post('/', authenticateAdmin, createBlogPost);
router.put('/:id', authenticateAdmin, updateBlogPost);
router.delete('/:id', authenticateAdmin, deleteBlogPost);

export default router;
