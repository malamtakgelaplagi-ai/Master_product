
import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductStatus, ProductionStatus, Category, Variant, Stock, StockLog, ProductionBatch, ProductionItem, Sale, SaleItem, ProductCost, BatchCost, PaymentLog, Warehouse, Customer, Material, MaterialStock, MaterialStockLog, BOM, User } from './types';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import BottomNav from './components/BottomNav';
import DashboardStats from './components/DashboardStats';
import ProductList from './components/ProductList';
import ProductFormModal from './components/ProductFormModal';
import VariantManagement from './components/VariantManagement';
import ProductionManagement from './components/ProductionManagement';
import StockManagement from './components/StockManagement';
import SalesManagement from './components/SalesManagement';
import ReportsManagement from './components/ReportsManagement';
import SettingsPage from './components/SettingsPage';
import MaterialManagement from './components/MaterialManagement';
import CategoryManagement from './components/CategoryManagement';
import WarehouseManagement from './components/WarehouseManagement';
import CustomerManagement from './components/CustomerManagement';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import { spreadsheetService } from './services/spreadsheetService';

type Page = 'products' | 'variants' | 'production' | 'stock' | 'sales' | 'reports' | 'settings';
type ProductTab = 'katalog' | 'bahan' | 'kategori' | 'gudang' | 'pelanggan';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  
  const [activePage, setActivePage] = useState<Page>('products');
  const [activeProductTab, setActiveProductTab] = useState<ProductTab>('katalog');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileProductMenuOpen, setIsMobileProductMenuOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesItems, setSalesItems] = useState<SaleItem[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [productCosts, setProductCosts] = useState<ProductCost[]>([]);
  const [batchCosts, setBatchCosts] = useState<BatchCost[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialStocks, setMaterialStocks] = useState<MaterialStock[]>([]);
  const [materialStockLogs, setMaterialStockLogs] = useState<MaterialStockLog[]>([]);
  const [bomProducts, setBomProducts] = useState<BOM[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist session
  useEffect(() => {
    const savedUser = localStorage.getItem('SESSION_USER');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (syncMessage.text) {
      const timer = setTimeout(() => setSyncMessage({ text: '', type: null }), 4000);
      return () => clearTimeout(timer);
    }
  }, [syncMessage]);

  const loadData = async () => {
    if (!currentUser) return;
    const businessUrl = spreadsheetService.getBusinessUrl();
    
    if (!businessUrl) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    try {
      const [businessData, userData] = await Promise.all([
        spreadsheetService.fetchData(),
        spreadsheetService.fetchUsers()
      ]);
      
      setProducts(businessData.products || []);
      setCategories(businessData.categories || []);
      setVariants(businessData.variants || []);
      setStocks(businessData.stocks || []);
      setStockLogs(businessData.stock_logs || []);
      setSales(businessData.sales || []);
      setSalesItems(businessData.sales_items || []);
      setPaymentLogs(businessData.payment_logs || []);
      setProductionBatches(businessData.production_batches || []);
      setProductionItems(businessData.production_items || []);
      setProductCosts(businessData.product_costs || []);
      setBatchCosts(businessData.batch_costs || []);
      setWarehouses(businessData.warehouses || []);
      setCustomers(businessData.customers || []);
      setMaterials(businessData.materials || []);
      setMaterialStocks(businessData.material_stocks || []);
      setMaterialStockLogs(businessData.material_stock_logs || []);
      setBomProducts(businessData.bom_products || []);
      
      setUsers(userData || []);
    } catch (e) {
      console.error("Load failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) loadData();
  }, [activePage, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('SESSION_USER', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('SESSION_USER');
    setActivePage('products');
    setAuthView('login');
  };

  const handlePageChange = (page: Page, subTab?: ProductTab) => {
    if (page === 'products' && !subTab && window.innerWidth < 768) {
        setIsMobileProductMenuOpen(true);
        return;
    }
    setActivePage(page);
    if (subTab) {
      setActiveProductTab(subTab);
    }
  };

  const isAllowed = (page: Page, tab?: ProductTab) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (role === 'SUPER_ADMIN') return true;
    
    if (role === 'KASIR') {
        return page === 'sales' || (page === 'products' && tab === 'pelanggan');
    }
    if (role === 'ADMIN') {
        return page === 'products' || page === 'variants' || page === 'production' || page === 'stock';
    }
    if (role === 'STAFF') {
        return page === 'stock' || (page === 'products' && tab === 'bahan');
    }
    return false;
  };

  const saveProducts = async (updated: Product[]) => {
    setProducts(updated);
    setIsSyncing(true);
    await spreadsheetService.syncProducts(updated);
    setIsSyncing(false);
    setSyncMessage({ text: 'Katalog Berhasil Disinkronkan', type: 'success' });
  };

  const handleAddProduct = (newProductData: Omit<Product, 'product_id' | 'status'>) => {
    const now = new Date();
    const datePart = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const nextId = `P${datePart}-${randomPart}`;
    const newProduct: Product = { ...newProductData, product_id: nextId, status: ProductStatus.AKTIF };
    saveProducts([newProduct, ...products]);
    setIsModalOpen(false);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.product_id === updatedProduct.product_id ? updatedProduct : p);
    saveProducts(updated);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const toggleProductStatus = (id: string) => {
    const updated = products.map(p => {
      if (p.product_id === id) {
        return { ...p, status: p.status === ProductStatus.AKTIF ? ProductStatus.NONAKTIF : ProductStatus.AKTIF };
      }
      return p;
    });
    saveProducts(updated);
  };

  const handleUpdatePayment = async (invoice: string, amount: number, method: string) => {
    const saleIdx = sales.findIndex(s => s.invoice === invoice);
    if (saleIdx === -1) return;

    const sale = sales[saleIdx];
    const newDp = Number(sale.dp) + amount;
    const newSisa = Math.max(0, Number(sale.total) - newDp);
    const newStatus = newSisa <= 0 ? 'PAID' : 'DP';

    const updatedSale = { ...sale, dp: newDp, sisa: newSisa, status: newStatus as any };
    const updatedSales = [...sales];
    updatedSales[saleIdx] = updatedSale;

    const newPaymentLog: PaymentLog = {
      id: 'PAY-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      invoice,
      tanggal: new Date().toISOString(),
      jumlah: amount,
      metode: method,
      user: currentUser?.nama || 'Kasir'
    };

    const updatedPaymentLogs = [newPaymentLog, ...paymentLogs];

    setSales(updatedSales);
    setPaymentLogs(updatedPaymentLogs);

    setIsSyncing(true);
    try {
      await Promise.all([
        spreadsheetService.syncSales(updatedSales),
        spreadsheetService.syncPaymentLogs(updatedPaymentLogs)
      ]);
      setSyncMessage({ text: 'Pelunasan Berhasil Disinkronkan', type: 'success' });
    } catch (e) {
      setSyncMessage({ text: 'Sinkronisasi Gagal', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      (p.nama_produk || '').toLowerCase().includes(query) ||
      (p.kategori || '').toLowerCase().includes(query) ||
      (p.product_id || '').toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Auth Gate
  if (!currentUser) {
    return authView === 'login' ? (
      <LoginPage onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} />
    ) : (
      <SignUpPage onBackToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className="flex h-screen bg-[#FBFBFD] text-[#1D1D1F] overflow-hidden">
      <div className={`hidden md:block transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] h-full ${isSidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden'}`}>
        <Sidebar 
          activePage={activePage} 
          activeProductTab={activeProductTab}
          onPageChange={handlePageChange} 
          userRole={currentUser.role}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <MobileHeader userName={currentUser.nama} onLogout={handleLogout} />

        <header className="hidden md:flex h-20 items-center justify-between px-10 glass-header sticky top-0 z-40 border-b border-[#F2F2F7]">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-[#F5F5F7] rounded-xl hover:bg-[#E8E8ED] transition-all text-[#1D1D1F]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h2 className="text-xl font-extrabold tracking-tight">
              {activePage === 'products' ? `Produk > ${activeProductTab.charAt(0).toUpperCase() + activeProductTab.slice(1)}` : 
               activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h2>
          </div>
          <div className="flex items-center gap-6">
             {isSyncing && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 animate-pulse">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Syncing Data...</span>
                </div>
             )}
             <div className="flex items-center gap-4">
               <div className="text-right border-r border-slate-100 pr-4">
                  <p className="text-sm font-black text-[#1D1D1F]">{currentUser.nama}</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{currentUser.role.replace('_', ' ')}</p>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#F5F5F7] border border-[#F2F2F7] overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.nama}`} alt="Avatar" />
                 </div>
                 <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all active:scale-95"
                 >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                 </button>
               </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 md:px-10 pb-32 md:pb-20 no-scrollbar">
          {activePage === 'products' && (
            <div className="animate-in fade-in duration-700 mt-10">
              <div className="mb-10">
                <DashboardStats products={products} />
              </div>

              <div className="mb-8 p-1.5 bg-[#F5F5F7] rounded-2xl flex w-full overflow-x-auto no-scrollbar gap-1 border border-[#F2F2F7] touch-pan-x">
                {[
                  { id: 'katalog', label: 'Katalog' },
                  { id: 'bahan', label: 'Bahan' },
                  { id: 'kategori', label: 'Kategori' },
                  { id: 'gudang', label: 'Gudang' },
                  { id: 'pelanggan', label: 'Pelanggan' },
                ].filter(t => isAllowed('products', t.id as ProductTab)).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProductTab(tab.id as ProductTab)}
                    className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                      activeProductTab === tab.id ? 'bg-white text-[#0071E3] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeProductTab === 'katalog' && isAllowed('products', 'katalog') && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-[#1D1D1F] tracking-tight">Daftar Produk</h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium">Kelola database produk pusat Anda</p>
                    </div>
                    {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                      <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="px-8 py-3 bg-[#0071E3] text-white rounded-2xl text-[12px] font-bold uppercase tracking-wider shadow-xl shadow-blue-500/10 hover:bg-[#0077ED] transition-all transform active:scale-95">
                        Tambah Produk
                      </button>
                    )}
                  </div>

                  <div className="premium-card overflow-hidden">
                    {isLoading ? (
                      <div className="py-20 flex flex-col items-center">
                        <div className="w-10 h-10 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <ProductList products={filteredProducts} onEdit={(p) => { setEditingProduct(p); setIsModalOpen(true); }} onToggleStatus={toggleProductStatus} />
                    )}
                  </div>
                </>
              )}

              {activeProductTab === 'bahan' && isAllowed('products', 'bahan') && (
                <MaterialManagement 
                  materials={materials} 
                  materialStocks={materialStocks} 
                  materialLogs={materialStockLogs} 
                  onSave={async (m, ms, ml) => { 
                    setMaterials(m); setMaterialStocks(ms); setMaterialStockLogs(ml);
                    setIsSyncing(true);
                    await spreadsheetService.syncMaterials(m);
                    await spreadsheetService.syncMaterialStocks(ms);
                    await spreadsheetService.syncMaterialStockLogs(ml);
                    setIsSyncing(false);
                  }} 
                  isLoading={isLoading} 
                />
              )}

              {activeProductTab === 'kategori' && isAllowed('products', 'kategori') && (
                <CategoryManagement 
                  categories={categories} 
                  onSave={async (c) => { 
                    setCategories(c);
                    setIsSyncing(true);
                    await spreadsheetService.syncCategories(c);
                    setIsSyncing(false);
                  }} 
                  isLoading={isLoading} 
                />
              )}

              {activeProductTab === 'gudang' && isAllowed('products', 'gudang') && (
                <WarehouseManagement 
                  warehouses={warehouses} 
                  stocks={stocks} 
                  onSave={async (w) => { 
                    setWarehouses(w);
                    setIsSyncing(true);
                    await spreadsheetService.syncWarehouses(w);
                    setIsSyncing(false);
                  }} 
                  isLoading={isLoading} 
                />
              )}

              {activeProductTab === 'pelanggan' && isAllowed('products', 'pelanggan') && (
                <CustomerManagement 
                  customers={customers} 
                  onSave={async (c) => { 
                    setCustomers(c);
                    setIsSyncing(true);
                    await spreadsheetService.syncCustomers(c);
                    setIsSyncing(false);
                  }} 
                  isLoading={isLoading} 
                />
              )}
            </div>
          )}

          {activePage === 'variants' && isAllowed('variants') && <div className="mt-10"><VariantManagement products={products} categories={categories} variants={variants} stocks={stocks} warehouses={warehouses} onSave={async (v, s) => { setVariants(v); setStocks(s); setIsSyncing(true); await spreadsheetService.syncVariants(v); await spreadsheetService.syncStocks(s); setIsSyncing(false); }} isLoading={isLoading} /></div>}
          {activePage === 'production' && isAllowed('production') && <div className="mt-10"><ProductionManagement batches={productionBatches} items={productionItems} variants={variants} stocks={stocks} products={products} batchCosts={batchCosts} warehouses={warehouses} materials={materials} materialStocks={materialStocks} bomProducts={bomProducts} isLoading={isLoading} onSaveBatch={async (b, i, c, s) => { setProductionBatches(b); setIsSyncing(true); await spreadsheetService.syncProductionBatches(b); await spreadsheetService.syncProductionItems(i); await spreadsheetService.syncBatchCosts(c); if(s) await spreadsheetService.syncStocks(s); setIsSyncing(false); }} onSaveBOM={async (bom) => { setBomProducts(bom); setIsSyncing(true); await spreadsheetService.syncBOM(bom); setIsSyncing(false); }} /></div>}
          {activePage === 'stock' && isAllowed('stock') && <div className="mt-10"><StockManagement variants={variants} stocks={stocks} products={products} stockLogs={stockLogs} warehouses={warehouses} isLoading={isLoading} onSaveAdjustment={async (s, l) => { setStocks(s); setIsSyncing(true); await spreadsheetService.syncStocks(s); await spreadsheetService.syncStockLogs([...l, ...stockLogs]); setIsSyncing(false); }} /></div>}
          {activePage === 'sales' && isAllowed('sales') && <div className="mt-10"><SalesManagement variants={variants} stocks={stocks} products={products} sales={sales} paymentLogs={paymentLogs} customers={customers} warehouses={warehouses} onSaveSale={async (sl, i, s) => { setSales([sl, ...sales]); setSalesItems([...i, ...salesItems]); setStocks(s); setIsSyncing(true); await spreadsheetService.syncSales([sl, ...sales]); await spreadsheetService.syncSalesItems([...i, ...salesItems]); await spreadsheetService.syncStocks(s); setIsSyncing(false); }} onUpdatePayment={handleUpdatePayment} isLoading={isLoading} /></div>}
          {activePage === 'reports' && isAllowed('reports') && <div className="mt-10"><ReportsManagement sales={sales} salesItems={salesItems} variants={variants} products={products} stocks={stocks} paymentLogs={paymentLogs} isLoading={isLoading} /></div>}
          {activePage === 'settings' && isAllowed('settings') && <div className="mt-10"><SettingsPage isLoading={isLoading} onRefreshData={loadData} users={users} onSyncUsers={async (u) => { setUsers(u); await spreadsheetService.syncUsers(u); }} isSuperAdmin={currentUser.role === 'SUPER_ADMIN'} /></div>}
        </main>

        <BottomNav activePage={activePage} onPageChange={handlePageChange} userRole={currentUser.role} />
      </div>

      {isMobileProductMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileProductMenuOpen(false)}></div>
            <div className="relative w-full max-w-lg bg-white rounded-t-[40px] shadow-2xl p-8 animate-in slide-in-from-bottom duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
                <h3 className="text-lg font-black text-[#1D1D1F] mb-6 px-2">Pilih Manajemen Produk</h3>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { id: 'katalog', label: 'Katalog Produk', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                        { id: 'bahan', label: 'Master Bahan Baku', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                        { id: 'kategori', label: 'Kategori & Atribut', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
                        { id: 'gudang', label: 'Manajemen Gudang', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                        { id: 'pelanggan', label: 'Database Pelanggan', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                    ].filter(tab => isAllowed('products', tab.id as ProductTab)).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                handlePageChange('products', tab.id as ProductTab);
                                setIsMobileProductMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all ${
                                activeProductTab === tab.id && activePage === 'products'
                                ? 'bg-[#0071E3] text-white' 
                                : 'bg-[#F5F5F7] text-slate-600 hover:bg-[#E8E8ED]'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                            </svg>
                            <span className="text-sm font-bold tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setIsMobileProductMenuOpen(false)}
                    className="w-full mt-6 py-4 text-sm font-black text-slate-400 uppercase tracking-widest"
                >
                    Tutup
                </button>
            </div>
        </div>
      )}

      {isModalOpen && (
        <ProductFormModal isOpen={isModalOpen} categories={categories} onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} initialData={editingProduct} existingNames={products.map(p => (p.nama_produk || '').toLowerCase())} />
      )}
    </div>
  );
};

export default App;
