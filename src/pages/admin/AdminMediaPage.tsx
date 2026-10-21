import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Search, Filter, Eye, Check, X } from 'lucide-react';
import { uploadMedia, getMediaLibrary, getTeams, getDrivers, getTeamCars } from '../../services/db';
import { useToast } from '../../context/ToastContext';

export const AdminMediaPage: React.FC = () => {
  const { toast } = useToast();
  const [mediaList, setMediaList] = useState<Array<{ id: string; url: string; name: string; category: string; size: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'teams' | 'drivers' | 'cars' | 'posters'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<string | null>(null);

  const loadMedia = () => {
    const list = getMediaLibrary();
    setMediaList(list);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const cat = selectedCategory === 'all' ? 'teams' : selectedCategory;

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadMedia(files[i], cat);
      }
      toast.success('Media Uploaded', `${files.length} asset(s) stored in paddock repository.`);
      loadMedia();
    } catch (err: any) {
      toast.error('Upload Error', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMedia = mediaList.filter(item => {
    return selectedCategory === 'all' || item.category === selectedCategory;
  });

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
            <ImageIcon className="w-4 h-4" />
            <span>Paddock Asset Repository</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">
            Media & Asset Library
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse and manage constructor logos, driver portrait cards, podium celebrations, and renders.
          </p>
        </div>

        <label className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-xs shadow-lg shadow-red-950/60 cursor-pointer transition-all flex items-center gap-1.5">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload Media File'}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'teams', 'drivers', 'cars', 'posters'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-display uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-red-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat === 'all' ? 'All Assets' : cat}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#121316] border border-zinc-800 text-center space-y-3">
          <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="font-display font-black text-xl text-white uppercase tracking-wide">
            No Uploaded Media Files Found
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Use the "Upload Media File" button above or upload assets directly in the Constructor and Driver edit forms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map(item => (
            <div
              key={item.id}
              className="rounded-2xl bg-[#121316] border border-zinc-800 p-3 space-y-2 group relative overflow-hidden"
            >
              <div
                onClick={() => setPreviewItem(item.url)}
                className="w-full aspect-square rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden cursor-pointer flex items-center justify-center p-2"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain filter brightness-95 group-hover:scale-105 transition-transform"
                />
              </div>

              <div>
                <div className="text-[11px] font-mono-code text-white truncate font-medium">
                  {item.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono-code uppercase mt-0.5">
                  <span>{item.category}</span>
                  <span>{Math.round(item.size / 1024)} KB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full preview modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute -top-10 right-0 text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewItem} alt="Preview" className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
