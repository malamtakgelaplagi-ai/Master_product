
import React, { useState } from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  activePage: string;
  activeProductTab?: string;
  onPageChange: (page: any, subTab?: any) => void;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, activeProductTab, onPageChange, userRole }) => {
  const [isProductExpanded, setIsProductExpanded] = useState(activePage === 'products');

  const menuItems = [
    { 
      id: 'products', 
      label: 'Produk', 
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      hasSub: true,
      subItems: [
        { id: 'katalog', label: 'Katalog Produk', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { id: 'bahan', label: 'Master Bahan', roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
        { id: 'kategori', label: 'Kategori', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { id: 'gudang', label: 'Gudang', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { id: 'pelanggan', label: 'Pelanggan', roles: ['SUPER_ADMIN', 'KASIR'] },
      ]
    },
    { id: 'variants', label: 'SKU Inventory', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'production', label: 'Produksi', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'stock', label: 'Gudang Stok', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4', roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
    { id: 'sales', label: 'Point of Sale', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', roles: ['SUPER_ADMIN', 'KASIR'] },
    { id: 'reports', label: 'Laporan', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['SUPER_ADMIN'] },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', roles: ['SUPER_ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <aside className="w-[280px] h-full bg-white border-r border-[#F2F2F7] flex flex-col shrink-0">
      <div className="p-8 flex items-center gap-4">
        <div className="bg-[#0071E3] p-2.5 rounded-2xl shadow-lg shadow-blue-500/10">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-[#1D1D1F] tracking-tighter leading-none">SUITE</h1>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise MDM</span>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-1.5 overflow-y-auto no-scrollbar pb-8">
        {filteredItems.map((item) => (
          <div key={item.id} className="space-y-1">
            <button
              onClick={() => {
                if (item.hasSub) {
                  setIsProductExpanded(!isProductExpanded);
                  if (activePage !== item.id) {
                    onPageChange(item.id, 'katalog');
                  }
                } else {
                  onPageChange(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[13px] font-bold tracking-tight transition-all group ${
                activePage === item.id ? 'sidebar-item-active' : 'text-slate-500 hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <svg className={`w-5 h-5 transition-colors ${activePage === item.id ? 'text-[#0071E3]' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span className="truncate">{item.label}</span>
              </div>
              {item.hasSub && (
                <svg className={`w-4 h-4 transition-transform duration-300 ${isProductExpanded ? 'rotate-180 text-[#0071E3]' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {item.hasSub && isProductExpanded && (
              <div className="pl-12 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
                {item.subItems?.filter(sub => sub.roles.includes(userRole)).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onPageChange(item.id, sub.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[12px] font-bold tracking-tight transition-all ${
                      activePage === 'products' && activeProductTab === sub.id
                        ? 'text-[#0071E3] bg-blue-50'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-[#F2F2F7]">
        <div className="bg-slate-50 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Active</p>
          <p className="text-[11px] font-bold text-[#1D1D1F]">{userRole.replace('_', ' ')}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
