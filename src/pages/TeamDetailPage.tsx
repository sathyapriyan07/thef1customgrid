import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, MapPin, Users, Car, Flag, Layers, Award } from 'lucide-react';
import { Team, TeamCar, DriverTeamSeason, Driver, Season } from '../types';
import { getTeamById, getTeamCars, getDriverTeamSeasons, getDrivers, getSeasons } from '../services/db';

interface TeamDetailPageProps {
  teamId: string;
  navigate: (path: string) => void;
}

export const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ teamId, navigate }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [cars, setCars] = useState<TeamCar[]>([]);
  const [assignments, setAssignments] = useState<DriverTeamSeason[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [t, c, a, d, s] = await Promise.all([
          getTeamById(teamId),
          getTeamCars(teamId),
          getDriverTeamSeasons(),
          getDrivers(),
          getSeasons(),
        ]);
        setTeam(t);
        setCars(c);
        setAssignments(a.filter(item => item.team_id === teamId));
        setDrivers(d);
        setSeasons(s);
      } catch (err) {
        console.error('Error loading team detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [teamId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-500 text-xs mt-3 font-mono-code uppercase">Loading Team Paddock Data...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Trophy className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-2xl font-bold font-display uppercase text-white">Constructor Not Found</h2>
        <p className="text-sm text-zinc-400">The team record requested was not found.</p>
        <button
          onClick={() => navigate('/teams')}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-semibold text-xs hover:bg-zinc-700"
        >
          Return to Constructors
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <button
        onClick={() => navigate('/teams')}
        className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Constructors Archive</span>
      </button>

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: team.primary_color }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-2xl bg-zinc-950 border border-zinc-800 p-3 flex items-center justify-center shrink-0">
              {team.logo_url ? (
                <img
                  src={team.logo_url}
                  alt={team.name}
                  className="max-h-full max-w-full object-contain filter brightness-95"
                />
              ) : (
                <Trophy className="w-10 h-10 text-zinc-500" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-mono-code font-bold uppercase"
                  style={{ color: team.primary_color, backgroundColor: `${team.primary_color}18` }}
                >
                  F1 Constructor
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono-code">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{team.hq}</span>
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
                {team.name}
              </h1>
            </div>
          </div>

          <button
            onClick={() => navigate('/builder')}
            className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-sm shadow-xl shadow-red-950/60 transition-all flex items-center gap-2 shrink-0"
          >
            <Layers className="w-4 h-4" />
            <span>Select in Grid Builder</span>
          </button>
        </div>

        <p className="mt-6 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl border-t border-zinc-800/80 pt-6">
          {team.bio}
        </p>
      </div>

      {/* Driver Lineup for this Team */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
          <Users className="w-4 h-4" />
          <span>Cockpit Assignments</span>
        </div>
        <h2 className="text-2xl font-black text-white font-display uppercase tracking-wide">
          Official Team Drivers
        </h2>

        {assignments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-sm text-zinc-500">
            No driver assignments currently recorded for this constructor.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {assignments.map(asg => {
              const driver = drivers.find(d => d.id === asg.driver_id);
              const season = seasons.find(s => s.id === asg.season_id);

              return (
                <div
                  key={asg.id}
                  onClick={() => driver && navigate(`/drivers/${driver.id}`)}
                  className="cursor-pointer group rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800 p-5 flex items-center gap-4 transition-all"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                    {driver?.card_image_url ? (
                      <img src={driver.card_image_url} alt={driver.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono-code font-bold">
                        {driver?.code || 'DRV'}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono-code uppercase text-zinc-400">
                      {season?.name || 'Grand Prix Season'} • Seat {asg.seat_number}
                    </div>
                    <div className="font-display font-black text-lg text-white uppercase truncate group-hover:text-red-400 transition-colors">
                      {driver?.name || 'Driver'}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono-code font-bold">
                      {driver?.code} • {driver?.nationality}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Car & Season Records */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
          <Car className="w-4 h-4" />
          <span>Engineering Records</span>
        </div>
        <h2 className="text-2xl font-black text-white font-display uppercase tracking-wide">
          Challengers & Statistics
        </h2>

        {cars.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-sm text-zinc-500">
            No specific car models or historical statistics recorded for this constructor yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cars.map(car => (
              <div key={car.id} className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-xs font-mono-code text-red-400 font-bold uppercase">
                      {car.year} Season
                    </span>
                    <h3 className="text-xl font-display font-black text-white uppercase tracking-wide">
                      {car.car_name}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono-code font-bold bg-zinc-800 text-zinc-300">
                    {car.points} Pts
                  </span>
                </div>

                {/* Car Image render if present */}
                {car.car_image_url && (
                  <div className="w-full h-40 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80">
                    <img
                      src={car.car_image_url}
                      alt={car.car_name}
                      className="w-full h-full object-cover filter brightness-90"
                    />
                  </div>
                )}

                {/* Stats Table */}
                <div className="grid grid-cols-4 gap-2 text-center pt-2">
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                    <div className="text-xs text-zinc-500 uppercase font-mono-code">Wins</div>
                    <div className="text-lg font-black text-amber-400 font-display">{car.wins}</div>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                    <div className="text-xs text-zinc-500 uppercase font-mono-code">Poles</div>
                    <div className="text-lg font-black text-cyan-400 font-display">{car.poles}</div>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                    <div className="text-xs text-zinc-500 uppercase font-mono-code">Podiums</div>
                    <div className="text-lg font-black text-emerald-400 font-display">{car.podiums}</div>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                    <div className="text-xs text-zinc-500 uppercase font-mono-code">Points</div>
                    <div className="text-lg font-black text-white font-display">{car.points}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
