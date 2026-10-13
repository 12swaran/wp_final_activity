import { listRecords } from '../utils/listRecords';
import { escapeRegex } from '../utils/security';
import { Request, Response } from 'express';
import { Testimonial } from '../models/Testimonial';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getApprovedTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({
      isFeatured: -1,
      createdAt: -1,
    });
    sendSuccess(res, testimonials, 'Approved testimonials retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientName, company, role, rating, reviewText, avatarUrl } = req.body;

    if (!clientName || !company || !reviewText) {
      sendError(res, 'Client name, company, and review text are required.', 400);
      return;
    }

    const review = await Testimonial.create({
      clientName: clientName.trim(),
      company: company.trim(),
      role: role ? role.trim() : 'Client',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      reviewText: reviewText.trim(),
      avatarUrl: avatarUrl || '',
      isApproved: false, // Requires admin moderation
      isFeatured: false,
    });

    sendSuccess(
      res,
      review,
      'Thank you for your feedback! Your review has been submitted for moderation.',
      201,
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAllTestimonialsAdmin = async (req: Request, res: Response): Promise<void> => {
  await listRecords(
    req,
    res,
    Testimonial,
    ['clientName', 'company', 'reviewText'],
    {},
    { createdAt: -1 },
  );
};

export const toggleApproveTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isApproved, isFeatured } = req.body;

    const updateData: any = {};
    if (isApproved !== undefined) updateData.isApproved = Boolean(isApproved);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

    const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!testimonial) {
      sendError(res, 'Testimonial not found.', 404);
      return;
    }

    sendSuccess(res, testimonial, 'Testimonial updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      sendError(res, 'Testimonial not found.', 404);
      return;
    }

    sendSuccess(res, { id }, 'Testimonial deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
