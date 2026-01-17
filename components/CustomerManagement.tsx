
import React, { useState } from 'react';
import { Customer } from '../types';

interface CustomerManagementProps {
  customers: Customer[];
  onSave: (updated: Customer[]) => void;
  isLoading: boolean;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onSave, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'customer_id'>>({ 
    nama: '', tipe: 'RETAIL', hp: '', email: '', alamat: '', catatan: '' 
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ nama: '', tipe: 'RETAIL', hp: '', email: '', alamat: '', catatan: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ 
      nama: customer.nama, 
      tipe: customer.tipe, 
      hp: customer.hp, 
      email: customer.email, 
      alamat: customer.alamat, 
      catatan: customer.catatan 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      const updated = customers.map(c => 
        c.customer_id === editingCustomer.customer_id ? { ...formData, customer_id: c.customer_id } : c
      );
      onSave(updated);
    } else {
      const newId = `CUS-${String(customers.length + 1).padStart(3, '0')}`;
      const newC: Customer = { ...formData, customer_id: newId };
      onSave([newC, ...customers]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus pelanggan ini dari database?')) {
      onSave(customers.filter(c => c.customer_id !== id));
    }
  };

  if (isLoading) return <div className="text-center py-24 animate-pulse"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Memuat Customer...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Master Database Pelanggan</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Kelola data klien, reseller, dan dropshipper Anda.</p>
         </div>
         <button onClick={handleOpenAdd} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">+ Pelanggan Baru</button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
         <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
               <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama / ID</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Klasifikasi</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontak Terdaftar</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Manajemen</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {customers.map(c => (
                 <tr key={c.customer_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="text-sm font-black text-slate-900">{c.nama}</div>
                       <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{c.customer_id}</div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${
                         c.tipe === 'RESELLER' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                         c.tipe === 'DROPSHIPPER' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                         'bg-slate-100 text-slate-600 border-slate-200'
                       }`}>
                         {c.tipe}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="text-xs font-black text-slate-700">{c.hp}</div>
                       <div className="text-[10px] text-slate-400 font-medium">{c.email}</div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px] leading-relaxed italic">{c.alamat}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleOpenEdit(c)}
                            className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit Pelanggan"
                          >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(c.customer_id)}
                            className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Hapus Pelanggan"
                          >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
               {customers.length === 0 && (
                 <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 italic font-medium">Belum ada pelanggan terdaftar.</td></tr>
               )}
            </tbody>
         </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl space-y-8 animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingCustomer ? 'Perbarui Data Pelanggan' : 'Registrasi Pelanggan Baru'}</h2>
                <p className="text-sm text-slate-400 mt-1 font-medium">{editingCustomer ? `ID: ${editingCustomer.customer_id}` : 'Tambahkan pelanggan baru ke database MDM Anda.'}</p>
              </div>
              
              <div className="space-y-5">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                   <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Ex: CV. Fashion Mandiri" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
                 </div>
                 
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipe Pelanggan</label>
                   <div className="grid grid-cols-3 gap-2">
                     {(['RETAIL', 'RESELLER', 'DROPSHIPPER'] as const).map(t => (
                       <button 
                        key={t}
                        type="button"
                        onClick={() => setFormData({...formData, tipe: t})}
                        className={`py-3.5 rounded-xl text-[10px] font-black tracking-widest border transition-all ${formData.tipe === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                       >
                         {t}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp / HP</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="0812..." value={formData.hp} onChange={e => setFormData({...formData, hp: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" placeholder="kantor@mail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Alamat Lengkap</label>
                   <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm leading-relaxed" placeholder="Jl. Sudirman No. 1..." rows={3} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} />
                 </div>
              </div>

              <div className="flex gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-slate-400 font-black uppercase text-[11px] tracking-[0.2em] transition-colors hover:text-slate-600">Batal</button>
                 <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                    {editingCustomer ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
                 </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
