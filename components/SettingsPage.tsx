
import React, { useState, useEffect } from 'react';
import { spreadsheetService } from '../services/spreadsheetService';
import { User } from '../types';

interface SettingsPageProps {
  isLoading: boolean;
  onRefreshData?: () => Promise<void>;
  users: User[];
  onSyncUsers: (users: User[]) => Promise<void>;
  isSuperAdmin: boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  isLoading,
  onRefreshData,
  users,
  onSyncUsers,
  isSuperAdmin
}) => {
  const [businessUrl, setBusinessUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'connection' | 'users'>('connection');

  const businessSheets = [
    'products', 'categories', 'variants', 'stocks', 
    'stock_logs', 'sales', 'sales_items', 'payment_logs',
    'production_batches', 'production_items', 'product_costs', 
    'batch_costs', 'warehouses', 'customers',
    'materials', 'material_stock', 'material_stock_logs', 'bom_products'
  ];

  useEffect(() => {
    setBusinessUrl(localStorage.getItem('BUSINESS_BACKEND_URL') || '');
  }, []);

  const handleSaveUrls = () => {
    if (businessUrl) {
      localStorage.setItem('BUSINESS_BACKEND_URL', businessUrl);
      setStatus('success');
      setMessage('URL Spreadsheet Bisnis berhasil disimpan.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleTestBusiness = async () => {
    if (!businessUrl) return;
    setStatus('testing');
    setMessage('Menghubungkan ke Spreadsheet Bisnis...');
    const isOk = await spreadsheetService.testConnection(businessUrl);
    if (isOk) {
      localStorage.setItem('BUSINESS_BACKEND_URL', businessUrl);
      if (onRefreshData) await onRefreshData();
      setStatus('success');
      setMessage('Koneksi Bisnis Berhasil!');
    } else {
      setStatus('error');
      setMessage('Koneksi Bisnis Gagal. Periksa URL Anda.');
    }
  };

  const handleToggleUser = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
    const updated = users.map(u => u.uid === uid ? { ...u, status: newStatus as any } : u);
    await onSyncUsers(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit mb-4">
        <button onClick={() => setActiveTab('connection')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'connection' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Integrasi Database</button>
        {isSuperAdmin && (
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
            Manajemen Tim {users.filter(u => u.status === 'PENDING').length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
          </button>
        )}
      </div>

      {activeTab === 'connection' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">A</div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Konfigurasi Data Bisnis</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tempat penyimpanan Produk, Stok, dan Penjualan</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Apps Script Web App URL</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[20px] text-xs font-mono focus:bg-white focus:border-blue-500 outline-none transition-all" 
                      placeholder="https://script.google.com/macros/s/.../exec" 
                      value={businessUrl} 
                      onChange={(e) => setBusinessUrl(e.target.value)} 
                    />
                  </div>
                  <button onClick={handleTestBusiness} className="w-full py-5 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-100">Test & Sinkronisasi Sekarang</button>
                </div>

                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Struktur Tabel yang Dibutuhkan</p>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {businessSheets.map(s => (
                        <div key={s} className="text-[9px] font-bold text-slate-500 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                          {s}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {message && (
             <div className={`p-5 rounded-[24px] text-xs font-bold flex items-center justify-center gap-3 animate-in slide-in-from-top-2 ${status === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                <div className={`w-2 h-2 rounded-full ${status === 'error' ? 'bg-rose-500' : (status === 'testing' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500')}`}></div>
                {message}
             </div>
          )}

          <div className="flex justify-center pt-4">
             <button onClick={handleSaveUrls} className="px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">Simpan Pengaturan</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
           <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Akun Tim</h3>
                <p className="text-sm text-slate-500">Otorisasi akses aplikasi untuk staf kantor.</p>
              </div>
              <button onClick={() => spreadsheetService.fetchUsers().then(u => onSyncUsers(u))} className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">Refresh Data</button>
           </div>
           <div className="overflow-x-auto">
              <table className="min-w-full">
                 <thead className="bg-slate-50">
                    <tr>
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama & Email</th>
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                       <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {users.length === 0 ? (
                      <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 italic text-sm">Belum ada user terdaftar.</td></tr>
                    ) : users.map(u => (
                      <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                         <td className="px-8 py-5">
                            <div className="text-sm font-bold text-slate-900">{u.nama}</div>
                            <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                         </td>
                         <td className="px-8 py-5 text-sm font-black text-indigo-600 uppercase tracking-tighter">{u.role}</td>
                         <td className="px-8 py-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              u.status === 'AKTIF' ? 'bg-emerald-50 text-emerald-600' : 
                              u.status === 'PENDING' ? 'bg-amber-50 text-amber-600 animate-pulse' : 
                              'bg-slate-100 text-slate-400'
                            }`}>{u.status}</span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            {u.role !== 'SUPER_ADMIN' && (
                              <button 
                                onClick={() => handleToggleUser(u.uid, u.status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  u.status === 'AKTIF' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-600 text-white shadow-lg'
                                }`}
                              >
                                {u.status === 'AKTIF' ? 'Nonaktifkan' : 'Aktivasi'}
                              </button>
                            )}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
