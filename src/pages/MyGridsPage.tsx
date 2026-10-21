import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Share2, 
  Layers, 
  Download, 
  Eye, 
  Calendar,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { CustomLineup, Team, Driver } from '../types';
import { getLineups, deleteLineup, saveLineup, getTeams, getDrivers } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface MyGridsPageProps {
  navigate: (path: string) => void;
}

export const MyGridsPage: React.FC<MyGridsPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [lineups, setLineups] = useState<CustomLineup[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [l, t, d] = await Promise.all([
        getLineups(),
        getTeams(),
        getDrivers(),
      ]);
      setLineups(l);
      setTeams(t);
      setDrivers(d);
    } catch (err) {
      console.error('Failed to load lineups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteLineup(id);
      toast.success('Lineup deleted');
      loadData();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    }
  };

  const handleDuplicate = async (original: CustomLineup) => {
    try {
      const { id, created_at, updated_at, ...rest } = original;
      const copy = await saveLineup({
        ...rest,
        name: `${original.name} (Copy)`,
        created_by: user?.id || null,
      });
      toast.success('Lineup duplicated!');
      loadData();
      navigate(`/builder?edit=${copy.id}`);
    } catch (err: any) {
      toast.error('Duplicate failed', err.message);
    }
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/grids/${id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Link Copied!', 'Shareable grid link copied to clipboard.');
    } else {
      toast.info('Share URL:', url);
    }
  };

  const displayedLineups = activeTab === 'my' && user
    ? lineups.filter(l => l.created_by === user.id)
    : lineups;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
            <Bookmark className="w-4 h-4" />
            <span>Paddock Grid Registry</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            Saved Grand Prix Grids
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse, duplicate, edit, and export custom lineups created by you and the F1 community.
          </p>
        </div>

        <button
          onClick={() => navigate('/builder')}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-sm shadow-xl shadow-red-950/60 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Grid</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold font-display uppercase tracking-wider transition-all ${
            activeTab === 'all'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All Community Lineups ({lineups.length})
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-display uppercase tracking-wider transition-all ${
              activeTab === 'my'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            My Saved Grids
          </button>
        )}
      </div>

      {/* Grid of Lineups */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : displayedLineups.length === 0 ? (
        <div className="p-16 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4">
          <Layers className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="font-display font-black text-2xl text-white uppercase tracking-wide">
            No Custom Grids Found
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Get started by launching the Grid Builder to construct your first 10, 11, or 12 team starting lineup.
          </p>
          <button
            onClick={() => navigate('/builder')}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold font-display uppercase"
          >
            Build Grid Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedLineups.map((lineup) => {
            const isCompleted = lineup.status === 'complete';
            const isPrivate = lineup.visibility === 'private';

            return (
              <div
                key={lineup.id}
                className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 flex flex-col justify-between space-y-5 hover:border-zinc-700 transition-all shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase tracking-wider bg-red-950/60 text-red-400 border border-red-800/40">
                      {lineup.team_count} Teams
                    </span>

                    <div className="flex items-center gap-1 text-[10px] font-mono-code text-zinc-400">
                      {isPrivate ? (
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Globe className="w-3 h-3" />
                          <span>Public</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3
                      onClick={() => navigate(`/grids/${lineup.id}`)}
                      className="font-display font-black text-xl text-white uppercase tracking-wide hover:text-red-400 cursor-pointer transition-colors"
                    >
                      {lineup.name}
                    </h3>
                    <div className="text-[11px] text-zinc-500 mt-1 font-mono-code">
                      Updated {new Date(lineup.updated_at || lineup.created_at || Date.now()).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Quick preview of teams */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {lineup.teams.slice(0, 5).map((slot, i) => {
                      const t = teams.find(team => team.id === slot.team_id);
                      return (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-medium text-zinc-300 flex items-center gap-1"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: t?.primary_color || slot.custom_primary_color || '#E10600' }}
                          />
                          <span>{t?.name?.split(' ')[0] || slot.custom_team_name?.split(' ')[0] || `T${i + 1}`}</span>
                        </span>
                      );
                    })}
                    {lineup.teams.length > 5 && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
                        +{lineup.teams.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions bottom row */}
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate(`/grids/${lineup.id}/poster`)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title="Poster Studio"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(lineup)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title="Duplicate grid"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare(lineup.id)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title="Share link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lineup.id, lineup.name)}
                      className="p-2 rounded-lg hover:bg-red-950/60 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete grid"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/grids/${lineup.id}`)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display uppercase tracking-wider"
                  >
                    View Grid
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
