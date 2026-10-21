import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Upload, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { Team } from '../../types';
import { getTeams, createTeam, updateTeam, deleteTeam, uploadMedia } from '../../services/db';
import { useToast } from '../../context/ToastContext';

export const AdminTeamsPage: React.FC = () => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [hq, setHq] = useState('');
  const [bio, setBio] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#E10600');
  const [secondaryColor, setSecondaryColor] = useState('#15151E');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const openCreateModal = () => {
    setEditingTeam(null);
    setName('');
    setSlug('');
    setHq('');
    setBio('');
    setPrimaryColor('#E10600');
    setSecondaryColor('#15151E');
    setLogoUrl('');
    setModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setName(team.name);
    setSlug(team.slug);
    setHq(team.hq || '');
    setBio(team.bio || '');
    setPrimaryColor(team.primary_color || '#E10600');
    setSecondaryColor(team.secondary_color || '#15151E');
    setLogoUrl(team.logo_url || '');
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingTeam) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadMedia(file, 'teams');
      setLogoUrl(url);
      toast.success('Logo uploaded successfully');
    } catch (err: any) {
      toast.error('Upload failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error('Validation error', 'Team name and slug are required.');
      return;
    }

    // Check slug uniqueness
    const slugConflict = teams.find(
      t => t.slug.toLowerCase() === slug.toLowerCase() && t.id !== editingTeam?.id
    );
    if (slugConflict) {
      toast.error('Duplicate Slug', `A team with slug "${slug}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, {
          name: name.trim(),
          slug: slug.trim(),
          hq: hq.trim(),
          bio: bio.trim(),
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          logo_url: logoUrl,
        });
        toast.success('Team updated successfully');
      } else {
        await createTeam({
          name: name.trim(),
          slug: slug.trim(),
          hq: hq.trim(),
          bio: bio.trim(),
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          logo_url: logoUrl,
        });
        toast.success('Constructor created successfully');
      }
      setModalOpen(false);
      loadTeams();
    } catch (err: any) {
      toast.error('Operation failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Are you sure you want to delete "${team.name}"? Dependent assignments may be removed.`)) return;

    try {
      await deleteTeam(team.id);
      toast.success('Team deleted');
      loadTeams();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.hq.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
            <Trophy className="w-4 h-4" />
            <span>Constructor Management CRUD</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">
            Formula 1 Teams
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Create, edit, and delete constructors. Manage official team brand colors and headquarters.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-xs shadow-lg shadow-red-950/60 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Constructor</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#121316] border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams by name, slug or HQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
          />
        </div>
        <span className="text-xs font-mono-code text-zinc-500">
          {filteredTeams.length} Records
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#121316] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 uppercase font-mono-code text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Constructor</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Colors</th>
                <th className="py-3.5 px-4">Headquarters</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shrink-0">
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Trophy className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                      <span className="font-display font-black text-sm text-white uppercase">
                        {team.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono-code text-zinc-400">
                    {team.slug}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-zinc-700 shadow-sm"
                        style={{ backgroundColor: team.primary_color }}
                        title={`Primary: ${team.primary_color}`}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-zinc-700 shadow-sm"
                        style={{ backgroundColor: team.secondary_color }}
                        title={`Secondary: ${team.secondary_color}`}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    {team.hq}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(team)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        title="Edit team"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(team)}
                        className="p-1.5 rounded-lg hover:bg-red-950/60 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete team"
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

      {/* Modal for Add / Edit Team */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-display font-black text-xl uppercase tracking-wider text-white">
                <Trophy className="w-5 h-5 text-red-500" />
                <span>{editingTeam ? 'Edit Constructor' : 'Create Constructor'}</span>
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
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuderia Ferrari"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Unique Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. scuderia-ferrari"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono-code focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Headquarters
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maranello, Italy"
                  value={hq}
                  onChange={(e) => setHq(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Biography / Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Historical overview and achievements..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono-code text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono-code text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Logo URL and file upload */}
              <div className="space-y-2">
                <label className="block text-zinc-400 uppercase font-mono-code">
                  Team Logo URL or Upload
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Trophy className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-600"
                    />
                    <label className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white cursor-pointer">
                      <Upload className="w-3 h-3 text-red-500" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
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
                  {isSubmitting ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
