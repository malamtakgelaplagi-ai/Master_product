
import React, { useState } from 'react';
import { Warehouse, Stock } from '../types';

interface WarehouseManagementProps {
  warehouses: Warehouse[];
  stocks: Stock[];
  onSave: (updated: Warehouse[]) => void;
  isLoading: boolean;
}

const WarehouseManagement: React.FC<WarehouseManagementProps> = ({ warehouses, stocks, onSave, isLoading }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ id: '', nama: '', lokasi: '' });

  const hasStock = (wid: string) => stocks.some(s => s.warehouse_id === wid && s.stok > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (warehouses.some(w => w.warehouse_id === formData.id)) {
      alert("ID Gudang sudah ada!");
      return;
    }
    const newW: Warehouse = { warehouse_id: formData.id, nama_gudang: formData.nama, lokasi: formData.lokasi, aktif: true };
    onSave([...warehouses, newW]);
    setIsAdding(false);
    setFormData({ id: '', nama: '', lokasi: '' });
  };

  if (isLoading) return <div className="text-center py-20 animate-pulse">Memuat Gudang...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-xl font-bold">Daftar Gudang</h2>
            <p className="text-sm text-slate-500">Kelola multi-lokasi penyimpanan barang Anda.</p>
         </div>
         <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md">+ Gudang Baru</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {warehouses.map(w => (
           <div key={w.warehouse_id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">{w.warehouse_id}</div>
                 <span className={`text-[10px] font-black px-2 py-0.5 rounded ${w.aktif ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{w.aktif ? 'AKTIF' : 'NON-AKTIF'}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">{w.nama_gudang}</h3>
              <p className="text-sm text-slate-500 mb-4">{w.lokasi}</p>
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                 <div className="text-[10px] font-bold text-slate-400 uppercase">Total SKU: {stocks.filter(s => s.warehouse_id === w.warehouse_id).length}</div>
                 {hasStock(w.warehouse_id) ? <span className="text-[9px] font-black text-orange-400">Gudang berisi stok</span> : 
                   <button onClick={() => onSave(warehouses.filter(wh => wh.warehouse_id !== w.warehouse_id))} className="text-[10px] text-red-400 font-bold hover:underline">Hapus</button>
                 }
              </div>
           </div>
         ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
           <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
              <h2 className="text-xl font-black">Tambah Gudang Baru</h2>
              <div className="space-y-4">
                 <input required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="ID (ex: WH-01)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})} />
                 <input required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Nama Gudang" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
                 <input required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Lokasi (Kota)" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} />
              </div>
              <div className="flex gap-2">
                 <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 text-slate-400 font-bold">Batal</button>
                 <button type="submit" className="flex-2 py-3 bg-blue-600 text-white rounded-xl font-black">Simpan Gudang</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default WarehouseManagement;
