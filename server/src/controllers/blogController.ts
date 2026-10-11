import { Request, Response } from 'express';
import { BlogPost } from '../models/BlogPost';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { slugify } from '../utils/slugify';

export const getPublishedPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag, search, page = '1', limit = '9' } = req.query;

    const query: any = { isPublished: true };
    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: String(search), $options: 'i' } },
        { summary: { $regex: String(search), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      BlogPost.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limitNum),
      BlogPost.countDocuments(query),
    ]);

    sendSuccess(res, posts, 'Blog posts retrieved successfully.', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const post = await BlogPost.findOne({ slug, isPublished: true });
    if (!post) {
      sendError(res, 'Article not found.', 404);
      return;
    }
    sendSuccess(res, post, 'Article retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAllPostsAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    sendSuccess(res, posts, 'All articles retrieved for admin.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const createBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, summary, content, coverImage, author, tags, readTimeMinutes, isPublished } = req.body;

    if (!title || !summary || !content) {
      sendError(res, 'Title, summary, and content are required.', 400);
      return;
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);

    const post = await BlogPost.create({
      title,
      slug: finalSlug,
      summary,
      content,
      coverImage: coverImage || '',
      author: author || 'Teja Web Studio',
      tags: Array.isArray(tags) ? tags : [],
      readTimeMinutes: Number(readTimeMinutes) || 5,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      publishedAt: isPublished ? new Date() : undefined,
    });

    sendSuccess(res, post, 'Article created successfully.', 201);
  } catch (err: any) {
    if (err.code === 11000) {
      sendError(res, 'An article with this slug already exists.', 409);
      return;
    }
    sendError(res, err.message, 500);
  }
};

export const updateBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    }

    const post = await BlogPost.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!post) {
      sendError(res, 'Article not found.', 404);
      return;
    }

    sendSuccess(res, post, 'Article updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) {
      sendError(res, 'Article not found.', 404);
      return;
    }

    sendSuccess(res, { id }, 'Article deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
