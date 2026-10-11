import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@tejastudio.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="hero-grid absolute inset-0 pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 md:p-10 shadow-2xl relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>
              Teja<span className="text-primary font-black">.</span>Studio
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Administrator Portal</h1>
          <p className="text-xs text-muted-foreground mt-1">Sign in with your secure administrator credentials</p>
        </div>

        {/* Demo Helper Box */}
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-white mb-1">Pre-filled Evaluation Credentials:</p>
          <p>Email: <span className="text-primary font-mono">admin@tejastudio.com</span></p>
          <p>Password: <span className="text-primary font-mono">AdminPassword123!</span></p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tejastudio.com"
                className="w-full rounded-xl border border-border bg-secondary pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1.5">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-border bg-secondary pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-card inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-semibold text-white shadow-glow hover:scale-[1.01] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                Sign In to Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border/50 pt-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-white transition-colors">
            ← Back to public website
          </Link>
        </div>
      </div>
    </div>
  );
};
