
import React, { useState } from 'react';
import { ProductionBatch, ProductionItem, Variant, Stock, ProductionStatus, Product, BatchCost, Warehouse, MaterialStock, BOM, Material } from '../types';
import ProductionFormModal from './ProductionFormModal';
import ProductionDetailModal from './ProductionDetailModal';
import ProductionViewModal from './ProductionViewModal';

interface ProductionManagementProps {
  batches: ProductionBatch[];
  items: ProductionItem[];
  variants: Variant[];
  stocks: Stock[];
  products: Product[];
  batchCosts: BatchCost[];
  warehouses: Warehouse[];
  materials: Material[];
  materialStocks: MaterialStock[];
  bomProducts: BOM[];
  isLoading: boolean;
  onSaveBatch: (batches: ProductionBatch[], items: ProductionItem[], costs: BatchCost[], updatedStocks?: Stock[]) => Promise<void>;
  onSaveBOM: (updated: BOM[]) => void;
}

const ProductionManagement: React.FC<ProductionManagementProps> = ({
  batches, items, variants, stocks, products, batchCosts, warehouses, materials, materialStocks, bomProducts, isLoading, onSaveBatch, onSaveBOM
}) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);

  const getBatchSummary = (batchId: string) => {
    const batchItems = items.filter(i => i.batch_id === batchId);
    
    const productNames = Array.from(new Set(batchItems.map(item => {
      const v = variants.find(vr => vr.sku === item.sku);
      return products.find(p => p.product_id === v?.product_id)?.nama_produk || item.sku;
    }))).join(', ');

    const totalQtyHasil = batchItems.reduce((acc, i) => acc + (Number(i.qty_hasil) || 0), 0);
    const totalQtyRencana = batchItems.reduce((acc, i) => acc + (Number(i.qty_rencana) || 0), 0);
    
    const totalMaterialCost = batchItems.reduce((acc, item) => {
      const skuBoms = bomProducts.filter(b => b.sku === item.sku);
      const materialCostPerPc = skuBoms.reduce((sum, b) => {
        const mat = materials.find(m => m.material_id === b.material_id);
        return sum + (Number(b.qty_per_pcs) * (mat?.harga_rata2 || 0));
      }, 0);
      
      const multiplier = item.qty_hasil > 0 ? item.qty_hasil : item.qty_rencana;
      return acc + (materialCostPerPc * multiplier);
    }, 0);

    const totalOverhead = batchCosts
      .filter(c => c.batch_id === batchId)
      .reduce((acc, c) => acc + (Number(c.biaya) || 0), 0);

    const divisor = totalQtyHasil > 0 ? totalQtyHasil : totalQtyRencana;
    const hppAktual = divisor > 0 ? (totalMaterialCost + totalOverhead) / divisor : 0;

    return {
      productNames,
      skuCount: batchItems.length,
      totalQtyRencana,
      totalQtyHasil,
      hppAktual
    };
  };

  const handleUpdateBatchData = async (batchId: string, updatedBatchFields: Partial<ProductionBatch>, updatedItemsFields?: ProductionItem[], updatedCosts?: BatchCost[], updatedStocks?: Stock[]) => {
    const updatedBatches = batches.map(b => b.batch_id === batchId ? { ...b, ...updatedBatchFields } : b);
    let finalItems = items;
    if (updatedItemsFields) {
      finalItems = items.map(i => {
        const updated = updatedItemsFields.find(ui => ui.sku === i.sku && ui.batch_id === batchId);
        return updated ? updated : i;
      });
    }
    let finalCosts = batchCosts;
    if (updatedCosts) {
       finalCosts = [...batchCosts.filter(c => c.batch_id !== batchId), ...updatedCosts];
    }
    await onSaveBatch(updatedBatches, finalItems, finalCosts, updatedStocks);
    setIsDetailModalOpen(false);
  };

  const getStatusColor = (status: ProductionStatus) => {
    switch(status) {
      case ProductionStatus.DIR: return 'bg-slate-100 text-slate-600';
      case ProductionStatus.POL: return 'bg-amber-100 text-amber-700';
      case ProductionStatus.CUT: return 'bg-orange-100 text-orange-700';
      case ProductionStatus.JHT: return 'bg-indigo-100 text-indigo-700';
      case ProductionStatus.PRO: return 'bg-blue-100 text-blue-700';
      case ProductionStatus.PAC: return 'bg-purple-100 text-purple-700';
      case ProductionStatus.FIN: return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20 animate-pulse"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-slate-500 font-medium">Memuat Data Produksi...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Alur Produksi & HPP Aktual</h2>
          <p className="text-sm text-slate-500">Monitor progres batch dan hitung biaya realitas produksi.</p>
        </div>
        <button onClick={() => setIsFormModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Buat Batch Baru</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch ID</th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk</th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Output</th>
                <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">HPP Aktual</th>
                <th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic">Belum ada batch produksi.</td></tr>
              ) : (
                batches.map(batch => {
                  const summary = getBatchSummary(batch.batch_id);
                  return (
                    <tr key={batch.batch_id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{batch.batch_id}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">{batch.catatan}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-700 line-clamp-1">{summary.productNames}</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase">{summary.skuCount} SKUs</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-black text-slate-900">{summary.totalQtyHasil} <span className="text-slate-400 font-normal">/ {summary.totalQtyRencana}</span></div>
                        <div className="w-20 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, (summary.totalQtyHasil / summary.totalQtyRencana) * 100)}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="text-sm font-black text-blue-600">Rp {Math.round(summary.hppAktual).toLocaleString()}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Estimated / Pc</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase ${getStatusColor(batch.status)}`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedBatch(batch); setIsViewModalOpen(true); }} 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Lihat Detail"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </button>
                          <button 
                            onClick={() => { setSelectedBatch(batch); setIsDetailModalOpen(true); }} 
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors font-bold text-[10px] flex items-center gap-1 uppercase tracking-widest"
                          >
                            Console <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isFormModalOpen && (
        <ProductionFormModal 
          isOpen={isFormModalOpen} 
          variants={variants} 
          products={products} 
          materials={materials}
          materialStocks={materialStocks} 
          bomProducts={bomProducts} 
          onClose={() => setIsFormModalOpen(false)} 
          onSubmit={async (newBatch, newItems, newCosts) => {
            const updatedBatches = [newBatch, ...batches];
            const updatedItems = [...newItems, ...items];
            const updatedCosts = [...newCosts, ...batchCosts];
            // Tunggu hingga sinkronisasi berhasil sebelum menutup modal
            await onSaveBatch(updatedBatches, updatedItems, updatedCosts);
            setIsFormModalOpen(false);
          }} 
          onSaveBOM={onSaveBOM}
          lastBatchId={batches.length > 0 ? batches[0].batch_id : 'PRD-000'} 
        />
      )}
      
      {isDetailModalOpen && selectedBatch && (
        <ProductionDetailModal 
          isOpen={isDetailModalOpen} 
          batch={selectedBatch} 
          items={items.filter(i => i.batch_id === selectedBatch.batch_id)} 
          costs={batchCosts.filter(c => c.batch_id === selectedBatch.batch_id)} 
          variants={variants} 
          stocks={stocks} 
          products={products} 
          warehouses={warehouses} 
          onClose={() => setIsDetailModalOpen(false)} 
          onUpdateBatch={handleUpdateBatchData} 
        />
      )}

      {isViewModalOpen && selectedBatch && (
        <ProductionViewModal
          isOpen={isViewModalOpen}
          batch={selectedBatch}
          items={items.filter(i => i.batch_id === selectedBatch.batch_id)}
          bomProducts={bomProducts}
          materials={materials}
          batchCosts={batchCosts.filter(c => c.batch_id === selectedBatch.batch_id)}
          products={products}
          variants={variants}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductionManagement;
