import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { chatApi } from '../services/api';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleChat: () => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  clientName: string;
  setClientName: (name: string) => void;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>(() => {
    return localStorage.getItem('studio_chat_name') || '';
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Generate or retrieve persistent sessionId
  const [sessionId] = useState<string>(() => {
    let id = localStorage.getItem('studio_chat_session_id');
    if (!id) {
      id = 'chat_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('studio_chat_session_id', id);
    }
    return id;
  });

  const lastMessageCountRef = useRef<number>(0);

  // Initial session startup
  useEffect(() => {
    const initChat = async () => {
      try {
        const conv = await chatApi.initSession({
          sessionId,
          clientName: clientName || undefined,
        });
        if (conv && conv.messages) {
          setMessages(conv.messages);
          lastMessageCountRef.current = conv.messages.length;
        }
      } catch (err) {
        console.warn('[Chat] Could not connect to chat server initially:', err);
      }
    };

    initChat();
  }, [sessionId]);

  // Periodic polling for incoming admin replies
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const msgs = await chatApi.getMessages(sessionId);
        if (Array.isArray(msgs)) {
          if (msgs.length > lastMessageCountRef.current) {
            // New message arrived
            if (!isOpen) {
              const newMsgs = msgs.slice(lastMessageCountRef.current);
              const adminMsgs = newMsgs.filter((m: ChatMessage) => m.sender === 'admin');
              if (adminMsgs.length > 0) {
                setUnreadCount((prev) => prev + adminMsgs.length);
              }
            }
          }
          setMessages(msgs);
          lastMessageCountRef.current = msgs.length;
        }
      } catch {
        // Silently skip failed poll in background
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [sessionId, isOpen]);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
      }
      return next;
    });
  };

  const handleSetClientName = (name: string) => {
    setClientName(name);
    localStorage.setItem('studio_chat_name', name);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const newMsg = await chatApi.sendMessage(sessionId, text, clientName || undefined);
      setMessages((prev) => [...prev, newMsg]);
      lastMessageCountRef.current += 1;
    } catch (err) {
      console.error('[Chat] Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleChat,
        messages,
        sendMessage,
        isLoading,
        clientName,
        setClientName: handleSetClientName,
        unreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
