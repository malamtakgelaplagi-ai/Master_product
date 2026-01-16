
import React, { useMemo } from 'react';
import { Variant, Product, Stock } from '../types';

interface StockDetailTableModalProps {
  variants: Variant[];
  products: Product[];
  stocks: Stock[];
  onClose: () => void;
}

const StockDetailTableModal: React.FC<StockDetailTableModalProps> = ({
  variants,
  products,
  stocks,
  onClose
}) => {
  // Consolidate data by Product ID to combine variations into a single display row
  const groupedData = useMemo(() => {
    const groups: Record<string, any> = {};

    variants.forEach((v) => {
      const product = products.find((p) => p.product_id === v.product_id);
      if (!product) return;

      const pid = v.product_id;
      if (!groups[pid]) {
        groups[pid] = {
          nama_produk: product.nama_produk,
          kategori: product.kategori,
          sub_kategori: product.sub_kategori,
          warnaSet: new Set<string>(),
          ukuranSet: new Set<string>(),
          bahanSet: new Set<string>(),
          deskripsi: product.deskripsi || v.deskripsi || '-',
          totalStok: 0,
          harga_jual: v.harga_jual, 
          hppList: [] as number[],
        };
      }

      // Add variation attributes to unique sets
      if (v.warna) groups[pid].warnaSet.add(v.warna);
      if (v.ukuran) groups[pid].ukuranSet.add(v.ukuran);
      if (v.jenis_bahan) groups[pid].bahanSet.add(v.jenis_bahan);

      // Accumulate physical stock across all warehouses for this variation
      const variantStocks = stocks.filter(s => s.sku === v.sku);
      variantStocks.forEach(s => {
        groups[pid].totalStok += (s.stok || 0);
        if (s.hpp_aktual) {
          groups[pid].hppList.push(s.hpp_aktual);
        }
      });
    });

    return Object.values(groups).map(g => ({
      ...g,
      warna: Array.from(g.warnaSet).join(', '),
      ukuran: Array.from(g.ukuranSet).join(', '),
      jenis_bahan: Array.from(g.bahanSet).join(', '),
      // Average HPP if multiple variations have different actual costs
      hpp_aktual: g.hppList.length > 0 
        ? Math.round(g.hppList.reduce((a: number, b: number) => a + b, 0) / g.hppList.length) 
        : 0
    }));
  }, [variants, products, stocks]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 sm:p-8">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-[95vw] overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-10 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full tracking-widest uppercase mb-3 inline-block">Enterprise Report</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Konsolidasi Master Stok</h2>
            <p className="text-sm text-slate-400 font-medium mt-1">Laporan stok fisik gabungan per model produk dengan data HPP aktual.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.print()} 
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              PDF Export
            </button>
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Modal Content - The Table */}
        <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-slate-200">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50 sticky top-0 z-20">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">Nama Produk</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">Kategori</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">Sub</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">Warna</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">Ukuran</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">Deskripsi</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">Bahan</th>
                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100 bg-orange-50/20">Stok</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">Harga Jual</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-blue-50/30">HPP Aktual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {groupedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-10 py-32 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h4m0 0l-4-4m4 4l-4 4" /></svg>
                    </div>
                    <p className="text-slate-400 font-bold text-sm tracking-tight">Belum ada data stok master untuk dikonsolidasikan.</p>
                  </td>
                </tr>
              ) : (
                groupedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6 border-r border-slate-50">
                      <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.nama_produk}</div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-[11px] font-bold text-slate-400 border-r border-slate-50">
                      {item.kategori}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-[11px] font-black text-blue-600 border-r border-slate-50">
                      {item.sub_kategori}
                    </td>
                    <td className="px-6 py-6 border-r border-slate-50">
                      <div className="text-[10px] font-bold text-slate-500 max-w-[140px] leading-relaxed">
                        {item.warna}
                      </div>
                    </td>
                    <td className="px-6 py-6 border-r border-slate-50">
                      <div className="text-[11px] font-black text-indigo-600 tracking-tight">
                        {item.ukuran}
                      </div>
                    </td>
                    <td className="px-10 py-6 border-r border-slate-50">
                      <p className="text-[10px] text-slate-400 line-clamp-2 min-w-[180px] leading-relaxed italic font-medium">
                        {item.deskripsi}
                      </p>
                    </td>
                    <td className="px-6 py-6 border-r border-slate-50">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        {item.jenis_bahan}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center border-r border-slate-50 bg-orange-50/10">
                      <span className={`text-lg font-black tracking-tighter ${item.totalStok <= 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.totalStok.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right font-black text-slate-900 text-sm border-r border-slate-50">
                      Rp {item.harga_jual.toLocaleString('id-ID')}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right font-black text-blue-700 text-sm bg-blue-50/20">
                      {item.hpp_aktual > 0 ? `Rp ${item.hpp_aktual.toLocaleString('id-ID')}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0 px-10">
           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Report Metadata</span>
                <span className="text-xs font-bold text-slate-600">{groupedData.length} Models • {groupedData.reduce((acc, i) => acc + i.totalStok, 0).toLocaleString()} Total Units</span>
              </div>
           </div>
           <button 
             onClick={onClose} 
             className="px-10 py-4 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
           >
             Close Console
           </button>
        </div>
      </div>
    </div>
  );
};

export default StockDetailTableModal;
