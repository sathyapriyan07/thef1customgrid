import React from 'react';
import { Layers, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#08090b] border-t border-zinc-800/80 pt-12 pb-8 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center font-black text-white italic font-display text-lg">
                F1
              </div>
              <span className="font-display font-black tracking-wider text-base uppercase text-white">
                GRID<span className="text-red-600">BUILDER</span>
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              The premier interactive Formula 1 paddock grid constructor. Design custom lineups, simulate fantasy transfers, and export high-resolution posters.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-semibold uppercase font-display tracking-wider text-xs mb-3">
              Explore Paddock
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/builder')} className="hover:text-red-400 transition-colors">
                  Interactive Grid Builder
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/drivers')} className="hover:text-white transition-colors">
                  Driver Directory & Stats
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/teams')} className="hover:text-white transition-colors">
                  Constructor Archive
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/seasons')} className="hover:text-white transition-colors">
                  Historical & Fantasy Seasons
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/my-grids')} className="hover:text-white transition-colors">
                  Community Lineups
                </button>
              </li>
            </ul>
          </div>

          {/* Admin & Tools */}
          <div>
            <h4 className="text-white font-semibold uppercase font-display tracking-wider text-xs mb-3">
              FIA Administration
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/admin')} className="hover:text-white transition-colors">
                  Admin Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin/teams')} className="hover:text-white transition-colors">
                  Team Management
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin/drivers')} className="hover:text-white transition-colors">
                  Driver Database CRUD
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin/assignments')} className="hover:text-white transition-colors">
                  Season Seat Assignments
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin/settings')} className="hover:text-white transition-colors">
                  Database & Supabase Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Tech Stack & Supabase */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase font-display tracking-wider text-xs mb-3">
              Architecture
            </h4>
            <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 space-y-1.5 text-[11px] font-mono-code text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Backend:</span>
                <span className="text-emerald-400">Supabase PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Auth & RLS:</span>
                <span className="text-zinc-300">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Export:</span>
                <span className="text-zinc-300">Ultra-DPI Canvas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-zinc-800/60 pt-6 space-y-2 text-[11px] text-zinc-500 leading-normal">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Fan Project Disclaimer</span>
          </div>
          <p>
            F1 Driver Grid Builder is an independent fan-made web application created for entertainment and community discussion. FORMULA 1, F1, FIA, and related marks are trademarks of Formula One Licensing B.V. and the Fédération Internationale de l'Automobile. This application is not affiliated with, endorsed by, or sponsored by Formula One World Championship Limited or any Formula 1 team. All constructor names, logos, driver portraits, and trademarks remain the property of their respective owners.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-zinc-900 text-zinc-500 text-[11px]">
          <div>© {new Date().getFullYear()} F1 Driver Grid Builder. All rights reserved.</div>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Built with precision for Formula 1 fans worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
