import React from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Calendar, 
  Flag, 
  Layers, 
  Image as ImageIcon, 
  Settings, 
  ArrowLeft, 
  LogOut,
  ShieldAlert,
  Car
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, navigate, children }) => {
  const { user, isAdmin, signOut } = useAuth();

  const menuItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Teams (CRUD)', path: '/admin/teams', icon: Trophy },
    { label: 'Team Cars', path: '/admin/cars', icon: Car },
    { label: 'Drivers (CRUD)', path: '/admin/drivers', icon: Users },
    { label: 'Seasons', path: '/admin/seasons', icon: Calendar },
    { label: 'Assignments', path: '/admin/assignments', icon: Flag },
    { label: 'Lineups', path: '/admin/lineups', icon: Layers },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { label: 'Settings & Supabase', path: '/admin/settings', icon: Settings },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0c0d10] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white font-display uppercase tracking-wide">
            Administrator Authorization Required
          </h2>
          <p className="text-sm text-zinc-400">
            This area requires verified administrator privileges. Sign in with an authorized account or use the 1-click test administrator mode.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-red-950/50"
            >
              Sign In to Admin Portal
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition-all"
            >
              Return to Public Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0c] text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0e0f13] border-r border-zinc-800/80 flex flex-col shrink-0">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-black text-white italic font-display text-lg shadow-md shadow-red-900/40">
              F1
            </div>
            <div>
              <div className="font-display font-black tracking-wider text-base uppercase text-white">
                FIA ADMIN
              </div>
              <div className="text-[10px] text-zinc-400 uppercase font-mono-code">Control Panel</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Return to Public Site"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* User Badge */}
        <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-950/40 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.email}</div>
            <div className="text-[10px] text-red-400 uppercase font-mono-code font-bold tracking-wider">
              {user?.role} Access
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Nav list */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-950/50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Public link */}
        <div className="p-3 border-t border-zinc-800/80">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Grid Builder</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0 bg-[#090a0c]">
        {children}
      </main>
    </div>
  );
};
