import mongoose, { Document, Schema } from 'mongoose';

export interface IQuotationRequest extends Document {
  businessType?: string;
  attachments: mongoose.Types.ObjectId[];
  proposal: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  requiredFeatures: string[];
  description: string;
  status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined';
  estimatedQuote?: number;
  notes?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationRequestSchema = new Schema<IQuotationRequest>(
  {
    businessType: String,
    attachments: [{ type: Schema.Types.ObjectId, ref: 'Upload' }],
    proposal: { type: String, default: '' },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    projectType: {
      type: String,
      required: true,
    },
    budgetRange: {
      type: String,
      required: true,
    },
    timeline: {
      type: String,
      required: true,
    },
    requiredFeatures: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'quoted', 'accepted', 'declined'],
      default: 'new',
    },
    estimatedQuote: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

QuotationRequestSchema.index({ status: 1, createdAt: -1 });

export const QuotationRequest = mongoose.model<IQuotationRequest>(
  'QuotationRequest',
  QuotationRequestSchema,
);
