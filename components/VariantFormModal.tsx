
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Variant, ProductStatus, Category } from '../types';

interface VariantFormModalProps {
  products: Product[];
  categories: Category[];
  existingVariants: Variant[];
  onClose: () => void;
  onSubmit: (variants: Variant[]) => void;
}

const VariantFormModal: React.FC<VariantFormModalProps> = ({ 
  products, 
  categories, 
  existingVariants, 
  onClose, 
  onSubmit 
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  
  // Multi-price states
  const [priceRetail, setPriceRetail] = useState('');
  const [priceReseller, setPriceReseller] = useState('');
  const [priceDropship, setPriceDropship] = useState('');
  
  const [minStock, setMinStock] = useState('10');
  const [error, setError] = useState('');

  const selectedProduct = useMemo(() => 
    products.find(p => p.product_id === selectedProductId), 
    [selectedProductId, products]
  );

  useEffect(() => {
    if (selectedProduct) {
      setDescription(selectedProduct.deskripsi || '');
      setPriceRetail(Number(selectedProduct.harga_jual || 0).toString());
      setPriceReseller(Number(selectedProduct.harga_jual || 0).toString());
      setPriceDropship(Number(selectedProduct.harga_jual || 0).toString());
    }
  }, [selectedProduct]);

  const availableOptions = useMemo(() => {
    if (!selectedProduct) return { sizes: [], colors: [], materials: [] };
    const cat = categories.find(c => c.name === selectedProduct.kategori);
    return {
      sizes: cat?.availableSizes || [],
      colors: cat?.availableColors || [],
      materials: cat?.availableMaterials || []
    };
  }, [selectedProduct, categories]);

  const generateSku = (prodName: string, color: string, size: string, material: string) => {
    const initials = (prodName || 'PRD').split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
    const colorCode = (color || 'XXX').substring(0, 3).toUpperCase();
    const sizeCode = (size || 'X').toUpperCase();
    const materialCode = (material || 'XXX').substring(0, 3).toUpperCase();
    return `${initials}-${colorCode}-${sizeCode}-${materialCode}`;
  };

  const handleToggle = (val: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(val)) setter(current.filter(c => c !== val));
    else setter([...current, val]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || selectedSizes.length === 0 || selectedColors.length === 0 || selectedMaterials.length === 0) {
      setError('Produk, Ukuran, Warna, dan Bahan wajib dipilih.');
      return;
    }

    const newVariants: Variant[] = [];
    const duplicates: string[] = [];

    selectedMaterials.forEach(material => {
      selectedColors.forEach(color => {
        selectedSizes.forEach(size => {
          const sku = generateSku(selectedProduct!.nama_produk, color, size, material);
          if (existingVariants.some(v => v.sku === sku)) {
            duplicates.push(sku);
          } else {
            newVariants.push({
              sku,
              product_id: selectedProductId,
              ukuran: size,
              warna: color,
              jenis_bahan: material,
              harga_jual: Number(priceRetail) || 0,
              harga_reseller: Number(priceReseller) || 0,
              harga_dropship: Number(priceDropship) || 0,
              stok_min: Number(minStock),
              status: ProductStatus.AKTIF,
              deskripsi: description.trim() || selectedProduct?.deskripsi || ''
            });
          }
        });
      });
    });

    if (newVariants.length === 0 && duplicates.length > 0) {
      setError(`Semua variasi terpilih sudah ada: ${duplicates.join(', ')}`);
      return;
    }

    onSubmit(newVariants);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in slide-in-from-top-4 duration-300 max-h-[95vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Generate Multi-Harga SKU</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100">{error}</div>}

          <section>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pilih Produk Induk</label>
            <select 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-slate-50"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">-- Pilih Produk Master --</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>{p.nama_produk}</option>
              ))}
            </select>
          </section>

          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <section className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Warna</label>
                  <div className="flex flex-wrap gap-2">
                    {availableOptions.colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleToggle(color, selectedColors, setSelectedColors)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedColors.includes(color) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </section>
                <section className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Ukuran</label>
                  <div className="flex flex-wrap gap-2">
                    {availableOptions.sizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggle(size, selectedSizes, setSelectedSizes)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedSizes.includes(size) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <section className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Bahan</label>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.materials.map(material => (
                    <button
                      key={material}
                      type="button"
                      onClick={() => handleToggle(material, selectedMaterials, setSelectedMaterials)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedMaterials.includes(material) ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase">Retail (Normal)</label>
                  <input type="number" className="w-full p-2 text-xs font-bold rounded-lg border" value={priceRetail} onChange={(e) => setPriceRetail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-blue-400 uppercase">Reseller</label>
                  <input type="number" className="w-full p-2 text-xs font-bold rounded-lg border" value={priceReseller} onChange={(e) => setPriceReseller(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-teal-400 uppercase">Dropship</label>
                  <input type="number" className="w-full p-2 text-xs font-bold rounded-lg border" value={priceDropship} onChange={(e) => setPriceDropship(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <div className="text-xs text-slate-500 font-medium">Akan dibuat {selectedSizes.length * selectedColors.length * selectedMaterials.length} SKU.</div>
           <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600">Batal</button>
              <button onClick={handleSubmit} className="px-8 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700">Simpan Variasi</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VariantFormModal;
