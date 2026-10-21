import React, { useState, useEffect } from 'react';
import { Search, Trophy, MapPin, ChevronRight, Users, Car } from 'lucide-react';
import { Team, TeamCar, DriverTeamSeason, Driver } from '../types';
import { getTeams, getTeamCars, getDriverTeamSeasons, getDrivers } from '../services/db';

interface TeamsPageProps {
  navigate: (path: string) => void;
}

export const TeamsPage: React.FC<TeamsPageProps> = ({ navigate }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [cars, setCars] = useState<TeamCar[]>([]);
  const [assignments, setAssignments] = useState<DriverTeamSeason[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [t, c, a, d] = await Promise.all([
          getTeams(),
          getTeamCars(),
          getDriverTeamSeasons(),
          getDrivers(),
        ]);
        setTeams(t);
        setCars(c);
        setAssignments(a);
        setDrivers(d);
      } catch (err) {
        console.error('Error loading teams:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.hq.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
          <Trophy className="w-4 h-4" />
          <span>F1 Constructor Championship Archives</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          Formula 1 Constructors
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Browse official works and privateer constructors. Explore their engineering headquarters, championship points, race victories, and current driver pairings.
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search constructor name or headquarters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-red-600 focus:outline-none text-sm text-white placeholder-zinc-500"
          />
        </div>
        <span className="hidden sm:inline-block text-xs font-mono-code text-zinc-500">
          {filteredTeams.length} Constructors Registered
        </span>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
            No Constructors Registered
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            The constructors database is currently clear. Authorized administrators can register works and privateer teams in the Admin Portal.
          </p>
          <button
            onClick={() => navigate('/admin/teams')}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold font-display uppercase tracking-wider text-white"
          >
            Register Constructor (Admin)
          </button>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
            No Matching Constructors
          </h3>
          <p className="text-sm text-zinc-400">
            No constructors match your search query "{searchQuery}".
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => {
            const teamCars = cars.filter(c => c.team_id === team.id);
            const teamAssigns = assignments.filter(a => a.team_id === team.id);
            const totalWins = teamCars.reduce((sum, c) => sum + (c.wins || 0), 0);
            const totalPoints = teamCars.reduce((sum, c) => sum + Number(c.points || 0), 0);

            return (
              <div
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="group cursor-pointer rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 transition-all p-6 flex flex-col justify-between relative overflow-hidden shadow-xl"
              >
                {/* Team Primary Color Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: team.primary_color }}
                />

                <div className="space-y-4">
                  {/* Logo and HQ */}
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 flex items-center justify-center">
                      {team.logo_url ? (
                        <img
                          src={team.logo_url}
                          alt={team.name}
                          className="max-h-full max-w-full object-contain filter brightness-95"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Trophy className="w-8 h-8 text-zinc-600" />
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-mono-code font-bold uppercase tracking-wider"
                        style={{ color: team.primary_color, backgroundColor: `${team.primary_color}18` }}
                      >
                        Constructor
                      </span>
                      <div className="text-[11px] text-zinc-500 flex items-center justify-end gap-1 mt-1.5">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span className="truncate max-w-[150px]">{team.hq}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-black text-2xl text-white uppercase tracking-wide group-hover:text-red-400 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {team.bio}
                    </p>
                  </div>

                  {/* Drivers Pills */}
                  {teamAssigns.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[10px] uppercase font-mono-code text-zinc-500 mb-1.5 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Registered Drivers</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {teamAssigns.slice(0, 2).map((asg) => {
                          const drv = drivers.find(d => d.id === asg.driver_id);
                          return (
                            <span
                              key={asg.id}
                              className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono-code font-bold text-zinc-300"
                            >
                              {drv?.code || 'DRV'} • {drv?.name?.split(' ').pop()}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Stats & Link */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-3 font-mono-code">
                    {totalWins > 0 && (
                      <span className="text-amber-400 font-bold">
                        {totalWins} Wins
                      </span>
                    )}
                    {totalPoints > 0 && (
                      <span className="text-zinc-300 font-semibold">
                        {totalPoints} Pts
                      </span>
                    )}
                  </div>
                  <span className="text-red-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-semibold text-[11px]">
                    Inspect Team <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
