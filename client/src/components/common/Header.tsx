import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Services', path: '/services' },
    { label: 'Work', path: '/portfolio' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white group">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-white transition-all">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>
            Teja<span className="text-primary font-black">.</span>Studio
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm transition-colors hover:text-white ${
                isActive(link.path) ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="flex items-center gap-3 ml-2">
            <Link
              to="/book"
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary-light hover:bg-primary/20 transition-all"
            >
              Book Call
            </Link>
            <Link
              to="/quote"
              className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
            >
              Start a Project <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card/95 backdrop-blur-2xl px-6 py-6 md:hidden animate-fade-in">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors ${
                  isActive(link.path) ? 'text-primary' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border my-2" />
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-full border border-primary/40 bg-primary/10 py-2.5 text-sm font-semibold text-primary"
              >
                Book a Free Discovery Call
              </Link>
              <Link
                to="/quote"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-full bg-primary py-2.5 text-sm font-semibold text-white shadow-glow"
              >
                Request a Custom Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
