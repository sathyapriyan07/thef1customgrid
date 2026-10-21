import React, { useState, useEffect } from 'react';
import { Car, Plus, Search, Edit, Trash2, X, Upload, Trophy } from 'lucide-react';
import { TeamCar, Team } from '../../types';
import { getTeamCars, createTeamCar, updateTeamCar, deleteTeamCar, getTeams, uploadMedia } from '../../services/db';
import { useToast } from '../../context/ToastContext';

export const AdminCarsPage: React.FC = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState<TeamCar[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeamId, setFilterTeamId] = useState('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<TeamCar | null>(null);

  // Form State
  const [teamId, setTeamId] = useState('');
  const [year, setYear] = useState(2025);
  const [carName, setCarName] = useState('');
  const [carImageUrl, setCarImageUrl] = useState('');
  const [wins, setWins] = useState(0);
  const [poles, setPoles] = useState(0);
  const [podiums, setPodiums] = useState(0);
  const [points, setPoints] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [c, t] = await Promise.all([getTeamCars(), getTeams()]);
      setCars(c);
      setTeams(t);
      if (t.length > 0 && !teamId) setTeamId(t[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCar(null);
    setTeamId(teams[0]?.id || '');
    setYear(2025);
    setCarName('');
    setCarImageUrl('');
    setWins(0);
    setPoles(0);
    setPodiums(0);
    setPoints(0);
    setModalOpen(true);
  };

  const openEditModal = (car: TeamCar) => {
    setEditingCar(car);
    setTeamId(car.team_id);
    setYear(car.year);
    setCarName(car.car_name);
    setCarImageUrl(car.car_image_url || '');
    setWins(car.wins || 0);
    setPoles(car.poles || 0);
    setPodiums(car.podiums || 0);
    setPoints(Number(car.points || 0));
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadMedia(file, 'cars');
      setCarImageUrl(url);
      toast.success('Car image uploaded successfully');
    } catch (err: any) {
      toast.error('Upload failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !carName.trim()) {
      toast.error('Validation error', 'Constructor and car name are required.');
      return;
    }

    // Check (team_id, year) uniqueness
    const conflict = cars.find(
      c => c.team_id === teamId && c.year === Number(year) && c.id !== editingCar?.id
    );
    if (conflict) {
      toast.error('Conflict', 'A car record for this constructor and year already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCar) {
        await updateTeamCar(editingCar.id, {
          team_id: teamId,
          year: Number(year),
          car_name: carName.trim(),
          car_image_url: carImageUrl,
          wins: Number(wins),
          poles: Number(poles),
          podiums: Number(podiums),
          points: Number(points),
        });
        toast.success('Car record updated');
      } else {
        await createTeamCar({
          team_id: teamId,
          year: Number(year),
          car_name: carName.trim(),
          car_image_url: carImageUrl,
          wins: Number(wins),
          poles: Number(poles),
          podiums: Number(podiums),
          points: Number(points),
        });
        toast.success('Car record created');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Operation failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (car: TeamCar) => {
    if (!confirm(`Delete car record "${car.car_name}" (${car.year})?`)) return;
    try {
      await deleteTeamCar(car.id);
      toast.success('Car record deleted');
      loadData();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    }
  };

  const filteredCars = cars.filter(c => {
    const matchesTeam = filterTeamId === 'all' || c.team_id === filterTeamId;
    const matchesSearch = 
      c.car_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.year.toString().includes(searchQuery);
    return matchesTeam && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
            <Car className="w-4 h-4" />
            <span>Constructor Challenger Models & Season Stats</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">
            Team Cars & Season Records
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Maintain season-specific machinery, wins, pole positions, and constructors championship points.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-xs shadow-lg shadow-red-950/60 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Car Model</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#121316] border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search car model or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-400 uppercase font-mono-code">Constructor:</span>
          <select
            value={filterTeamId}
            onChange={(e) => setFilterTeamId(e.target.value)}
            className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-red-600"
          >
            <option value="all">All Constructors</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#121316] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 uppercase font-mono-code text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Season</th>
                <th className="py-3.5 px-4">Constructor</th>
                <th className="py-3.5 px-4">Car Chassis</th>
                <th className="py-3.5 px-4 text-center">Wins</th>
                <th className="py-3.5 px-4 text-center">Poles</th>
                <th className="py-3.5 px-4 text-center">Podiums</th>
                <th className="py-3.5 px-4 text-center">Points</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredCars.map((car) => {
                const team = teams.find(t => t.id === car.team_id);
                return (
                  <tr key={car.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono-code font-bold text-red-400">
                      {car.year}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: team?.primary_color || '#E10600' }}
                        />
                        <span className="font-display font-black text-sm text-white uppercase">
                          {team?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-display font-bold text-sm text-zinc-200">
                      {car.car_name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono-code font-bold text-amber-400">
                      {car.wins}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono-code font-bold text-cyan-400">
                      {car.poles}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono-code font-bold text-emerald-400">
                      {car.podiums}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono-code font-black text-white">
                      {car.points}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(car)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(car)}
                          className="p-1.5 rounded-lg hover:bg-red-950/60 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-display font-black text-xl uppercase tracking-wider text-white">
                <Car className="w-5 h-5 text-red-500" />
                <span>{editingCar ? 'Edit Car Record' : 'Add Constructor Car'}</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                    Constructor *
                  </label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                    Season Year *
                  </label>
                  <input
                    type="number"
                    min="1950"
                    max="2035"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600 font-mono-code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Chassis / Car Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SF-25, MCL38, RB20, W15"
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">Wins</label>
                  <input
                    type="number"
                    min="0"
                    value={wins}
                    onChange={(e) => setWins(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono-code"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">Poles</label>
                  <input
                    type="number"
                    min="0"
                    value={poles}
                    onChange={(e) => setPoles(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono-code"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">Podiums</label>
                  <input
                    type="number"
                    min="0"
                    value={podiums}
                    onChange={(e) => setPodiums(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono-code"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">Points</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono-code"
                  />
                </div>
              </div>

              {/* Car Image render URL & upload */}
              <div className="space-y-1">
                <label className="block text-zinc-400 uppercase font-mono-code">
                  Challenger Image URL or Upload
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={carImageUrl}
                    onChange={(e) => setCarImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-600"
                  />
                  <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3 text-red-500" />
                    <span>{isUploading ? 'Uploading...' : 'File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
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
                  {isSubmitting ? 'Saving...' : editingCar ? 'Update Car' : 'Save Car'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
