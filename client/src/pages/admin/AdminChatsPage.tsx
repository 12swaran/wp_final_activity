import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, CheckCheck, User, Bot, Clock, XCircle, Sparkles } from 'lucide-react';
import { ChatConversation, ChatMessage } from '../../types';
import { chatApi } from '../../services/api';

export const AdminChatsPage: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = () => {
    chatApi
      .getAdminConversations()
      .then((data) => {
        setConversations(data || []);
        if (!selectedSessionId && data && data.length > 0) {
          setSelectedSessionId(data[0].sessionId);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConversations();
    // Poll every 5 seconds for new customer chat messages
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      const found = conversations.find((c) => c.sessionId === selectedSessionId);
      if (found) {
        setActiveConversation(found);
      }
    }
  }, [selectedSessionId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !replyInput.trim() || sending) return;

    setSending(true);
    try {
      await chatApi.sendAdminReply(selectedSessionId, replyInput.trim());
      setReplyInput('');
      fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleCloseChat = async () => {
    if (!selectedSessionId) return;
    try {
      await chatApi.closeConversation(selectedSessionId);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Live Customer Chat Console</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time conversations with website visitors. Replies are saved and delivered directly to
          the client's floating chat box.
        </p>
      </div>

      {loading && conversations.length === 0 ? (
        <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
          Connecting to customer live chat threads...
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
          No chat conversations started yet. Visitors who message via the public chat widget will
          appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px] rounded-3xl border border-border bg-card overflow-hidden">
          {/* Left Pane: Conversation Threads (4 cols) */}
          <div className="lg:col-span-4 border-r border-border flex flex-col h-full bg-secondary/20">
            <div className="p-4 border-b border-border">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Active Threads (
                {conversations.length})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/60">
              {conversations.map((conv) => {
                const isSelected = selectedSessionId === conv.sessionId;
                const lastMsg = conv.messages && conv.messages[conv.messages.length - 1];
                const unreadClientMsgs = conv.messages.filter(
                  (m) => m.sender === 'client' && !m.isRead,
                ).length;

                return (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedSessionId(conv.sessionId)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-primary/10 border-l-4 border-l-primary'
                        : 'hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                      {conv.clientName ? conv.clientName.charAt(0) : 'G'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{conv.clientName}</h4>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {lastMsg ? lastMsg.message : 'No messages'}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.2 text-[9px] font-semibold ${
                            conv.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {conv.status}
                        </span>
                        {unreadClientMsgs > 0 && (
                          <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[9px] font-bold">
                            {unreadClientMsgs} new
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Pane: Message Thread & Reply Composer (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-full bg-card">
            {activeConversation ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                      {activeConversation.clientName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">
                        {activeConversation.clientName}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Session: {activeConversation.sessionId} •{' '}
                        {activeConversation.clientEmail || 'No email provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeConversation.status === 'active' && (
                      <button
                        onClick={handleCloseChat}
                        className="text-[11px] text-muted-foreground hover:text-white bg-secondary px-3 py-1.5 rounded-lg border border-border"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/50">
                  {activeConversation.messages.map((msg, idx) => {
                    const isAdmin = msg.sender !== 'client';
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 ${isAdmin ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                            isAdmin ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {isAdmin ? (
                            <Bot className="h-3.5 w-3.5" />
                          ) : (
                            <User className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-primary text-white rounded-tr-none'
                              : 'bg-secondary border border-border text-foreground rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
                            <span>
                              {isAdmin
                                ? msg.senderName || 'Studio Admin'
                                : activeConversation.clientName}
                            </span>
                            <span>
                              {new Date(msg.sentAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Composer Form */}
                <form
                  onSubmit={handleSendReply}
                  className="p-4 border-t border-border bg-card flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder={`Reply to ${activeConversation.clientName}...`}
                    className="flex-1 rounded-xl border border-border bg-secondary px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!replyInput.trim() || sending}
                    className="glow-card flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{sending ? 'Sending...' : 'Reply'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                Select a conversation on the left to start messaging.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
