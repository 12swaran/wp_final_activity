import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  isPublished: boolean;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  deliverables: string[];
  startingPrice: number;
  isFeatured: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    isPublished: { type: Boolean, default: true },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    fullDescription: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Globe',
    },
    deliverables: {
      type: [String],
      default: [],
    },
    startingPrice: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

ServiceSchema.index({ orderIndex: 1 });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
