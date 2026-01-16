
import React, { useState, useMemo } from 'react';
import { Product, Variant, Stock, ProductStatus, Category, Warehouse } from '../types';
import VariantFormModal from './VariantFormModal';

interface VariantManagementProps {
  products: Product[];
  categories: Category[];
  variants: Variant[];
  stocks: Stock[];
  warehouses: Warehouse[];
  onSave: (variants: Variant[], stocks: Stock[]) => void;
  isLoading: boolean;
}

const VariantManagement: React.FC<VariantManagementProps> = ({ 
  products, categories, variants, stocks, warehouses,
  onSave, isLoading 
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [skuSearch, setSkuSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getProduct = (productId: string) => products.find(p => p.product_id === productId);

  const filteredVariants = useMemo(() => {
    const query = skuSearch.toLowerCase();
    return variants.filter(v => {
      const product = getProduct(v.product_id);
      const matchProduct = selectedProductId === 'all' || v.product_id === selectedProductId;
      const matchSearch = (v.sku?.toLowerCase() || '').includes(query) || (product?.nama_produk?.toLowerCase() || '').includes(query);
      return matchProduct && matchSearch;
    });
  }, [variants, selectedProductId, skuSearch, products]);

  const toggleVariantStatus = (sku: string) => {
    const updated = variants.map(v => v.sku === sku ? { ...v, status: v.status === ProductStatus.AKTIF ? ProductStatus.NONAKTIF : ProductStatus.AKTIF } : v);
    onSave(updated, stocks);
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20 animate-pulse"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-slate-500 font-medium">Memuat SKU...</p></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter Produk</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-semibold" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}><option value="all">Semua Produk</option>{products.map(p => (<option key={p.product_id} value={p.product_id}>{p.nama_produk}</option>))}</select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cari SKU / Nama</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" placeholder="Ketik kode SKU atau nama produk..." value={skuSearch} onChange={(e) => setSkuSearch(e.target.value)} />
              </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Generate SKU</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr><th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Code</th><th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product & Variation</th><th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Retail</th><th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Reseller</th><th className="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th><th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVariants.length === 0 ? (<tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic">Data tidak ditemukan.</td></tr>) : (
                filteredVariants.map(v => {
                  const product = getProduct(v.product_id);
                  return (
                    <tr key={v.sku} className={`hover:bg-blue-50/50 transition-colors group ${v.status === ProductStatus.NONAKTIF ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="px-2 py-1 bg-slate-100 rounded font-mono text-xs font-bold text-slate-600 border border-slate-200 inline-block">{v.sku}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-slate-900">{product?.nama_produk || 'Produk Terhapus'}</div><div className="flex flex-wrap gap-2 mt-1"><span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{v.warna}</span><span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{v.ukuran}</span></div></td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-slate-900">Rp {Number(v.harga_jual || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-blue-600">Rp {Number(v.harga_reseller || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${v.status === ProductStatus.AKTIF ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>{v.status}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => toggleVariantStatus(v.sku)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeWidth="2" strokeLinecap="round" /></svg>
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
      {isModalOpen && (<VariantFormModal products={products} categories={categories} existingVariants={variants} onClose={() => setIsModalOpen(false)} onSubmit={(newVariants) => { const defaultWhId = warehouses[0]?.warehouse_id || 'WH-01'; const newStocks: Stock[] = newVariants.map(v => ({ sku: v.sku, warehouse_id: defaultWhId, stok: 0 })); onSave([...newVariants, ...variants], [...newStocks, ...stocks]); setIsModalOpen(false); }} />)}
    </div>
  );
};

export default VariantManagement;
