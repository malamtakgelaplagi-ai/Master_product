
import React, { useMemo } from 'react';
import { ProductionBatch, ProductionItem, BOM, Material, BatchCost, Product, Variant, ProductionStatus } from '../types';

interface ProductionViewModalProps {
  isOpen: boolean;
  batch: ProductionBatch;
  items: ProductionItem[];
  bomProducts: BOM[];
  materials: Material[];
  batchCosts: BatchCost[];
  products: Product[];
  variants: Variant[];
  onClose: () => void;
}

const ProductionViewModal: React.FC<ProductionViewModalProps> = ({
  isOpen, batch, items, bomProducts, materials, batchCosts, products, variants, onClose
}) => {
  if (!isOpen) return null;

  const materialConsumption = useMemo(() => {
    const consumption: Record<string, { name: string, qty: number, unit: string, cost: number }> = {};
    
    items.forEach(item => {
      const skuBoms = bomProducts.filter(b => b.sku === item.sku);
      // Use qty_hasil if finished/processed, else use qty_rencana for prediction
      const multiplier = item.qty_hasil > 0 ? item.qty_hasil : item.qty_rencana;
      
      skuBoms.forEach(bom => {
        const mat = materials.find(m => m.material_id === bom.material_id);
        if (mat) {
          const usedQty = bom.qty_per_pcs * multiplier;
          if (!consumption[mat.material_id]) {
            consumption[mat.material_id] = {
              name: mat.nama_bahan,
              qty: 0,
              unit: mat.satuan,
              cost: mat.harga_rata2
            };
          }
          consumption[mat.material_id].qty += usedQty;
        }
      });
    });
    
    return Object.values(consumption);
  }, [items, bomProducts, materials]);

  const financialSummary = useMemo(() => {
    const totalMaterialCost = materialConsumption.reduce((acc, m) => acc + (m.qty * m.cost), 0);
    const totalOverhead = batchCosts.reduce((acc, c) => acc + (Number(c.biaya) || 0), 0);
    const totalQtyHasil = items.reduce((acc, i) => acc + (Number(i.qty_hasil) || 0), 0);
    const totalQtyRencana = items.reduce((acc, i) => acc + (Number(i.qty_rencana) || 0), 0);
    
    const divisor = totalQtyHasil > 0 ? totalQtyHasil : totalQtyRencana;
    const hpp = divisor > 0 ? (totalMaterialCost + totalOverhead) / divisor : 0;
    
    return {
      totalMaterialCost,
      totalOverhead,
      totalCost: totalMaterialCost + totalOverhead,
      hpp,
      totalQtyHasil,
      totalQtyRencana
    };
  }, [materialConsumption, batchCosts, items]);

  const getStatusStyle = (status: ProductionStatus) => {
    switch(status) {
      case ProductionStatus.DIR: return 'bg-slate-100 text-slate-600 border-slate-200';
      case ProductionStatus.FIN: return 'bg-emerald-500 text-white border-emerald-600';
      default: return 'bg-blue-600 text-white border-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Header Section */}
        <div className="p-8 bg-slate-900 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black bg-blue-500 px-3 py-1 rounded-full tracking-widest uppercase">Production Report</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase border ${getStatusStyle(batch.status)}`}>
                  {batch.status}
                </span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter mt-2">{batch.batch_id}</h2>
              <p className="text-slate-400 font-medium italic text-sm">{batch.catatan || 'Tanpa catatan internal'}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white">✕</button>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tanggal Mulai</p>
              <p className="text-sm font-bold text-white">{new Date(batch.tanggal_mulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Selesai</p>
              <p className="text-sm font-bold text-white">{new Date(batch.target_selesai).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">HPP Aktual Estimasi</p>
              <p className="text-lg font-black text-emerald-400 tracking-tighter">Rp {Math.round(financialSummary.hpp).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-slate-50">
          
          {/* Products Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Output Produk & Efisiensi</h3>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU Produk</th>
                    <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Rencana</th>
                    <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Hasil OK</th>
                    <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Reject</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Efisiensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map(item => {
                    const variant = variants.find(v => v.sku === item.sku);
                    const product = products.find(p => p.product_id === variant?.product_id);
                    const efficiency = item.qty_rencana > 0 ? (item.qty_hasil / item.qty_rencana) * 100 : 0;
                    return (
                      <tr key={item.sku}>
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-slate-900">{product?.nama_produk || item.sku}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                        </td>
                        <td className="px-6 py-5 text-center font-bold text-slate-600">{item.qty_rencana} Pcs</td>
                        <td className="px-6 py-5 text-center font-black text-blue-600 bg-blue-50/20">{item.qty_hasil} Pcs</td>
                        <td className="px-6 py-5 text-center font-bold text-rose-500">{item.qty_rusak} Pcs</td>
                        <td className="px-6 py-5 text-right">
                          <div className={`text-xs font-black ${efficiency >= 100 ? 'text-emerald-600' : efficiency >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {efficiency.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Raw Materials Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Konsumsi Bahan Baku (Realitas BOM)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materialConsumption.map(mat => (
                <div key={mat.name} className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-lg">
                      {mat.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none mb-1">{mat.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Terpakai dalam batch ini</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 tracking-tighter">{mat.qty.toFixed(2)} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">{mat.unit}</span></p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Rp {(mat.qty * mat.cost).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {materialConsumption.length === 0 && (
                <div className="col-span-2 p-10 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 italic text-sm">
                  Tidak ada data konsumsi bahan baku yang tercatat.
                </div>
              )}
            </div>
          </section>

          {/* Cost Analysis Footer */}
          <section className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-4">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Total Pengeluaran Batch</h4>
                <div className="space-y-3">
                   <div className="flex justify-between items-center opacity-60">
                      <span className="text-xs font-bold uppercase tracking-widest">Bahan Baku (BOM)</span>
                      <span className="text-sm font-bold">Rp {financialSummary.totalMaterialCost.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center opacity-60">
                      <span className="text-xs font-bold uppercase tracking-widest">Overhead / Ongkos</span>
                      <span className="text-sm font-bold">Rp {financialSummary.totalOverhead.toLocaleString()}</span>
                   </div>
                   <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                      <span className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Grand Total Modal</span>
                      <span className="text-3xl font-black tracking-tighter">Rp {financialSummary.totalCost.toLocaleString()}</span>
                   </div>
                </div>
             </div>
             
             <div className="flex flex-col justify-center space-y-6">
                <div className="flex gap-4 items-center">
                   <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Modal per Unit (Pcs)</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">Rp {Math.round(financialSummary.hpp).toLocaleString()}</p>
                   </div>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-4 border-blue-600 pl-4">
                  "HPP aktual dihitung berdasarkan konsumsi nyata bahan baku sesuai BOM dan biaya tambahan operasional yang dibebankan pada batch ini."
                </p>
             </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => window.print()} 
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Cetak Laporan
              </button>
           </div>
           <button 
             onClick={onClose} 
             className="px-10 py-4 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
           >
             Tutup Detail
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionViewModal;
