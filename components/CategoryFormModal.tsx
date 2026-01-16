
import React, { useState, useEffect } from 'react';
import { Category } from '../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, 'id'>) => void;
  existingNames: string[];
  initialData?: Category | null;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onAdd, existingNames, initialData }) => {
  const [name, setName] = useState('');
  const [subCategories, setSubCategories] = useState<string[]>(['']);
  const [availableSizes, setAvailableSizes] = useState<string[]>(['']);
  const [availableColors, setAvailableColors] = useState<string[]>(['']);
  const [availableMaterials, setAvailableMaterials] = useState<string[]>(['']);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name || '');
      
      const ensureArr = (v: any) => {
        if (Array.isArray(v)) return v.length > 0 ? v : [''];
        if (typeof v === 'string' && v.trim()) return v.split(',').map(s => s.trim());
        return [''];
      };

      setSubCategories(ensureArr(initialData.subCategories));
      setAvailableSizes(ensureArr(initialData.availableSizes));
      setAvailableColors(ensureArr(initialData.availableColors));
      setAvailableMaterials(ensureArr(initialData.availableMaterials));
    } else if (isOpen) {
      setName('');
      setSubCategories(['']);
      setAvailableSizes(['']);
      setAvailableColors(['']);
      setAvailableMaterials(['']);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddField = (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]) => {
    if (current.length < 25) {
      setter([...current, '']);
    }
  };

  const handleChangeField = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]) => {
    const updated = [...current];
    updated[index] = value;
    setter(updated);
  };

  const handleRemoveField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]) => {
    if (current.length > 1) {
      setter(current.filter((_, i) => i !== index));
    } else {
      setter(['']);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMain = name.trim();
    if (!trimmedMain) {
        setError('Nama kategori utama harus diisi.');
        return;
    }

    const isDuplicate = existingNames.some(n => n.toLowerCase() === trimmedMain.toLowerCase());
    if (!initialData && isDuplicate) {
      setError('Kategori utama sudah ada.');
      return;
    }

    const validSubs = subCategories.map(s => s.trim()).filter(s => s !== '');
    const validSizes = availableSizes.map(s => s.trim()).filter(s => s !== '');
    const validColors = availableColors.map(s => s.trim()).filter(s => s !== '');
    const validMaterials = availableMaterials.map(s => s.trim()).filter(s => s !== '');

    if (validSubs.length === 0) {
        setError('Minimal harus ada 1 sub-kategori.');
        return;
    }

    onAdd({
        name: trimmedMain,
        subCategories: validSubs,
        availableSizes: validSizes,
        availableColors: validColors,
        availableMaterials: validMaterials
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? `Edit Kategori` : 'Konfigurasi Kategori Baru'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <section>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Identitas Utama</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-bold bg-slate-50"
              placeholder="Contoh: Pakaian Atasan"
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
            />
          </section>

          {/* Sub Categories */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Sub-Kategori</label>
                <button type="button" onClick={() => handleAddField(setSubCategories, subCategories)} className="text-xs font-bold text-blue-600 hover:underline">+ Tambah</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {subCategories.map((sub, idx) => (
                    <div key={idx} className="flex gap-1 items-center bg-slate-50 p-1 rounded border border-slate-100">
                        <input
                            type="text"
                            className="flex-1 px-2 py-1 bg-transparent text-xs outline-none"
                            placeholder="Sub..."
                            value={sub}
                            onChange={(e) => handleChangeField(idx, e.target.value, setSubCategories, subCategories)}
                        />
                        <button type="button" onClick={() => handleRemoveField(idx, setSubCategories, subCategories)} className="text-slate-300 hover:text-red-500 p-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ))}
            </div>
          </section>

          {/* Sizes, Colors, Materials */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Ukuran</label>
                    <button type="button" onClick={() => handleAddField(setAvailableSizes, availableSizes)} className="text-[10px] font-bold text-blue-600 hover:underline">+ Add</button>
                </div>
                <div className="space-y-1.5">
                    {availableSizes.map((size, idx) => (
                        <div key={idx} className="flex gap-1 items-center bg-slate-50 p-1 rounded border border-slate-100">
                            <input
                                type="text"
                                className="flex-1 px-2 py-1 bg-transparent text-[11px] outline-none"
                                placeholder="S, M, 32..."
                                value={size}
                                onChange={(e) => handleChangeField(idx, e.target.value, setAvailableSizes, availableSizes)}
                            />
                            <button type="button" onClick={() => handleRemoveField(idx, setAvailableSizes, availableSizes)} className="text-slate-200 hover:text-red-500">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Warna</label>
                    <button type="button" onClick={() => handleAddField(setAvailableColors, availableColors)} className="text-[10px] font-bold text-blue-600 hover:underline">+ Add</button>
                </div>
                <div className="space-y-1.5">
                    {availableColors.map((color, idx) => (
                        <div key={idx} className="flex gap-1 items-center bg-slate-50 p-1 rounded border border-slate-100">
                            <input
                                type="text"
                                className="flex-1 px-2 py-1 bg-transparent text-[11px] outline-none"
                                placeholder="Hitam, Biru..."
                                value={color}
                                onChange={(e) => handleChangeField(idx, e.target.value, setAvailableColors, availableColors)}
                            />
                            <button type="button" onClick={() => handleRemoveField(idx, setAvailableColors, availableColors)} className="text-slate-200 hover:text-red-500">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
              </section>
            </div>

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Jenis Bahan</label>
                  <button type="button" onClick={() => handleAddField(setAvailableMaterials, availableMaterials)} className="text-[10px] font-bold text-blue-600 hover:underline">+ Tambah Bahan</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                  {availableMaterials.map((material, idx) => (
                      <div key={idx} className="flex gap-1 items-center bg-slate-50 p-1 rounded border border-slate-100">
                          <input
                              type="text"
                              className="flex-1 px-2 py-1 bg-transparent text-[11px] outline-none"
                              placeholder="Cotton, Linen..."
                              value={material}
                              onChange={(e) => handleChangeField(idx, e.target.value, setAvailableMaterials, availableMaterials)}
                          />
                          <button type="button" onClick={() => handleRemoveField(idx, setAvailableMaterials, availableMaterials)} className="text-slate-200 hover:text-red-500">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                      </div>
                  ))}
              </div>
            </section>
          </div>
          
          <div className="pt-6 border-t border-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">Batal</button>
            <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
              {initialData ? 'Simpan Perubahan' : 'Simpan Kategori Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
