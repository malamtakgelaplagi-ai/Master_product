
import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductStatus, ProductionStatus, Category, Variant, Stock, StockLog, ProductionBatch, ProductionItem, Sale, SaleItem, ProductCost, BatchCost, PaymentLog, Warehouse, Customer, Material, MaterialStock, MaterialStockLog, BOM } from './types';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import ProductList from './components/ProductList';
import ProductFormModal from './components/ProductFormModal';
import VariantManagement from './components/VariantManagement';
import ProductionManagement from './components/ProductionManagement';
import StockManagement from './components/StockManagement';
import SalesManagement from './components/SalesManagement';
import ReportsManagement from './components/ReportsManagement';
import SettingsPage from './components/SettingsPage';
import { spreadsheetService } from './services/spreadsheetService';

type Page = 'products' | 'categories' | 'variants' | 'production' | 'stock' | 'sales' | 'reports' | 'settings';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('products');
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
  
  // Material States
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialStocks, setMaterialStocks] = useState<MaterialStock[]>([]);
  const [materialStockLogs, setMaterialStockLogs] = useState<MaterialStockLog[]>([]);
  const [bomProducts, setBomProducts] = useState<BOM[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUrlMissing, setIsUrlMissing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (syncMessage.text) {
      const timer = setTimeout(() => setSyncMessage({ text: '', type: null }), 4000);
      return () => clearTimeout(timer);
    }
  }, [syncMessage]);

  const loadData = async () => {
    const url = spreadsheetService.getApiUrl();
    if (!url) {
      setIsUrlMissing(true);
      setIsLoading(false);
      return;
    }
    
    setIsUrlMissing(false);
    setIsLoading(true);
    const data = await spreadsheetService.fetchData();
    
    setProducts(data.products || []);
    setCategories(data.categories || []);
    setVariants(data.variants || []);
    setStocks(data.stocks || []);
    setStockLogs(data.stock_logs || []);
    setSales(data.sales || []);
    setSalesItems(data.sales_items || []);
    setPaymentLogs(data.payment_logs || []);
    setProductionBatches(data.production_batches || []);
    setProductionItems(data.production_items || []);
    setProductCosts(data.product_costs || []);
    setBatchCosts(data.batch_costs || []);
    setWarehouses(data.warehouses || []);
    setCustomers(data.customers || []);
    
    // New Material Data
    setMaterials(data.materials || []);
    setMaterialStocks(data.material_stocks || []);
    setMaterialStockLogs(data.material_stock_logs || []);
    setBomProducts(data.bom_products || []);
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activePage]);

  // Sync Wrappers
  const saveMaterials = async (updated: Material[], updatedStocks: MaterialStock[], newLogs: MaterialStockLog[]) => {
    setMaterials(updated);
    setMaterialStocks(updatedStocks);
    setMaterialStockLogs([...newLogs, ...materialStockLogs]);
    setIsSyncing(true);
    await Promise.all([
      spreadsheetService.syncMaterials(updated),
      spreadsheetService.syncMaterialStocks(updatedStocks),
      spreadsheetService.syncMaterialStockLogs([...newLogs, ...materialStockLogs])
    ]);
    setIsSyncing(false);
    setSyncMessage({ text: 'Material stocks updated', type: 'success' });
  };

  const saveBOM = async (updated: BOM[]) => {
    setBomProducts(updated);
    setIsSyncing(true);
    await spreadsheetService.syncBOM(updated);
    setIsSyncing(false);
    setSyncMessage({ text: 'Product BOM synchronized', type: 'success' });
  };

  const saveProducts = async (updated: Product[]) => {
    setProducts(updated);
    setIsSyncing(true);
    await spreadsheetService.syncProducts(updated);
    setIsSyncing(false);
    setSyncMessage({ text: 'Product catalog synchronized', type: 'success' });
  };

  const saveCategories = async (updated: Category[]) => {
    setCategories(updated);
    setIsSyncing(true);
    await spreadsheetService.syncCategories(updated);
    setIsSyncing(false);
    setSyncMessage({ text: 'Category database synchronized', type: 'success' });
  };

  const saveProductCosts = async (updated: ProductCost[]) => {
    setProductCosts(updated);
    setIsSyncing(true);
    await spreadsheetService.syncProductCosts(updated);
    setIsSyncing(false);
    setSyncMessage({ text: 'Product costs synchronized', type: 'success' });
  };

  const saveVariants = async (updatedVariants: Variant[], updatedStocks: Stock[]) => {
    setVariants(updatedVariants);
    setStocks(updatedStocks);
    setIsSyncing(true);
    await Promise.all([
      spreadsheetService.syncVariants(updatedVariants),
      spreadsheetService.syncStocks(updatedStocks)
    ]);
    setIsSyncing(false);
    setSyncMessage({ text: 'SKU variants updated', type: 'success' });
  };

  const saveProductionData = async (batches: ProductionBatch[], items: ProductionItem[], costs: BatchCost[], updatedStocks?: Stock[]) => {
    setProductionBatches(batches);
    setProductionItems(items);
    setBatchCosts(costs);
    
    const logs: StockLog[] = [];
    const matLogs: MaterialStockLog[] = [];
    let updatedMaterialStocks = [...materialStocks];

    if (updatedStocks) {
      const activeBatch = batches.find(b => b.status === ProductionStatus.FIN);
      if (activeBatch) {
        // Record output to product stocks
        items.filter(i => i.qty_hasil > 0 && i.batch_id === activeBatch.batch_id).forEach(item => {
          logs.push({
            tanggal: new Date().toISOString(),
            sku: item.sku,
            from_wh: '-',
            to_wh: activeBatch.dest_warehouse_id || warehouses[0]?.warehouse_id || 'WH-01',
            qty: item.qty_hasil,
            jenis: 'PRODUKSI',
            referensi: activeBatch.batch_id,
            user: 'Admin'
          });

          // AUTOMATIC MATERIAL DEDUCTION (BOM)
          const skuBoms = bomProducts.filter(b => b.sku === item.sku);
          skuBoms.forEach(bom => {
            const usage = bom.qty_per_pcs * item.qty_hasil;
            matLogs.push({
              tanggal: new Date().toISOString(),
              material_id: bom.material_id,
              qty: -usage,
              jenis: 'PRODUKSI',
              referensi: activeBatch.batch_id,
              catatan: `Produksi ${item.sku}`
            });
            
            updatedMaterialStocks = updatedMaterialStocks.map(ms => 
              ms.material_id === bom.material_id ? { ...ms, stok: ms.stok - usage } : ms
            );
          });
        });
        setStocks(updatedStocks);
        setStockLogs(prev => [...logs, ...prev]);
        setMaterialStocks(updatedMaterialStocks);
        setMaterialStockLogs(prev => [...matLogs, ...prev]);
      }
    }
    
    setIsSyncing(true);
    const promises: Promise<any>[] = [
      spreadsheetService.syncProductionBatches(batches),
      spreadsheetService.syncProductionItems(items),
      spreadsheetService.syncBatchCosts(costs)
    ];
    if (updatedStocks) {
      promises.push(spreadsheetService.syncStocks(updatedStocks));
      promises.push(spreadsheetService.syncStockLogs([...logs, ...stockLogs]));
      promises.push(spreadsheetService.syncMaterialStocks(updatedMaterialStocks));
      promises.push(spreadsheetService.syncMaterialStockLogs([...matLogs, ...materialStockLogs]));
    }
    
    await Promise.all(promises);
    setIsSyncing(false);
    setSyncMessage({ text: 'Production state updated', type: 'success' });
  };

  const saveStockAdjustment = async (updatedStocks: Stock[], newLogs: StockLog[]) => {
    const allLogs = [...newLogs, ...stockLogs];
    setStocks(updatedStocks);
    setStockLogs(allLogs);
    setIsSyncing(true);
    await Promise.all([
      spreadsheetService.syncStocks(updatedStocks),
      spreadsheetService.syncStockLogs(allLogs)
    ]);
    setIsSyncing(false);
    setSyncMessage({ text: 'Stock level adjustment successful', type: 'success' });
  };

  const handleSaveSale = async (sale: Sale, items: SaleItem[], updatedStocks: Stock[]) => {
    const saleLogs: StockLog[] = items.map(item => ({
      tanggal: sale.tanggal,
      sku: item.sku,
      from_wh: sale.warehouse_id,
      to_wh: '-',
      qty: -item.qty,
      jenis: 'PENJUALAN',
      referensi: sale.invoice,
      user: sale.user
    }));

    const newPaymentLog: PaymentLog = {
      id: `PAY-${Date.now()}`,
      invoice: sale.invoice,
      tanggal: sale.tanggal,
      jumlah: sale.dp,
      metode: sale.metode,
      user: sale.user
    };

    const allSales = [sale, ...sales];
    const allItems = [...items, ...salesItems];
    const allLogs = [...saleLogs, ...stockLogs];
    const allPaymentLogs = [newPaymentLog, ...paymentLogs];

    setSales(allSales);
    setSalesItems(allItems);
    setStocks(updatedStocks);
    setStockLogs(allLogs);
    setPaymentLogs(allPaymentLogs);

    setIsSyncing(true);
    await Promise.all([
      spreadsheetService.syncSales(allSales),
      spreadsheetService.syncSalesItems(allItems),
      spreadsheetService.syncStocks(updatedStocks),
      spreadsheetService.syncStockLogs(allLogs),
      spreadsheetService.syncPaymentLogs(allPaymentLogs)
    ]);
    setIsSyncing(false);
    setSyncMessage({ text: 'Transaction recorded', type: 'success' });
  };

  const handleUpdatePayment = async (invoice: string, amount: number, method: string) => {
    const now = new Date().toISOString();
    const newLog: PaymentLog = {
      id: `PAY-${Date.now()}`,
      invoice,
      tanggal: now,
      jumlah: amount,
      metode: method,
      user: 'Admin'
    };
    const updatedPaymentLogs = [newLog, ...paymentLogs];
    const updatedSales = sales.map(s => {
      if (s.invoice === invoice) {
        const newTotalPaid = Number(s.dp) + amount;
        const newRemaining = Math.max(0, Number(s.total) - newTotalPaid);
        return {
          ...s,
          dp: newTotalPaid,
          sisa: newRemaining,
          status: newRemaining <= 0 ? 'PAID' : 'DP' as 'PAID' | 'DP'
        };
      }
      return s;
    });
    setSales(updatedSales);
    setPaymentLogs(updatedPaymentLogs);
    setIsSyncing(true);
    await Promise.all([
      spreadsheetService.syncSales(updatedSales),
      spreadsheetService.syncPaymentLogs(updatedPaymentLogs)
    ]);
    setIsSyncing(false);
    setSyncMessage({ text: 'Debt settlement recorded', type: 'success' });
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

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      (p.nama_produk?.toLowerCase() || '').includes(query) ||
      (p.kategori?.toLowerCase() || '').includes(query) ||
      (p.product_id?.toLowerCase() || '').includes(query)
    );
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-900">
      <Header activePage={activePage} onPageChange={setActivePage} isSyncing={isSyncing} />
      
      {syncMessage.text && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-[28px] shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-500 ${
          syncMessage.type === 'success' ? 'bg-slate-900 text-white border-white/10' : 'bg-rose-600 text-white border-rose-50'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${syncMessage.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`}></div>
          <span className="text-[11px] font-black uppercase tracking-widest">{syncMessage.text}</span>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-20">
        {isUrlMissing && activePage !== 'settings' && (
          <div className="bg-rose-50 border-2 border-rose-100 rounded-[32px] p-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div className="bg-rose-500 p-4 rounded-3xl text-white shadow-xl shadow-rose-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-900 tracking-tight">System Disconnected</h3>
                <p className="text-sm text-rose-600 font-medium">Please configure your Spreadsheet Backend URL in Settings to begin.</p>
              </div>
            </div>
            <button onClick={() => setActivePage('settings')} className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95">Go to Settings</button>
          </div>
        )}

        {activePage === 'products' && (
          <div className="animate-in fade-in duration-700">
            <DashboardStats products={products} />
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Syncing Enterprise Data...</p>
                </div>
              ) : (
                <>
                  <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/30">
                    <div className="relative flex-1 group">
                      <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Search model, category, or internal ID..."
                        className="block w-full pl-14 pr-5 py-4 border border-slate-200 rounded-2xl bg-white text-sm font-medium focus:ring-4 focus:ring-blue-50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95">Add Master Product</button>
                  </div>
                  <ProductList products={filteredProducts} onEdit={(p) => { setEditingProduct(p); setIsModalOpen(true); }} onToggleStatus={toggleProductStatus} />
                </>
              )}
            </div>
          </div>
        )}

        {activePage === 'variants' && (
          <VariantManagement 
            products={products} 
            categories={categories} 
            variants={variants} 
            stocks={stocks} 
            warehouses={warehouses}
            onSave={saveVariants} 
            isLoading={isLoading} 
          />
        )}
        {activePage === 'production' && (
          <ProductionManagement 
            batches={productionBatches} 
            items={productionItems} 
            variants={variants} 
            stocks={stocks} 
            products={products} 
            batchCosts={batchCosts}
            warehouses={warehouses}
            materials={materials}
            materialStocks={materialStocks}
            bomProducts={bomProducts}
            isLoading={isLoading} 
            onSaveBatch={saveProductionData} 
            onSaveBOM={saveBOM}
          />
        )}
        {activePage === 'stock' && (
          <StockManagement 
            variants={variants} 
            stocks={stocks} 
            products={products} 
            stockLogs={stockLogs} 
            warehouses={warehouses}
            isLoading={isLoading} 
            onSaveAdjustment={saveStockAdjustment} 
          />
        )}
        {activePage === 'sales' && (
          <SalesManagement 
            variants={variants} 
            stocks={stocks} 
            products={products} 
            sales={sales}
            paymentLogs={paymentLogs}
            customers={customers}
            warehouses={warehouses}
            onSaveSale={handleSaveSale} 
            onUpdatePayment={handleUpdatePayment}
            isLoading={isLoading} 
          />
        )}
        {activePage === 'reports' && (
          <ReportsManagement 
            sales={sales}
            salesItems={salesItems}
            variants={variants}
            products={products}
            stocks={stocks}
            paymentLogs={paymentLogs}
            isLoading={isLoading}
          />
        )}
        {activePage === 'settings' && (
          <SettingsPage 
            warehouses={warehouses}
            customers={customers}
            categories={categories}
            materials={materials}
            materialStocks={materialStocks}
            materialLogs={materialStockLogs}
            stocks={stocks}
            isLoading={isLoading}
            onRefreshData={loadData}
            onSaveMaterials={saveMaterials}
            onSaveWarehouses={async (updated) => {
              setWarehouses(updated);
              setIsSyncing(true);
              await spreadsheetService.syncWarehouses(updated);
              setIsSyncing(false);
              setSyncMessage({ text: 'Warehouse configurations updated', type: 'success' });
            }}
            onSaveCustomers={async (updated) => {
              setCustomers(updated);
              setIsSyncing(true);
              await spreadsheetService.syncCustomers(updated);
              setIsSyncing(false);
              setSyncMessage({ text: 'Customer database synchronized', type: 'success' });
            }}
            onSaveCategories={async (updated) => {
              setCategories(updated);
              setIsSyncing(true);
              await spreadsheetService.syncCategories(updated);
              setIsSyncing(false);
              setSyncMessage({ text: 'Category database synchronized', type: 'success' });
            }}
          />
        )}
      </main>

      {isModalOpen && (
        <ProductFormModal isOpen={isModalOpen} categories={categories} onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} initialData={editingProduct} existingNames={products.map(p => (p.nama_produk || '').toLowerCase())} />
      )}
    </div>
  );
};

export default App;
