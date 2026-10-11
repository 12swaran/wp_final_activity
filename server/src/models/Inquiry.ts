import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiryReply {
  replyMessage: string;
  repliedBy: string;
  repliedAt: Date;
}

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  replyHistory: IInquiryReply[];
  ipHash?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
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
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'archived'],
      default: 'new',
    },
    replyHistory: [
      {
        replyMessage: { type: String, required: true },
        repliedBy: { type: String, required: true },
        repliedAt: { type: Date, default: Date.now },
      },
    ],
    ipHash: {
      type: String,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

InquirySchema.index({ status: 1, createdAt: -1 });

export const Inquiry = mongoose.model<IInquiry>('Inquiry', InquirySchema);
