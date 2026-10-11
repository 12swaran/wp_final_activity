import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { sendError } from '../utils/apiResponse';

// In-memory cache for recent submission hashes (expires in 3 minutes)
const recentSubmissionsCache = new Map<string, number>();

// Clean up expired cache entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [hash, timestamp] of recentSubmissionsCache.entries()) {
    if (now - timestamp > 3 * 60 * 1000) {
      recentSubmissionsCache.delete(hash);
    }
  }
}, 5 * 60 * 1000);

export const checkHoneypotAndDuplicate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Honeypot check: If the hidden honeypot field is filled, silently ignore spam bot
  if (req.body._hp_company || req.body._hp_website) {
    console.warn(`[Spam Blocked] Honeypot triggered from IP: ${req.ip}`);
    // Respond with success to confuse bot without persisting anything
    res.status(200).json({ success: true, message: 'Submission received successfully' });
    return;
  }

  // 2. Duplicate submission throttling based on payload hash
  const email = (req.body.email || req.body.clientEmail || '').trim().toLowerCase();
  const content = (req.body.message || req.body.description || req.body.serviceType || '').trim().toLowerCase();
  
  if (email && content) {
    const rawString = `${req.ip}_${email}_${content}`;
    const hash = crypto.createHash('sha256').update(rawString).digest('hex');
    const existingTimestamp = recentSubmissionsCache.get(hash);

    if (existingTimestamp && Date.now() - existingTimestamp < 2 * 60 * 1000) { // 2 minute duplicate window
      sendError(res, 'Duplicate submission detected. Please wait a moment before resubmitting.', 429, 'Duplicate Submission');
      return;
    }

    recentSubmissionsCache.set(hash, Date.now());
  }

  next();
};
