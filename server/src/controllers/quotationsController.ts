import { Request, Response } from 'express';
import { QuotationRequest } from '../models/QuotationRequest';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { sendEmail, emailTemplates } from '../services/emailService';
import { env } from '../config/env';

export const submitQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      company,
      projectType,
      budgetRange,
      timeline,
      requiredFeatures,
      description,
      idempotencyKey,
    } = req.body;

    if (!name || !email || !projectType || !budgetRange || !timeline || !description) {
      sendError(res, 'Name, email, project type, budget range, timeline, and description are required.', 400);
      return;
    }

    const quotation = await QuotationRequest.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      company: company ? company.trim() : '',
      projectType,
      budgetRange,
      timeline,
      requiredFeatures: Array.isArray(requiredFeatures) ? requiredFeatures : [],
      description: description.trim(),
      status: 'new',
      idempotencyKey,
    });

    // Send confirmation email to client
    const confirmation = emailTemplates.quotationConfirmation(quotation.name, quotation.projectType, quotation.budgetRange);
    sendEmail({
      to: quotation.email,
      subject: confirmation.subject,
      html: confirmation.html,
    }).catch((err) => console.error('[Email Error] Quotation confirmation failed:', err.message));

    // Send alert to admin
    const adminAlert = emailTemplates.adminNewNotification(
      'Quotation Request',
      `Client: ${quotation.name} (${quotation.email})\nCompany: ${quotation.company || 'N/A'}\nPhone: ${quotation.phone || 'N/A'}\nProject: ${quotation.projectType}\nBudget: ${quotation.budgetRange}\nTimeline: ${quotation.timeline}\nFeatures: ${quotation.requiredFeatures.join(', ')}\nDescription: ${quotation.description}`
    );
    sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: adminAlert.subject,
      html: adminAlert.html,
    }).catch((err) => console.error('[Email Error] Admin notification failed:', err.message));

    sendSuccess(res, { id: quotation._id }, 'Your quotation request has been received. We will prepare your proposal within 24-48 hours!', 201);
  } catch (err: any) {
    if (err.code === 11000) {
      sendSuccess(res, { message: 'Quotation request already received.' }, 'Your proposal request has already been recorded.');
      return;
    }
    sendError(res, err.message, 500);
  }
};

export const getQuotations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '15' } = req.query;

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { email: { $regex: String(search), $options: 'i' } },
        { company: { $regex: String(search), $options: 'i' } },
        { projectType: { $regex: String(search), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;

    const [quotations, total] = await Promise.all([
      QuotationRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      QuotationRequest.countDocuments(query),
    ]);

    sendSuccess(res, quotations, 'Quotations retrieved successfully.', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getQuotationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const quotation = await QuotationRequest.findById(id);
    if (!quotation) {
      sendError(res, 'Quotation not found.', 404);
      return;
    }
    sendSuccess(res, quotation, 'Quotation retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, estimatedQuote, notes } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (estimatedQuote !== undefined) updateData.estimatedQuote = Number(estimatedQuote);
    if (notes !== undefined) updateData.notes = notes;

    const quotation = await QuotationRequest.findByIdAndUpdate(id, updateData, { new: true });
    if (!quotation) {
      sendError(res, 'Quotation not found.', 404);
      return;
    }

    sendSuccess(res, quotation, 'Quotation updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const quotation = await QuotationRequest.findByIdAndDelete(id);
    if (!quotation) {
      sendError(res, 'Quotation not found.', 404);
      return;
    }
    sendSuccess(res, { id }, 'Quotation deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
