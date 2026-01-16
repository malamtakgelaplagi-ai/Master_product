
import React, { useState } from 'react';
import { Customer } from '../types';

interface CustomerManagementProps {
  customers: Customer[];
  onSave: (updated: Customer[]) => void;
  isLoading: boolean;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onSave, isLoading }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<Customer, 'customer_id'>>({ nama: '', tipe: 'RETAIL', hp: '', email: '', alamat: '', catatan: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CUS-${String(customers.length + 1).padStart(3, '0')}`;
    const newC: Customer = { ...formData, customer_id: newId };
    onSave([newC, ...customers]);
    setIsAdding(false);
    setFormData({ nama: '', tipe: 'RETAIL', hp: '', email: '', alamat: '', catatan: '' });
  };

  if (isLoading) return <div className="text-center py-20 animate-pulse">Memuat Customer...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-xl font-bold">Master Customer</h2>
            <p className="text-sm text-slate-500">Database pelanggan untuk loyalty dan klasifikasi harga.</p>
         </div>
         <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md">+ Customer Baru</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
               <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Nama / ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Tipe</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Kontak</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">Alamat</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {customers.map(c => (
                 <tr key={c.customer_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="text-sm font-bold">{c.nama}</div>
                       <div className="text-[10px] text-slate-400 font-mono">{c.customer_id}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded ${c.tipe === 'RESELLER' ? 'bg-blue-100 text-blue-700' : c.tipe === 'DROPSHIPPER' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>{c.tipe}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-xs font-medium">{c.hp}</div>
                       <div className="text-[10px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-[11px] text-slate-600 line-clamp-1">{c.alamat}</div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
           <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-black">Registrasi Customer</h2>
              <div className="space-y-4">
                 <input required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Nama Customer" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
                 <select className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold" value={formData.tipe} onChange={e => setFormData({...formData, tipe: e.target.value as any})}>
                    <option value="RETAIL">RETAIL</option>
                    <option value="RESELLER">RESELLER</option>
                    <option value="DROPSHIPPER">DROPSHIPPER</option>
                 </select>
                 <input className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="No. HP" value={formData.hp} onChange={e => setFormData({...formData, hp: e.target.value})} />
                 <input className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 <textarea className="w-full px-4 py-3 bg-slate-50 border rounded-xl" placeholder="Alamat" rows={2} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} />
              </div>
              <div className="flex gap-2">
                 <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 text-slate-400 font-bold">Batal</button>
                 <button type="submit" className="flex-2 py-3 bg-indigo-600 text-white rounded-xl font-black">Daftarkan</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
