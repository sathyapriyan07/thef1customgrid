import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, X, Upload, Flag } from 'lucide-react';
import { Driver } from '../../types';
import { getDrivers, createDriver, updateDriver, deleteDriver, uploadMedia } from '../../services/db';
import { useToast } from '../../context/ToastContext';

export const AdminDriversPage: React.FC = () => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [nationality, setNationality] = useState('');
  const [bio, setBio] = useState('');
  const [cardImageUrl, setCardImageUrl] = useState('');
  const [podiumImageUrl, setPodiumImageUrl] = useState('');
  const [gridImageUrl, setGridImageUrl] = useState('');

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDrivers = async () => {
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const openCreateModal = () => {
    setEditingDriver(null);
    setName('');
    setCode('');
    setNationality('');
    setBio('');
    setCardImageUrl('');
    setPodiumImageUrl('');
    setGridImageUrl('');
    setModalOpen(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setCode(driver.code);
    setNationality(driver.nationality || '');
    setBio(driver.bio || '');
    setCardImageUrl(driver.card_image_url || '');
    setPodiumImageUrl(driver.podium_image_url || '');
    setGridImageUrl(driver.grid_image_url || '');
    setModalOpen(true);
  };

  const handleCodeChange = (val: string) => {
    setCode(val.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'card' | 'podium' | 'grid') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const url = await uploadMedia(file, 'drivers');
      if (field === 'card') setCardImageUrl(url);
      if (field === 'podium') setPodiumImageUrl(url);
      if (field === 'grid') setGridImageUrl(url);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error('Upload failed', err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation error', 'Driver name is required.');
      return;
    }

    if (code.length !== 3) {
      toast.error('Validation error', 'Driver code must be exactly 3 uppercase letters (e.g. VER, HAM, NOR).');
      return;
    }

    // Code uniqueness
    const conflict = drivers.find(
      d => d.code.toUpperCase() === code.toUpperCase() && d.id !== editingDriver?.id
    );
    if (conflict) {
      toast.error('Duplicate Code', `Driver code "${code}" is already in use by ${conflict.name}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, {
          name: name.trim(),
          code: code.toUpperCase().trim(),
          nationality: nationality.trim(),
          bio: bio.trim(),
          card_image_url: cardImageUrl,
          podium_image_url: podiumImageUrl,
          grid_image_url: gridImageUrl,
        });
        toast.success('Driver updated');
      } else {
        await createDriver({
          name: name.trim(),
          code: code.toUpperCase().trim(),
          nationality: nationality.trim(),
          bio: bio.trim(),
          card_image_url: cardImageUrl,
          podium_image_url: podiumImageUrl,
          grid_image_url: gridImageUrl,
        });
        toast.success('Driver registered successfully');
      }
      setModalOpen(false);
      loadDrivers();
    } catch (err: any) {
      toast.error('Operation failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (driver: Driver) => {
    if (!confirm(`Are you sure you want to delete ${driver.name} (${driver.code})?`)) return;
    try {
      await deleteDriver(driver.id);
      toast.success('Driver removed');
      loadDrivers();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.nationality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-red-500 uppercase tracking-widest font-semibold">
            <Users className="w-4 h-4" />
            <span>Driver Database CRUD</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">
            Formula 1 Drivers
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Maintain registered driver profiles, official three-letter superlicense codes, and paddock photography.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display uppercase tracking-wider font-extrabold text-xs shadow-lg shadow-red-950/60 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#121316] border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver by name, 3-letter code or nationality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
          />
        </div>
        <span className="text-xs font-mono-code text-zinc-500">
          {filteredDrivers.length} Drivers Registered
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#121316] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 uppercase font-mono-code text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Nationality</th>
                <th className="py-3.5 px-4">Card Image</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                        {driver.card_image_url ? (
                          <img src={driver.card_image_url} alt={driver.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono-code text-zinc-600 font-bold">
                            {driver.code}
                          </div>
                        )}
                      </div>
                      <span className="font-display font-black text-sm text-white uppercase">
                        {driver.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded font-mono-code font-black text-xs bg-zinc-950 border border-zinc-800 text-red-400">
                      {driver.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{driver.nationality}</span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 font-mono-code text-[11px] truncate max-w-[180px]">
                    {driver.card_image_url ? 'Configured' : 'Missing (Placeholder)'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(driver)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(driver)}
                        className="p-1.5 rounded-lg hover:bg-red-950/60 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-display font-black text-xl uppercase tracking-wider text-white">
                <Users className="w-5 h-5 text-red-500" />
                <span>{editingDriver ? 'Edit Driver' : 'Register New Driver'}</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                    Driver Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Max Verstappen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                    Code (3-Letters) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="VER"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono-code font-black text-center focus:outline-none focus:border-red-600 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Netherlands, United Kingdom, Spain"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono-code mb-1">
                  Biography / Accolades
                </label>
                <textarea
                  rows={3}
                  placeholder="World championships, victories, driving style..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              {/* 3 Images with separate upload controls & preview */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="text-zinc-400 font-mono-code uppercase font-semibold">
                  Driver Photography
                </div>

                {/* Card Portrait */}
                <div>
                  <label className="block text-zinc-400 mb-1">Driver Card Portrait Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={cardImageUrl}
                      onChange={(e) => setCardImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-600"
                    />
                    <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3 text-red-500" />
                      <span>{uploadingField === 'card' ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'card')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Podium Image */}
                <div>
                  <label className="block text-zinc-400 mb-1">Podium Celebration Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={podiumImageUrl}
                      onChange={(e) => setPodiumImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-600"
                    />
                    <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3 text-red-500" />
                      <span>{uploadingField === 'podium' ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'podium')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Grid Image */}
                <div>
                  <label className="block text-zinc-400 mb-1">Grid Suit Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={gridImageUrl}
                      onChange={(e) => setGridImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-red-600"
                    />
                    <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3 text-red-500" />
                      <span>{uploadingField === 'grid' ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'grid')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display uppercase tracking-wider"
                >
                  {isSubmitting ? 'Saving...' : editingDriver ? 'Update Driver' : 'Register Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
