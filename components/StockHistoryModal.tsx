
import React from 'react';
import { StockLog } from '../types';

interface StockHistoryModalProps {
  sku: string;
  logs: StockLog[];
  onClose: () => void;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  sku,
  logs,
  onClose
}) => {
  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] flex flex-col">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Riwayat Mutasi Stok</h2>
            <p className="text-[10px] font-mono text-slate-500">{sku}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/30">
          {sortedLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 italic text-sm">Belum ada riwayat mutasi untuk SKU ini.</div>
          ) : (
            sortedLogs.map((log, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
                 <div className="flex flex-col items-center gap-1 shrink-0">
                    {/* Fixed: log.perubahan to log.qty */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                      log.qty > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {log.qty > 0 ? `+${log.qty}` : log.qty}
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Mutasi</span>
                 </div>
                 <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-widest ${
                         log.jenis === 'PRODUKSI' ? 'bg-blue-600 text-white' :
                         log.jenis === 'PENJUALAN' ? 'bg-indigo-600 text-white' :
                         // Fixed: log.jenis === 'PENYESUAIAN' to log.jenis === 'ADJUSTMENT'
                         log.jenis === 'ADJUSTMENT' ? 'bg-orange-500 text-white' :
                         'bg-slate-500 text-white'
                       }`}>
                         {log.jenis}
                       </span>
                       <span className="text-[10px] text-slate-400 font-medium">
                         {new Date(log.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">Ref: {log.referensi}</div>
                    {log.alasan && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                         "{log.alasan}"
                      </p>
                    )}
                    <div className="text-[10px] text-slate-400 text-right font-medium">— {log.user}</div>
                 </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 text-center shrink-0">
           <button onClick={onClose} className="text-xs font-black text-blue-600 uppercase tracking-widest py-2 px-6">Tutup Riwayat</button>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryModal;
