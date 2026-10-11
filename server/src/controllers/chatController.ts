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

    let conversation = await ChatConversation.findOne({ sessionId });
    if (!conversation) {
      conversation = await ChatConversation.create({
        sessionId,
        clientName: clientName ? clientName.trim() : 'Website Guest',
        clientEmail: clientEmail ? clientEmail.toLowerCase().trim() : '',
        status: 'active',
        messages: [
          {
            sender: 'admin',
            senderName: 'Teja Web Studio',
            message: 'Hello! Thanks for visiting Teja Web Studio. How can we help you with your website project today?',
            sentAt: new Date(),
            isRead: true,
          },
        ],
        lastMessageAt: new Date(),
      });
    } else {
      if (clientName) conversation.clientName = clientName.trim();
      if (clientEmail) conversation.clientEmail = clientEmail.toLowerCase().trim();
      await conversation.save();
    }

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

    let conversation = await ChatConversation.findOne({ sessionId });
    if (!conversation) {
      conversation = await ChatConversation.create({
        sessionId,
        clientName: clientName || 'Website Guest',
        clientEmail: clientEmail || '',
        status: 'active',
        messages: [],
      });
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
    const conversations = await ChatConversation.find().sort({ lastMessageAt: -1 });
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
      { new: true }
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
