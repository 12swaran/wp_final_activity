import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { slugify } from '../utils/slugify';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = '1', limit = '12' } = req.query;

    const query: any = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: String(search), $options: 'i' } },
        { clientName: { $regex: String(search), $options: 'i' } },
        { technologies: { $in: [new RegExp(String(search), 'i')] } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ orderIndex: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Project.countDocuments(query),
    ]);

    sendSuccess(res, projects, 'Projects retrieved successfully.', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getProjectBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({ slug });
    if (!project) {
      sendError(res, 'Project not found.', 404);
      return;
    }
    sendSuccess(res, project, 'Project retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, category, clientName, resultStat, featuredImage, galleryImages, liveUrl, githubUrl, technologies, caseStudyMarkdown, isFeatured, orderIndex } = req.body;

    if (!title || !category || !clientName || !featuredImage) {
      sendError(res, 'Title, category, client name, and featured image are required.', 400);
      return;
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);

    const existing = await Project.findOne({ slug: finalSlug });
    if (existing) {
      sendError(res, `A project with slug "${finalSlug}" already exists.`, 409);
      return;
    }

    const project = await Project.create({
      title,
      slug: finalSlug,
      category,
      clientName,
      resultStat: resultStat || '',
      featuredImage,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      technologies: Array.isArray(technologies) ? technologies : [],
      caseStudyMarkdown: caseStudyMarkdown || '',
      isFeatured: Boolean(isFeatured),
      orderIndex: Number(orderIndex) || 0,
    });

    sendSuccess(res, project, 'Project created successfully.', 201);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    } else if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
    }

    const project = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!project) {
      sendError(res, 'Project not found.', 404);
      return;
    }

    sendSuccess(res, project, 'Project updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      sendError(res, 'Project not found.', 404);
      return;
    }

    sendSuccess(res, { id }, 'Project deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
