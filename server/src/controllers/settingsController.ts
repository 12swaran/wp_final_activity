import { Request, Response } from 'express';
import { Setting } from '../models/Setting';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    sendSuccess(res, settings, 'Website settings retrieved.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    sendSuccess(res, settings, 'Website settings updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
