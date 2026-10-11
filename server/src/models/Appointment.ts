import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType: string;
  appointmentDate: string; // Stored as 'YYYY-MM-DD' for exact timezone-agnostic slot indexing
  startTime: string; // 'HH:mm', e.g., '14:00'
  endTime: string; // 'HH:mm', e.g., '14:30'
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  meetingLink?: string;
  notes?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      default: '',
      trim: true,
    },
    serviceType: {
      type: String,
      required: true,
      default: 'Discovery Consultation (30 mins)',
    },
    appointmentDate: {
      type: String,
      required: true, // format: 'YYYY-MM-DD'
      index: true,
    },
    startTime: {
      type: String,
      required: true, // format: 'HH:mm'
    },
    endTime: {
      type: String,
      required: true, // format: 'HH:mm'
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/sample-discovery-call',
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
  }
);

// Compound Partial Index to strictly prevent conflicting double bookings for active slots
AppointmentSchema.index(
  { appointmentDate: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['confirmed', 'pending'] } },
  }
);

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
