import { Request, Response } from 'express';
import { Service } from '../models/Service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { slugify } from '../utils/slugify';

export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find().sort({ orderIndex: 1, createdAt: 1 });
    sendSuccess(res, services, 'Services retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getServiceBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const service = await Service.findOne({ slug });
    if (!service) {
      sendError(res, 'Service not found.', 404);
      return;
    }
    sendSuccess(res, service, 'Service retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, shortDescription, fullDescription, icon, deliverables, startingPrice, isFeatured, orderIndex } = req.body;
    
    if (!title || !shortDescription) {
      sendError(res, 'Title and short description are required.', 400);
      return;
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);

    const existing = await Service.findOne({ slug: finalSlug });
    if (existing) {
      sendError(res, `A service with slug "${finalSlug}" already exists.`, 409);
      return;
    }

    const service = await Service.create({
      title,
      slug: finalSlug,
      shortDescription,
      fullDescription: fullDescription || '',
      icon: icon || 'Globe',
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      startingPrice: Number(startingPrice) || 0,
      isFeatured: Boolean(isFeatured),
      orderIndex: Number(orderIndex) || 0,
    });

    sendSuccess(res, service, 'Service created successfully.', 201);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    } else if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
    }

    const service = await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!service) {
      sendError(res, 'Service not found.', 404);
      return;
    }

    sendSuccess(res, service, 'Service updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      sendError(res, 'Service not found.', 404);
      return;
    }

    sendSuccess(res, { id }, 'Service deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
