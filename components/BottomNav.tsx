
import React from 'react';
import { UserRole } from '../types';

interface BottomNavProps {
  activePage: string;
  onPageChange: (page: any) => void;
  // Added userRole prop to fix Type error in App.tsx
  userRole: UserRole;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, onPageChange, userRole }) => {
  const items = [
    { id: 'products', label: 'Produk', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', roles: ['SUPER_ADMIN', 'ADMIN', 'KASIR', 'STAFF'] },
    { id: 'stock', label: 'Gudang', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4', roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
    { id: 'production', label: 'Produksi', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'sales', label: 'Kasir', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', roles: ['SUPER_ADMIN', 'KASIR'] },
    { id: 'reports', label: 'Laporan', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['SUPER_ADMIN'] },
    { id: 'settings', label: 'Set', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: ['SUPER_ADMIN'] },
  ];

  // Added role-based filtering for bottom navigation items to stay consistent with Sidebar
  const filteredItems = items.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-[#F2F2F7] flex items-center justify-around px-2 pb-2 z-50">
      {filteredItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onPageChange(item.id)}
          className={`flex flex-col items-center gap-1.5 transition-all px-4 py-2 rounded-2xl ${
            activePage === item.id ? 'text-[#0071E3] bg-[#F0F7FF]' : 'text-slate-400'
          }`}
        >
          <svg className={`w-5 h-5 ${activePage === item.id ? 'text-[#0071E3]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} />
          </svg>
          <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
