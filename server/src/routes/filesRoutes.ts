import { asyncRouter } from '../utils/asyncRouter';
import mongoose from 'mongoose';
import { Upload } from '../models/Upload';
import { ClientProject } from '../models/ClientProject';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';
import { newToken, hashToken } from '../utils/security';
import { validateFile } from '../utils/fileRules';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = asyncRouter();
router.post('/', formSubmissionRateLimiter, async (req, res, next) => {
  const save = async () => {
    try {
      const { filename, mime, base64, visibility } = req.body;
      const checked = validateFile(filename, mime, base64);
      if (visibility === 'public' && mime === 'application/pdf')
        return void sendError(res, 'Public uploads must be images.', 400);
      const token = newToken();
      const file = await Upload.create({
        ...checked,
        mime,
        visibility,
        size: checked.content.length,
        claimHash: hashToken(token),
        ...(visibility === 'private' && !req.headers.authorization
          ? { expiresAt: new Date(Date.now() + 86400000) }
          : {}),
      });
      sendSuccess(
        res,
        { fileId: file._id, filename: file.filename, token, url: `/api/files/${file._id}` },
        'File uploaded.',
        201,
      );
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  };
  if (req.body.visibility === 'public' || req.headers.authorization)
    await authenticateAdmin(req, res, () => {
      void save();
    });
  else await save();
});
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return void sendError(res, 'Invalid file ID.', 400);
  const serve = async () => {
    try {
      const file = await Upload.findById(req.params.id).select('+content');
      if (!file) return void sendError(res, 'File not found.', 404);
      if (file.visibility === 'private' && req.headers['x-project-token']) {
        const project = await ClientProject.findOne({
          tokenHash: hashToken(String(req.headers['x-project-token'])),
          documents: file._id,
        });
        if (!project) return void sendError(res, 'File access denied.', 403);
      }
      res.setHeader('Content-Type', file.mime);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader(
        'Content-Disposition',
        `${file.visibility === 'private' ? 'attachment' : 'inline'}; filename="${file.filename}"`,
      );
      res.setHeader(
        'Cache-Control',
        file.visibility === 'private' ? 'no-store' : 'public, max-age=3600',
      );
      res.send(file.content);
    } catch {
      sendError(res, 'Unable to retrieve file.', 500);
    }
  };
  try {
    const info = await Upload.findById(req.params.id);
    if (!info) return void sendError(res, 'File not found.', 404);
    if (info.visibility === 'public' || req.headers['x-project-token']) await serve();
    else
      await authenticateAdmin(req, res, () => {
        void serve();
      });
  } catch {
    sendError(res, 'Unable to retrieve file.', 500);
  }
});
export default router;
