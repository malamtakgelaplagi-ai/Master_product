
import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductFormData, Category } from '../types';
import { generateProductDescription } from '../services/geminiService';

interface ProductFormModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: Product | null;
  existingNames: string[];
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ 
  onClose, 
  onSubmit, 
  initialData,
  existingNames,
  categories
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    nama_produk: '',
    kategori: '',
    sub_kategori: '',
    ukuran: '',
    warna: '',
    jenis_bahan: '',
    harga_jual: '',
    biaya_produksi: '',
    deskripsi: '',
    catatan_internal: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_produk: initialData.nama_produk,
        kategori: initialData.kategori,
        sub_kategori: initialData.sub_kategori || '',
        ukuran: initialData.ukuran || '',
        warna: initialData.warna || '',
        jenis_bahan: initialData.jenis_bahan || '',
        harga_jual: (initialData.harga_jual || 0).toString(),
        biaya_produksi: (initialData.biaya_produksi || 0).toString(),
        deskripsi: initialData.deskripsi || '',
        catatan_internal: initialData.catatan_internal || ''
      });
    }
  }, [initialData]);

  const activeCategory = useMemo(() => {
    return categories.find(c => c.name === formData.kategori);
  }, [formData.kategori, categories]);

  const subCategories = useMemo(() => {
    if (!activeCategory) return [];
    return Array.isArray(activeCategory.subCategories) ? activeCategory.subCategories : [];
  }, [activeCategory]);

  const categorySizes = useMemo(() => {
    if (!activeCategory) return [];
    return Array.isArray(activeCategory.availableSizes) ? activeCategory.availableSizes : [];
  }, [activeCategory]);

  const categoryColors = useMemo(() => {
    if (!activeCategory) return [];
    return Array.isArray(activeCategory.availableColors) ? activeCategory.availableColors : [];
  }, [activeCategory]);

  const categoryMaterials = useMemo(() => {
    if (!activeCategory) return [];
    return Array.isArray(activeCategory.availableMaterials) ? activeCategory.availableMaterials : [];
  }, [activeCategory]);

  const validate = () => {
    if (!formData.nama_produk || !formData.kategori || !formData.sub_kategori || !formData.harga_jual || !formData.biaya_produksi || !formData.deskripsi.trim()) {
      setError('Field Nama, Kategori, Sub, Harga, dan Deskripsi wajib diisi.');
      return false;
    }
    
    const normalizedName = (formData.nama_produk || '').toLowerCase().trim();
    if (!initialData && existingNames.includes(normalizedName)) {
      setError('Nama produk sudah ada. Gunakan nama yang unik.');
      return false;
    }
    if (initialData && normalizedName !== (initialData.nama_produk || '').toLowerCase() && existingNames.includes(normalizedName)) {
      setError('Nama produk sudah digunakan oleh produk lain.');
      return false;
    }

    if (Number(formData.harga_jual) < Number(formData.biaya_produksi)) {
      setError('Harga jual tidak boleh lebih kecil dari biaya produksi.');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleAiGenerate = async () => {
    if (!formData.nama_produk || !formData.kategori) {
      setError('Isi nama produk dan kategori terlebih dahulu untuk bantuan AI.');
      return;
    }
    setIsGenerating(true);
    const context = `${formData.kategori} - ${formData.sub_kategori} | Bahan: ${formData.jenis_bahan} | Warna: ${formData.warna} | Ukuran: ${formData.ukuran}`;
    const desc = await generateProductDescription(formData.nama_produk, context);
    setFormData(prev => ({ ...prev, deskripsi: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalData = {
      ...formData,
      harga_jual: Number(formData.harga_jual) || 0,
      biaya_produksi: Number(formData.biaya_produksi) || 0,
      nama_produk: formData.nama_produk.trim(),
      deskripsi: formData.deskripsi.trim(),
      ...(initialData ? { product_id: initialData.product_id, status: initialData.status } : {})
    };

    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Master Produk' : 'Tambah Master Produk'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Produk <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                placeholder="Contoh: Kaos Oversize Premium"
                value={formData.nama_produk}
                onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori <span className="text-red-500">*</span></label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value, sub_kategori: '', ukuran: '', warna: '', jenis_bahan: '' })}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sub-Kategori <span className="text-red-500">*</span></label>
                  <select
                    required
                    disabled={!formData.kategori}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:text-slate-400"
                    value={formData.sub_kategori}
                    onChange={(e) => setFormData({ ...formData, sub_kategori: e.target.value })}
                  >
                    <option value="">{formData.kategori ? 'Pilih Sub' : 'Pilih Kategori'}</option>
                    {subCategories.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atribut Spesifik Kategori</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ukuran</label>
                        {categorySizes.length > 0 ? (
                            <select
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                value={formData.ukuran}
                                onChange={(e) => setFormData({ ...formData, ukuran: e.target.value })}
                            >
                                <option value="">Pilih Ukuran</option>
                                {categorySizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="S, M, L..."
                                value={formData.ukuran}
                                onChange={(e) => setFormData({ ...formData, ukuran: e.target.value })}
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Warna</label>
                        {categoryColors.length > 0 ? (
                            <select
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                value={formData.warna}
                                onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                            >
                                <option value="">Pilih Warna</option>
                                {categoryColors.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Hitam, Biru..."
                                value={formData.warna}
                                onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                            />
                        )}
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenis Bahan</label>
                        {categoryMaterials.length > 0 ? (
                            <select
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                value={formData.jenis_bahan}
                                onChange={(e) => setFormData({ ...formData, jenis_bahan: e.target.value })}
                            >
                                <option value="">Pilih Bahan</option>
                                {categoryMaterials.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Cotton Combed 30s, Linen..."
                                value={formData.jenis_bahan}
                                onChange={(e) => setFormData({ ...formData, jenis_bahan: e.target.value })}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga Jual <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">Rp</span>
                  <input
                    type="number"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-blue-600"
                    value={formData.harga_jual}
                    onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Biaya Produksi <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">Rp</span>
                  <input
                    type="number"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.biaya_produksi}
                    onChange={(e) => setFormData({ ...formData, biaya_produksi: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
               <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold disabled:opacity-50 shadow-md"
               >
                  {isGenerating ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {isGenerating ? 'Menyusun deskripsi...' : 'Auto-Write Deskripsi AI'}
               </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Produk <span className="text-red-500">*</span></label>
              <textarea
                rows={3}
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed"
                placeholder="Detail produk untuk katalog..."
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Internal</label>
              <textarea
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50"
                placeholder="Rahasia tim produksi..."
                value={formData.catatan_internal}
                onChange={(e) => setFormData({ ...formData, catatan_internal: e.target.value })}
              ></textarea>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">Batal</button>
          <button onClick={handleSubmit} className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
            {initialData ? 'Simpan Perubahan' : 'Simpan Produk Baru'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
