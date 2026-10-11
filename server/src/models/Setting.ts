import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  studioName: string;
  tagline: string;
  contactEmail: string;
  whatsappNumber: string;
  businessHours: {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "18:00"
    workDays: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  };
  slotDurationMinutes: number; // e.g., 30
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    studioName: {
      type: String,
      default: 'Teja Web Studio',
    },
    tagline: {
      type: String,
      default: 'Simple, Affordable Websites for Small Businesses',
    },
    contactEmail: {
      type: String,
      default: 'hello@tejastudio.com',
    },
    whatsappNumber: {
      type: String,
      default: '1234567890',
    },
    businessHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      workDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
    },
    socialLinks: {
      github: { type: String, default: 'https://github.com' },
      linkedin: { type: String, default: 'https://linkedin.com' },
      twitter: { type: String, default: 'https://twitter.com' },
      dribbble: { type: String, default: 'https://dribbble.com' },
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.model<ISetting>('Setting', SettingSchema);
