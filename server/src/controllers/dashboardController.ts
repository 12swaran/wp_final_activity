import { Request, Response } from 'express';
import { Inquiry } from '../models/Inquiry';
import { QuotationRequest } from '../models/QuotationRequest';
import { Appointment } from '../models/Appointment';
import { Project } from '../models/Project';
import { Service } from '../models/Service';
import { Testimonial } from '../models/Testimonial';
import { BlogPost } from '../models/BlogPost';
import { ChatConversation } from '../models/ChatConversation';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalInquiries,
      newInquiries,
      totalQuotations,
      newQuotations,
      quotationValues,
      totalAppointments,
      confirmedAppointments,
      todayAppointments,
      totalProjects,
      totalServices,
      totalTestimonials,
      pendingTestimonials,
      totalBlogPosts,
      activeChats,
      recentInquiries,
      recentAppointments,
      recentQuotations,
    ] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      QuotationRequest.countDocuments(),
      QuotationRequest.countDocuments({ status: 'new' }),
      QuotationRequest.aggregate([
        { $group: { _id: null, totalValue: { $sum: '$estimatedQuote' } } },
      ]),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ appointmentDate: todayStr, status: 'confirmed' }),
      Project.countDocuments(),
      Service.countDocuments(),
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ isApproved: false }),
      BlogPost.countDocuments({ isPublished: true }),
      ChatConversation.countDocuments({ status: 'active' }),
      Inquiry.find().sort({ createdAt: -1 }).limit(5),
      Appointment.find().sort({ appointmentDate: 1, startTime: 1 }).limit(5),
      QuotationRequest.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const pipelineValue = quotationValues.length > 0 ? quotationValues[0].totalValue : 0;

    sendSuccess(
      res,
      {
        kpi: {
          inquiries: {
            total: totalInquiries,
            new: newInquiries,
          },
          quotations: {
            total: totalQuotations,
            new: newQuotations,
            pipelineValue,
          },
          appointments: {
            total: totalAppointments,
            confirmed: confirmedAppointments,
            today: todayAppointments,
          },
          content: {
            projects: totalProjects,
            services: totalServices,
            testimonials: totalTestimonials,
            pendingReviews: pendingTestimonials,
            blogPosts: totalBlogPosts,
            activeChats,
          },
        },
        recentActivity: {
          inquiries: recentInquiries,
          appointments: recentAppointments,
          quotations: recentQuotations,
        },
      },
      'Dashboard analytics retrieved successfully.'
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
