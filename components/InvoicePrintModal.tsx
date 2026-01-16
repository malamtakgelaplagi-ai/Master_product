
import React from 'react';
import { Sale, SaleItem } from '../types';

interface InvoicePrintModalProps {
  isOpen: boolean;
  sale: Sale;
  items: any[]; 
  warehouseName: string;
  onClose: () => void;
}

const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen, sale, items, warehouseName, onClose
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 print:p-0 print:bg-white print:relative print:z-0">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] print:shadow-none print:rounded-none print:max-h-none print:w-full">
        
        {/* Invoice Header (Web Only) */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Settle Success</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 print:overflow-visible print:p-4">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2.5 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">MasterProduk</h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Inventory & POS Solution</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-500 font-medium">
                <p>Gudang Pengirim: <span className="text-slate-900 font-bold">{warehouseName}</span></p>
                <p>Operator Kasir: <span className="text-slate-900 font-bold">{sale.user}</span></p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">INVOICE</h2>
              <p className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">{sale.invoice}</p>
              <div className="mt-2">
                <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${sale.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {sale.status === 'PAID' ? 'LUNAS / PAID' : 'BELUM LUNAS / DP'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-10 border-t border-slate-100 pt-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Customer / Client</p>
              <p className="text-xl font-black text-slate-900">{sale.customer_name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{sale.tipe_harga} TIER</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal & Waktu</p>
              <p className="text-sm font-bold text-slate-900">
                {new Date(sale.tanggal).toLocaleDateString('id-ID', { 
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
              <p className="text-xs font-bold text-slate-500">Pukul {new Date(sale.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
              <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Metode: {sale.metode}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
             <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
               <table className="min-w-full divide-y divide-slate-200">
                 <thead>
                   <tr className="bg-slate-100/50 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">
                     <th className="px-6 py-4">Nama Produk & SKU</th>
                     <th className="px-6 py-4 text-center">Jumlah</th>
                     <th className="px-6 py-4 text-right">Harga Satuan</th>
                     <th className="px-6 py-4 text-right">Subtotal</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white">
                   {items.map((item, idx) => (
                     <tr key={idx} className="text-sm">
                       <td className="px-6 py-5">
                         <div className="font-bold text-slate-900">{item.nama_produk || 'Produk'}</div>
                         <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{item.sku}</div>
                       </td>
                       <td className="px-6 py-5 text-center font-bold text-slate-600">{item.qty} Pcs</td>
                       <td className="px-6 py-5 text-right font-medium text-slate-500">Rp {item.harga.toLocaleString()}</td>
                       <td className="px-6 py-5 text-right font-black text-slate-900">Rp {item.subtotal.toLocaleString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-6">
             <div className="w-full max-w-xs space-y-4">
                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                   <span className="uppercase tracking-widest text-[10px] font-black">Grand Total</span>
                   <span className="font-bold">Rp {sale.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-blue-600 bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100">
                   <span className="uppercase tracking-widest text-[9px]">Jumlah Dibayar</span>
                   <span className="text-lg">Rp {sale.dp.toLocaleString()}</span>
                </div>
                {sale.sisa > 0 && (
                   <div className="flex justify-between items-center text-sm font-black text-rose-600 px-5 py-3 border border-rose-100 rounded-2xl bg-rose-50/30">
                      <span className="uppercase tracking-widest text-[9px]">Sisa Piutang</span>
                      <span>Rp {sale.sisa.toLocaleString()}</span>
                   </div>
                )}
             </div>
          </div>

          {/* Terms / Note */}
          <div className="pt-20 border-t border-slate-100 text-center space-y-3">
             <p className="text-xs font-black text-slate-900 tracking-tight uppercase">✨ Terima kasih telah mempercayai MasterProduk ✨</p>
             <p className="text-[10px] text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">Simpan invoice ini sebagai bukti pembelian resmi. Barang yang sudah dibeli dapat ditukar maksimal 2x24 jam dengan syarat hangtag masih terpasang.</p>
          </div>
        </div>

        {/* Footer Actions (Web Only) */}
        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0 print:hidden">
           <button onClick={onClose} className="px-8 py-3 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Tutup Dialog</button>
           <button 
             onClick={handlePrint}
             className="px-12 py-4 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 flex items-center gap-3 hover:bg-black transition-all active:scale-95"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
             Print Invoice
           </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintModal;
