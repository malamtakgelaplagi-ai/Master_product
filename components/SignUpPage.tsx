
import React, { useState } from 'react';
import { spreadsheetService } from '../services/spreadsheetService';
import { UserRole } from '../types';

interface SignUpPageProps {
  onBackToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirm: '',
    role: 'KASIR' as UserRole
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await spreadsheetService.signUp({
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      if (res) {
        setSuccess(true);
      } else {
        setError('Gagal mendaftar. Periksa URL backend.');
      }
    } catch (err) {
      setError('Kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD] p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-black text-[#1D1D1F]">Pendaftaran Berhasil</h2>
          <p className="text-sm text-slate-500 mt-4 leading-relaxed">
            Akun Anda telah dikirim ke Admin. Mohon tunggu proses aktivasi sebelum dapat digunakan untuk login.
          </p>
          <button 
            onClick={onBackToLogin}
            className="mt-10 w-full py-4 bg-[#0071E3] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/10"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD] p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-50"></div>
      
      <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl border border-white">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-black text-[#1D1D1F] tracking-tighter">Daftar Tim Baru</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">Lengkapi data diri untuk bergabung</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-[#0071E3] transition-all" 
                placeholder="Ex: Andi Wijaya"
                value={formData.nama}
                onChange={e => setFormData({...formData, nama: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Perusahaan</label>
              <input 
                type="email" 
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-[#0071E3] transition-all" 
                placeholder="andi@company.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-[#0071E3] transition-all" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Konfirmasi</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-[#0071E3] transition-all" 
                  placeholder="••••••••"
                  value={formData.confirm}
                  onChange={e => setFormData({...formData, confirm: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Posisi Jabatan (Role)</label>
              <select 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-[#0071E3] transition-all"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="KASIR">KASIR / SALES</option>
                <option value="ADMIN">ADMIN OPERATIONAL</option>
                <option value="STAFF">STAFF GUDANG</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 py-4 bg-[#0071E3] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50"
            >
              {isLoading ? 'Mendaftar...' : 'Ajukan Pendaftaran'}
            </button>
          </form>

          <button 
            onClick={onBackToLogin}
            className="mt-6 w-full text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Sudah punya akun? Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
