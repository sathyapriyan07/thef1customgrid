import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { clearAllData, getTeams, getDrivers, getTeamCars, getSeasons, getDriverTeamSeasons, getLineups } from '../../services/db';
import { isSupabaseConfigured, supabaseConfig } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const handleClearAll = () => {
    clearAllData();
    setClearConfirmOpen(false);
    toast.success('Paddock Data Cleared', 'All seed data and database records have been completely purged.');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleExportJSON = async () => {
    try {
      const [teams, drivers, cars, seasons, assignments, lineups] = await Promise.all([
        getTeams(),
        getDrivers(),
        getTeamCars(),
        getSeasons(),
        getDriverTeamSeasons(),
        getLineups(),
      ]);

      const backup = {
        exported_at: new Date().toISOString(),
        version: '1.0.0',
        teams,
        drivers,
        cars,
        seasons,
        assignments,
        lineups,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `f1_paddock_backup_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Database Exported', 'Full JSON backup downloaded.');
    } catch (err: any) {
      toast.error('Export Failed', err.message);
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.teams) localStorage.setItem('f1_grid_teams', JSON.stringify(data.teams));
        if (data.drivers) localStorage.setItem('f1_grid_drivers', JSON.stringify(data.drivers));
        if (data.cars) localStorage.setItem('f1_grid_cars', JSON.stringify(data.cars));
        if (data.seasons) localStorage.setItem('f1_grid_seasons', JSON.stringify(data.seasons));
        if (data.assignments) localStorage.setItem('f1_grid_assignments', JSON.stringify(data.assignments));
        if (data.lineups) localStorage.setItem('f1_grid_lineups', JSON.stringify(data.lineups));
        toast.success('Data Imported Successfully', 'Reloading page to refresh data.');
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        toast.error('Import Failed', 'Invalid JSON backup format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
          <Settings className="w-4 h-4" />
          <span>System & Supabase Infrastructure</span>
        </div>
        <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">
          Paddock System Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Supabase PostgreSQL integration checklist, data backup, restore seed dataset, and migration instructions.
        </p>
      </div>

      {/* Supabase Status Card */}
      <div className="rounded-3xl bg-[#121316] border border-zinc-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wide">
                Supabase Backend Status
              </h3>
              <p className="text-xs text-zinc-400">
                PostgreSQL single source of truth for teams, drivers, and lineups.
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-mono-code font-bold uppercase tracking-wider ${
            isSupabaseConfigured
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
              : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
          }`}>
            {isSupabaseConfigured ? '🟢 Supabase Active' : '🟠 Local Test Storage Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-code">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-zinc-500">VITE_SUPABASE_URL</span>
            <div className="text-white truncate">
              {supabaseConfig.url || '<Not configured in environment>'}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-zinc-500">VITE_SUPABASE_PUBLISHABLE_KEY</span>
            <div className="text-white">
              {supabaseConfig.hasKey ? 'Configured (Active)' : '<Not configured in environment>'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs text-zinc-300">
          <div className="font-semibold text-white uppercase font-display text-sm">
            Supabase Setup Checklist:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-zinc-400">
            <li>Create a new project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-red-400 underline">supabase.com</a>.</li>
            <li>In the Supabase SQL Editor, run the migrations provided in the project under <code className="text-zinc-300">/supabase/migrations/</code> in order (001 schema, 002 RLS, 003 buckets, 004 seed).</li>
            <li>Add <code className="text-zinc-300">VITE_SUPABASE_URL</code> and <code className="text-zinc-300">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your environment.</li>
          </ol>
        </div>
      </div>

      {/* Database Operations (Backup, Import, Reset) */}
      <div className="rounded-3xl bg-[#121316] border border-zinc-800 p-6 space-y-4 shadow-xl">
        <h3 className="font-display font-black text-lg text-white uppercase tracking-wide">
          Data Management & Seed Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Backup */}
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors space-y-1.5"
          >
            <Download className="w-5 h-5 text-cyan-400" />
            <div className="font-display font-bold text-sm text-white uppercase">
              Export Backup JSON
            </div>
            <div className="text-[11px] text-zinc-500">
              Download complete snapshot of constructors, drivers, and lineups.
            </div>
          </button>

          {/* Import */}
          <label className="p-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors space-y-1.5 cursor-pointer">
            <Upload className="w-5 h-5 text-emerald-400" />
            <div className="font-display font-bold text-sm text-white uppercase">
              Import JSON Backup
            </div>
            <div className="text-[11px] text-zinc-500">
              Restore records from an exported JSON file.
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* Clear All Data */}
          <button
            onClick={() => setClearConfirmOpen(true)}
            className="p-4 rounded-2xl bg-zinc-950 hover:bg-red-950/40 border border-zinc-800 text-left transition-colors space-y-1.5 group"
          >
            <Trash2 className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <div className="font-display font-bold text-sm text-white uppercase group-hover:text-red-400">
              Clear All Data & Seed Records
            </div>
            <div className="text-[11px] text-zinc-500">
              Permanently wipe all constructors, drivers, seasons, cars, and custom lineups.
            </div>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center mx-auto text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-wide">
              Clear All Data?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will completely remove all teams, drivers, seasons, assignments, and custom lineups from the database.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setClearConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display uppercase tracking-wider"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
