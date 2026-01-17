
import React from 'react';
import { Product, ProductStatus } from '../types';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onToggleStatus: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onToggleStatus }) => {
  if (products.length === 0) {
    return (
      <div className="py-40 text-center">
        <div className="bg-[#F5F5F7] w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-300">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">Catalog is Empty</h3>
        <p className="mt-2 text-sm text-slate-400 font-medium max-w-xs mx-auto">No products registered in the database yet. Click the "Add Product" button to start.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-[#FBFBFD] border-b border-[#F2F2F7]">
          <tr>
            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Model Identity</th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attributes</th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pricing</th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Availability</th>
            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F2F2F7]">
          {products.map((product) => (
            <tr key={product.product_id} className="group hover:bg-[#F9F9FB] transition-all">
              <td className="px-8 py-7">
                <div className="flex items-center gap-5">
                  <div className="bg-[#F5F5F7] px-3 py-1.5 rounded-xl text-[#1D1D1F] text-[10px] font-black font-mono border border-[#E8E8ED]">
                    {product.product_id}
                  </div>
                  <div className="max-w-[180px]">
                    <div className="text-base font-bold text-[#1D1D1F] truncate leading-tight group-hover:text-[#0071E3] transition-colors">{product.nama_produk || 'Unnamed Item'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">
                      COGS: Rp {(Number(product.biaya_produksi) || 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-7">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 overflow-hidden max-w-[150px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{product.kategori || 'UNCATEGORIZED'}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {product.ukuran && <span className="text-[9px] bg-white text-slate-600 px-2 py-0.5 rounded-lg font-black uppercase border border-slate-100 shadow-sm">{product.ukuran}</span>}
                        {product.warna && <span className="text-[9px] bg-white text-slate-600 px-2 py-0.5 rounded-lg font-black uppercase border border-slate-100 shadow-sm">{product.warna}</span>}
                    </div>
                </div>
              </td>
              <td className="px-8 py-7">
                <div className="text-base font-black text-[#1D1D1F] tracking-tight">
                  Rp {(Number(product.harga_jual) || 0).toLocaleString('id-ID')}
                </div>
              </td>
              <td className="px-8 py-7">
                <div className={`px-4 py-1.5 inline-flex text-[9px] font-black rounded-full uppercase tracking-[0.15em] border ${
                  product.status === ProductStatus.AKTIF 
                    ? 'bg-[#EBF7F2] text-[#34C759] border-[#D1F0E2]' 
                    : 'bg-[#F5F5F7] text-slate-400 border-[#E8E8ED] line-through'
                }`}>
                  {product.status}
                </div>
              </td>
              <td className="px-8 py-7 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                  <button 
                    onClick={() => onEdit(product)}
                    className="p-3 text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all border border-transparent hover:border-[#E8E8ED]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button 
                    onClick={() => onToggleStatus(product.product_id)}
                    className={`p-3 transition-all rounded-xl border border-transparent hover:border-[#F2F2F7] ${product.status === ProductStatus.AKTIF ? 'text-slate-300 hover:text-[#FF3B30] hover:bg-[#FFF2F0]' : 'text-[#34C759] hover:bg-[#EBF7F2]'}`}
                  >
                    {product.status === ProductStatus.AKTIF ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
