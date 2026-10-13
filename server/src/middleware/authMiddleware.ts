import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Admin, IAdmin } from '../models/Admin';
import { sendError } from '../utils/apiResponse';

export interface AuthenticatedRequest extends Request {
  user?: IAdmin;
}

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const cookie = req.headers.cookie
        ?.split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith('studio_session='));
      if (cookie) token = cookie.slice('studio_session='.length);
    }
    if (!token) {
      sendError(res, 'Authentication required. No token provided.', 401, 'Unauthorized');
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string };

    // Find admin user in database
    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      sendError(
        res,
        'The administrator account associated with this token no longer exists.',
        401,
        'Unauthorized',
      );
      return;
    }

    req.user = admin;
    next();
  } catch (error: any) {
    sendError(res, 'Invalid or expired authentication token.', 401, 'Unauthorized');
  }
};

export const requireSuperadmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'superadmin')
    return void sendError(res, 'Only the studio owner can change these settings.', 403);
  next();
};
