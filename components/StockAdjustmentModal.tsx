
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
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adjValue = parseInt(value);
    if (isNaN(adjValue) || adjValue <= 0) {
      setError('Masukkan angka yang valid.');
      return;
    }
    if (!reason.trim()) {
      setError('Alasan penyesuaian wajib diisi.');
      return;
    }

    const finalAdjustment = type === 'plus' ? adjValue : -adjValue;
    if (currentStock + finalAdjustment < 0) {
      setError('Stok akhir tidak boleh negatif.');
      return;
    }

    onSave(finalAdjustment, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Penyesuaian Stok</h2>
            <p className="text-[10px] font-mono text-slate-400">{sku}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           {error && (
             <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100">{error}</div>
           )}

           <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setType('plus')}
                className={`flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all ${type === 'plus' ? 'bg-green-50 border-green-500 text-green-700' : 'border-slate-100 text-slate-400'}`}
              >+ TAMBAH</button>
              <button 
                type="button" 
                onClick={() => setType('minus')}
                className={`flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all ${type === 'minus' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-100 text-slate-400'}`}
              >- KURANG</button>
           </div>

           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Perubahan</label>
              <input 
                type="number" 
                className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black text-center outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
           </div>

           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alasan Perubahan</label>
              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Contoh: Barang rusak saat display, selisih stok fisik opname..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
           </div>

           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-600 font-medium">Stok Saat Ini:</span>
                <span className="font-black text-blue-900">{currentStock}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-blue-700 font-bold">Estimasi Stok Akhir:</span>
                <span className="font-black text-blue-900 text-lg">
                  {currentStock + (parseInt(value) || 0) * (type === 'plus' ? 1 : -1)}
                </span>
              </div>
           </div>

           <button 
             type="submit"
             className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all active:scale-95"
           >
             SIMPAN PERUBAHAN STOK
           </button>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
