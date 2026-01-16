
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

  if (isLoading) return <div className="text-center py-20 animate-pulse">Memuat Stok...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            placeholder="Cari SKU / Produk..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            className="flex-1 sm:w-64 px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
          >
            <option value="all">Semua Gudang (Konsolidasi)</option>
            {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.nama_gudang}</option>)}
          </select>
          <button 
            onClick={() => setIsDetailTableOpen(true)}
            className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2a4 4 0 014-4h4m0 0l-4-4m4 4l-4 4" /></svg>
            Detail Stok
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Identity</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Physical Stock</th>
                {selectedWarehouseId === 'all' && <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Breakdown</th>}
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={selectedWarehouseId === 'all' ? 4 : 3} className="px-8 py-20 text-center text-slate-400 italic">No stock data found for these filters.</td>
                </tr>
              ) : (
                filteredData.map(v => {
                  const total = getStockLevel(v.sku, selectedWarehouseId);
                  const isLow = total <= v.stok_min;
                  return (
                    <tr key={v.sku} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-black text-slate-400 font-mono mb-0.5">{v.sku}</div>
                        <div className="text-sm font-black text-slate-900">{products.find(p => p.product_id === v.product_id)?.nama_produk}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{v.warna}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{v.ukuran}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className={`text-2xl font-black tracking-tighter ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{total}</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Threshold: {v.stok_min}</div>
                        {isLow && <div className="text-[8px] font-black text-rose-500 uppercase mt-1">LOW STOCK</div>}
                      </td>
                      {selectedWarehouseId === 'all' && (
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-1.5">
                            {warehouses.map(w => {
                              const s = stocks.find(st => st.sku === v.sku && st.warehouse_id === w.warehouse_id);
                              if (!s || s.stok === 0) return null;
                              return <span key={w.warehouse_id} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-100 px-2 py-1 rounded-lg shadow-sm">{w.nama_gudang}: {s.stok}</span>
                            })}
                          </div>
                        </td>
                      )}
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedSku(v.sku); setIsHistoryOpen(true); }} 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="View History"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>
                          {selectedWarehouseId !== 'all' && (
                            <button 
                              onClick={() => { setSelectedSku(v.sku); setIsAdjustmentOpen(true); }} 
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                            >
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
            const newLog: StockLog = { tanggal: new Date().toISOString(), sku: selectedSku, from_wh: adjustment < 0 ? selectedWarehouseId : '-', to_wh: adjustment > 0 ? selectedWarehouseId : '-', qty: adjustment, jenis: 'ADJUSTMENT', referensi: 'MANUAL', user: 'Admin', alasan: reason };
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
