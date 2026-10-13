import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogPost extends Document {
  seoTitle: string;
  seoDescription: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  readTimeMinutes: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
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
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: 'Teja Web Studio',
    },
    tags: {
      type: [String],
      default: [],
    },
    readTimeMinutes: {
      type: Number,
      default: 5,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

BlogPostSchema.index({ isPublished: 1, publishedAt: -1 });

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
