import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    sourceType: { type: String, enum: ['inquiry', 'quotation'], required: true },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ['inquiry', 'quotation', 'approved', 'in_progress', 'completed', 'cancelled'],
      default: 'inquiry',
    },
    tokenHash: { type: String, required: true, unique: true, select: false },
    proposal: { type: String, default: '' },
    quoteAmount: { type: Number, min: 0, default: 0 },
    documents: [{ type: Schema.Types.ObjectId, ref: 'Upload' }],
    updates: [{ text: String, status: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true },
);
schema.index({ sourceType: 1, sourceId: 1 }, { unique: true });
export const ClientProject = model('ClientProject', schema);
