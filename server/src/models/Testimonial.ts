import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  clientName: string;
  company: string;
  role: string;
  avatarUrl?: string;
  rating: number;
  reviewText: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'Founder / Business Owner',
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    reviewText: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

TestimonialSchema.index({ isApproved: 1, isFeatured: 1, createdAt: -1 });

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
