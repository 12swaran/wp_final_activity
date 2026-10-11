import { Request, Response } from 'express';
import { FAQ } from '../models/FAQ';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getActiveFAQs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ category: 1, orderIndex: 1 });
    sendSuccess(res, faqs, 'FAQs retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAllFAQsAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await FAQ.find().sort({ orderIndex: 1 });
    sendSuccess(res, faqs, 'All FAQs retrieved.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const createFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, category, orderIndex, isActive } = req.body;

    if (!question || !answer) {
      sendError(res, 'Question and answer are required.', 400);
      return;
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      category: category ? category.trim() : 'General',
      orderIndex: Number(orderIndex) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    sendSuccess(res, faq, 'FAQ created successfully.', 201);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
    if (!faq) {
      sendError(res, 'FAQ not found.', 404);
      return;
    }
    sendSuccess(res, faq, 'FAQ updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) {
      sendError(res, 'FAQ not found.', 404);
      return;
    }
    sendSuccess(res, { id }, 'FAQ deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
