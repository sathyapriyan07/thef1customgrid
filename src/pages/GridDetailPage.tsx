import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Copy, 
  Share2, 
  Trophy, 
  Users, 
  Calendar,
  Layers,
  Flag
} from 'lucide-react';
import { CustomLineup, Team, Driver, Season } from '../types';
import { getLineupById, getTeams, getDrivers, getSeasons, saveLineup } from '../services/db';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface GridDetailPageProps {
  gridId: string;
  navigate: (path: string) => void;
}

export const GridDetailPage: React.FC<GridDetailPageProps> = ({ gridId, navigate }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [lineup, setLineup] = useState<CustomLineup | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [l, t, d, s] = await Promise.all([
          getLineupById(gridId),
          getTeams(),
          getDrivers(),
          getSeasons(),
        ]);
        setLineup(l);
        setTeams(t);
        setDrivers(d);
        setSeasons(s);
      } catch (err) {
        console.error('Error loading grid detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [gridId]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Public URL Copied!', 'Grid link copied to clipboard.');
    }
  };

  const handleDuplicate = async () => {
    if (!lineup) return;
    try {
      const { id, created_at, updated_at, ...rest } = lineup;
      const copy = await saveLineup({
        ...rest,
        name: `${lineup.name} (Duplicate)`,
        created_by: user?.id || null,
      });
      toast.success('Grid Duplicated!');
      navigate(`/builder?edit=${copy.id}`);
    } catch (err: any) {
      toast.error('Duplicate Error', err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-500 text-xs mt-3 font-mono-code uppercase">Loading Grid Lineup...</p>
      </div>
    );
  }

  if (!lineup) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Layers className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-2xl font-bold font-display uppercase text-white">Lineup Not Found</h2>
        <p className="text-sm text-zinc-400">The requested custom grid does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/my-grids')}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-semibold text-xs hover:bg-zinc-700"
        >
          View All Grids
        </button>
      </div>
    );
  }

  const season = seasons.find(s => s.id === lineup.season_id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <button
          onClick={() => navigate('/my-grids')}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Saved Grids</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={handleDuplicate}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={() => navigate(`/builder?edit=${lineup.id}`)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit in Builder</span>
          </button>
          <button
            onClick={() => navigate(`/grids/${lineup.id}/poster`)}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase font-bold text-xs tracking-wider shadow-lg shadow-red-950/60 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Poster</span>
          </button>
        </div>
      </div>

      {/* Grid Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-zinc-900 via-[#14151a] to-zinc-950 border border-zinc-800 p-8 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono-code font-bold uppercase bg-red-950/60 text-red-400 border border-red-800/40">
            {lineup.team_count} Constructors
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono-code uppercase bg-zinc-800 text-zinc-300">
            {season?.name || 'Grand Prix Specification'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono-code uppercase bg-zinc-800 text-zinc-300">
            {lineup.status === 'complete' ? 'Complete Lineup' : 'Draft Lineup'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          {lineup.name}
        </h1>
      </div>

      {/* Lineup Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {lineup.teams.map((slot, idx) => {
          const team = teams.find(t => t.id === slot.team_id);
          const teamName = slot.custom_team_name || team?.name || `Team ${idx + 1}`;
          const primaryColor = slot.custom_primary_color || team?.primary_color || '#E10600';
          const logoUrl = slot.custom_logo_url || team?.logo_url;

          return (
            <div
              key={idx}
              className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4 shadow-xl relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: primaryColor }}
              />

              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 p-1.5 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt={teamName} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Trophy className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-code text-zinc-500 font-bold">
                      Position #{slot.position || idx + 1}
                    </span>
                    <h3 className="font-display font-black text-xl text-white uppercase truncate">
                      {teamName}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Driver Seats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([1, 2] as const).map(seatNum => {
                  const seat = slot.seats?.find(s => s.seat_number === seatNum);
                  const driver = drivers.find(d => d.id === seat?.driver_id);

                  return (
                    <div
                      key={seatNum}
                      className="rounded-xl p-3 bg-zinc-950 border border-zinc-800/90 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                        {driver?.card_image_url ? (
                          <img src={driver.card_image_url} alt={driver.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono-code text-xs text-zinc-600">
                            {driver?.code || 'P' + seatNum}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-[10px] font-mono-code text-zinc-500">Seat {seatNum}</div>
                        {driver ? (
                          <>
                            <div className="font-display font-black text-sm text-white uppercase truncate">
                              {driver.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono-code font-bold">
                              {driver.code} &bull; {driver.nationality}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-zinc-600 italic">Empty Seat</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
