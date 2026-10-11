import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';
import { env } from '../config/env';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Please provide both email and password.', 400, 'Bad Request');
      return;
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      sendError(res, 'Invalid email or password credentials.', 401, 'Unauthorized');
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password credentials.', 401, 'Unauthorized');
      return;
    }

    // Update lastLogin
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    sendSuccess(
      res,
      {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          lastLogin: admin.lastLogin,
        },
      },
      'Admin logged in successfully.'
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getCurrentAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    sendSuccess(
      res,
      {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
      },
      'Current admin retrieved.'
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateAdminProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const { fullName, email, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      sendError(res, 'Admin not found', 404);
      return;
    }

    if (fullName) admin.fullName = fullName.trim();
    if (email) admin.email = email.toLowerCase().trim();

    if (newPassword) {
      if (!currentPassword) {
        sendError(res, 'Current password is required to set a new password.', 400);
        return;
      }

      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        sendError(res, 'Current password is incorrect.', 400);
        return;
      }

      admin.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();

    sendSuccess(
      res,
      {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
      'Admin profile updated successfully.'
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
