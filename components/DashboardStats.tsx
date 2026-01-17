
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
      <div className="premium-card p-8 flex items-center gap-6">
        <div className="bg-[#F5F5F7] p-4 rounded-2xl text-[#1D1D1F] shrink-0 border border-[#F2F2F7]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div className="overflow-hidden">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1 truncate">Total Items</p>
          <p className="text-4xl font-black text-[#1D1D1F] tracking-tighter truncate">{products.length}</p>
        </div>
      </div>

      <div className="premium-card p-8 flex items-center gap-6">
        <div className="bg-[#EBF7F2] p-4 rounded-2xl text-[#34C759] shrink-0 border border-[#D1F0E2]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="overflow-hidden">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1 truncate">Active Now</p>
          <p className="text-4xl font-black text-[#1D1D1F] tracking-tighter truncate">{activeCount}</p>
        </div>
      </div>

      <div className="premium-card p-8 flex items-center gap-6 border-l-4 border-l-[#0071E3]">
        <div className="bg-[#F0F7FF] p-4 rounded-2xl text-[#0071E3] shrink-0 border border-[#D9E9FF]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="overflow-hidden">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1 truncate">Avg Profit</p>
          <p className="text-3xl font-black text-[#1D1D1F] tracking-tighter truncate">Rp {(Math.round(avgMargin) || 0).toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
