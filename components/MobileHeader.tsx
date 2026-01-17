
import React from 'react';

interface MobileHeaderProps {
  userName?: string;
  onLogout?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ userName, onLogout }) => {
  return (
    <header className="flex md:hidden items-center justify-between px-6 h-16 bg-white border-b border-[#F2F2F7] sticky top-0 z-50 glass-header">
      <div className="flex items-center gap-3">
        <div className="bg-[#0071E3] p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        </div>
        <h1 className="text-sm font-black text-[#1D1D1F] uppercase tracking-[0.2em]">SUITE</h1>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Out
        </button>
        <div className="w-8 h-8 rounded-full bg-[#F5F5F7] border border-[#F2F2F7] overflow-hidden">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'User'}`} alt="Profile" />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
