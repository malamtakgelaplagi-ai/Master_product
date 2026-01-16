
import React, { useState, useEffect } from 'react';
import { spreadsheetService } from '../services/spreadsheetService';
import { Warehouse, Customer, Stock, Category, Material, MaterialStock, MaterialStockLog } from '../types';
import WarehouseManagement from './WarehouseManagement';
import CustomerManagement from './CustomerManagement';
import CategoryManagement from './CategoryManagement';
import MaterialManagement from './MaterialManagement';

interface SettingsPageProps {
  warehouses: Warehouse[];
  customers: Customer[];
  categories: Category[];
  materials: Material[];
  materialStocks: MaterialStock[];
  materialLogs: MaterialStockLog[];
  stocks: Stock[];
  isLoading: boolean;
  onRefreshData?: () => Promise<void>;
  onSaveWarehouses: (updated: Warehouse[]) => Promise<void>;
  onSaveCustomers: (updated: Customer[]) => Promise<void>;
  onSaveCategories: (updated: Category[]) => Promise<void>;
  onSaveMaterials: (updated: Material[], updatedStocks: MaterialStock[], newLogs: MaterialStockLog[]) => Promise<void>;
}

type SettingsTab = 'backend' | 'categories' | 'materials' | 'warehouses' | 'customers';

const SettingsPage: React.FC<SettingsPageProps> = ({
  warehouses,
  customers,
  categories,
  materials,
  materialStocks,
  materialLogs,
  stocks,
  isLoading,
  onRefreshData,
  onSaveWarehouses,
  onSaveCustomers,
  onSaveCategories,
  onSaveMaterials
}) => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<SettingsTab>('backend');

  const requiredSheets = [
    'products', 'categories', 'variants', 'stocks', 
    'stock_logs', 'sales', 'sales_items', 'payment_logs',
    'production_batches', 'production_items', 'product_costs', 
    'batch_costs', 'warehouses', 'customers',
    'materials', 'material_stock', 'material_stock_logs', 'bom_products'
  ];

  useEffect(() => {
    const savedUrl = localStorage.getItem('BACKEND_URL');
    if (savedUrl) setUrl(savedUrl);
  }, []);

  const handleSaveBackend = () => {
    if (!url.startsWith('https://script.google.com')) {
      setStatus('error');
      setMessage('URL harus dimulai dengan https://script.google.com');
      return;
    }
    localStorage.setItem('BACKEND_URL', url);
    setStatus('success');
    setMessage('URL Backend berhasil disimpan.');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleTest = async () => {
    if (!url) {
      setStatus('error');
      setMessage('Masukkan URL terlebih dahulu.');
      return;
    }

    setStatus('testing');
    setMessage('Menghubungkan & Sinkronisasi...');
    localStorage.setItem('BACKEND_URL', url);

    const isOk = await spreadsheetService.testConnection(url);
    if (isOk) {
      if (onRefreshData) await onRefreshData();
      setStatus('success');
      setMessage('Koneksi Berhasil! Data telah disinkronkan.');
    } else {
      setStatus('error');
      setMessage('Koneksi gagal. Periksa Apps Script Web App Anda.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-1.5 bg-slate-50 border-b border-slate-200 flex overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('backend')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'backend' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Backend & Sync</button>
          <button onClick={() => setActiveTab('materials')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'materials' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Master Bahan</button>
          <button onClick={() => setActiveTab('categories')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'categories' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Kategori Produk</button>
          <button onClick={() => setActiveTab('warehouses')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'warehouses' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Master Gudang</button>
          <button onClick={() => setActiveTab('customers')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'customers' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>Master Customer</button>
        </div>

        <div className="p-8">
          {activeTab === 'backend' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
              <section>
                <h3 className="text-lg font-black text-slate-900 mb-2">Konfigurasi Koneksi</h3>
                <p className="text-sm text-slate-500 mb-6">Hubungkan aplikasi ini dengan Google Spreadsheet melalui URL Apps Script.</p>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Web App URL (Apps Script)</label>
                  <input type="text" className="w-full px-6 py-4 border-2 rounded-[24px] text-sm font-mono focus:ring-4 focus:ring-blue-100 border-slate-100 transition-all outline-none" placeholder="https://script.google.com/macros/s/.../exec" value={url} onChange={(e) => { setUrl(e.target.value); setStatus('idle'); }} />
                  {message && (
                    <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${status === 'error' ? 'bg-red-500' : (status === 'testing' ? 'bg-amber-500 animate-ping' : 'bg-green-500')}`}></div>
                      {message}
                    </div>
                  )}
                </div>
              </section>
              <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 space-y-4">
                 <div className="flex items-center justify-between"><h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Daftar Sheet Wajib ({requiredSheets.length})</h3></div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{requiredSheets.map(s => (<div key={s} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div><span className="text-[10px] font-mono font-bold text-slate-500">{s}</span></div>))}</div>
              </div>
              <div className="flex gap-4">
                <button onClick={handleTest} disabled={!url || status === 'testing' || isLoading} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-[20px] font-black text-xs uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-slate-200 flex items-center justify-center gap-2">
                  {status === 'testing' || isLoading ? (<><div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>Syncing...</>) : 'Test & Sinkronkan'}
                </button>
                <button onClick={handleSaveBackend} className="flex-[2] py-4 bg-blue-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Simpan Konfigurasi</button>
              </div>
            </div>
          )}

          {activeTab === 'materials' && <MaterialManagement materials={materials} materialStocks={materialStocks} materialLogs={materialLogs} onSave={onSaveMaterials} isLoading={isLoading} />}
          {activeTab === 'categories' && <CategoryManagement categories={categories} onSave={onSaveCategories} isLoading={isLoading} />}
          {activeTab === 'warehouses' && <WarehouseManagement warehouses={warehouses} stocks={stocks} onSave={onSaveWarehouses} isLoading={isLoading} />}
          {activeTab === 'customers' && <CustomerManagement customers={customers} onSave={onSaveCustomers} isLoading={isLoading} />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
