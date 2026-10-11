import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { ChatWidget } from '../chat/ChatWidget';
import { WhatsAppButton } from '../common/WhatsAppButton';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
    </div>
  );
};
