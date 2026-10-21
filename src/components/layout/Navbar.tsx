import React, { useState } from 'react';
import { 
  Trophy, 
  Layers, 
  Users, 
  Flag, 
  Calendar, 
  Bookmark, 
  ShieldCheck, 
  Menu, 
  X, 
  Database,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, isAdmin, signOut, loginAsDemoAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  const navLinks = [
    { label: 'Grid Builder', path: '/builder', icon: Layers, highlight: true },
    { label: 'Drivers', path: '/drivers', icon: Users },
    { label: 'Teams', path: '/teams', icon: Trophy },
    { label: 'Seasons', path: '/seasons', icon: Calendar },
    { label: 'My Grids', path: '/my-grids', icon: Bookmark },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0c0d10]/95 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('/')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 text-white font-black shadow-lg shadow-red-900/30">
              <span className="font-display italic text-2xl tracking-tighter">F1</span>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-amber-400 rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black tracking-wider text-lg uppercase text-white">
                  GRID<span className="text-red-600">BUILDER</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono-code font-bold uppercase tracking-widest bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                  2025/2026
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-zinc-400 uppercase tracking-wider -mt-1 font-medium">
                Formula 1 Paddock Studio
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNav('/')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPath === '/' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              Home
            </button>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath.startsWith(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    link.highlight
                      ? isActive
                        ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-900/30'
                        : 'bg-red-600/15 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white font-medium'
                      : isActive
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Backend Status & User Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Supabase status badge */}
            <button
              onClick={() => setDbModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-code border transition-colors ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/50'
                  : 'bg-zinc-800/60 text-amber-300 border-amber-600/30 hover:bg-zinc-800'
              }`}
              title="Database connection info"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Supabase' : 'Local DB'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Admin or Login */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-1">
                <button
                  onClick={() => handleNav('/admin')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/admin/login')}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 rounded-lg transition-all"
                >
                  Admin Access
                </button>
                <button
                  onClick={loginAsDemoAdmin}
                  className="px-2.5 py-1.5 text-xs font-medium text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 rounded-lg transition-all"
                  title="Test admin features with one click"
                >
                  1-Click Admin
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-3 pb-5 space-y-2">
            <button
              onClick={() => handleNav('/')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-200 rounded-lg hover:bg-zinc-800"
            >
              Home
            </button>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    link.highlight
                      ? 'bg-red-600/20 text-red-300 border border-red-500/30'
                      : 'text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              {isAdmin ? (
                <button
                  onClick={() => handleNav('/admin')}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg"
                >
                  Admin Dashboard
                </button>
              ) : (
                <button
                  onClick={() => handleNav('/admin/login')}
                  className="px-3 py-1.5 text-xs text-zinc-300 bg-zinc-800 rounded-lg"
                >
                  Admin Login
                </button>
              )}
              <button
                onClick={() => setDbModalOpen(true)}
                className="text-xs text-zinc-400 underline"
              >
                Database Info
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Database Setup Info Modal */}
      {dbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-lg font-display tracking-wide uppercase">
                <Database className="w-5 h-5 text-red-500" />
                <span>Supabase PostgreSQL Integration</span>
              </div>
              <button
                onClick={() => setDbModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-300">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400 font-mono-code uppercase">Connection Mode</div>
                  <div className="font-semibold text-white">
                    {isSupabaseConfigured ? '🟢 Live Supabase Connected' : '🟠 Local Reactive Paddock Store'}
                  </div>
                </div>
                <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {isSupabaseConfigured ? 'PostgreSQL' : 'Indexed Storage'}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-zinc-400">
                The application comes complete with full SQL migration scripts in <code className="text-red-400">supabase/migrations/</code> for all 9 tables, Row Level Security policies, storage buckets, and seed data.
              </p>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono-code text-xs text-zinc-300 space-y-1">
                <div className="text-zinc-500"># In .env or hosting environment:</div>
                <div>VITE_SUPABASE_URL="https://your-ref.supabase.co"</div>
                <div>VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"</div>
              </div>

              <p className="text-xs text-zinc-400">
                In local mode, all CRUD operations (Teams, Cars, Drivers, Assignments, Lineups, and Media) work seamlessly in browser storage with instant live reactivity.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDbModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
