import mongoose, { Document, Schema } from 'mongoose';

export interface IPricingPlan extends Document {
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  description: string;
  badge?: string;
  isPopular: boolean;
  features: string[];
  ctaText: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    name: {
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
    price: {
      type: Number,
      required: true,
    },
    billingCycle: {
      type: String,
      default: 'one-time',
    },
    description: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      default: '',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    features: {
      type: [String],
      default: [],
    },
    ctaText: {
      type: String,
      default: 'Get Started',
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

PricingPlanSchema.index({ orderIndex: 1 });

export const PricingPlan = mongoose.model<IPricingPlan>('PricingPlan', PricingPlanSchema);
