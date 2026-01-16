
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
                 <tr key={m.material_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 text-[10px] font-black font-mono text-slate-400">{m.material_id}</td>
                    <td className="px-8 py-5 font-bold text-slate-900 text-sm">{m.nama_bahan}</td>
                    <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.kategori}</td>
                    <td className="px-8 py-5 text-center">
                       <span className={`text-sm font-black ${getStock(m.material_id) <= 10 ? 'text-rose-600' : 'text-slate-900'}`}>{getStock(m.material_id)}</span>
                       <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{m.satuan}</span>
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-bold text-slate-700">Rp {m.harga_rata2.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                       <button onClick={() => { setSelectedMat(m); setAdjData({ qty: 0, type: 'PEMBELIAN', note: '' }); setIsAdjustmentOpen(true); }} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Adjust Stok</button>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <form onSubmit={handleAdd} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
              <h2 className="text-xl font-black">Bahan Baru</h2>
              <div className="space-y-4">
                 <input required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Nama Bahan" value={formData.nama_bahan} onChange={e => setFormData({...formData, nama_bahan: e.target.value})} />
                 <div className="grid grid-cols-2 gap-3">
                    <select className="px-4 py-3 bg-slate-50 border rounded-xl font-bold" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                        <option>KAIN</option><option>BENANG</option><option>AKSESORIS</option><option>LAINNYA</option>
                    </select>
                    <input className="px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Satuan (m, pcs, cone)" value={formData.satuan} onChange={e => setFormData({...formData, satuan: e.target.value})} />
                 </div>
                 <input type="number" className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Harga Estimasi/Rata-rata" value={formData.harga_rata2} onChange={e => setFormData({...formData, harga_rata2: Number(e.target.value)})} />
              </div>
              <div className="flex gap-2">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-400 font-bold">Batal</button>
                 <button type="submit" className="flex-2 py-3 bg-blue-600 text-white rounded-xl font-black">Simpan Bahan</button>
              </div>
           </form>
        </div>
      )}

      {isAdjustmentOpen && selectedMat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <form onSubmit={handleAdjust} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl font-black">Mutasi Stok Bahan</h2>
                <p className="text-xs text-slate-400">{selectedMat.nama_bahan}</p>
              </div>
              <div className="space-y-4">
                 <select className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold" value={adjData.type} onChange={e => setAdjData({...adjData, type: e.target.value as any})}>
                    <option value="PEMBELIAN">PEMBELIAN (+)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (+/-)</option>
                 </select>
                 <input type="number" required className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-2xl font-black text-center" placeholder="Qty" value={adjData.qty || ''} onChange={e => setAdjData({...adjData, qty: Number(e.target.value)})} />
                 <input className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Catatan/Supplier" value={adjData.note} onChange={e => setAdjData({...adjData, note: e.target.value})} />
              </div>
              <div className="flex gap-2">
                 <button type="button" onClick={() => setIsAdjustmentOpen(false)} className="flex-1 py-3 text-slate-400 font-bold">Batal</button>
                 <button type="submit" className="flex-2 py-3 bg-slate-900 text-white rounded-xl font-black">Simpan Mutasi</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default MaterialManagement;
