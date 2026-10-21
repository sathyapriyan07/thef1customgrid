import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  RotateCcw, 
  Sparkles, 
  Save, 
  Download, 
  Trash2, 
  Plus, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Search, 
  Trophy, 
  Flag,
  Share2,
  ExternalLink,
  ChevronRight,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team, Driver, CustomLineup, CustomLineupTeam, CustomLineupSeat, Season } from '../types';
import { getTeams, getDrivers, getSeasons, saveLineup, getLineupById } from '../services/db';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface GridBuilderPageProps {
  navigate: (path: string) => void;
  editGridId?: string;
}

export const GridBuilderPage: React.FC<GridBuilderPageProps> = ({ navigate, editGridId }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  // Grid Configuration state
  const [gridName, setGridName] = useState('My Custom F1 Grid');
  const [teamCount, setTeamCount] = useState<10 | 11 | 12>(10);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('s-2025');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  // Slots: array of CustomLineupTeam
  const [gridTeams, setGridTeams] = useState<CustomLineupTeam[]>([]);

  // Driver picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<{ teamIndex: number; seatNumber: 1 | 2 } | null>(null);
  const [driverSearch, setDriverSearch] = useState('');
  const [driverNationalityFilter, setDriverNationalityFilter] = useState('all');

  // Constructor selector modal state
  const [teamSelectorOpen, setTeamSelectorOpen] = useState(false);
  const [targetTeamIndex, setTargetTeamIndex] = useState<number | null>(null);

  // Custom Fictional Team Modal
  const [customTeamModalOpen, setCustomTeamModalOpen] = useState(false);
  const [customTeamName, setCustomTeamName] = useState('');
  const [customTeamColor, setCustomTeamColor] = useState('#E10600');
  const [customTeamLogo, setCustomTeamLogo] = useState('');

  // Confirmation dialogs
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize slots
  const initDefaultGrid = (count: 10 | 11 | 12, availableTeams: Team[]) => {
    const slots: CustomLineupTeam[] = [];
    for (let i = 0; i < count; i++) {
      const defaultTeam = availableTeams[i] || null;
      slots.push({
        position: i + 1,
        team_id: defaultTeam ? defaultTeam.id : null,
        seats: [
          { seat_number: 1, driver_id: null },
          { seat_number: 2, driver_id: null },
        ],
      });
    }
    return slots;
  };

  useEffect(() => {
    async function load() {
      try {
        const [teamsData, driversData, seasonsData] = await Promise.all([
          getTeams(),
          getDrivers(),
          getSeasons(),
        ]);
        setTeams(teamsData);
        setDrivers(driversData);
        setSeasons(seasonsData);

        if (editGridId) {
          const existing = await getLineupById(editGridId);
          if (existing) {
            setGridName(existing.name);
            setTeamCount(existing.team_count);
            if (existing.season_id) setSelectedSeasonId(existing.season_id);
            if (existing.visibility === 'public' || existing.visibility === 'private') {
              setVisibility(existing.visibility);
            }
            setGridTeams(existing.teams);
            setLoading(false);
            return;
          }
        }

        // Default: 10 teams using available constructors
        setGridTeams(initDefaultGrid(10, teamsData));
      } catch (err) {
        console.error('Failed to load Grid Builder data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [editGridId]);

  // Adjust team count dynamically
  const handleTeamCountChange = (newCount: 10 | 11 | 12) => {
    if (newCount === teamCount) return;
    setTeamCount(newCount);

    setGridTeams(prev => {
      if (newCount > prev.length) {
        // Expand
        const updated = [...prev];
        for (let i = prev.length; i < newCount; i++) {
          const nextTeam = teams[i] || null;
          updated.push({
            position: i + 1,
            team_id: nextTeam ? nextTeam.id : null,
            seats: [
              { seat_number: 1, driver_id: null },
              { seat_number: 2, driver_id: null },
            ],
          });
        }
        return updated;
      } else {
        // Shrink
        return prev.slice(0, newCount);
      }
    });
  };

  // Compute duplicate drivers
  const assignedDriverIds: string[] = [];
  const duplicateDriverIds = new Set<string>();

  gridTeams.forEach(teamSlot => {
    teamSlot.seats?.forEach(seat => {
      if (seat.driver_id) {
        if (assignedDriverIds.includes(seat.driver_id)) {
          duplicateDriverIds.add(seat.driver_id);
        } else {
          assignedDriverIds.push(seat.driver_id);
        }
      }
    });
  });

  const totalSeats = teamCount * 2;
  const filledSeats = gridTeams.reduce((acc, t) => {
    return acc + (t.seats?.filter(s => s.driver_id !== null).length || 0);
  }, 0);
  const isComplete = filledSeats === totalSeats && duplicateDriverIds.size === 0;

  // Driver Assignment Handlers
  const openDriverPicker = (teamIndex: number, seatNumber: 1 | 2) => {
    setTargetSlot({ teamIndex, seatNumber });
    setDriverSearch('');
    setDriverNationalityFilter('all');
    setPickerOpen(true);
  };

  const assignDriver = (driverId: string) => {
    if (!targetSlot) return;
    const { teamIndex, seatNumber } = targetSlot;

    setGridTeams(prev => {
      const next = [...prev];
      const targetTeam = { ...next[teamIndex] };
      const nextSeats = [...(targetTeam.seats || [])];

      const seatIdx = nextSeats.findIndex(s => s.seat_number === seatNumber);
      if (seatIdx >= 0) {
        nextSeats[seatIdx] = { ...nextSeats[seatIdx], driver_id: driverId };
      } else {
        nextSeats.push({ seat_number: seatNumber, driver_id: driverId });
      }
      targetTeam.seats = nextSeats;
      next[teamIndex] = targetTeam;
      return next;
    });

    setPickerOpen(false);
    setTargetSlot(null);
  };

  const clearSeat = (teamIndex: number, seatNumber: 1 | 2) => {
    setGridTeams(prev => {
      const next = [...prev];
      const targetTeam = { ...next[teamIndex] };
      targetTeam.seats = targetTeam.seats.map(s => 
        s.seat_number === seatNumber ? { ...s, driver_id: null } : s
      );
      next[teamIndex] = targetTeam;
      return next;
    });
  };

  // Constructor selection
  const openTeamSelector = (teamIndex: number) => {
    setTargetTeamIndex(teamIndex);
    setTeamSelectorOpen(true);
  };

  const selectTeam = (teamId: string) => {
    if (targetTeamIndex === null) return;
    setGridTeams(prev => {
      const next = [...prev];
      next[targetTeamIndex] = {
        ...next[targetTeamIndex],
        team_id: teamId,
        custom_team_name: undefined,
        custom_logo_url: undefined,
        custom_primary_color: undefined,
      };
      return next;
    });
    setTeamSelectorOpen(false);
    setTargetTeamIndex(null);
  };

  const handleApplyCustomTeam = () => {
    if (targetTeamIndex === null || !customTeamName.trim()) return;
    setGridTeams(prev => {
      const next = [...prev];
      next[targetTeamIndex] = {
        ...next[targetTeamIndex],
        team_id: null,
        custom_team_name: customTeamName.trim(),
        custom_primary_color: customTeamColor,
        custom_logo_url: customTeamLogo || undefined,
      };
      return next;
    });
    setCustomTeamModalOpen(false);
    setCustomTeamName('');
    setTargetTeamIndex(null);
    toast.success('Custom constructor applied!');
  };

  // Quick Action: Randomize Grid
  const handleRandomize = () => {
    const shuffledDrivers = [...drivers].sort(() => 0.5 - Math.random());
    setGridTeams(prev => {
      let driverIdx = 0;
      return prev.map(t => {
        const d1 = shuffledDrivers[driverIdx++]?.id || null;
        const d2 = shuffledDrivers[driverIdx++]?.id || null;
        return {
          ...t,
          seats: [
            { seat_number: 1, driver_id: d1 },
            { seat_number: 2, driver_id: d2 },
          ],
        };
      });
    });
    toast.info('Randomized grid lineup!');
  };

  // Quick Action: Auto-fill Official 2025 Grid
  const handleAutoFill2025 = () => {
    if (teams.length === 0 || drivers.length === 0) {
      toast.info('Empty Database', 'No constructors or drivers registered in the database yet. Add teams & drivers in Admin or create custom entrants!');
      return;
    }

    const officialLineup = [
      { slug: 'mclaren-f1', d1: 'd-nor', d2: 'd-pia' },
      { slug: 'scuderia-ferrari', d1: 'd-lec', d2: 'd-ham' },
      { slug: 'red-bull-racing', d1: 'd-ver', d2: 'd-law' },
      { slug: 'mercedes-amg', d1: 'd-rus', d2: 'd-ant' },
      { slug: 'aston-martin', d1: 'd-alo', d2: 'd-str' },
      { slug: 'alpine-f1', d1: 'd-gas', d2: 'd-doo' },
      { slug: 'haas-f1', d1: 'd-oco', d2: 'd-bea' },
      { slug: 'vcarb', d1: 'd-tsu', d2: 'd-had' },
      { slug: 'williams-racing', d1: 'd-alb', d2: 'd-sai' },
      { slug: 'kick-sauber', d1: 'd-hul', d2: 'd-bor' },
      { slug: 'andretti-cadillac', d1: 'd-her', d2: 'd-vet' },
      { slug: 'porsche-penske', d1: 'd-msc', d2: 'd-dru' },
    ];

    setGridTeams(prev => {
      return prev.map((t, idx) => {
        const pair = officialLineup[idx];
        const matchedTeam = pair ? teams.find(tm => tm.slug === pair.slug) : null;
        return {
          ...t,
          team_id: matchedTeam ? matchedTeam.id : t.team_id,
          seats: [
            { seat_number: 1, driver_id: pair?.d1 || null },
            { seat_number: 2, driver_id: pair?.d2 || null },
          ],
        };
      });
    });
    toast.success('Official 2025 Grand Prix Grid populated!');
  };

  // Quick Action: Clear all seats
  const handleClearAll = () => {
    setGridTeams(prev => {
      return prev.map(t => ({
        ...t,
        seats: [
          { seat_number: 1, driver_id: null },
          { seat_number: 2, driver_id: null },
        ],
      }));
    });
    setResetConfirmOpen(false);
    toast.info('All driver seats cleared.');
  };

  // Save Lineup
  const handleSaveLineup = async () => {
    if (!gridName.trim()) {
      toast.error('Please enter a name for your custom grid.');
      return;
    }

    if (duplicateDriverIds.size > 0) {
      toast.error('Validation Conflict', 'Please resolve duplicate driver assignments before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveLineup({
        id: editGridId,
        name: gridName.trim(),
        team_count: teamCount,
        season_id: selectedSeasonId,
        status: isComplete ? 'complete' : 'draft',
        visibility,
        teams: gridTeams,
        created_by: user?.id || null,
      });

      if (isComplete) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E10600', '#FFFFFF', '#FF8000', '#27F4D2'],
        });
      }

      toast.success(
        'Lineup Saved Successfully',
        isComplete ? 'Grid marked complete! Ready for poster export.' : 'Saved as draft.'
      );
      navigate(`/grids/${saved.id}`);
    } catch (err: any) {
      toast.error('Failed to save grid', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter available drivers for picker
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(driverSearch.toLowerCase());
    const matchesNat = driverNationalityFilter === 'all' || d.nationality === driverNationalityFilter;
    return matchesSearch && matchesNat;
  });

  const uniqueNationalities = Array.from(new Set(drivers.map(d => d.nationality).filter(Boolean))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#14151a] to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
              <Layers className="w-4 h-4" />
              <span>Interactive Paddock Constructor</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={gridName}
                onChange={(e) => setGridName(e.target.value)}
                className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight bg-transparent border-b border-zinc-700 focus:border-red-600 focus:outline-none w-full max-w-lg"
                placeholder="Name your grid..."
              />
            </div>
            <p className="text-xs text-zinc-400">
              Customize constructors, assign cockpits, eliminate duplicate conflicts, and export high-res artwork.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleAutoFill2025}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold font-display uppercase tracking-wider transition-colors flex items-center gap-1.5"
              title="Populate with the confirmed 2025 F1 grid"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto 2025 Grid</span>
            </button>

            <button
              onClick={handleRandomize}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold font-display uppercase tracking-wider transition-colors flex items-center gap-1.5"
              title="Randomize driver cockpits"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Randomize</span>
            </button>

            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-zinc-300 hover:text-red-400 text-xs font-semibold transition-colors"
              title="Clear all driver seats"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleSaveLineup}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-950/60 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Grid'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Row: Team Count (10/11/12), Season, Visibility, Stats */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-code">
          {/* Team Count Selector (10, 11, or 12) */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 uppercase">Constructors:</span>
            <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
              {([10, 11, 12] as const).map(count => (
                <button
                  key={count}
                  onClick={() => handleTeamCountChange(count)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    teamCount === count
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {count} Teams ({count * 2} Seats)
                </button>
              ))}
            </div>
          </div>

          {/* Visibility selector */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 uppercase">Visibility:</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              className="py-1 px-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-red-600"
            >
              <option value="public">Public (Shareable)</option>
              <option value="private">Private (Only You)</option>
            </select>
          </div>

          {/* Progress & Seat Validation Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 uppercase">Seats Filled:</span>
              <span className={`font-bold ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                {filledSeats} / {totalSeats}
              </span>
            </div>

            {duplicateDriverIds.size > 0 ? (
              <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{duplicateDriverIds.size} Duplicate Conflict</span>
              </span>
            ) : isComplete ? (
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Grid Complete</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Draft Lineup
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Driver Warning Banner */}
      {duplicateDriverIds.size > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/50 border border-red-700/60 text-red-200 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="font-bold">Driver Conflict Detected:</span> The same driver cannot occupy multiple seats on the grid.
              <span className="ml-2 font-mono-code font-semibold">
                Duplicated: {Array.from(duplicateDriverIds).map(id => drivers.find(d => d.id === id)?.name).join(', ')}
              </span>
            </div>
          </div>
          <span className="font-mono-code uppercase text-[10px] bg-red-900/60 px-2 py-1 rounded">
            Resolve to Complete Grid
          </span>
        </div>
      )}

      {/* Empty Database Helper Banner */}
      {teams.length === 0 && (
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-zinc-300">
            <Trophy className="w-4 h-4 text-red-500 shrink-0" />
            <span>
              The database has no registered official constructors yet. You can create custom/fictional entrants using the <strong>palette icon</strong> on any slot, or register official constructors in the Admin Portal.
            </span>
          </div>
          <button
            onClick={() => navigate('/admin/teams')}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono-code text-[11px] shrink-0"
          >
            Add Teams (Admin) &rarr;
          </button>
        </div>
      )}

      {/* Grid of Constructor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {gridTeams.map((teamSlot, teamIdx) => {
          const selectedTeam = teams.find(t => t.id === teamSlot.team_id);
          const isFictional = !teamSlot.team_id && Boolean(teamSlot.custom_team_name);
          const teamName = teamSlot.custom_team_name || selectedTeam?.name || 'Unassigned Constructor';
          const primaryColor = teamSlot.custom_primary_color || selectedTeam?.primary_color || '#E10600';
          const logoUrl = teamSlot.custom_logo_url || selectedTeam?.logo_url;

          return (
            <div
              key={teamIdx}
              className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 p-5 space-y-4 shadow-xl relative overflow-hidden transition-all hover:border-zinc-700"
            >
              {/* Primary Color Accent Stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: primaryColor }}
              />

              {/* Team Slot Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 pt-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 p-1.5 flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt={teamName} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Trophy className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-[11px] font-bold text-zinc-500">
                        #{teamIdx + 1}
                      </span>
                      {isFictional && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-code uppercase bg-amber-950/60 text-amber-400 border border-amber-800/50">
                          Custom Entrant
                        </span>
                      )}
                    </div>
                    <div className="font-display font-black text-xl text-white uppercase truncate">
                      {teamName}
                    </div>
                  </div>
                </div>

                {/* Team Switcher Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openTeamSelector(teamIdx)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                    title="Change constructor"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => {
                      setTargetTeamIndex(teamIdx);
                      setCustomTeamName(teamSlot.custom_team_name || '');
                      setCustomTeamColor(primaryColor);
                      setCustomTeamLogo(teamSlot.custom_logo_url || '');
                      setCustomTeamModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    title="Create custom/fictional team"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Driver 1 & Driver 2 Cockpit Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([1, 2] as const).map(seatNum => {
                  const seat = teamSlot.seats?.find(s => s.seat_number === seatNum);
                  const driver = drivers.find(d => d.id === seat?.driver_id);
                  const isDuplicate = driver && duplicateDriverIds.has(driver.id);

                  return (
                    <div
                      key={seatNum}
                      className={`rounded-xl p-3 border transition-all ${
                        isDuplicate
                          ? 'bg-red-950/40 border-red-600/80 shadow-md shadow-red-950/50'
                          : driver
                          ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-950/30 border-dashed border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono-code text-zinc-400 mb-2">
                        <span className="font-bold uppercase">Seat {seatNum}</span>
                        {isDuplicate && (
                          <span className="text-red-400 font-bold uppercase animate-pulse">
                            Duplicate!
                          </span>
                        )}
                      </div>

                      {driver ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Portrait */}
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                              {driver.card_image_url ? (
                                <img
                                  src={driver.card_image_url}
                                  alt={driver.name}
                                  className="w-full h-full object-cover object-top"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono-code font-bold text-xs">
                                  {driver.code}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="px-1.5 py-0.2 rounded font-mono-code font-black text-[10px] text-white"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  {driver.code}
                                </span>
                                <span className="font-display font-black text-sm text-white uppercase truncate">
                                  {driver.name}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-400 font-mono-code truncate">
                                {driver.nationality}
                              </div>
                            </div>
                          </div>

                          {/* Actions: Replace / Clear */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openDriverPicker(teamIdx, seatNum)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors"
                            >
                              Swap
                            </button>
                            <button
                              onClick={() => clearSeat(teamIdx, seatNum)}
                              className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                              title="Clear seat"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openDriverPicker(teamIdx, seatNum)}
                          className="w-full py-2.5 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 transition-colors group"
                        >
                          <Plus className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                          <span>Assign Driver</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Selection Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
              <div className="flex items-center gap-2 font-display font-black text-xl uppercase tracking-wider text-white">
                <Users className="w-5 h-5 text-red-500" />
                <span>Select Driver for Seat {targetSlot?.seatNumber}</span>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search driver name or code (VER, HAM, NOR)..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
              </div>

              <select
                value={driverNationalityFilter}
                onChange={(e) => setDriverNationalityFilter(e.target.value)}
                className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-red-600"
              >
                <option value="all">All Nationalities</option>
                {uniqueNationalities.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Scrollable Driver List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredDrivers.map(drv => {
                const isAlreadyAssigned = assignedDriverIds.includes(drv.id);

                return (
                  <div
                    key={drv.id}
                    onClick={() => assignDriver(drv.id)}
                    className="p-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                        {drv.card_image_url ? (
                          <img src={drv.card_image_url} alt={drv.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono-code text-xs text-zinc-600">
                            {drv.code}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code font-black text-xs px-1.5 py-0.2 bg-zinc-950 rounded text-red-400 border border-zinc-800">
                            {drv.code}
                          </span>
                          <span className="font-display font-black text-base text-white uppercase group-hover:text-red-400 transition-colors">
                            {drv.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono-code">
                          {drv.nationality}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAlreadyAssigned && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40 text-[10px] font-mono-code font-bold">
                          Assigned Elsewhere
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Constructor Selector Modal */}
      {teamSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
              <div className="flex items-center gap-2 font-display font-black text-xl uppercase tracking-wider text-white">
                <Trophy className="w-5 h-5 text-red-500" />
                <span>Select Constructor for Slot #{targetTeamIndex !== null ? targetTeamIndex + 1 : ''}</span>
              </div>
              <button
                onClick={() => setTeamSelectorOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {teams.map(tm => (
                <div
                  key={tm.id}
                  onClick={() => selectTeam(tm.id)}
                  className="p-3.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-8 rounded-full"
                      style={{ backgroundColor: tm.primary_color }}
                    />
                    <div className="w-10 h-10 rounded-lg bg-zinc-950 p-1 flex items-center justify-center border border-zinc-800 shrink-0">
                      {tm.logo_url ? (
                        <img src={tm.logo_url} alt={tm.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <Trophy className="w-5 h-5 text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-display font-black text-base text-white uppercase group-hover:text-red-400 transition-colors">
                        {tm.name}
                      </div>
                      <div className="text-[11px] text-zinc-400">{tm.hq}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom/Fictional Team Modal */}
      {customTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-display font-black text-xl uppercase tracking-wider text-white">
                <Palette className="w-5 h-5 text-red-500" />
                <span>Custom / Fictional Constructor</span>
              </div>
              <button
                onClick={() => setCustomTeamModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Constructor Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Porsche Penske, Audi Sport, Jordan GP"
                  value={customTeamName}
                  onChange={(e) => setCustomTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customTeamColor}
                    onChange={(e) => setCustomTeamColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={customTeamColor}
                    onChange={(e) => setCustomTeamColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono-code uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={customTeamLogo}
                  onChange={(e) => setCustomTeamLogo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setCustomTeamModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomTeam}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display uppercase tracking-wider"
              >
                Apply Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center mx-auto text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-wide">
              Clear All Driver Seats?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will unassign all cockpits across the entire grid. Constructors will remain in position.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display uppercase tracking-wider"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
