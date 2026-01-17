
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
      const matchSearch = (v.sku?.toLowerCase() || '').includes(query) || 
                          (product?.nama_produk?.toLowerCase() || '').includes(query);
      return matchSearch;
    });
  }, [variants, products, stocks, searchQuery]);

  if (isLoading) return <div className="text-center py-24 animate-pulse"><div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="font-bold text-slate-400">Loading Enterprise Stocks...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search & Warehouse Filter */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            placeholder="Cari SKU, Nama Produk, atau Varian..."
            className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-semibold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select 
              className="w-full md:w-72 pl-5 pr-10 py-4 bg-slate-900 text-white border-none rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-slate-100 transition-all appearance-none cursor-pointer"
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
            >
              <option value="all">🌐 Semua Gudang (Konsolidasi)</option>
              {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>🏠 {w.nama_gudang}</option>)}
            </select>
            <div className="absolute right-4 inset-y-0 flex items-center pointer-events-none text-white/50">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <button 
            onClick={() => setIsDetailTableOpen(true)}
            className="p-4 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            title="Tabel Detail Master"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>

      {/* Info Message for All Warehouses View */}
      {selectedWarehouseId === 'all' && (
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
           <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
           <div>
              <p className="text-sm font-black text-blue-900 uppercase tracking-tight">Mode Konsolidasi Aktif</p>
              <p className="text-xs text-blue-700 font-medium">Pilih salah satu <b>Gudang Spesifik</b> di dropdown atas untuk mengaktifkan tombol <b>"ADJUST"</b> dan menginput stok produk jadi.</p>
           </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Identity</th>
                <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Physical Balance</th>
                {selectedWarehouseId === 'all' && <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Warehouse Distribution</th>}
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={selectedWarehouseId === 'all' ? 4 : 3} className="px-10 py-32 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <p className="text-slate-400 font-bold text-sm tracking-tight">Tidak ada data stok ditemukan untuk kriteria ini.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map(v => {
                  const total = getStockLevel(v.sku, selectedWarehouseId);
                  const isLow = total <= v.stok_min;
                  return (
                    <tr key={v.sku} className="group hover:bg-slate-50/30 transition-all">
                      <td className="px-10 py-8">
                        <div className="text-[10px] font-black text-slate-400 font-mono mb-1 tracking-widest">{v.sku}</div>
                        <div className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">{products.find(p => p.product_id === v.product_id)?.nama_produk}</div>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{v.warna}</span>
                          <span className="text-[9px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{v.ukuran}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className={`text-4xl font-black tracking-tighter leading-none ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{total}</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Threshold: {v.stok_min}</div>
                        {isLow && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                             <span className="text-[9px] font-black uppercase tracking-widest">Restock Needed</span>
                          </div>
                        )}
                      </td>
                      {selectedWarehouseId === 'all' && (
                        <td className="px-10 py-8">
                          <div className="flex flex-wrap gap-2">
                            {warehouses.map(w => {
                              const s = stocks.find(st => st.sku === v.sku && st.warehouse_id === w.warehouse_id);
                              if (!s || s.stok === 0) return null;
                              return (
                                <div key={w.warehouse_id} className="flex flex-col bg-white border border-slate-100 px-3 py-2 rounded-2xl shadow-sm min-w-[100px]">
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{w.nama_gudang}</span>
                                   <span className="text-sm font-black text-slate-900">{s.stok} <span className="text-[10px] font-normal text-slate-400">Pcs</span></span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      )}
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <button 
                            onClick={() => { setSelectedSku(v.sku); setIsHistoryOpen(true); }} 
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                            title="Lihat Kartu Stok"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>
                          {selectedWarehouseId !== 'all' && (
                            <button 
                              onClick={() => { setSelectedSku(v.sku); setIsAdjustmentOpen(true); }} 
                              className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
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
