
import React, { useState, useMemo } from 'react';
import { ProductionBatch, ProductionItem, Variant, ProductionStatus, Product, Material, MaterialStock, BOM, BatchCost } from '../types';

interface ProductionFormModalProps {
  isOpen: boolean;
  variants: Variant[];
  products: Product[];
  materials: Material[];
  materialStocks: MaterialStock[];
  bomProducts: BOM[];
  onClose: () => void;
  onSubmit: (batch: ProductionBatch, items: ProductionItem[], costs: BatchCost[]) => void;
  onSaveBOM: (updated: BOM[]) => void;
  lastBatchId: string;
}

const ProductionFormModal: React.FC<ProductionFormModalProps> = ({
  isOpen, variants, products, materials, materialStocks, bomProducts, onClose, onSubmit, onSaveBOM, lastBatchId
}) => {
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [targetSelesai, setTargetSelesai] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ sku: string, qty: number }[]>([]);
  const [skuSearch, setSkuSearch] = useState('');
  const [editingRecipeSku, setEditingRecipeSku] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const [localBatchCosts, setLocalBatchCosts] = useState<Omit<BatchCost, 'batch_id'>[]>([]);
  const [newCost, setNewCost] = useState({ kategori: 'Produksi', komponen: '', biaya: 0 });
  const [newBOMEntry, setNewBOMEntry] = useState({ material_id: '', qty: 0 });

  const nextId = useMemo(() => {
    const parts = lastBatchId.split('-');
    const num = parseInt(parts[1] || '0') + 1;
    return `PRD-${String(num).padStart(3, '0')}`;
  }, [lastBatchId]);

  const totalQtyRencana = useMemo(() => selectedItems.reduce((acc, i) => acc + i.qty, 0), [selectedItems]);
  const totalOverhead = useMemo(() => localBatchCosts.reduce((acc, c) => acc + Number(c.biaya), 0), [localBatchCosts]);
  const overheadPerPc = totalQtyRencana > 0 ? totalOverhead / totalQtyRencana : 0;

  const materialRequirements = useMemo(() => {
    const req: Record<string, number> = {};
    selectedItems.forEach(item => {
      const skuBoms = bomProducts.filter(b => b.sku === item.sku);
      skuBoms.forEach(b => {
        req[b.material_id] = (req[b.material_id] || 0) + (Number(b.qty_per_pcs) * item.qty);
      });
    });
    return req;
  }, [selectedItems, bomProducts]);

  const hppBreakdown = useMemo(() => {
    const map: Record<string, { material: number, overhead: number, total: number }> = {};
    selectedItems.forEach(item => {
      const skuBoms = bomProducts.filter(b => b.sku === item.sku);
      const materialCost = skuBoms.reduce((acc, b) => {
        const mat = materials.find(m => m.material_id === b.material_id);
        return acc + (Number(b.qty_per_pcs) * (mat?.harga_rata2 || 0));
      }, 0);
      
      map[item.sku] = {
        material: materialCost,
        overhead: overheadPerPc,
        total: materialCost + overheadPerPc
      };
    });
    return map;
  }, [selectedItems, bomProducts, materials, overheadPerPc]);

  const stockWarnings = useMemo(() => {
    const warnings: string[] = [];
    Object.entries(materialRequirements).forEach(([matId, needed]) => {
      const neededNum = needed as number;
      const stock = materialStocks.find(s => s.material_id === matId)?.stok || 0;
      if (neededNum > stock) {
        const mat = materials.find(m => m.material_id === matId);
        warnings.push(`${mat?.nama_bahan || matId} Kurang: ${Math.ceil(neededNum - stock)} unit`);
      }
    });
    return warnings;
  }, [materialRequirements, materialStocks, materials]);

  const filteredVariants = useMemo(() => {
    const query = skuSearch.toLowerCase();
    if (query.length < 2) return [];
    return variants.filter(v => {
      const p = products.find(prod => prod.product_id === v.product_id);
      return (v.sku?.toLowerCase() || '').includes(query) || (p?.nama_produk?.toLowerCase() || '').includes(query);
    }).slice(0, 5);
  }, [variants, products, skuSearch]);

  const handleAddItem = (variant: Variant) => {
    if (selectedItems.some(i => i.sku === variant.sku)) return;
    setSelectedItems([...selectedItems, { sku: variant.sku, qty: 10 }]);
    setSkuSearch('');
  };

  const handleAddBatchCost = () => {
    if (!newCost.komponen || newCost.biaya <= 0) return;
    setLocalBatchCosts([...localBatchCosts, { ...newCost, qty: 1, satuan: 'Batch' } as any]);
    setNewCost({ kategori: 'Produksi', komponen: '', biaya: 0 });
  };

  const handleUpdateQty = (sku: string, qty: number) => {
    setSelectedItems(selectedItems.map(i => i.sku === sku ? { ...i, qty: Math.max(1, qty) } : i));
  };

  const handleAddBOMIngredient = () => {
    if (!editingRecipeSku || !newBOMEntry.material_id || newBOMEntry.qty <= 0) return;
    const updated = [...bomProducts, { sku: editingRecipeSku, material_id: newBOMEntry.material_id, qty_per_pcs: newBOMEntry.qty }];
    onSaveBOM(updated);
    setNewBOMEntry({ material_id: '', qty: 0 });
  };

  const handleDeleteBOMIngredient = (materialId: string) => {
    if (!editingRecipeSku) return;
    const updated = bomProducts.filter(b => !(b.sku === editingRecipeSku && b.material_id === materialId));
    onSaveBOM(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockWarnings.length > 0) {
      setError('Stok bahan baku tidak mencukupi.');
      return;
    }
    if (!targetSelesai || selectedItems.length === 0) {
      setError('Target selesai dan item wajib diisi.');
      return;
    }
    
    const batch: ProductionBatch = { batch_id: nextId, tanggal_mulai: tanggalMulai, target_selesai: targetSelesai, status: ProductionStatus.DIR, catatan };
    const items: ProductionItem[] = selectedItems.map(item => ({ batch_id: nextId, sku: item.sku, qty_rencana: item.qty, qty_hasil: 0, qty_rusak: 0 }));
    const costs: BatchCost[] = localBatchCosts.map(c => ({ ...c, batch_id: nextId }));

    onSubmit(batch, items, costs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300 max-h-[95vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div><h2 className="text-xl font-bold text-slate-900">Rencana Produksi & Estimasi HPP</h2><p className="text-xs text-slate-400 font-mono">{nextId}</p></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 flex-1 bg-slate-50">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Tanggal Mulai</label><input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)} /></div>
            <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Target Selesai</label><input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" value={targetSelesai} onChange={e => setTargetSelesai(e.target.value)} /></div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Catatan Batch / Keterangan</label>
              <textarea 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm min-h-[60px]" 
                placeholder="Contoh: Produksi untuk koleksi lebaran, Vendor Jahit Pak Budi..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Pilih Produk Output</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari SKU atau Nama Produk..." 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white" 
                value={skuSearch} 
                onChange={e => setSkuSearch(e.target.value)} 
              />
              {filteredVariants.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                  {filteredVariants.map(v => {
                    const p = products.find(prod => prod.product_id === v.product_id);
                    return (
                      <button key={v.sku} type="button" onClick={() => handleAddItem(v)} className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center justify-between border-b last:border-0 border-slate-100">
                        <div className="flex-1">
                          <div className="text-sm font-black text-slate-900">{p?.nama_produk || 'Produk'}</div>
                          <div className="text-[10px] text-slate-500 font-mono font-bold">{v.sku} — {v.warna} {v.ukuran}</div>
                        </div>
                        <div className="text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">+ ADD</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50"><tr className="text-[9px] font-black uppercase text-slate-400 text-left"><th className="px-4 py-3">Detail SKU</th><th className="px-4 py-3 text-center w-28">Qty Rencana</th><th className="px-4 py-3 text-center w-24">Aksi BOM</th><th className="px-4 py-3 w-10"></th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {selectedItems.map(item => (
                    <React.Fragment key={item.sku}>
                      <tr>
                        <td className="px-4 py-3">
                           <div className="text-xs font-black text-slate-900">{item.sku}</div>
                           <div className="text-[9px] text-slate-400 font-bold uppercase">{variants.find(v => v.sku === item.sku)?.warna}</div>
                        </td>
                        <td className="px-4 py-3"><input type="number" className="w-full text-center px-2 py-1 border border-slate-200 rounded-lg text-sm font-black" value={item.qty} onChange={e => handleUpdateQty(item.sku, parseInt(e.target.value) || 0)} /></td>
                        <td className="px-4 py-3 text-center">
                          <button type="button" onClick={() => setEditingRecipeSku(editingRecipeSku === item.sku ? null : item.sku)} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${editingRecipeSku === item.sku ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Resep</button>
                        </td>
                        <td className="px-4 py-3"><button type="button" onClick={() => setSelectedItems(selectedItems.filter(i => i.sku !== item.sku))} className="text-rose-300 hover:text-rose-500 transition-colors">✕</button></td>
                      </tr>
                      {editingRecipeSku === item.sku && (
                        <tr className="bg-blue-50/20">
                          <td colSpan={4} className="px-4 py-3">
                             <div className="space-y-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Atur Komposisi Bahan Per Pcs</h4>
                                </div>
                                <div className="grid grid-cols-12 gap-2">
                                  <select className="col-span-7 px-3 py-1.5 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newBOMEntry.material_id} onChange={e => setNewBOMEntry({...newBOMEntry, material_id: e.target.value})}>
                                    <option value="">-- Pilih Bahan Baku --</option>
                                    {materials.map(m => <option key={m.material_id} value={m.material_id}>{m.nama_bahan}</option>)}
                                  </select>
                                  <input type="number" step="0.01" className="col-span-3 px-3 py-1.5 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Qty" value={newBOMEntry.qty || ''} onChange={e => setNewBOMEntry({...newBOMEntry, qty: Number(e.target.value)})} />
                                  <button type="button" onClick={handleAddBOMIngredient} className="col-span-2 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 active:scale-95">+</button>
                                </div>
                                <div className="space-y-1 mt-3">
                                  {bomProducts.filter(b => b.sku === item.sku).map(b => (
                                    <div key={b.material_id} className="flex justify-between items-center text-[10px] font-bold text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 group">
                                      <span>{materials.find(m => m.material_id === b.material_id)?.nama_bahan}</span>
                                      <div className="flex items-center gap-3">
                                        <span className="text-slate-900">{b.qty_per_pcs} {materials.find(m => m.material_id === b.material_id)?.satuan} / Pc</span>
                                        <button 
                                          type="button" 
                                          onClick={() => handleDeleteBOMIngredient(b.material_id)} 
                                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                          title="Hapus bahan dari resep"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  {bomProducts.filter(b => b.sku === item.sku).length === 0 && (
                                    <p className="text-[10px] text-slate-400 italic text-center py-2">Belum ada bahan baku yang ditambahkan.</p>
                                  )}
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {selectedItems.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-300 italic text-sm">Cari dan tambahkan produk output di atas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Biaya Operasional Produksi (Labor/Overhead)</label>
            <div className="grid grid-cols-12 gap-2">
               <input className="col-span-6 px-4 py-2 border rounded-xl text-sm" placeholder="Contoh: Ongkos Jahit Satuan" value={newCost.komponen} onChange={e => setNewCost({...newCost, komponen: e.target.value})} />
               <input type="number" className="col-span-4 px-4 py-2 border rounded-xl text-sm" placeholder="Total Biaya" value={newCost.biaya || ''} onChange={e => setNewCost({...newCost, biaya: Number(e.target.value)})} />
               <button type="button" onClick={handleAddBatchCost} className="col-span-2 bg-slate-900 text-white rounded-xl text-xs font-black">ADD</button>
            </div>
            <div className="space-y-2">
               {localBatchCosts.map((c, i) => (
                 <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">{c.komponen}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black">Rp {c.biaya.toLocaleString()}</span>
                      <button type="button" onClick={() => setLocalBatchCosts(localBatchCosts.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-600 transition-colors">✕</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="bg-slate-900 p-6 rounded-[32px] text-white space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Rincian Estimasi HPP Aktual</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedItems.map(item => {
                    const breakdown = hppBreakdown[item.sku];
                    return (
                      <div key={item.sku} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{item.sku}</p>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xl font-black text-white">Rp {Math.round(breakdown.total).toLocaleString()}</span>
                           <span className="text-[9px] font-black bg-blue-600 px-2 py-0.5 rounded">PER PCS</span>
                        </div>
                        <div className="space-y-1 pt-2 border-t border-white/5">
                           <div className="flex justify-between text-[9px] font-bold opacity-50"><span>Bahan Baku:</span><span>Rp {Math.round(breakdown.material).toLocaleString()}</span></div>
                           <div className="flex justify-between text-[9px] font-bold opacity-50"><span>Allocated Cost:</span><span>Rp {Math.round(breakdown.overhead).toLocaleString()}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Modal Batch</p>
                    <p className="text-3xl font-black text-white tracking-tighter">
                      Rp {(Object.values(materialRequirements).reduce((acc: number, needed, idx) => {
                        const mat = materials.find(m => m.material_id === Object.keys(materialRequirements)[idx]);
                        return acc + (Number(needed) * (mat?.harga_rata2 || 0));
                      }, 0) + totalOverhead).toLocaleString()}
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Kebutuhan Produksi</p>
                    <p className="text-xl font-black text-white">{totalQtyRencana} PCS</p>
                 </div>
              </div>
            </div>
          )}
        </form>
        
        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-slate-500">Batal</button>
          <button type="button" onClick={handleSubmit} className="px-10 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Selesaikan Rencana</button>
        </div>
      </div>
    </div>
  );
};

export default ProductionFormModal;
