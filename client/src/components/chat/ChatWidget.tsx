import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const ChatWidget: React.FC = () => {
  const {
    isOpen,
    toggleChat,
    messages,
    sendMessage,
    isLoading,
    clientName,
    clientEmail,
    setClientEmail,
    setClientName,
    unreadCount,
  } = useChat();

  const [input, setInput] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(!clientName || !clientEmail);
  const [tempEmail, setTempEmail] = useState(clientEmail);
  const [tempName, setTempName] = useState(clientName);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const text = input;
    try {
      await sendMessage(text);
      setInput('');
    } catch {
      /* Preserve the draft; the error notice explains the failure. */
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setClientName(tempName.trim());
      setClientEmail(tempEmail.trim());
      setShowNamePrompt(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question).catch(() => {});
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="glow-card group relative flex items-center gap-2.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-105 active:scale-95"
          aria-label="Open live chat"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <MessageSquare className="h-4 w-4" />
          <span>Chat with us</span>
          {unreadCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded Chat Box Window */}
      {isOpen && (
        <div className="flex flex-col w-[min(400px,calc(100vw-3rem))] h-[min(520px,calc(100dvh-5rem))] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-5 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-white">Teja Web Studio</h3>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Active Now • Saved Conversation
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Guest Name Prompt Bar */}
          {showNamePrompt && (
            <form
              onSubmit={handleSaveName}
              className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex flex-wrap items-center gap-2"
            >
              <label className="text-xs" htmlFor="chat-email">
                Email
              </label>
              <input
                id="chat-email"
                type="email"
                required
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                className="bg-secondary rounded-lg px-3 py-2 text-xs w-full"
              />
              <input
                type="text"
                aria-label="Your name"
                required
                placeholder="Your name for this chat..."
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="flex-1 bg-background/80 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="text-xs bg-primary px-3 py-1 rounded-lg text-white font-medium hover:bg-primary-hover"
              >
                Save
              </button>
            </form>
          )}

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-background/40">
            {messages.map((msg, index) => {
              const isAdmin = msg.sender !== 'client';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${isAdmin ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                      isAdmin ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isAdmin ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isAdmin
                        ? 'bg-secondary border border-border text-foreground rounded-tl-none'
                        : 'bg-primary text-white rounded-tr-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <span
                      className={`mt-1 block text-[9px] ${
                        isAdmin ? 'text-muted-foreground' : 'text-primary-light'
                      }`}
                    >
                      {new Date(msg.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/30 border-t border-border overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleQuickQuestion('How long does a website take?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-card hover:bg-secondary text-muted-foreground hover:text-white border border-border transition-colors"
            >
              ⏱ Delivery timeline?
            </button>
            <button
              onClick={() => handleQuickQuestion('What is your pricing for a business site?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-card hover:bg-secondary text-muted-foreground hover:text-white border border-border transition-colors"
            >
              💰 Pricing details?
            </button>
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-border bg-card p-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-secondary border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40 transition-transform active:scale-95 hover:bg-primary-hover"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
