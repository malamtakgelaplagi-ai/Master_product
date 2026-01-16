
import React, { useState, useMemo } from 'react';
import { Sale, SaleItem, Variant, Product, Stock, PaymentLog } from '../types';

interface ReportsManagementProps {
  sales: Sale[];
  salesItems: SaleItem[];
  variants: Variant[];
  products: Product[];
  stocks: Stock[];
  paymentLogs: PaymentLog[];
  isLoading: boolean;
}

const ReportsManagement: React.FC<ReportsManagementProps> = ({
  sales,
  salesItems,
  variants,
  products,
  stocks,
  paymentLogs,
  isLoading
}) => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const stats = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const rangeSales = sales.filter(s => {
      const d = new Date(s.tanggal);
      return d >= start && d <= end;
    });

    const rangePayments = paymentLogs.filter(p => {
      const d = new Date(p.tanggal);
      return d >= start && d <= end;
    });

    const omzetSelected = rangeSales
      .filter(s => s.status === 'PAID')
      .reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    const piutangSelected = rangeSales
      .filter(s => s.status === 'DP')
      .reduce((acc, s) => acc + (Number(s.sisa) || 0), 0);

    const cashInSelected = rangePayments.reduce((acc, p) => acc + (Number(p.jumlah) || 0), 0);

    let totalLabaSelected = 0;
    const paidInvoicesInRange = rangeSales.filter(s => s.status === 'PAID').map(s => s.invoice);
    const paidItemsInRange = salesItems.filter(si => paidInvoicesInRange.includes(si.invoice));

    paidItemsInRange.forEach(item => {
      const v = variants.find(vr => vr.sku === item.sku);
      if (v) {
        const stockItem = stocks.find(s => s.sku === v.sku);
        const prod = products.find(p => p.product_id === v.product_id);
        const hpp = Number(stockItem?.hpp_aktual) || Number(prod?.biaya_produksi) || 0;
        const netPrice = Number(item.harga) - Number(item.diskon);
        totalLabaSelected += (netPrice - hpp) * Number(item.qty);
      }
    });

    const now = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);
    const criticalInvoices = sales.filter(s => s.status === 'DP' && new Date(s.tanggal) < fourteenDaysAgo);

    const trendDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayTotal = paymentLogs
        .filter(p => p.tanggal.startsWith(dStr))
        .reduce((acc, p) => acc + (Number(p.jumlah) || 0), 0);
      return { 
        label: d.toLocaleDateString('id-ID', { weekday: 'short' }), 
        value: dayTotal
      };
    }).reverse();

    return { omzetSelected, piutangSelected, cashInSelected, totalLabaSelected, criticalInvoices, trendDays };
  }, [sales, salesItems, variants, products, stocks, paymentLogs, startDate, endDate]);

  const inventoryValuation = useMemo(() => {
    let totalHppValue = 0;
    let totalRetailValue = 0;
    let totalPcs = 0;
    stocks.forEach(s => {
      const v = variants.find(vr => vr.sku === s.sku);
      const p = v ? products.find(prod => prod.product_id === v.product_id) : null;
      const hpp = Number(s.hpp_aktual) || Number(p?.biaya_produksi) || 0;
      const retail = Number(v?.harga_jual) || 0;
      const qty = Number(s.stok) || 0;
      totalHppValue += hpp * qty;
      totalRetailValue += retail * qty;
      totalPcs += qty;
    });
    return { totalHppValue, totalRetailValue, totalPcs };
  }, [stocks, variants, products]);

  const setQuickFilter = (type: 'today' | 'week' | 'month' | 'all') => {
    const end = new Date();
    const start = new Date();
    if (type === 'today') {}
    else if (type === 'week') { start.setDate(end.getDate() - 7); }
    else if (type === 'month') { start.setDate(1); }
    else if (type === 'all') { start.setFullYear(2020, 0, 1); }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (isLoading) return <div className="text-center py-24 animate-pulse"><div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="font-bold text-slate-400">Loading Report Dashboard...</p></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Filters */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            <div className="space-y-1.5 w-full md:w-auto">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
               <input 
                 type="date" 
                 className="w-full md:w-48 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
               />
            </div>
            <div className="hidden md:block text-slate-300 font-black mt-5">→</div>
            <div className="space-y-1.5 w-full md:w-auto">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
               <input 
                 type="date" 
                 className="w-full md:w-48 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
               />
            </div>
         </div>
         <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['today', 'week', 'month', 'all'].map(filter => (
              <button key={filter} onClick={() => setQuickFilter(filter as any)} className="whitespace-nowrap px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                {filter}
              </button>
            ))}
         </div>
      </div>

      {/* Main Financials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-white border border-white/5">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Net Omzet</p>
              <h3 className="text-3xl font-black tracking-tighter">Rp {stats.omzetSelected.toLocaleString()}</h3>
              <p className="mt-6 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Settled Invoices only</p>
           </div>
           <div className="absolute -right-4 -bottom-4 w-28 h-28 text-white/5"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
           <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2">New Receivables</p>
           <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Rp {stats.piutangSelected.toLocaleString()}</h3>
           <p className="mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unpaid portion in range</p>
        </div>

        <div className="bg-emerald-500 p-8 rounded-[40px] shadow-xl shadow-emerald-100 text-white">
           <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-2">Cash Collected</p>
           <h3 className="text-3xl font-black tracking-tighter">Rp {stats.cashInSelected.toLocaleString()}</h3>
           <p className="mt-6 text-[9px] font-bold text-emerald-200 uppercase tracking-widest">Total real money received</p>
        </div>

        <div className="bg-blue-600 p-8 rounded-[40px] shadow-xl shadow-blue-100 text-white">
           <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-2">Est. Gross Profit</p>
           <h3 className="text-3xl font-black tracking-tighter">Rp {Math.round(stats.totalLabaSelected).toLocaleString()}</h3>
           <p className="mt-6 text-[9px] font-bold text-blue-200 uppercase tracking-widest">Paid Invoices - HPP</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-12">
              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Daily Cash Inflow</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time tracking last 7 active days</p>
              </div>
           </div>
           
           <div className="h-64 flex items-end justify-between gap-6 px-4">
              {stats.trendDays.map((day, i) => {
                const maxVal = Math.max(...stats.trendDays.map(d => d.value)) || 1;
                const height = (day.value / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                     <div className="w-full relative flex flex-col items-center justify-end h-full">
                        {day.value > 0 && (
                          <div className="absolute -top-10 text-[10px] font-black text-slate-900 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-2xl px-3 py-1.5 rounded-xl border border-slate-100 whitespace-nowrap z-20">
                            Rp {day.value.toLocaleString()}
                          </div>
                        )}
                        <div 
                          className={`w-full max-w-[56px] rounded-t-2xl transition-all duration-700 group-hover:scale-x-110 group-hover:brightness-110 ${day.value > 0 ? 'bg-slate-900 shadow-xl shadow-slate-200' : 'bg-slate-100'}`}
                          style={{ height: `${Math.max(6, height)}%` }}
                        ></div>
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day.label}</span>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-rose-900 p-10 rounded-[48px] shadow-2xl shadow-rose-200 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                 <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></div>
                 <h4 className="text-[11px] font-black text-rose-300 uppercase tracking-[0.3em]">Critical Overdue</h4>
              </div>
              
              {stats.criticalInvoices.length === 0 ? (
                <div className="py-12 text-center text-rose-300/40 italic text-sm font-bold">No overdue piutang. Excellent! ✨</div>
              ) : (
                <div className="space-y-4 relative z-10">
                   {stats.criticalInvoices.slice(0, 4).map(inv => (
                     <div key={inv.invoice} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm transition-all hover:bg-white/10">
                        <div>
                           <div className="text-[10px] font-black text-rose-300 tracking-widest mb-0.5">{inv.invoice}</div>
                           <div className="text-xs font-bold truncate max-w-[120px]">{inv.customer_name}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs font-black text-rose-400">Rp {inv.sisa.toLocaleString()}</div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 px-2">Top Performance</h4>
              <div className="space-y-6">
                 {(() => {
                    const counts: Record<string, { qty: number, name: string }> = {};
                    rangeSales(sales, startDate, endDate).forEach(s => {
                      salesItems.filter(si => si.invoice === s.invoice).forEach(item => {
                        const v = variants.find(vr => vr.sku === item.sku);
                        const p = v ? products.find(prod => prod.product_id === v.product_id) : null;
                        const name = p?.nama_produk || 'Unknown Product';
                        counts[name] = { qty: (counts[name]?.qty || 0) + Number(item.qty), name };
                      });
                    });
                    
                    return Object.values(counts)
                      .sort((a, b) => b.qty - a.qty)
                      .slice(0, 5)
                      .map((p, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-[11px] text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">{i+1}</div>
                          <div className="flex-1">
                             <div className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{p.name}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.qty} Units Sold</div>
                          </div>
                        </div>
                      ));
                 })()}
              </div>
           </div>
        </div>
      </div>

      {/* Global Inventory Valuation */}
      <div className="bg-slate-900 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
         <div className="absolute top-0 right-0 p-12 opacity-5">
            <svg className="w-72 h-72" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
         </div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-8 max-w-2xl text-center md:text-left">
               <div>
                  <h4 className="text-4xl font-black tracking-tight leading-none mb-4">Global Asset Valuation</h4>
                  <p className="text-base text-slate-400 font-medium leading-relaxed">Live assessment of total capital locked in warehouse and projected retail value based on current physical stock.</p>
               </div>
               
               <div className="grid grid-cols-2 gap-12 border-t border-white/10 pt-10">
                  <div className="space-y-1.5">
                     <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em]">Total Capital (HPP)</p>
                     <p className="text-3xl font-black tracking-tighter">Rp {inventoryValuation.totalHppValue.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1.5">
                     <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">Retail Potential</p>
                     <p className="text-3xl font-black tracking-tighter">Rp {inventoryValuation.totalRetailValue.toLocaleString()}</p>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col gap-6 w-full md:w-80">
               <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-2xl group hover:bg-white/10 transition-all shadow-xl shadow-black/20">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Inventory Depth</p>
                  <p className="text-5xl font-black text-white tracking-tighter">{inventoryValuation.totalPcs.toLocaleString()} <span className="text-xs text-slate-600 font-black uppercase tracking-widest ml-1">Items</span></p>
                  <div className="mt-6 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[65%] shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
                  </div>
               </div>
               <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[40px] backdrop-blur-2xl group hover:bg-indigo-500/20 transition-all shadow-xl">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Active Models</p>
                  <p className="text-5xl font-black text-white tracking-tighter">{products.length} <span className="text-xs text-indigo-800 font-black uppercase tracking-widest ml-1">SKUs</span></p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

function rangeSales(sales: Sale[], startStr: string, endStr: string): Sale[] {
  const start = new Date(startStr); start.setHours(0,0,0,0);
  const end = new Date(endStr); end.setHours(23,59,59,999);
  return sales.filter(s => {
    const d = new Date(s.tanggal);
    return d >= start && d <= end;
  });
}

export default ReportsManagement;
