import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, ChevronRight, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { Season, DriverTeamSeason, Team, Driver, TeamCar } from '../types';
import { getSeasons, getDriverTeamSeasons, getTeams, getDrivers, getTeamCars } from '../services/db';

interface SeasonsPageProps {
  navigate: (path: string) => void;
}

export const SeasonsPage: React.FC<SeasonsPageProps> = ({ navigate }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [assignments, setAssignments] = useState<DriverTeamSeason[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [cars, setCars] = useState<TeamCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a, t, d, c] = await Promise.all([
          getSeasons(),
          getDriverTeamSeasons(),
          getTeams(),
          getDrivers(),
          getTeamCars(),
        ]);
        setSeasons(s);
        setAssignments(a);
        setTeams(t);
        setDrivers(d);
        setCars(c);
      } catch (err) {
        console.error('Error loading seasons:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
          <Calendar className="w-4 h-4" />
          <span>F1 Grand Prix Eras</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          Season Explorer
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Explore modern championship seasons, historic title battles, and fantasy regulation expansions with independent constructor cars and driver lineups.
        </p>
      </div>

      {/* Seasons list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : seasons.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
            No Seasons Registered
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            The seasons database is currently clear. Authorized administrators can configure championship or fantasy eras in the Admin Portal.
          </p>
          <button
            onClick={() => navigate('/admin/seasons')}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold font-display uppercase tracking-wider text-white"
          >
            Create Season (Admin)
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {seasons.map(season => {
            const seasonAssignments = assignments.filter(a => a.season_id === season.id);
            const participatingTeamIds = Array.from(new Set(seasonAssignments.map(a => a.team_id)));
            const seasonCars = cars.filter(c => c.year === season.year);

            return (
              <div
                key={season.id}
                className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 space-y-6 hover:border-zinc-700 transition-all shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                        {season.season_type}
                      </span>
                      {season.is_current && (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Current Official Season</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
                      {season.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => navigate('/builder')}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase font-bold text-xs tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>Load Into Grid Builder</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Lineup pairings summary for this season */}
                <div className="space-y-3">
                  <div className="text-xs font-mono-code text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Registered Constructor Lineups ({participatingTeamIds.length} Teams)</span>
                  </div>

                  {participatingTeamIds.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No official pairings recorded yet for this season.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {participatingTeamIds.map(tId => {
                        const team = teams.find(t => t.id === tId);
                        const teamAssigns = seasonAssignments.filter(a => a.team_id === tId).sort((a, b) => a.seat_number - b.seat_number);

                        return (
                          <div
                            key={tId}
                            className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-2 relative overflow-hidden"
                          >
                            <div
                              className="absolute top-0 left-0 right-0 h-1"
                              style={{ backgroundColor: team?.primary_color || '#E10600' }}
                            />
                            <div className="font-display font-black text-sm text-white uppercase truncate pt-0.5">
                              {team?.name || 'Constructor'}
                            </div>
                            <div className="space-y-1 text-xs">
                              {teamAssigns.map(asg => {
                                const driver = drivers.find(d => d.id === asg.driver_id);
                                return (
                                  <div key={asg.id} className="flex items-center justify-between text-zinc-300">
                                    <span className="text-[10px] font-mono-code text-zinc-500">P{asg.seat_number}</span>
                                    <span className="font-mono-code font-bold text-[11px] truncate">{driver?.code || 'DRV'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
