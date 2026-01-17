
import React, { useState } from 'react';
import { spreadsheetService } from '../services/spreadsheetService';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onSwitchToSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');

    try {
      const res = await spreadsheetService.login(email, password);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setError(res.message || 'Login gagal.');
      }
    } catch (err) {
      setError('Gagal terhubung ke database keamanan. Periksa koneksi internet atau validitas URL di kode.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD] p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-50"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl shadow-blue-500/5 border border-white">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-[#0071E3] p-4 rounded-2xl shadow-xl shadow-blue-500/20 mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-[#1D1D1F] tracking-tighter text-center">Suite Terminal</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">Enterprise Data Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[12px] font-bold border border-rose-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="flex-1">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-50 transition-all outline-none" 
                placeholder="email@kantor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-blue-50 transition-all outline-none" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-[#0071E3] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-[#0077ED] transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Masuk Sekarang'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <button 
              onClick={onSwitchToSignUp}
              className="text-sm font-black text-slate-400 hover:text-[#0071E3] uppercase tracking-widest transition-colors"
            >
              Ajukan Akun Tim Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
