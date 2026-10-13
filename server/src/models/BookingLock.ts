import { Schema, model } from 'mongoose';
const schema = new Schema({
  date: { type: String, required: true },
  minute: { type: Number, required: true },
  appointmentId: { type: Schema.Types.ObjectId, required: true },
});
schema.index({ date: 1, minute: 1 }, { unique: true });
export const BookingLock = model('BookingLock', schema);
