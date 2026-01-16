
import React from 'react';
import { Product, ProductStatus } from '../types';

interface DashboardStatsProps {
  products: Product[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ products }) => {
  const activeCount = products.filter(p => p.status === ProductStatus.AKTIF).length;
  
  const avgMargin = products.length > 0 
    ? products.reduce((acc, p) => {
        const jual = Number(p.harga_jual) || 0;
        const modal = Number(p.biaya_produksi) || 0;
        return acc + (jual - modal);
      }, 0) / products.length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
        <div className="bg-slate-900 p-3.5 rounded-2xl text-white shadow-lg shadow-slate-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Catalog</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{products.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
        <div className="bg-emerald-500 p-3.5 rounded-2xl text-white shadow-lg shadow-emerald-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Produk Aktif</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{activeCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
        <div className="bg-blue-600 p-3.5 rounded-2xl text-white shadow-lg shadow-blue-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Avg Product Margin</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">Rp {(Math.round(avgMargin) || 0).toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
