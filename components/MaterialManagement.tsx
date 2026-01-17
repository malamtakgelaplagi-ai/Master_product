
import React, { useState, useMemo } from 'react';
import { Material, MaterialStock, MaterialStockLog } from '../types';

interface MaterialManagementProps {
  materials: Material[];
  materialStocks: MaterialStock[];
  materialLogs: MaterialStockLog[];
  onSave: (updated: Material[], updatedStocks: MaterialStock[], newLogs: MaterialStockLog[]) => void;
  isLoading: boolean;
}

const MaterialManagement: React.FC<MaterialManagementProps> = ({
  materials,
  materialStocks,
  materialLogs,
  onSave,
  isLoading
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedMat, setSelectedMat] = useState<Material | null>(null);
  const [formData, setFormData] = useState<Partial<Material>>({
    nama_bahan: '', kategori: 'KAIN', satuan: 'meter', harga_rata2: 0, aktif: true
  });
  const [adjData, setAdjData] = useState({ qty: 0, type: 'PEMBELIAN' as 'PEMBELIAN' | 'ADJUSTMENT', note: '' });

  const getStock = (id: string) => materialStocks.find(s => s.material_id === id)?.stok || 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `MAT-${String(materials.length + 1).padStart(2, '0')}`;
    const newMat: Material = {
      material_id: nextId,
      nama_bahan: formData.nama_bahan || '',
      kategori: formData.kategori || 'LAINNYA',
      satuan: formData.satuan || 'pcs',
      harga_rata2: Number(formData.harga_rata2) || 0,
      aktif: true
    };
    const newStock: MaterialStock = { material_id: nextId, stok: 0 };
    onSave([...materials, newMat], [...materialStocks, newStock], []);
    setIsModalOpen(false);
    setFormData({ nama_bahan: '', kategori: 'KAIN', satuan: 'meter', harga_rata2: 0, aktif: true });
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMat) return;
    const qty = Number(adjData.qty);
    const newLogs: MaterialStockLog[] = [{
      tanggal: new Date().toISOString(),
      material_id: selectedMat.material_id,
      qty,
      jenis: adjData.type,
      referensi: adjData.type === 'PEMBELIAN' ? 'PO-MANUAL' : 'ADJ-MANUAL',
      catatan: adjData.note
    }];
    const updatedStocks = materialStocks.map(s => 
      s.material_id === selectedMat.material_id ? { ...s, stok: s.stok + qty } : s
    );
    onSave(materials, updatedStocks, newLogs);
    setIsAdjustmentOpen(false);
  };

  const handleDelete = (materialId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus bahan ini dari database master?')) {
      const updatedMaterials = materials.filter(m => m.material_id !== materialId);
      const updatedStocks = materialStocks.filter(s => s.material_id !== materialId);
      onSave(updatedMaterials, updatedStocks, []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-lg font-black text-slate-900">Inventori Bahan Baku</h2>
            <p className="text-sm text-slate-500">Kelola master kain, aksesoris, dan benang.</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">+ Tambah Bahan</button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
         <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
               <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Material ID</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Bahan</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Fisik</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Price</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {materials.map(m => (
                 <tr key={m.material_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 text-[10px] font-black font-mono text-slate-400">{m.material_id}</td>
                    <td className="px-8 py-5 font-bold text-slate-900 text-sm">{m.nama_bahan}</td>
                    <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.kategori}</td>
                    <td className="px-8 py-5 text-center">
                       <span className={`text-sm font-black ${getStock(m.material_id) <= 10 ? 'text-rose-600' : 'text-slate-900'}`}>{getStock(m.material_id)}</span>
                       <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{m.satuan}</span>
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-bold text-slate-700">Rp {m.harga_rata2.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => { setSelectedMat(m); setAdjData({ qty: 0, type: 'PEMBELIAN', note: '' }); setIsAdjustmentOpen(true); }} 
                            className="text-[10px] font-black text-blue-600 uppercase hover:text-blue-800 transition-colors"
                          >
                            Adjust Stok
                          </button>
                          <button 
                            onClick={() => handleDelete(m.material_id)}
                            className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Hapus Bahan"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
               {materials.length === 0 && (
                 <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic text-sm">Belum ada bahan baku terdaftar.</td></tr>
               )}
            </tbody>
         </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <form onSubmit={handleAdd} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in duration-200">
              <h2 className="text-xl font-black text-slate-900">Tambah Bahan Baru</h2>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Bahan</label>
                    <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" placeholder="Contoh: Kain Cotton Combed 30s" value={formData.nama_bahan} onChange={e => setFormData({...formData, nama_bahan: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kategori</label>
                       <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                           <option>KAIN</option><option>BENANG</option><option>AKSESORIS</option><option>LAINNYA</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Satuan</label>
                       <input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" placeholder="m, pcs, cone" value={formData.satuan} onChange={e => setFormData({...formData, satuan: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Harga Rata-rata (Estimasi)</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" placeholder="Rp 0" value={formData.harga_rata2} onChange={e => setFormData({...formData, harga_rata2: Number(e.target.value)})} />
                 </div>
              </div>
              <div className="flex gap-2">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest">Batal</button>
                 <button type="submit" className="flex-[2] py-4 bg-[#0071E3] text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-blue-500/20">Simpan Bahan</button>
              </div>
           </form>
        </div>
      )}

      {isAdjustmentOpen && selectedMat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <form onSubmit={handleAdjust} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in duration-200">
              <div>
                <h2 className="text-xl font-black text-slate-900">Mutasi Stok Bahan</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedMat.nama_bahan}</p>
              </div>
              <div className="space-y-4">
                 <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={adjData.type} onChange={e => setAdjData({...adjData, type: e.target.value as any})}>
                    <option value="PEMBELIAN">PEMBELIAN (+)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (+/-)</option>
                 </select>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jumlah Kuantitas</label>
                    <input type="number" required className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-3xl font-black text-center" placeholder="0" value={adjData.qty || ''} onChange={e => setAdjData({...adjData, qty: Number(e.target.value)})} />
                 </div>
                 <input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" placeholder="Catatan/Supplier..." value={adjData.note} onChange={e => setAdjData({...adjData, note: e.target.value})} />
              </div>
              <div className="flex gap-2">
                 <button type="button" onClick={() => setIsAdjustmentOpen(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest">Batal</button>
                 <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[11px] tracking-widest">Simpan Mutasi</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default MaterialManagement;
