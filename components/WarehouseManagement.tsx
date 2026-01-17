
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

  const handleDelete = (wid: string) => {
    if (hasStock(wid)) {
      alert("Tidak dapat menghapus gudang yang masih berisi stok barang!");
      return;
    }
    if (window.confirm('Hapus gudang ini dari sistem?')) {
      onSave(warehouses.filter(wh => wh.warehouse_id !== wid));
    }
  };

  if (isLoading) return <div className="text-center py-20 animate-pulse"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Memuat Gudang...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-lg font-black text-slate-900">Daftar Gudang</h2>
            <p className="text-sm text-slate-500 font-medium">Kelola multi-lokasi penyimpanan barang Anda.</p>
         </div>
         <button onClick={() => setIsAdding(true)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">+ Gudang Baru</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {warehouses.map(w => (
           <div key={w.warehouse_id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm group hover:shadow-xl hover:border-blue-100 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${w.aktif ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{w.aktif ? 'AKTIF' : 'NON-AKTIF'}</span>
                 </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{w.nama_gudang}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   <p className="text-xs font-bold uppercase tracking-widest">{w.lokasi}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal ID</span>
                    <span className="text-xs font-black text-indigo-600 font-mono">{w.warehouse_id}</span>
                 </div>
                 {hasStock(w.warehouse_id) ? (
                   <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">Gudang Berisi Stok</span>
                 ) : (
                   <button 
                    onClick={() => handleDelete(w.warehouse_id)}
                    className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Hapus Gudang"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                 )}
              </div>
           </div>
         ))}
         {warehouses.length === 0 && (
           <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic">Belum ada gudang terdaftar.</p>
           </div>
         )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl space-y-8 animate-in zoom-in duration-200">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tambah Gudang Baru</h2>
                <p className="text-sm text-slate-400 mt-1">Daftarkan titik distribusi baru Anda.</p>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ID Gudang</label>
                   <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="CONTOH: WH-01" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Gudang</label>
                   <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Gudang Utama Jakarta" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lokasi Kota</label>
                   <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Jakarta Selatan" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} />
                 </div>
              </div>
              <div className="flex gap-3">
                 <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest">Batal</button>
                 <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-500/20">Simpan Gudang</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default WarehouseManagement;
