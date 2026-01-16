
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
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl shadow-lg shadow-slate-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tighter leading-none">MasterProduk</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Management System</p>
                  {isSyncing && (
                    <span className="flex items-center gap-1 text-[9px] text-blue-600 font-black animate-pulse bg-blue-50 px-1.5 py-0.5 rounded">
                      SYNC ACTIVE
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onPageChange?.('settings')}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  activePage === 'settings' 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>
          
          <nav className="flex gap-1 h-12 overflow-x-auto no-scrollbar items-center">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onPageChange?.(item.id as any)}
                className={`text-[11px] font-black uppercase tracking-widest flex items-center px-4 whitespace-nowrap transition-all h-full border-b-2 ${
                  activePage === item.id 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
