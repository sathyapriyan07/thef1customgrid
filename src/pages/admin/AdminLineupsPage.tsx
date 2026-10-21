import React, { useState, useEffect } from 'react';
import { Layers, Star, Trash2, Eye, Search, Globe, Lock } from 'lucide-react';
import { CustomLineup, Team, Driver } from '../../types';
import { getLineups, deleteLineup, saveLineup, getTeams, getDrivers } from '../../services/db';
import { useToast } from '../../context/ToastContext';

interface AdminLineupsPageProps {
  navigate: (path: string) => void;
}

export const AdminLineupsPage: React.FC<AdminLineupsPageProps> = ({ navigate }) => {
  const { toast } = useToast();
  const [lineups, setLineups] = useState<CustomLineup[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLineups = async () => {
    try {
      const [l, t, d] = await Promise.all([getLineups(), getTeams(), getDrivers()]);
      setLineups(l);
      setTeams(t);
      setDrivers(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLineups();
  }, []);

  const toggleFeatured = async (lineup: CustomLineup) => {
    try {
      await saveLineup({
        ...lineup,
        is_featured: !lineup.is_featured,
      });
      toast.success(
        lineup.is_featured ? 'Removed from Featured' : 'Featured on Homepage!'
      );
      loadLineups();
    } catch (err: any) {
      toast.error('Update failed', err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Moderator confirmation: Delete lineup "${name}"?`)) return;
    try {
      await deleteLineup(id);
      toast.success('Lineup removed');
      loadLineups();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    }
  };

  const filteredLineups = lineups.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
          <Layers className="w-4 h-4" />
          <span>Community Lineup Moderation</span>
        </div>
        <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">
          Lineup Management
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Inspect, feature, and moderate all public and private saved starting grids.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-[#121316] border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search custom lineups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
          />
        </div>
        <span className="text-xs font-mono-code text-zinc-500">
          {filteredLineups.length} Grids
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#121316] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 uppercase font-mono-code text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Lineup Name</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Visibility</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredLineups.map((lineup) => (
                <tr key={lineup.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-display font-black text-sm text-white uppercase">
                        {lineup.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono-code">
                        ID: {lineup.id}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono-code font-bold text-red-400">
                    {lineup.team_count} Teams
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code uppercase ${
                      lineup.status === 'complete'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-zinc-950 text-zinc-400'
                    }`}>
                      {lineup.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {lineup.visibility === 'public' ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-mono-code text-[11px]">
                        <Globe className="w-3 h-3" />
                        <span>Public</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-zinc-500 font-mono-code text-[11px]">
                        <Lock className="w-3 h-3" />
                        <span>Private</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleFeatured(lineup)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        lineup.is_featured
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          : 'text-zinc-600 hover:text-amber-400'
                      }`}
                      title={lineup.is_featured ? 'Featured on home' : 'Click to feature'}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/grids/${lineup.id}`)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        title="View grid"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lineup.id, lineup.name)}
                        className="p-1.5 rounded-lg hover:bg-red-950/60 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete lineup"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
