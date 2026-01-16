
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
      <div className="py-32 text-center bg-white rounded-3xl border border-slate-200">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Empty Inventory</h3>
        <p className="mt-2 text-sm text-slate-400 font-medium">Your product catalog is currently empty.<br/>Click 'Tambah Produk' to add your first item.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Identity</th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Retail Price</th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.product_id} className="hover:bg-slate-50/50 transition-all group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 px-2 py-1.5 rounded-lg text-slate-500 text-[10px] font-black font-mono group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {product.product_id}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">{product.nama_produk || 'Untitled Product'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">
                      Base Cost: Rp {(Number(product.biaya_produksi) || 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.kategori || 'UNCATEGORIZED'}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{product.sub_kategori || 'N/A'}</span>
                    </div>
                    <div className="flex gap-1.5">
                        {product.ukuran && <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-black uppercase border border-slate-200">{product.ukuran}</span>}
                        {product.warna && <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-black uppercase border border-slate-200">{product.warna}</span>}
                        {product.jenis_bahan && <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-black uppercase border border-blue-100">{product.jenis_bahan}</span>}
                    </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="text-sm font-black text-slate-900 tracking-tight">
                  Rp {(Number(product.harga_jual) || 0).toLocaleString('id-ID')}
                </div>
              </td>
              <td className="px-8 py-6">
                <span className={`px-3 py-1 inline-flex text-[9px] font-black rounded-full uppercase tracking-widest ${
                  product.status === ProductStatus.AKTIF 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-400 line-through'
                }`}>
                  {product.status || 'inactive'}
                </span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                  <button 
                    onClick={() => onEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Edit Product"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onToggleStatus(product.product_id)}
                    className={`p-2 transition-all rounded-xl ${product.status === ProductStatus.AKTIF ? 'text-slate-300 hover:text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                    title={product.status === ProductStatus.AKTIF ? 'Deactivate' : 'Activate'}
                  >
                    {product.status === ProductStatus.AKTIF ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
