import { Schema, model } from 'mongoose';
const schema = new Schema(
  {
    filename: { type: String, required: true },
    mime: { type: String, required: true },
    content: { type: Buffer, required: true, select: false },
    size: { type: Number, required: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    claimHash: { type: String, select: false },
    owner: { type: Schema.Types.ObjectId },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Upload = model('Upload', schema);
