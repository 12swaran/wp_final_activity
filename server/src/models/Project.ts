import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  category: string;
  clientName: string;
  resultStat: string;
  featuredImage: string;
  galleryImages: string[];
  liveUrl: string;
  githubUrl?: string;
  technologies: string[];
  caseStudyMarkdown: string;
  isFeatured: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
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
    category: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    resultStat: {
      type: String,
      default: '',
    },
    featuredImage: {
      type: String,
      required: true,
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    liveUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    caseStudyMarkdown: {
      type: String,
      default: '',
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

ProjectSchema.index({ category: 1, orderIndex: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
