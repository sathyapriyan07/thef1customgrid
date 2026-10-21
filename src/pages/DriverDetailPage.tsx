import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, Flag, Trophy, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { Driver, Team, DriverTeamSeason, Season } from '../types';
import { getDriverById, getTeams, getDriverTeamSeasons, getSeasons } from '../services/db';

interface DriverDetailPageProps {
  driverId: string;
  navigate: (path: string) => void;
}

export const DriverDetailPage: React.FC<DriverDetailPageProps> = ({ driverId, navigate }) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [driverAssignments, setDriverAssignments] = useState<DriverTeamSeason[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, allTeams, allSeasons, allAssignments] = await Promise.all([
          getDriverById(driverId),
          getTeams(),
          getSeasons(),
          getDriverTeamSeasons(),
        ]);
        setDriver(d);
        setTeams(allTeams);
        setSeasons(allSeasons);
        setDriverAssignments(allAssignments.filter(a => a.driver_id === driverId));
      } catch (err) {
        console.error('Error loading driver detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [driverId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-500 text-xs mt-3 font-mono-code uppercase">Loading Driver Profile...</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Users className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-2xl font-bold font-display uppercase text-white">Driver Not Found</h2>
        <p className="text-sm text-zinc-400">The driver record requested does not exist or was removed.</p>
        <button
          onClick={() => navigate('/drivers')}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-semibold text-xs hover:bg-zinc-700"
        >
          Return to Drivers
        </button>
      </div>
    );
  }

  // Current assignment
  const currentAssignment = driverAssignments[0];
  const currentTeam = currentAssignment ? teams.find(t => t.id === currentAssignment.team_id) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/drivers')}
        className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Driver Directory</span>
      </button>

      {/* Driver Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-10 shadow-2xl overflow-hidden">
        {currentTeam && (
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{ backgroundColor: currentTeam.primary_color }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Portrait Image */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-64 h-72 sm:w-72 sm:h-80 rounded-2xl overflow-hidden bg-zinc-950 border-2 border-zinc-800 shadow-2xl flex items-center justify-center">
              {driver.card_image_url ? (
                <img
                  src={driver.card_image_url}
                  alt={driver.name}
                  className="w-full h-full object-cover object-top filter brightness-95"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center text-zinc-600">
                  <Users className="w-16 h-16" />
                  <span className="text-xs uppercase font-mono-code mt-2">Driver Portrait</span>
                </div>
              )}
              {/* Driver code stamp */}
              <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-zinc-700 font-mono-code font-black text-sm text-white">
                {driver.code}
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono-code font-semibold bg-red-950/60 text-red-400 border border-red-800/40">
                Formula 1 Driver
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-zinc-400" />
                <span>{driver.nationality}</span>
              </span>
              {currentTeam && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold font-display uppercase tracking-wider"
                  style={{ backgroundColor: `${currentTeam.primary_color}25`, color: currentTeam.primary_color }}
                >
                  {currentTeam.name}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-tight">
              {driver.name}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              {driver.bio || 'Professional Formula 1 driver registered for grand prix world championships.'}
            </p>

            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/builder')}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-bold text-sm shadow-lg shadow-red-950/60 transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Assign in Grid Builder</span>
              </button>
              {currentTeam && (
                <button
                  onClick={() => navigate(`/teams/${currentTeam.id}`)}
                  className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-display uppercase tracking-wider font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-zinc-400" />
                  <span>View Constructor ({currentTeam.name})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Driver Gallery (Podium Image & Grid Image) */}
      <div className="space-y-4">
        <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
          Media & Paddock Imagery
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Podium Image */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase font-mono-code">
              Podium Celebration Visual
            </div>
            <div className="w-full h-48 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center overflow-hidden">
              {driver.podium_image_url ? (
                <img
                  src={driver.podium_image_url}
                  alt={`${driver.name} Podium`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-zinc-600 space-y-1">
                  <Trophy className="w-8 h-8 mx-auto" />
                  <span className="text-xs uppercase font-mono-code block">Designed Placeholder</span>
                  <span className="text-[11px] text-zinc-500">No podium photo uploaded yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Grid Image */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase font-mono-code">
              Starting Grid Suit Visual
            </div>
            <div className="w-full h-48 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center overflow-hidden">
              {driver.grid_image_url ? (
                <img
                  src={driver.grid_image_url}
                  alt={`${driver.name} Grid Suit`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-zinc-600 space-y-1">
                  <Users className="w-8 h-8 mx-auto" />
                  <span className="text-xs uppercase font-mono-code block">Designed Placeholder</span>
                  <span className="text-[11px] text-zinc-500">No grid suit photo uploaded yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Team Affiliations */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 space-y-4">
        <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
          Season & Constructor Assignments
        </h3>

        {driverAssignments.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No assigned seasons in the current database registry.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {driverAssignments.map(assign => {
              const tm = teams.find(t => t.id === assign.team_id);
              const sn = seasons.find(s => s.id === assign.season_id);
              return (
                <div
                  key={assign.id}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-10 rounded-full"
                      style={{ backgroundColor: tm?.primary_color || '#E10600' }}
                    />
                    <div>
                      <div className="text-xs text-zinc-400 uppercase font-mono-code">
                        {sn?.name || 'Grand Prix Season'}
                      </div>
                      <div className="font-display font-bold text-base text-white uppercase">
                        {tm?.name || 'Constructor'}
                      </div>
                      <div className="text-[11px] text-zinc-400">Seat {assign.seat_number}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
