import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  ArrowLeft, 
  Sparkles, 
  Palette, 
  Sliders, 
  CheckCircle, 
  Eye, 
  Layers,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomLineup, Team, Driver } from '../types';
import { getLineupById, getTeams, getDrivers } from '../services/db';
import { renderGridPoster, PosterOptions } from '../utils/posterRenderer';
import { useToast } from '../context/ToastContext';

interface PosterStudioPageProps {
  gridId: string;
  navigate: (path: string) => void;
}

export const PosterStudioPage: React.FC<PosterStudioPageProps> = ({ gridId, navigate }) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [lineup, setLineup] = useState<CustomLineup | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  // Poster Customization options
  const [posterTitle, setPosterTitle] = useState('FORMULA 1 GRAND PRIX GRID');
  const [posterSubtitle, setPosterSubtitle] = useState('Official Lineup Specification');
  const [creatorCredit, setCreatorCredit] = useState('Paddock Enthusiast');
  const [preset, setPreset] = useState<'official' | 'dark' | 'minimal' | 'championship'>('official');
  const [aspectRatio, setAspectRatio] = useState<'1080x1350' | '1920x1080' | '1400x1980'>('1080x1350');
  const [showBranding, setShowBranding] = useState(true);
  const [showDate, setShowDate] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [l, t, d] = await Promise.all([
          getLineupById(gridId),
          getTeams(),
          getDrivers(),
        ]);
        if (l) {
          setLineup(l);
          setPosterTitle(l.name.toUpperCase());
        }
        setTeams(t);
        setDrivers(d);
      } catch (err) {
        console.error('Failed to load poster data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [gridId]);

  // Generate / re-render canvas poster whenever options or data change
  useEffect(() => {
    if (!lineup || !canvasRef.current || teams.length === 0 || drivers.length === 0) return;

    let active = true;
    async function draw() {
      try {
        if (!canvasRef.current || !lineup) return;
        const options: PosterOptions = {
          title: posterTitle,
          subtitle: posterSubtitle,
          creatorCredit,
          preset,
          aspectRatio,
          showBranding,
          showDate,
        };
        const url = await renderGridPoster(canvasRef.current, lineup, teams, drivers, options);
        if (active) {
          setPreviewDataUrl(url);
        }
      } catch (err) {
        console.error('Poster render error:', err);
      }
    }
    draw();

    return () => {
      active = false;
    };
  }, [lineup, teams, drivers, posterTitle, posterSubtitle, creatorCredit, preset, aspectRatio, showBranding, showDate]);

  const handleDownload = () => {
    if (!previewDataUrl) return;
    setIsExporting(true);

    try {
      const link = document.createElement('a');
      link.download = `${(posterTitle || 'f1_grid_poster').replace(/[^a-zA-Z0-9_-]/g, '_')}_${aspectRatio}.png`;
      link.href = previewDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
      toast.success('Poster Exported!', 'High-resolution PNG downloaded.');
    } catch (err: any) {
      toast.error('Export Error', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-500 text-xs mt-3 font-mono-code uppercase">Initializing Poster Studio...</p>
      </div>
    );
  }

  if (!lineup) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Layers className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-2xl font-bold font-display uppercase text-white">Lineup Not Found</h2>
        <p className="text-sm text-zinc-400">Cannot generate poster for a non-existent grid.</p>
        <button
          onClick={() => navigate('/builder')}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-semibold text-xs hover:bg-zinc-700"
        >
          Return to Builder
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/grids/${gridId}`)}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grid Details</span>
        </button>

        <span className="text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>High-Resolution Artwork Studio</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Canvas Preview */}
        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 text-xs font-mono-code text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-red-500" />
              <span>Canvas Render Preview</span>
            </span>
            <span className="bg-zinc-950 px-2.5 py-0.5 rounded border border-zinc-800 text-zinc-300">
              {aspectRatio} &bull; 300 DPI
            </span>
          </div>

          {/* Hidden Canvas element used for actual drawing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Rendered Preview Image */}
          <div className="relative w-full flex items-center justify-center p-2 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden shadow-inner max-h-[70vh]">
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Poster Preview"
                className="max-h-[64vh] max-w-full rounded-lg shadow-2xl object-contain border border-zinc-800"
              />
            ) : (
              <div className="py-24 text-center text-zinc-600 text-xs font-mono-code uppercase">
                Rendering High-DPI Poster...
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-display uppercase tracking-wider font-black text-base shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>{isExporting ? 'Preparing File...' : 'Download High-Res PNG'}</span>
          </button>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-red-500" />
            <h2 className="font-display font-black text-xl text-white uppercase tracking-wide">
              Poster Configuration
            </h2>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-mono-code uppercase text-zinc-400">
              Design Aesthetic Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'official', label: 'Official Grid Style' },
                { id: 'dark', label: 'Dark Paddock' },
                { id: 'minimal', label: 'Minimal Lineup' },
                { id: 'championship', label: 'Championship Poster' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                    preset === p.id
                      ? 'bg-red-600 text-white border-red-500 shadow-md'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="block text-xs font-mono-code uppercase text-zinc-400">
              Format & Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '1080x1350', label: 'Portrait (4:5)', sub: '1080×1350' },
                { id: '1920x1080', label: 'Wallpaper (16:9)', sub: '1920×1080' },
                { id: '1400x1980', label: 'Print A3', sub: '1400×1980' },
              ].map(a => (
                <button
                  key={a.id}
                  onClick={() => setAspectRatio(a.id as any)}
                  className={`p-2 rounded-xl text-center transition-all border ${
                    aspectRatio === a.id
                      ? 'bg-zinc-800 text-white border-red-500 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-[11px] font-bold">{a.label}</div>
                  <div className="text-[9px] font-mono-code text-zinc-500">{a.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text options */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-mono-code uppercase text-zinc-400 mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={posterTitle}
                onChange={(e) => setPosterTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600 font-display font-black text-sm uppercase"
              />
            </div>

            <div>
              <label className="block font-mono-code uppercase text-zinc-400 mb-1">
                Subtitle Tagline
              </label>
              <input
                type="text"
                value={posterSubtitle}
                onChange={(e) => setPosterSubtitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-mono-code uppercase text-zinc-400 mb-1">
                Creator Credit Label
              </label>
              <input
                type="text"
                value={creatorCredit}
                onChange={(e) => setCreatorCredit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600 text-xs"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-zinc-800 text-xs font-mono-code">
            <label className="flex items-center justify-between cursor-pointer text-zinc-300">
              <span>Show Official Paddock Branding</span>
              <input
                type="checkbox"
                checked={showBranding}
                onChange={(e) => setShowBranding(e.target.checked)}
                className="w-4 h-4 rounded accent-red-600 bg-zinc-950"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-zinc-300">
              <span>Show Issue Date Timestamp</span>
              <input
                type="checkbox"
                checked={showDate}
                onChange={(e) => setShowDate(e.target.checked)}
                className="w-4 h-4 rounded accent-red-600 bg-zinc-950"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
