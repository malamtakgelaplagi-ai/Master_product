
import React, { useState, useMemo, useEffect } from 'react';
import { Variant, Stock, Product, Sale, SaleItem, PaymentLog, Warehouse, Customer } from '../types';
import InvoicePrintModal from './InvoicePrintModal';

interface SalesManagementProps {
  variants: Variant[];
  stocks: Stock[];
  products: Product[];
  sales: Sale[];
  paymentLogs: PaymentLog[];
  customers: Customer[];
  warehouses: Warehouse[];
  onSaveSale: (sale: Sale, items: SaleItem[], updatedStocks: Stock[]) => void;
  onUpdatePayment: (invoice: string, amount: number, method: string) => void;
  isLoading: boolean;
}

interface CartItem extends SaleItem {
  nama_produk: string;
  warna: string;
  ukuran: string;
  max_stok: number;
}

const SalesManagement: React.FC<SalesManagementProps> = ({
  variants,
  stocks,
  products,
  sales,
  paymentLogs,
  customers,
  warehouses,
  onSaveSale,
  onUpdatePayment,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'piutang'>('pos');
  const [skuSearch, setSkuSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.warehouse_id || '');
  const [tipeHarga, setTipeHarga] = useState<'RETAIL' | 'RESELLER' | 'DROPSHIP'>('RETAIL');
  const [metode, setMetode] = useState<'CASH' | 'TRANSFER' | 'QRIS'>('CASH');
  const [dp, setDp] = useState<number>(0);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState('');

  // Printing State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<{sale: Sale, items: CartItem[], warehouseName: string} | null>(null);

  // Pelunasan State
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'QRIS'>('CASH');

  useEffect(() => {
    generateInvoice();
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].warehouse_id);
    }
  }, [warehouses]);

  useEffect(() => {
    const cust = customers.find(c => c.customer_id === selectedCustomerId);
    if (cust) {
      if (cust.tipe === 'RESELLER') setTipeHarga('RESELLER');
      else if (cust.tipe === 'DROPSHIPPER') setTipeHarga('DROPSHIP');
      else setTipeHarga('RETAIL');
    }
  }, [selectedCustomerId, customers]);

  const generateInvoice = () => {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0].replace(/-/g, '').substring(2);
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    setInvoice(`INV-${datePart}-${randPart}`);
  };

  const getStockFromWarehouse = (sku: string) => {
    return stocks.find(s => s.sku === sku && s.warehouse_id === selectedWarehouseId)?.stok || 0;
  };

  const getPriceByTier = (v: Variant) => {
    if (tipeHarga === 'RESELLER') return Number(v.harga_reseller) || Number(v.harga_jual);
    if (tipeHarga === 'DROPSHIP') return Number(v.harga_dropship) || Number(v.harga_jual);
    return Number(v.harga_jual);
  };

  const filteredVariants = useMemo(() => {
    const query = skuSearch.toLowerCase();
    if (query.length < 2) return [];
    return variants.filter(v => {
      const p = products.find(prod => prod.product_id === v.product_id);
      return (v.sku?.toLowerCase() || '').includes(query) ||
             (p?.nama_produk?.toLowerCase() || '').includes(query);
    }).slice(0, 5);
  }, [variants, products, skuSearch]);

  const addToCart = (v: Variant) => {
    const prod = products.find(p => p.product_id === v.product_id);
    const existing = cart.find(c => c.sku === v.sku);
    const currentStock = getStockFromWarehouse(v.sku);
    const hargaSatuan = getPriceByTier(v);

    if (currentStock <= 0) {
      setError(`Stok di gudang ini habis.`);
      return;
    }

    if (existing) {
      if (existing.qty + 1 > currentStock) {
        setError(`Stok gudang tidak mencukupi.`);
        return;
      }
      const newQty = existing.qty + 1;
      setCart(cart.map(c => c.sku === v.sku ? { 
        ...c, 
        qty: newQty, 
        subtotal: (newQty * c.harga) - (newQty * c.diskon) 
      } : c));
    } else {
      setCart([...cart, {
        invoice,
        sku: v.sku,
        qty: 1,
        harga: hargaSatuan,
        diskon: 0,
        subtotal: hargaSatuan,
        nama_produk: prod?.nama_produk || 'Produk',
        warna: v.warna,
        ukuran: v.ukuran,
        max_stok: currentStock
      }]);
    }
    setSkuSearch('');
    setError('');
  };

  const updateQty = (sku: string, newQty: number) => {
    const item = cart.find(c => c.sku === sku);
    if (!item) return;
    const qty = Math.max(1, newQty);
    if (qty > item.max_stok) {
      setError(`Stok gudang hanya ${item.max_stok}.`);
      return;
    }
    setError('');
    setCart(cart.map(c => c.sku === sku ? { ...c, qty, subtotal: (qty * c.harga) - (qty * c.diskon) } : c));
  };

  const removeFromCart = (sku: string) => {
    setCart(cart.filter(c => c.sku !== sku));
  };

  const totalKotor = cart.reduce((acc, c) => acc + (c.harga * c.qty), 0);
  const totalDiskon = cart.reduce((acc, c) => acc + (c.diskon * c.qty), 0);
  const totalAkhir = totalKotor - totalDiskon;

  const handleCheckout = (isLunas: boolean) => {
    if (cart.length === 0) {
      setError('Keranjang masih kosong.');
      return;
    }
    if (!selectedCustomerId) {
      setError('Pilih Customer terlebih dahulu.');
      return;
    }
    if (!selectedWarehouseId) {
      setError('Pilih Gudang asal barang.');
      return;
    }

    const cust = customers.find(c => c.customer_id === selectedCustomerId);
    const paymentAmount = isLunas ? totalAkhir : dp;
    
    const sale: Sale = {
      invoice,
      tanggal: new Date().toISOString(),
      customer_id: selectedCustomerId,
      customer_name: cust?.nama || 'Guest',
      tipe_harga: tipeHarga,
      total: totalAkhir,
      dp: paymentAmount,
      sisa: isLunas ? 0 : Math.max(0, totalAkhir - paymentAmount),
      status: (isLunas || paymentAmount >= totalAkhir) ? 'PAID' : 'DP',
      metode,
      warehouse_id: selectedWarehouseId,
      user: 'Kasir'
    };

    const saleItems: SaleItem[] = cart.map(({ nama_produk, warna, ukuran, max_stok, ...rest }) => rest);

    const updatedStocks = stocks.map(s => {
      const itemInCart = cart.find(c => c.sku === s.sku && s.warehouse_id === selectedWarehouseId);
      if (itemInCart) {
        return { ...s, stok: s.stok - itemInCart.qty };
      }
      return s;
    });

    onSaveSale(sale, saleItems, updatedStocks);

    // Setup print preview before clearing cart
    setLastCompletedSale({
      sale,
      items: [...cart],
      warehouseName: warehouses.find(w => w.warehouse_id === selectedWarehouseId)?.nama_gudang || 'Central Warehouse'
    });
    setIsPrintModalOpen(true);

    // Clear session state
    setCart([]);
    setSelectedCustomerId('');
    setDp(0);
    generateInvoice();
  };

  const handleProcessPelunasan = () => {
    if (!selectedInvoice) return;
    if (paymentAmount <= 0) {
      setError('Jumlah bayar tidak valid.');
      return;
    }
    onUpdatePayment(selectedInvoice.invoice, paymentAmount, paymentMethod);
    setSelectedInvoice(null);
    setPaymentAmount(0);
  };

  const dpInvoices = useMemo(() => {
    return sales.filter(s => s.status === 'DP').sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [sales]);

  if (isLoading) return <div className="text-center py-24 animate-pulse"><div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="font-bold text-slate-400">Loading Cashier...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('pos')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'pos' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>New Transaction</button>
        <button onClick={() => setActiveTab('piutang')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'piutang' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
          Receivables {dpInvoices.length > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{dpInvoices.length}</span>}
        </button>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Customer</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">-- Guest --</option>
                      {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.nama} ({c.tipe})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Warehouse</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500 transition-all"
                      value={selectedWarehouseId}
                      onChange={(e) => { setSelectedWarehouseId(e.target.value); setCart([]); }}
                    >
                      {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.nama_gudang}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Price Tier</label>
                    <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                        {(['RETAIL', 'RESELLER', 'DROPSHIP'] as const).map(t => (
                          <button key={t} onClick={() => setTipeHarga(t)} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${tipeHarga === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{t}</button>
                        ))}
                    </div>
                  </div>
              </div>
              
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search SKU or Product Name..."
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-[24px] font-bold text-lg outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all"
                    value={skuSearch}
                    onChange={(e) => setSkuSearch(e.target.value)}
                  />
                  {filteredVariants.length > 0 && (
                    <div className="absolute z-20 w-full mt-3 bg-white border border-slate-200 rounded-[28px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      {filteredVariants.map(v => (
                        <button key={v.sku} onClick={() => addToCart(v)} className="w-full px-8 py-5 text-left hover:bg-slate-50 flex items-center justify-between group border-b border-slate-50 last:border-0">
                          <div>
                            <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{products.find(p => p.product_id === v.product_id)?.nama_produk}</div>
                            <div className="text-[11px] text-slate-400 font-mono font-bold mt-0.5">{v.sku} • {v.warna} • {v.ukuran}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-slate-900">Rp {getPriceByTier(v).toLocaleString()}</div>
                            <div className="text-[10px] font-black uppercase text-slate-400">Stock: {getStockFromWarehouse(v.sku)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item Detail</th>
                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Qty</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                        <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center">
                          <div className="max-w-xs mx-auto">
                            <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <p className="text-slate-400 font-bold text-sm tracking-tight">Your cart is empty. Search items to start selling.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      cart.map(item => (
                        <tr key={item.sku} className="group hover:bg-slate-50/50 transition-all">
                            <td className="px-8 py-6">
                              <div className="text-sm font-black text-slate-900">{item.nama_produk}</div>
                              <div className="text-[11px] text-slate-400 font-bold font-mono mt-0.5">{item.sku}</div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center justify-center gap-3">
                                  <button onClick={() => updateQty(item.sku, item.qty - 1)} className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all active:scale-90">-</button>
                                  <span className="font-black text-base w-8 text-center">{item.qty}</span>
                                  <button onClick={() => updateQty(item.sku, item.qty + 1)} className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all active:scale-90">+</button>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right text-sm font-bold text-slate-600">{item.harga.toLocaleString()}</td>
                            <td className="px-8 py-6 text-right text-sm font-black text-slate-900">{item.subtotal.toLocaleString()}</td>
                            <td className="px-8 py-6 text-right">
                              <button onClick={() => removeFromCart(item.sku)} className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </td>
                        </tr>
                      ))
                    )}
                  </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl text-white sticky top-28 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              
              <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-10 relative z-10">Billing Summary</h3>
              
              {error && <div className="mb-6 p-4 bg-rose-500/20 text-rose-300 text-[11px] font-black rounded-2xl border border-rose-500/30 flex gap-2 items-center"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>{error}</div>}
              
              <div className="space-y-4 mb-12 relative z-10">
                  <div className="flex justify-between items-center opacity-60">
                    <span className="text-[11px] font-black uppercase tracking-widest">Subtotal</span>
                    <span className="text-sm font-bold">Rp {totalKotor.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="text-[11px] font-black uppercase tracking-widest">Savings</span>
                    <span className="text-sm font-bold">-Rp {totalDiskon.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1">Grand Total</span>
                    <span className="text-3xl font-black tracking-tighter">Rp {totalAkhir.toLocaleString()}</span>
                  </div>
              </div>

              <div className="space-y-8 mb-12 relative z-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Amount (DP/Lunas)</label>
                    <input 
                      type="number" 
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[24px] text-2xl font-black text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all" 
                      placeholder="0"
                      value={dp || ''} 
                      onChange={(e) => setDp(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['CASH', 'TRANSFER', 'QRIS'] as const).map(m => (
                          <button key={m} onClick={() => setMetode(m)} className={`py-4 text-[10px] font-black rounded-2xl border transition-all ${metode === m ? 'bg-white text-slate-900 border-white shadow-xl shadow-white/5 scale-[1.05]' : 'text-slate-400 border-white/10 hover:border-white/30'}`}>{m}</button>
                        ))}
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-4 relative z-10">
                  <button onClick={() => handleCheckout(false)} disabled={cart.length === 0 || dp >= totalAkhir} className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] border border-white/10 transition-all disabled:opacity-30">Mark as Installment</button>
                  <button onClick={() => handleCheckout(true)} disabled={cart.length === 0} className="w-full py-6 bg-blue-600 hover:bg-blue-700 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50">Settle & Print</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
             <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Pending Receivables</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Unpaid customer balances</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Total outstanding</p>
                  <p className="text-3xl font-black text-rose-600 tracking-tighter">Rp {dpInvoices.reduce((acc, i) => acc + Number(i.sisa), 0).toLocaleString()}</p>
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice ID</th>
                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
                        <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining Balance</th>
                        <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dpInvoices.length === 0 ? (
                      <tr><td colSpan={4} className="px-10 py-20 text-center text-slate-300 italic">No outstanding receivables found.</td></tr>
                    ) : (
                      dpInvoices.map(sale => (
                        <tr key={sale.invoice} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6 font-black text-sm text-slate-900">{sale.invoice}</td>
                            <td className="px-10 py-6 font-bold text-sm text-slate-600">{sale.customer_name}</td>
                            <td className="px-10 py-6 text-right font-black text-sm text-rose-600 bg-rose-50/20">Rp {sale.sisa.toLocaleString()}</td>
                            <td className="px-10 py-6 text-center">
                              <button onClick={() => { setSelectedInvoice(sale); setPaymentAmount(sale.sisa); }} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-100">Make Payment</button>
                            </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
             </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-xl p-12 space-y-10 animate-in zoom-in duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Settle Payment</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Invoice: {selectedInvoice.invoice}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" /></svg>
                </button>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-[32px] text-center border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount to Settle</p>
                 <p className="text-4xl font-black text-slate-900 tracking-tighter">Rp {selectedInvoice.sisa.toLocaleString()}</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payment Amount</label>
                    <input 
                      type="number" 
                      className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[32px] text-3xl font-black outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all text-center" 
                      value={paymentAmount || ''} 
                      onChange={(e) => setPaymentAmount(Number(e.target.value))} 
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Metode</label>
                    <div className="grid grid-cols-3 gap-3">
                        {(['CASH', 'TRANSFER', 'QRIS'] as const).map(m => (
                          <button key={m} onClick={() => setPaymentMethod(m)} className={`py-5 text-[11px] font-black rounded-3xl border-2 transition-all ${paymentMethod === m ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'border-slate-100 text-slate-400'}`}>{m}</button>
                        ))}
                    </div>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setSelectedInvoice(null)} className="flex-1 py-6 text-slate-400 font-black uppercase tracking-widest text-[11px] hover:text-slate-600">Cancel</button>
                 <button onClick={handleProcessPelunasan} className="flex-[2] py-6 bg-blue-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95">Confirm Payment</button>
              </div>
           </div>
        </div>
      )}

      {/* Invoice Printing Dialog */}
      {isPrintModalOpen && lastCompletedSale && (
        <InvoicePrintModal
          isOpen={isPrintModalOpen}
          sale={lastCompletedSale.sale}
          items={lastCompletedSale.items}
          warehouseName={lastCompletedSale.warehouseName}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SalesManagement;
