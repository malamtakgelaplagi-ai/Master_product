
import React, { useState, useMemo } from 'react';
import { Variant, Stock, Product, StockLog, Warehouse } from '../types';
import StockAdjustmentModal from './StockAdjustmentModal';
import StockHistoryModal from './StockHistoryModal';
import StockDetailTableModal from './StockDetailTableModal';

interface StockManagementProps {
  variants: Variant[];
  stocks: Stock[];
  products: Product[];
  stockLogs: StockLog[];
  warehouses: Warehouse[];
  isLoading: boolean;
  onSaveAdjustment: (updatedStocks: Stock[], newLogs: StockLog[]) => void;
}

const StockManagement: React.FC<StockManagementProps> = ({
  variants,
  stocks,
  products,
  stockLogs,
  warehouses,
  isLoading,
  onSaveAdjustment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('all');
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDetailTableOpen, setIsDetailTableOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const getStockLevel = (sku: string, whId: string) => {
    if (whId === 'all') {
      return stocks.filter(s => s.sku === sku).reduce((acc, s) => acc + s.stok, 0);
    }
    return stocks.find(s => s.sku === sku && s.warehouse_id === whId)?.stok || 0;
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return variants.filter(v => {
      const product = products.find(p => p.product_id === v.product_id);
      return (v.sku?.toLowerCase() || '').includes(query) || 
             (product?.nama_produk?.toLowerCase() || '').includes(query);
    });
  }, [variants, products, searchQuery]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
      <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Stock Data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Aesthetic Guide Banner */}
      {showGuide && (
        <div className="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-indigo-500/20 p-5 rounded-[32px] border border-indigo-500/30">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black tracking-tight mb-2">Cara Cepat Input Stok Baru</h3>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                Pilih gudang tujuan, cari SKU produk, lalu klik <span className="text-indigo-400 font-bold italic">Adjust</span>. Pilih jenis "+" untuk memasukkan stok awal produk jadi Anda tanpa simulasi produksi.
              </p>
            </div>
            <button onClick={() => setShowGuide(false)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Sembunyikan</button>
          </div>
        </div>
      )}

      {/* Control Center */}
      <div className="premium-card p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 relative w-full">
          <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-slate-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            placeholder="Cari SKU atau Nama Produk..."
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-semibold text-slate-700 transition-all focus:bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="flex-1 md:w-72 px-6 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest outline-none cursor-pointer appearance-none text-center"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
          >
            <option value="all">🌐 Semua Gudang</option>
            {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>🏠 {w.nama_gudang}</option>)}
          </select>
          <button 
            onClick={() => setIsDetailTableOpen(true)}
            className="p-5 bg-white border border-slate-200 text-slate-900 rounded-[24px] hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="premium-card overflow-hidden shadow-xl shadow-slate-200/50">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Identity</th>
              <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Physical Balance</th>
              <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-10 py-32 text-center">
                  <p className="text-slate-400 font-bold italic">Tidak ada data stok yang ditemukan.</p>
                </td>
              </tr>
            ) : (
              filteredData.map(v => {
                const total = getStockLevel(v.sku, selectedWarehouseId);
                const isLow = total <= v.stok_min;
                const product = products.find(p => p.product_id === v.product_id);
                return (
                  <tr key={v.sku} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8">
                      <div className="text-[10px] font-black text-indigo-500 font-mono mb-1">{v.sku}</div>
                      <div className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{product?.nama_produk}</div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg uppercase border border-slate-200">{v.warna}</span>
                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg uppercase border border-slate-200">{v.ukuran}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className={`text-5xl font-black tracking-tighter leading-none ${isLow ? 'text-rose-500' : 'text-slate-900'}`}>{total}</div>
                      <div className="text-[10px] font-black uppercase text-slate-400 mt-3 tracking-widest">Min: {v.stok_min}</div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => { setSelectedSku(v.sku); setIsHistoryOpen(true); }}
                          className="p-4 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-[20px] transition-all"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        {selectedWarehouseId !== 'all' && (
                          <button 
                            onClick={() => { setSelectedSku(v.sku); setIsAdjustmentOpen(true); }}
                            className="px-8 py-4 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Adjust
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isAdjustmentOpen && selectedSku && (
        <StockAdjustmentModal 
          sku={selectedSku}
          currentStock={getStockLevel(selectedSku, selectedWarehouseId)}
          onClose={() => setIsAdjustmentOpen(false)}
          onSave={(adjustment, reason) => {
            const updatedStocks = [...stocks];
            const stockIdx = updatedStocks.findIndex(s => s.sku === selectedSku && s.warehouse_id === selectedWarehouseId);
            if (stockIdx !== -1) {
              updatedStocks[stockIdx] = { ...updatedStocks[stockIdx], stok: updatedStocks[stockIdx].stok + adjustment };
            } else {
              updatedStocks.push({ sku: selectedSku, warehouse_id: selectedWarehouseId, stok: adjustment });
            }
            const newLog: StockLog = { 
              tanggal: new Date().toISOString(), 
              sku: selectedSku, 
              from_wh: adjustment < 0 ? selectedWarehouseId : '-', 
              to_wh: adjustment > 0 ? selectedWarehouseId : '-', 
              qty: adjustment, 
              jenis: 'ADJUSTMENT', 
              referensi: 'MANUAL', 
              user: 'Admin', 
              alasan: reason 
            };
            onSaveAdjustment(updatedStocks, [newLog]);
            setIsAdjustmentOpen(false);
          }}
        />
      )}

      {isHistoryOpen && selectedSku && (
        <StockHistoryModal sku={selectedSku} logs={stockLogs.filter(l => l.sku === selectedSku)} onClose={() => setIsHistoryOpen(false)} />
      )}

      {isDetailTableOpen && (
        <StockDetailTableModal 
          variants={variants}
          products={products}
          stocks={stocks}
          onClose={() => setIsDetailTableOpen(false)}
        />
      )}
    </div>
  );
};

export default StockManagement;
