import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginPageProps {
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { signInAdmin, loginAsDemoAdmin, isAdmin } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('admin@f1gridbuilder.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signInAdmin(email, password);
      if (res.success) {
        toast.success('Access Authorized', 'Welcome to the FIA Administrative Control Panel.');
        navigate('/admin');
      } else {
        toast.error('Authentication Error', res.error);
      }
    } catch (err: any) {
      toast.error('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickLogin = () => {
    loginAsDemoAdmin();
    toast.success('Admin Session Activated', 'Signed in as FIA Technical Delegate (Superadmin).');
    navigate('/admin');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#121316] border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-950/60 font-black italic font-display text-2xl">
            FIA
          </div>
          <h1 className="text-2xl font-black text-white font-display uppercase tracking-wide">
            FIA Administrative Portal
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in with verified administrator credentials to access constructor, driver, car, and season database CRUD.
          </p>
        </div>

        {/* 1-Click quick test access */}
        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="text-[11px] font-mono-code text-zinc-400 flex items-center justify-between">
            <span>Quick Administrator Access:</span>
            <span className="text-amber-400">Evaluation Mode</span>
          </div>
          <button
            type="button"
            onClick={handle1ClickLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-white border border-red-500/40 text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>1-Click Test Admin Sign-In</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 font-mono-code uppercase mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-mono-code uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-sm shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            &larr; Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
