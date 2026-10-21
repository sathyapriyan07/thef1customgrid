import React, { useEffect, useState } from 'react';
import { 
  Layers, 
  Users, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Share2, 
  Flag, 
  CheckCircle, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Team, Driver, Season, CustomLineup } from '../types';
import { getTeams, getDrivers, getSeasons, getLineups } from '../services/db';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [lineups, setLineups] = useState<CustomLineup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [teamsData, driversData, seasonsData, lineupsData] = await Promise.all([
          getTeams(),
          getDrivers(),
          getSeasons(),
          getLineups(undefined, true),
        ]);
        setTeams(teamsData);
        setDrivers(driversData);
        setSeasons(seasonsData);
        setLineups(lineupsData);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-[#0e0f14] to-[#0c0d10] border-b border-zinc-800/60 pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient racing background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute -top-24 right-10 w-96 h-96 bg-cyan-500/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono-code uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Next-Gen Formula 1 Grid Simulator</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white font-display tracking-tight uppercase leading-[0.95]">
                Build Your Own <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-amber-500">
                  F1 Grand Prix Grid
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl font-normal leading-relaxed">
                Take control of the paddock. Assign drivers to legendary constructors, simulate 10, 11, or 12 team alternate-history seasons, design fantasy pairings, and export high-resolution posters suitable for print.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/builder')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-display uppercase tracking-wider font-extrabold text-lg shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2 group"
                >
                  <Layers className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Build Your Grid</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate('/drivers')}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-display uppercase tracking-wider font-bold text-base transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span>Explore Drivers</span>
                </button>
              </div>

              {/* Fast Stats Row */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-zinc-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-white">
                    {teams.length}
                  </div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wide">Constructors</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-white">
                    {drivers.length}
                  </div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wide">Drivers Active</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-red-500">
                    10-12
                  </div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wide">Team Grid Layouts</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Grid Teaser Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <span className="font-display font-bold uppercase tracking-wider text-sm text-white">
                      Starting Grid Simulator
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {lineups.length > 0 ? `${lineups.length} SAVED GRIDS` : 'CLEAN SLATE'}
                  </span>
                </div>

                {/* Dynamic or Empty Slots preview */}
                <div className="space-y-2.5">
                  {lineups.length > 0 ? (
                    lineups[0].teams.slice(0, 5).map((slot, idx) => {
                      const t = teams.find(team => team.id === slot.team_id);
                      const d1 = drivers.find(d => d.id === slot.seats[0]?.driver_id);
                      const d2 = drivers.find(d => d.id === slot.seats[1]?.driver_id);
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between transition-all hover:border-zinc-700"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: t?.primary_color || '#E10600' }} />
                            <div>
                              <div className="text-xs font-bold text-white uppercase font-display tracking-wider">
                                {t?.name || slot.custom_team_name || `Constructor ${idx + 1}`}
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                {d1?.name || '[ Open Seat 1 ]'} &bull; {d2?.name || '[ Open Seat 2 ]'}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-mono-code text-zinc-500">#{idx + 1}</span>
                        </div>
                      );
                    })
                  ) : (
                    [1, 2, 3, 4, 5].map((slotNum) => (
                      <div
                        key={slotNum}
                        className="p-3 rounded-xl bg-zinc-900/50 border border-dashed border-zinc-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-8 rounded-full bg-zinc-800" />
                          <div>
                            <div className="text-xs font-bold text-zinc-300 uppercase font-display tracking-wider">
                              Constructor Slot #{slotNum}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono-code">
                              Cockpit 1: [ Open ] &bull; Cockpit 2: [ Open ]
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono-code text-zinc-600">P{slotNum}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/builder')}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Launch Grid Builder (Clean Slate)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Current Constructors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="text-red-500 font-mono-code text-xs uppercase tracking-widest font-semibold">
              Paddock Garages
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
              Featured Constructors
            </h2>
          </div>
          <button
            onClick={() => navigate('/teams')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <span>View All Constructors</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
            <Trophy className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
              No Constructors Registered Yet
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              The database is currently clean and empty. Authorized administrators can register teams or apply sample data in the FIA Admin Portal.
            </p>
            <button
              onClick={() => navigate('/admin/teams')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold font-display uppercase text-xs"
            >
              Add Constructor (Admin)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {teams.slice(0, 4).map((team) => (
              <div
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="group cursor-pointer rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 transition-all p-5 flex flex-col justify-between relative overflow-hidden shadow-lg"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: team.primary_color }}
                />
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 p-2 flex items-center justify-center border border-zinc-800">
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
                        <Trophy className="w-6 h-6 text-zinc-500" />
                      )}
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase"
                      style={{ color: team.primary_color, backgroundColor: `${team.primary_color}18` }}
                    >
                      Works Team
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wide group-hover:text-red-400 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {team.bio}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span className="truncate">{team.hq}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-zinc-500 group-hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Drivers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="text-red-500 font-mono-code text-xs uppercase tracking-widest font-semibold">
              The Grid Talent
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
              Featured Drivers
            </h2>
          </div>
          <button
            onClick={() => navigate('/drivers')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <span>Browse Full Driver Roster</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {drivers.length === 0 ? (
          <div className="p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
            <Users className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
              No Drivers Registered Yet
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Register drivers with three-letter superlicense codes in the FIA Admin Portal.
            </p>
            <button
              onClick={() => navigate('/admin/drivers')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold font-display uppercase text-xs"
            >
              Add Driver (Admin)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {drivers.slice(0, 6).map((driver) => (
              <div
                key={driver.id}
                onClick={() => navigate(`/drivers/${driver.id}`)}
                className="group cursor-pointer rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 transition-all p-3.5 flex flex-col justify-between text-center relative overflow-hidden"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-950 mb-3 border border-zinc-800/90 flex items-center justify-center">
                  {driver.card_image_url ? (
                    <img
                      src={driver.card_image_url}
                      alt={driver.name}
                      className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Users className="w-10 h-10 text-zinc-600" />
                  )}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono-code font-black text-[11px] text-white">
                    {driver.code}
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-black text-base text-white uppercase tracking-wider group-hover:text-red-400 transition-colors truncate">
                    {driver.name}
                  </h4>
                  <div className="text-[11px] text-zinc-400 font-medium">
                    {driver.nationality}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Community Grids Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="text-red-500 font-mono-code text-xs uppercase tracking-widest font-semibold">
              Curated Community Creations
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
              Featured Custom Grids
            </h2>
          </div>
          <button
            onClick={() => navigate('/my-grids')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <span>Explore All Grids</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {lineups.length === 0 ? (
          <div className="p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
            <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
              No Saved Custom Grids Yet
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Be the first to construct an alternate-history Formula 1 grid and save it to the public paddock gallery!
            </p>
            <button
              onClick={() => navigate('/builder')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold font-display uppercase text-xs"
            >
              Build First Grid
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lineups.slice(0, 2).map((lineup) => (
              <div
                key={lineup.id}
                className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-red-950/60 text-red-400 border border-red-800/40">
                      {lineup.team_count} Teams
                    </span>
                    <h3 className="text-xl font-display font-black text-white uppercase tracking-wide mt-1">
                      {lineup.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/grids/${lineup.id}/poster`)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>Poster Studio</span>
                    </button>
                    <button
                      onClick={() => navigate(`/grids/${lineup.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                    >
                      View Grid
                    </button>
                  </div>
                </div>

                {/* Quick team pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {lineup.teams.slice(0, 6).map((slot, i) => {
                    const t = teams.find((team) => team.id === slot.team_id);
                    return (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-medium flex items-center gap-1.5"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t?.primary_color || '#E10600' }}
                        />
                        <span>{t?.name || slot.custom_team_name || `Team ${i + 1}`}</span>
                      </span>
                    );
                  })}
                  {lineup.teams.length > 6 && (
                    <span className="px-2 py-1 rounded bg-zinc-800/80 text-[11px] text-zinc-400">
                      +{lineup.teams.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Callout Banner: Custom Grid Builder CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-red-950/60 via-zinc-900 to-zinc-950 border border-red-900/30 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-red-400 font-mono-code text-xs uppercase tracking-widest font-bold">
              Unleash Paddock Creativity
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight leading-tight">
              Ready to construct your dream starting grid?
            </h2>
            <p className="text-sm sm:text-base text-zinc-300">
              Pick 10, 11, or 12 constructors, fill every cockpit with your preferred drivers, detect duplicate seat conflicts in real time, and render downloadable ultra-DPI posters.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/builder')}
                className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-base shadow-lg shadow-red-950/60 transition-all flex items-center gap-2"
              >
                <Layers className="w-5 h-5" />
                <span>Launch Grid Builder</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
