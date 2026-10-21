import React, { useState, useEffect } from 'react';
import { Flag, Plus, Trash2, X, AlertTriangle, Users, Trophy } from 'lucide-react';
import { DriverTeamSeason, Team, Driver, Season } from '../../types';
import { 
  getDriverTeamSeasons, 
  createDriverTeamSeason, 
  deleteDriverTeamSeason, 
  getTeams, 
  getDrivers, 
  getSeasons 
} from '../../services/db';
import { useToast } from '../../context/ToastContext';

export const AdminAssignmentsPage: React.FC = () => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<DriverTeamSeason[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('s-2025');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [seasonId, setSeasonId] = useState('s-2025');
  const [seatNumber, setSeatNumber] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [a, t, d, s] = await Promise.all([
        getDriverTeamSeasons(),
        getTeams(),
        getDrivers(),
        getSeasons(),
      ]);
      setAssignments(a);
      setTeams(t);
      setDrivers(d);
      setSeasons(s);
      if (t.length > 0 && !teamId) setTeamId(t[0].id);
      if (d.length > 0 && !driverId) setDriverId(d[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = (presetTeamId?: string, presetSeat?: 1 | 2) => {
    setTeamId(presetTeamId || teams[0]?.id || '');
    setDriverId(drivers[0]?.id || '');
    setSeasonId(selectedSeasonId);
    setSeatNumber(presetSeat || 1);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverId || !teamId || !seasonId) {
      toast.error('Validation Error', 'Driver, team and season are required.');
      return;
    }

    // Conflict checks:
    // 1. Is driver already assigned in this season?
    const driverConflict = assignments.find(
      a => a.season_id === seasonId && a.driver_id === driverId
    );
    if (driverConflict) {
      const conflictingTeam = teams.find(t => t.id === driverConflict.team_id);
      toast.warning(
        'Driver Reallocated',
        `Driver was already assigned to ${conflictingTeam?.name || 'another team'}. Reassigning cockpit.`
      );
    }

    // 2. Is this team's seat already occupied?
    const seatConflict = assignments.find(
      a => a.season_id === seasonId && a.team_id === teamId && a.seat_number === seatNumber
    );

    setIsSubmitting(true);
    try {
      await createDriverTeamSeason({
        driver_id: driverId,
        team_id: teamId,
        season_id: seasonId,
        seat_number: seatNumber,
      });

      toast.success('Driver cockpit assignment updated');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Assignment error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDriverTeamSeason(id);
      toast.success('Seat assignment removed');
      loadData();
    } catch (err: any) {
      toast.error('Failed to remove assignment', err.message);
    }
  };

  const seasonAssignments = assignments.filter(a => a.season_id === selectedSeasonId);

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
            <Flag className="w-4 h-4" />
            <span>Driver-Team Cockpit Assignments</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">
            Official Lineup Assignments
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pair drivers with constructor seat 1 or seat 2 for each Formula 1 season.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-xs shadow-lg shadow-red-950/60 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Season Selector Toolbar */}
      <div className="bg-[#121316] border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono-code text-zinc-400 uppercase">Target Season:</span>
          <select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-red-600"
          >
            {seasons.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.year || 'Era'})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono-code text-zinc-500">
          {seasonAssignments.length} Cockpits Assigned
        </span>
      </div>

      {/* Team Pairings Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map(team => {
          const teamSeats = seasonAssignments.filter(a => a.team_id === team.id);
          const seat1 = teamSeats.find(s => s.seat_number === 1);
          const seat2 = teamSeats.find(s => s.seat_number === 2);
          const driver1 = seat1 ? drivers.find(d => d.id === seat1.driver_id) : null;
          const driver2 = seat2 ? drivers.find(d => d.id === seat2.driver_id) : null;

          return (
            <div
              key={team.id}
              className="rounded-2xl bg-[#121316] border border-zinc-800 p-5 space-y-4 shadow-xl relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: team.primary_color }}
              />

              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt={team.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Trophy className="w-4 h-4 text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-white uppercase">
                      {team.name}
                    </h3>
                    <div className="text-[10px] text-zinc-400 font-mono-code">{team.hq}</div>
                  </div>
                </div>
              </div>

              {/* Both Seats Displayed Together */}
              <div className="grid grid-cols-2 gap-3">
                {/* Seat 1 */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-zinc-400">
                    <span className="font-bold">SEAT 1</span>
                    {seat1 && (
                      <button
                        onClick={() => handleDelete(seat1.id)}
                        className="text-zinc-600 hover:text-red-400"
                        title="Remove assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {driver1 ? (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-1.5 py-0.2 rounded font-mono-code font-black text-[10px] text-white"
                          style={{ backgroundColor: team.primary_color }}
                        >
                          {driver1.code}
                        </span>
                        <div className="font-display font-black text-sm text-white uppercase truncate">
                          {driver1.name}
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{driver1.nationality}</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openCreateModal(team.id, 1)}
                      className="w-full py-2 text-center text-xs text-zinc-500 hover:text-white bg-zinc-900/40 hover:bg-zinc-900 rounded-lg transition-colors border border-dashed border-zinc-800"
                    >
                      + Assign Seat 1
                    </button>
                  )}
                </div>

                {/* Seat 2 */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-zinc-400">
                    <span className="font-bold">SEAT 2</span>
                    {seat2 && (
                      <button
                        onClick={() => handleDelete(seat2.id)}
                        className="text-zinc-600 hover:text-red-400"
                        title="Remove assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {driver2 ? (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-1.5 py-0.2 rounded font-mono-code font-black text-[10px] text-white"
                          style={{ backgroundColor: team.primary_color }}
                        >
                          {driver2.code}
                        </span>
                        <div className="font-display font-black text-sm text-white uppercase truncate">
                          {driver2.name}
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{driver2.nationality}</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openCreateModal(team.id, 2)}
                      className="w-full py-2 text-center text-xs text-zinc-500 hover:text-white bg-zinc-900/40 hover:bg-zinc-900 rounded-lg transition-colors border border-dashed border-zinc-800"
                    >
                      + Assign Seat 2
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-display font-black text-xl uppercase tracking-wider text-white">
                <Flag className="w-5 h-5 text-red-500" />
                <span>Assign Driver to Constructor</span>
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
                  Season
                </label>
                <select
                  value={seasonId}
                  onChange={(e) => setSeasonId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                >
                  {seasons.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Constructor
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
                  Driver
                </label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600 font-mono-code"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      [{d.code}] {d.name} ({d.nationality})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Cockpit Seat
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSeatNumber(1)}
                    className={`py-2 rounded-xl font-bold font-mono-code transition-all ${
                      seatNumber === 1
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    Seat 1 (P1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeatNumber(2)}
                    className={`py-2 rounded-xl font-bold font-mono-code transition-all ${
                      seatNumber === 2
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    Seat 2 (P2)
                  </button>
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
                  {isSubmitting ? 'Saving...' : 'Confirm Seat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
