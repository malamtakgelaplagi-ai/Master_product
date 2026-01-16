
import React, { useState, useEffect, useMemo } from 'react';
import { ProductionBatch, ProductionItem, Variant, ProductionStatus, Product, Stock, BatchCost, Warehouse, BOM, Material } from '../types';

interface ProductionDetailModalProps {
  isOpen: boolean;
  batch: ProductionBatch;
  items: ProductionItem[];
  costs: BatchCost[];
  variants: Variant[];
  products: Product[];
  stocks: Stock[];
  warehouses: Warehouse[];
  onClose: () => void;
  onUpdateBatch: (
    batchId: string, 
    batchFields: Partial<ProductionBatch>, 
    itemFields?: ProductionItem[],
    costFields?: BatchCost[],
    updatedStocks?: Stock[]
  ) => void;
}

const ProductionDetailModal: React.FC<ProductionDetailModalProps> = ({
  isOpen,
  batch,
  items,
  costs,
  variants,
  products,
  stocks,
  warehouses,
  onClose,
  onUpdateBatch
}) => {
  const [currentResults, setCurrentResults] = useState<ProductionItem[]>([]);
  const [currentStatus, setCurrentStatus] = useState<ProductionStatus>(batch.status);
  const [destWarehouseId, setDestWarehouseId] = useState(batch.dest_warehouse_id || warehouses[0]?.warehouse_id || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentResults([...items]);
      setCurrentStatus(batch.status);
      setError('');
    }
  }, [isOpen, items, batch]);

  // HPP calculation logic stays for stock updates, even if hidden from UI
  const totalActualCost = useMemo(() => costs.reduce((acc, c) => acc + (Number(c.biaya) || 0), 0), [costs]);
  const totalQtyHasil = useMemo(() => currentResults.reduce((acc, i) => acc + (Number(i.qty_hasil) || 0), 0), [currentResults]);
  const hppAktual = useMemo(() => totalQtyHasil > 0 ? totalActualCost / totalQtyHasil : 0, [totalActualCost, totalQtyHasil]);

  const handleUpdateItem = (sku: string, field: 'qty_hasil' | 'qty_rusak', value: number) => {
    if (batch.status === ProductionStatus.FIN) return;
    setCurrentResults(prev => prev.map(item => item.sku === sku ? { ...item, [field]: Math.max(0, value) } : item));
  };

  const handleFinalize = () => {
    if (totalQtyHasil === 0) {
       setError('Hasil produksi tidak boleh 0 untuk finalize.');
       return;
    }
    if (!destWarehouseId) {
       setError('Pilih gudang tujuan stok.');
       return;
    }

    const updatedStocks = [...stocks];
    currentResults.forEach(item => {
      const stockIdx = updatedStocks.findIndex(s => s.sku === item.sku && s.warehouse_id === destWarehouseId);
      if (stockIdx !== -1) {
        updatedStocks[stockIdx] = { 
          ...updatedStocks[stockIdx], 
          stok: updatedStocks[stockIdx].stok + item.qty_hasil,
          hpp_aktual: hppAktual 
        };
      } else {
        updatedStocks.push({ sku: item.sku, warehouse_id: destWarehouseId, stok: item.qty_hasil, hpp_aktual: hppAktual });
      }
    });

    onUpdateBatch(batch.batch_id, { status: ProductionStatus.FIN, dest_warehouse_id: destWarehouseId }, currentResults, costs, updatedStocks);
  };

  const handleSaveDraft = () => {
    onUpdateBatch(batch.batch_id, { status: currentStatus }, currentResults, costs);
    onClose();
  };

  const statusOptions = [
    { value: ProductionStatus.DIR, label: 'DIR' },
    { value: ProductionStatus.POL, label: 'POL' },
    { value: ProductionStatus.CUT, label: 'CUT' },
    { value: ProductionStatus.JHT, label: 'JHT' },
    { value: ProductionStatus.PRO, label: 'PRO' },
    { value: ProductionStatus.PAC, label: 'PAC' },
    { value: ProductionStatus.FIN, label: 'FIN' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col border border-slate-200">
        
        {/* Header Section */}
        <div className="p-6 bg-slate-900 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black bg-blue-500 px-2 py-0.5 rounded tracking-widest uppercase">{batch.batch_id}</span>
              <h2 className="text-xl font-bold mt-1">{batch.catatan || 'Laporan Hasil Produksi'}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">✕</button>
          </div>
          
          <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Update Status Produksi</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  disabled={batch.status === ProductionStatus.FIN}
                  onClick={() => setCurrentStatus(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                    currentStatus === opt.value 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20' 
                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {opt.value}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section - Progress Qty Only */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {error && <div className="bg-red-50 p-3 text-xs text-red-700 font-bold border-l-4 border-red-500 rounded-lg">{error}</div>}

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Pelaporan Hasil SKU</h4>
             {currentResults.map(item => (
               <div key={item.sku} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.sku}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Rencana: {item.qty_rencana} Pcs</div>
                    </div>
                    {item.qty_hasil > 0 && (
                      <div className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-black">
                        {Math.round((item.qty_hasil / item.qty_rencana) * 100)}% Efisiensi
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Hasil OK (Pcs)</label>
                    <input 
                      type="number" 
                      disabled={batch.status === ProductionStatus.FIN}
                      className="w-full h-11 px-3 bg-green-50 border border-green-100 rounded-xl font-black text-center text-green-700 focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                      placeholder="0"
                      value={item.qty_hasil || ''} 
                      onChange={(e) => handleUpdateItem(item.sku, 'qty_hasil', parseInt(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Rusak (Pcs)</label>
                    <input 
                      type="number" 
                      disabled={batch.status === ProductionStatus.FIN}
                      className="w-full h-11 px-3 bg-red-50 border border-red-100 rounded-xl font-black text-center text-red-700 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                      placeholder="0"
                      value={item.qty_rusak || ''} 
                      onChange={(e) => handleUpdateItem(item.sku, 'qty_rusak', parseInt(e.target.value) || 0)} 
                    />
                  </div>
               </div>
             ))}
          </div>

          {/* Warehouse selector moved here from summary tab */}
          {batch.status !== ProductionStatus.FIN && (
            <div className="pt-6 border-t border-slate-200">
              <div className="bg-blue-600/5 p-5 rounded-3xl border border-blue-600/10 space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Gudang Tujuan Penerimaan</label>
                </div>
                <select 
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm" 
                  value={destWarehouseId} 
                  onChange={(e) => setDestWarehouseId(e.target.value)}
                >
                  <option value="">-- Pilih Gudang Tujuan --</option>
                  {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.nama_gudang}</option>)}
                </select>
                <p className="text-[9px] text-slate-400 font-medium px-1 italic">* Stok akan otomatis ditambahkan ke gudang ini setelah status FINALIZE.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="p-6 bg-white border-t flex items-center justify-between shrink-0">
           {batch.status === ProductionStatus.FIN ? (
             <div className="flex items-center gap-3 text-emerald-600 font-black text-[11px] uppercase tracking-widest px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 w-full justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
               Laporan Selesai & Stok Terupdate
             </div>
           ) : (
             <div className="flex gap-3 w-full justify-end">
                <button onClick={onClose} className="px-6 py-2 text-xs font-black text-slate-400 uppercase hover:text-slate-600 transition-colors">Batal</button>
                <button 
                  onClick={handleSaveDraft} 
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Simpan Draft
                </button>
                {currentStatus === ProductionStatus.FIN && (
                  <button 
                    onClick={handleFinalize} 
                    className="px-10 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span>Finalize Ke Stok</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </button>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDetailModal;
