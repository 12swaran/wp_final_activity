import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { sendSuccess } from './apiResponse';
import { escapeRegex } from './security';
export const listRecords = async (
  req: Request,
  res: Response,
  model: Model<any>,
  fields: string[],
  query: any = {},
  sort: any = { createdAt: -1 },
) => {
  if (req.query.search)
    query.$or = fields.map((field) => ({
      [field]: { $regex: escapeRegex(String(req.query.search)), $options: 'i' },
    }));
  if (!req.query.page) {
    sendSuccess(res, await model.find(query).sort(sort));
    return;
  }
  const page = Number(req.query.page || 1),
    limit = Number(req.query.limit || 20);
  const [data, total] = await Promise.all([
    model
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    model.countDocuments(query),
  ]);
  sendSuccess(res, data, 'Records retrieved.', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
};
