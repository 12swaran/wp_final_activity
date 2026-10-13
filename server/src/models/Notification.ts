import { Schema, model } from 'mongoose';
export const Notification = model(
  'Notification',
  new Schema(
    {
      to: { type: String, required: true },
      subject: { type: String, required: true },
      status: { type: String, enum: ['deferred', 'sent', 'failed'], default: 'deferred' },
      error: String,
      referenceId: String,
    },
    { timestamps: true },
  ),
);
