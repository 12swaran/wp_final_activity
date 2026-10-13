import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  sender: 'client' | 'admin';
  senderName?: string;
  message: string;
  sentAt: Date;
  isRead: boolean;
}

export interface IChatConversation extends Document {
  sessionId: string;
  clientName: string;
  clientEmail?: string;
  status: 'active' | 'closed';
  messages: IChatMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sender: {
      type: String,
      enum: ['client', 'admin'],
      required: true,
    },
    senderName: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientName: {
      type: String,
      default: 'Website Guest',
      trim: true,
    },
    clientEmail: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    messages: [ChatMessageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

ChatConversationSchema.index({ status: 1, lastMessageAt: -1 });

export const ChatConversation = mongoose.model<IChatConversation>(
  'ChatConversation',
  ChatConversationSchema,
);
