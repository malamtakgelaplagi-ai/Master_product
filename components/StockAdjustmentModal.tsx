
import React, { useState } from 'react';

interface StockAdjustmentModalProps {
  sku: string;
  currentStock: number;
  onClose: () => void;
  onSave: (adjustment: number, reason: string) => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  sku,
  currentStock,
  onClose,
  onSave
}) => {
  const [type, setType] = useState<'plus' | 'minus'>('plus');
  const [value, setValue] = useState<string>('');
  const [reason, setReason] = useState('Stok Awal');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adjValue = parseInt(value);
    if (isNaN(adjValue) || adjValue <= 0) {
      setError('Masukkan angka stok yang valid.');
      return;
    }
    if (!reason.trim()) {
      setError('Alasan wajib diisi (ex: Stok Awal).');
      return;
    }

    const finalAdjustment = type === 'plus' ? adjValue : -adjValue;
    if (currentStock + finalAdjustment < 0) {
      setError('Stok tidak boleh minus setelah dikurangi.');
      return;
    }

    onSave(finalAdjustment, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Adjust Inventory</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{sku}</span>
              <span className="text-slate-400 font-bold text-xs">Current: {currentStock} Pcs</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
           {error && (
             <div className="p-5 bg-rose-50 text-rose-600 text-xs font-black rounded-3xl border border-rose-100 flex items-center gap-3">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               {error}
             </div>
           )}

           <div className="flex p-2 bg-slate-100 rounded-[32px] gap-2">
              <button 
                type="button" 
                onClick={() => setType('plus')}
                className={`flex-1 py-5 rounded-[28px] font-black text-sm tracking-widest transition-all ${type === 'plus' ? 'bg-white text-emerald-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
              >+ TAMBAH</button>
              <button 
                type="button" 
                onClick={() => setType('minus')}
                className={`flex-1 py-5 rounded-[28px] font-black text-sm tracking-widest transition-all ${type === 'minus' ? 'bg-white text-rose-500 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
              >- KURANG</button>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Kuantitas Adjustment</label>
              <input 
                type="number" 
                className="w-full py-8 bg-slate-50 border-2 border-slate-50 rounded-[32px] text-5xl font-black text-center text-slate-900 outline-none transition-all focus:bg-white focus:border-indigo-600"
                placeholder="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Keterangan / Alasan</label>
              <div className="flex gap-2 mb-3">
                {['Stok Awal', 'Input Produk Jadi', 'Opname'].map(r => (
                  <button 
                    key={r} 
                    type="button" 
                    onClick={() => setReason(r)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${reason === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <textarea 
                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium outline-none focus:bg-white transition-all"
                rows={3}
                placeholder="Ketik alasan lainnya..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
           </div>

           <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[40px] text-white">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Final Inventory State</p>
                <p className="text-4xl font-black tracking-tighter">
                  {currentStock + (parseInt(value) || 0) * (type === 'plus' ? 1 : -1)} <span className="text-xs text-slate-500 font-bold uppercase">Pcs</span>
                </p>
              </div>
              <button 
                type="submit"
                className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Apply Changes
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
