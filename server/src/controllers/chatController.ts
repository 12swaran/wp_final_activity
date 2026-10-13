import { escapeRegex } from '../utils/security';
import { Request, Response } from 'express';
import { ChatConversation } from '../models/ChatConversation';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const initOrGetSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, clientName, clientEmail } = req.body;

    if (!sessionId) {
      sendError(res, 'Session ID is required.', 400);
      return;
    }

    const insert: any = {
      sessionId,
      status: 'active',
      messages: [
        {
          sender: 'admin',
          senderName: 'Teja Web Studio',
          message:
            'Hello! Thanks for visiting Teja Web Studio. How can we help you with your website project today?',
          sentAt: new Date(),
          isRead: true,
        },
      ],
      lastMessageAt: new Date(),
    };
    const update: any = {};
    if (clientName) update.clientName = clientName.trim();
    else insert.clientName = 'Website Guest';
    if (clientEmail) update.clientEmail = clientEmail.toLowerCase().trim();
    else insert.clientEmail = '';
    // React Strict Mode and quick navigation can initialize the same session concurrently.
    // A single indexed upsert prevents duplicate conversations.
    const conversation = await ChatConversation.findOneAndUpdate(
      { sessionId },
      { $setOnInsert: insert, ...(Object.keys(update).length ? { $set: update } : {}) },
      { upsert: true, new: true, runValidators: true },
    );

    sendSuccess(res, conversation, 'Chat session active.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getSessionMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const conversation = await ChatConversation.findOne({ sessionId });

    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    sendSuccess(res, conversation.messages, 'Messages retrieved.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const sendClientMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { message, clientName, clientEmail } = req.body;

    if (!message || !message.trim()) {
      sendError(res, 'Message text is required.', 400);
      return;
    }

    const conversation = await ChatConversation.findOne({ sessionId });
    if (!conversation) {
      sendError(res, 'Start a chat with your name and email first.', 400);
      return;
    }

    conversation.messages.push({
      sender: 'client',
      senderName: conversation.clientName,
      message: message.trim(),
      sentAt: new Date(),
      isRead: false,
    });
    conversation.lastMessageAt = new Date();
    await conversation.save();

    sendSuccess(res, conversation.messages[conversation.messages.length - 1], 'Message sent.', 201);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAdminConversations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const conversations = await ChatConversation.find({ 'messages.sender': 'client' }).sort({
      lastMessageAt: -1,
    });
    sendSuccess(res, conversations, 'Conversations retrieved for admin.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const sendAdminReply = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      sendError(res, 'Reply message cannot be empty.', 400);
      return;
    }

    const conversation = await ChatConversation.findOne({ sessionId });
    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    const senderName = req.user?.fullName || 'Studio Admin';

    conversation.messages.push({
      sender: 'admin',
      senderName,
      message: message.trim(),
      sentAt: new Date(),
      isRead: true,
    });

    // Mark previous client messages as read
    conversation.messages.forEach((msg) => {
      if (msg.sender === 'client') {
        msg.isRead = true;
      }
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    sendSuccess(res, conversation.messages[conversation.messages.length - 1], 'Reply sent.', 201);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const closeConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const conversation = await ChatConversation.findOneAndUpdate(
      { sessionId },
      { status: 'closed' },
      { new: true, runValidators: true },
    );

    if (!conversation) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    sendSuccess(res, conversation, 'Conversation closed.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
