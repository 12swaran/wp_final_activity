import { Router } from 'express';
import authRoutes from './authRoutes';
import servicesRoutes from './servicesRoutes';
import projectsRoutes from './projectsRoutes';
import pricingRoutes from './pricingRoutes';
import inquiriesRoutes from './inquiriesRoutes';
import quotationsRoutes from './quotationsRoutes';
import appointmentsRoutes from './appointmentsRoutes';
import testimonialsRoutes from './testimonialsRoutes';
import blogRoutes from './blogRoutes';
import faqRoutes from './faqRoutes';
import chatRoutes from './chatRoutes';
import dashboardRoutes from './dashboardRoutes';
import settingsRoutes from './settingsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', servicesRoutes);
router.use('/projects', projectsRoutes);
router.use('/pricing', pricingRoutes);
router.use('/inquiries', inquiriesRoutes);
router.use('/quotations', quotationsRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/testimonials', testimonialsRoutes);
router.use('/blog', blogRoutes);
router.use('/faqs', faqRoutes);
router.use('/chat', chatRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);

export default router;
