import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, ChevronRight, Trophy, Flag, ArrowUpDown } from 'lucide-react';
import { Driver, Team, DriverTeamSeason } from '../types';
import { getDrivers, getTeams, getDriverTeamSeasons } from '../services/db';

interface DriversPageProps {
  navigate: (path: string) => void;
}

export const DriversPage: React.FC<DriversPageProps> = ({ navigate }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [assignments, setAssignments] = useState<DriverTeamSeason[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'code'>('name');

  useEffect(() => {
    async function load() {
      try {
        const [driversData, teamsData, assignData] = await Promise.all([
          getDrivers(),
          getTeams(),
          getDriverTeamSeasons(),
        ]);
        setDrivers(driversData);
        setTeams(teamsData);
        setAssignments(assignData);
      } catch (err) {
        console.error('Failed to load drivers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute unique nationalities
  const nationalities = Array.from(new Set(drivers.map(d => d.nationality).filter(Boolean))).sort();

  // Filtered and sorted drivers
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNationality = 
      selectedNationality === 'all' || d.nationality === selectedNationality;
    return matchesSearch && matchesNationality;
  }).sort((a, b) => {
    if (sortBy === 'code') return a.code.localeCompare(b.code);
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
          <Users className="w-4 h-4" />
          <span>F1 Driver Roster Archive</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          Formula 1 Drivers
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Search and explore current, historic, and fantasy grand prix contenders. Check their official three-letter driver codes, career affiliations, and biographies.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by driver name or code (e.g. VER, HAM, NOR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-red-600 focus:outline-none text-sm text-white placeholder-zinc-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Nationality Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
            <select
              value={selectedNationality}
              onChange={(e) => setSelectedNationality(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-red-600 w-full md:w-auto"
            >
              <option value="all">All Nationalities</option>
              {nationalities.map(nat => (
                <option key={nat} value={nat}>{nat}</option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-zinc-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'code')}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-red-600"
            >
              <option value="name">Sort by Name</option>
              <option value="code">Sort by Code (3-letter)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Driver Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
            No Drivers Registered
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            The driver database is currently clear. Authorized administrators can register new drivers via the Admin Portal.
          </p>
          <button
            onClick={() => navigate('/admin/drivers')}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold font-display uppercase tracking-wider text-white"
          >
            Register Driver (Admin)
          </button>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
            No Matching Drivers
          </h3>
          <p className="text-sm text-zinc-400">
            No drivers match your search query or nationality filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedNationality('all'); }}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDrivers.map(driver => {
            // Find current/latest assignment
            const assignment = assignments.find(a => a.driver_id === driver.id);
            const team = assignment ? teams.find(t => t.id === assignment.team_id) : null;

            return (
              <div
                key={driver.id}
                onClick={() => navigate(`/drivers/${driver.id}`)}
                className="group cursor-pointer rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 transition-all p-4 flex flex-col justify-between relative overflow-hidden shadow-xl"
              >
                {/* Team color accent line if assigned */}
                {team && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: team.primary_color }}
                  />
                )}

                {/* Driver Portrait Card with Code Badge */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 mb-3 border border-zinc-800/80 flex items-center justify-center">
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
                    <div className="flex flex-col items-center justify-center text-zinc-600">
                      <Users className="w-12 h-12" />
                      <span className="text-[10px] uppercase font-mono-code mt-1">No Portrait</span>
                    </div>
                  )}

                  {/* 3-letter code badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-sm border border-zinc-700 font-mono-code font-black text-xs text-white shadow-lg">
                    {driver.code}
                  </div>

                  {/* Assigned team pill */}
                  {team && (
                    <div 
                      className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold font-display uppercase tracking-wider backdrop-blur-md shadow"
                      style={{ backgroundColor: `${team.primary_color}dd`, color: '#ffffff' }}
                    >
                      {team.name}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-lg text-white uppercase tracking-wide group-hover:text-red-400 transition-colors truncate">
                      {driver.name}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {driver.bio || 'Grand Prix driver active in modern & historical Formula 1 championships.'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Flag className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{driver.nationality}</span>
                  </span>
                  <span className="text-red-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-semibold text-[11px]">
                    Profile <ChevronRight className="w-3.5 h-3.5" />
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
