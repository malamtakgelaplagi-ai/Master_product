
import React from 'react';

interface HeaderProps {
  isSyncing?: boolean;
  activePage?: 'products' | 'categories' | 'variants' | 'production' | 'stock' | 'sales' | 'reports' | 'settings';
  onPageChange?: (page: 'products' | 'categories' | 'variants' | 'production' | 'stock' | 'sales' | 'reports' | 'settings') => void;
}

const Header: React.FC<HeaderProps> = ({ isSyncing, activePage, onPageChange }) => {
  const menuItems = [
    { id: 'products', label: 'Produk' },
    { id: 'variants', label: 'SKU' },
    { id: 'production', label: 'Produksi' },
    { id: 'stock', label: 'Stok' },
    { id: 'sales', label: 'Kasir' },
    { id: 'reports', label: 'Laporan' },
  ];

  return (
    <header className="glass-header sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-[14px] shadow-lg shadow-indigo-200/50">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">MasterProduk</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">Enterprise Suite</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isSyncing && (
                <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Syncing</span>
                </div>
              )}
              <button 
                onClick={() => onPageChange?.('settings')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activePage === 'settings' 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>
          
          <nav className="flex gap-2 h-12 overflow-x-auto no-scrollbar items-center border-t border-slate-50">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onPageChange?.(item.id as any)}
                className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center px-4 py-2 whitespace-nowrap transition-all rounded-full overflow-hidden max-w-[120px] ${
                  activePage === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
