import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, X, CheckCircle2 } from 'lucide-react';
import { Season } from '../../types';
import { getSeasons, createSeason, updateSeason, deleteSeason } from '../../services/db';
import { useToast } from '../../context/ToastContext';

export const AdminSeasonsPage: React.FC = () => {
  const { toast } = useToast();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [year, setYear] = useState<number | ''>(2025);
  const [seasonType, setSeasonType] = useState<'formula1' | 'historic' | 'fictional' | 'fantasy'>('formula1');
  const [isCurrent, setIsCurrent] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSeasons = async () => {
    try {
      const data = await getSeasons();
      setSeasons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const openCreateModal = () => {
    setEditingSeason(null);
    setName('');
    setYear(2025);
    setSeasonType('formula1');
    setIsCurrent(false);
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (season: Season) => {
    setEditingSeason(season);
    setName(season.name);
    setYear(season.year || '');
    setSeasonType(season.season_type);
    setIsCurrent(season.is_current);
    setIsPublished(season.is_published);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation error', 'Season name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSeason) {
        await updateSeason(editingSeason.id, {
          name: name.trim(),
          year: year ? Number(year) : undefined,
          season_type: seasonType,
          is_current: isCurrent,
          is_published: isPublished,
        });
        toast.success('Season updated');
      } else {
        await createSeason({
          name: name.trim(),
          year: year ? Number(year) : undefined,
          season_type: seasonType,
          is_current: isCurrent,
          is_published: isPublished,
        });
        toast.success('Season created');
      }
      setModalOpen(false);
      loadSeasons();
    } catch (err: any) {
      toast.error('Operation failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (season: Season) => {
    if (!confirm(`Are you sure you want to delete "${season.name}"?`)) return;
    try {
      await deleteSeason(season.id);
      toast.success('Season deleted');
      loadSeasons();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
            <Calendar className="w-4 h-4" />
            <span>Grand Prix Seasons Management</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">
            Championship Seasons
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure calendar years, historic championship editions, and fictional expansion seasons.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-xs shadow-lg shadow-red-950/60 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Season</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#121316] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 uppercase font-mono-code text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Season Name</th>
                <th className="py-3.5 px-4">Year</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {seasons.map((season) => (
                <tr key={season.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-display font-black text-sm text-white uppercase">
                    {season.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono-code text-zinc-400">
                    {season.year || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded font-mono-code text-[10px] uppercase bg-zinc-950 border border-zinc-800 text-zinc-300">
                      {season.season_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {season.is_current && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          Current Official
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code ${
                        season.is_published ? 'text-zinc-300' : 'text-zinc-500'
                      }`}>
                        {season.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(season)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(season)}
                        className="p-1.5 rounded-lg hover:bg-red-950/60 text-zinc-500 hover:text-red-400 transition-colors"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-display font-black text-xl uppercase tracking-wider text-white">
                <Calendar className="w-5 h-5 text-red-500" />
                <span>{editingSeason ? 'Edit Season' : 'Create Season'}</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Season Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 New Engine Era"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                    Calendar Year
                  </label>
                  <input
                    type="number"
                    placeholder="2025"
                    value={year}
                    onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono-code focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                    Season Type
                  </label>
                  <select
                    value={seasonType}
                    onChange={(e) => setSeasonType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="formula1">Official Formula 1</option>
                    <option value="historic">Historic Classic</option>
                    <option value="fictional">Fictional</option>
                    <option value="fantasy">Fantasy Expansion</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800 font-mono-code">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-300">Mark as Current Season</span>
                  <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="w-4 h-4 rounded accent-red-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-300">Published in Public Directory</span>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded accent-red-600"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display uppercase tracking-wider"
                >
                  {isSubmitting ? 'Saving...' : editingSeason ? 'Update Season' : 'Create Season'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
