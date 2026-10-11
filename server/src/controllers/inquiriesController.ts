import { Request, Response } from 'express';
import { Inquiry } from '../models/Inquiry';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { sendEmail, emailTemplates } from '../services/emailService';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const submitInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message, idempotencyKey } = req.body;

    if (!name || !email || !subject || !message) {
      sendError(res, 'Name, email, subject, and message are required.', 400);
      return;
    }

    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      idempotencyKey,
    });

    // Send confirmation email to user asynchronously
    const confirmation = emailTemplates.inquiryConfirmation(inquiry.name, inquiry.subject);
    sendEmail({
      to: inquiry.email,
      subject: confirmation.subject,
      html: confirmation.html,
    }).catch((err) => console.error('[Email Error] Inquiry confirmation failed:', err.message));

    // Send admin alert
    const adminAlert = emailTemplates.adminNewNotification(
      'Contact Inquiry',
      `From: ${inquiry.name} (${inquiry.email})\nPhone: ${inquiry.phone || 'N/A'}\nSubject: ${inquiry.subject}\nMessage: ${inquiry.message}`
    );
    sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: adminAlert.subject,
      html: adminAlert.html,
    }).catch((err) => console.error('[Email Error] Admin notification failed:', err.message));

    sendSuccess(res, { id: inquiry._id }, 'Your inquiry has been submitted successfully. We will get back to you shortly!', 201);
  } catch (err: any) {
    if (err.code === 11000) {
      sendSuccess(res, { message: 'Submission already received.' }, 'Your inquiry has already been received.');
      return;
    }
    sendError(res, err.message, 500);
  }
};

export const getInquiries = async (req: Request, res: Response): Promise<void> => {
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
        { subject: { $regex: String(search), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Inquiry.countDocuments(query),
    ]);

    sendSuccess(res, inquiries, 'Inquiries retrieved successfully.', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getInquiryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      sendError(res, 'Inquiry not found.', 404);
      return;
    }
    sendSuccess(res, inquiry, 'Inquiry retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'in_progress', 'resolved', 'archived'].includes(status)) {
      sendError(res, 'Invalid status value.', 400);
      return;
    }

    const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!inquiry) {
      sendError(res, 'Inquiry not found.', 404);
      return;
    }

    sendSuccess(res, inquiry, 'Inquiry status updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const replyToInquiry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      sendError(res, 'Reply message cannot be empty.', 400);
      return;
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      sendError(res, 'Inquiry not found.', 404);
      return;
    }

    const repliedBy = req.user?.fullName || 'Studio Admin';

    // Append reply to history and set status to in_progress
    inquiry.replyHistory.push({
      replyMessage: replyMessage.trim(),
      repliedBy,
      repliedAt: new Date(),
    });

    if (inquiry.status === 'new') {
      inquiry.status = 'in_progress';
    }

    await inquiry.save();

    // Send email to client
    await sendEmail({
      to: inquiry.email,
      subject: `Reply: ${inquiry.subject} — Teja Web Studio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background: #f8fafc; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Teja Web Studio</h2>
          <p>Hi ${inquiry.name},</p>
          <div style="background: #ffffff; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0; border-radius: 4px;">
            ${replyMessage.replace(/\n/g, '<br/>')}
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="color: #64748b; font-size: 13px;">Original message:<br/><em>${inquiry.message}</em></p>
          <p>Best regards,<br/><strong>${repliedBy}</strong><br/>Teja Web Studio</p>
        </div>
      `,
    });

    sendSuccess(res, inquiry, 'Reply sent and logged successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findByIdAndDelete(id);
    if (!inquiry) {
      sendError(res, 'Inquiry not found.', 404);
      return;
    }
    sendSuccess(res, { id }, 'Inquiry deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
