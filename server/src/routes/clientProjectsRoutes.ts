import { asyncRouter } from '../utils/asyncRouter';
import { ClientProject } from '../models/ClientProject';
import { Inquiry } from '../models/Inquiry';
import { QuotationRequest } from '../models/QuotationRequest';
import { Upload } from '../models/Upload';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';
import { newToken, hashToken, escapeRegex } from '../utils/security';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = asyncRouter();
router.post('/track', formSubmissionRateLimiter, async (req, res) => {
  const project = await ClientProject.findOne({ tokenHash: hashToken(req.body.token) }).populate(
    'documents',
    'filename mime size',
  );
  if (!project) return void sendError(res, 'Invalid tracking code.', 404);
  sendSuccess(res, project, 'Project retrieved.');
});
router.use(authenticateAdmin);
router.get('/', async (req, res) => {
  const page = Number(req.query.page || 1),
    limit = Number(req.query.limit || 20);
  const query = req.query.search
    ? { title: { $regex: escapeRegex(String(req.query.search)), $options: 'i' } }
    : {};
  const [data, total] = await Promise.all([
    ClientProject.find(query)
      .populate('documents', 'filename mime size')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ClientProject.countDocuments(query),
  ]);
  sendSuccess(res, data, 'Client projects retrieved.', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});
router.post('/', async (req, res) => {
  const { sourceType, sourceId } = req.body;
  const lead =
    sourceType === 'inquiry'
      ? await Inquiry.findById(sourceId)
      : await QuotationRequest.findById(sourceId);
  if (!lead) return void sendError(res, 'Lead not found.', 404);
  const token = newToken();
  try {
    const project = await ClientProject.create({
      sourceType,
      sourceId,
      title: 'subject' in lead ? lead.subject : lead.projectType,
      clientName: lead.name,
      clientEmail: lead.email,
      proposal: (lead as any).proposal || '',
      quoteAmount: (lead as any).estimatedQuote || 0,
      status: sourceType === 'inquiry' ? 'inquiry' : 'quotation',
      tokenHash: hashToken(token),
      ...(sourceType === 'quotation' ? { documents: (lead as any).attachments || [] } : {}),
      updates: [
        {
          text: 'Project created from customer request.',
          status: sourceType === 'inquiry' ? 'inquiry' : 'quotation',
        },
      ],
    });
    sendSuccess(res, { project, token }, 'Lead converted. Save this private tracking code.', 201);
  } catch (error: any) {
    sendError(
      res,
      error.code === 11000 ? 'This lead already has a project.' : 'Unable to convert lead.',
      error.code === 11000 ? 409 : 500,
    );
  }
});
router.put('/:id', async (req, res) => {
  const project = await ClientProject.findById(req.params.id);
  if (!project) return void sendError(res, 'Project not found.', 404);
  if (req.body.documents) {
    const files = await Upload.find({ _id: { $in: req.body.documents }, visibility: 'private' });
    if (files.length !== new Set(req.body.documents).size)
      return void sendError(res, 'Invalid project document.', 400);
    // Files already claimed by another request cannot be attached to this client.
    if (
      files.some(
        (file) =>
          file.owner &&
          ![String(project._id), String(project.sourceId)].includes(String(file.owner)),
      )
    )
      return void sendError(res, 'Document belongs to another client.', 403);
    await Upload.updateMany(
      { _id: { $in: req.body.documents } },
      { $set: { owner: project._id }, $unset: { expiresAt: 1 } },
    );
    project.documents = req.body.documents;
  }
  for (const key of ['status', 'proposal', 'quoteAmount'] as const)
    if (req.body[key] !== undefined) (project as any)[key] = req.body[key];
  if (req.body.update || req.body.status)
    project.updates.push({
      text: req.body.update || `Status updated to ${project.status}.`,
      status: project.status,
      at: new Date(),
    });
  await project.save();
  sendSuccess(res, project, 'Project updated.');
});
router.post('/:id/tracking-code', async (req, res) => {
  const token = newToken();
  const project = await ClientProject.findByIdAndUpdate(req.params.id, {
    tokenHash: hashToken(token),
  });
  if (!project) return void sendError(res, 'Project not found.', 404);
  sendSuccess(res, { token }, 'New code created. The old code no longer works.');
});
export default router;
