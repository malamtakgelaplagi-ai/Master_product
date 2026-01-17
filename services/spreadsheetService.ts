
import { Product, Category, Variant, Stock, StockLog, ProductionBatch, ProductionItem, Sale, SaleItem, ProductCost, BatchCost, PaymentLog, Warehouse, Customer, Material, MaterialStock, MaterialStockLog, BOM, User } from '../types';

// =============================================================
// PASTE URL WEB APP SPREADSHEET B (KEAMANAN) DI SINI
// =============================================================
const HARDCODED_AUTH_URL = 'https://script.google.com/macros/s/AKfycbwhIv0K_CfuKNn2tKPFwh78BJvFahraM8d4DwOPheo3yBSRrKUtdobNSbYWvSuFKfRJZA/exec';
// =============================================================

export const spreadsheetService = {
  getBusinessUrl(): string {
    return localStorage.getItem('BUSINESS_BACKEND_URL') || '';
  },

  getAuthUrl(): string {
    // Sekarang mengambil langsung dari variabel di atas, bukan localStorage
    return HARDCODED_AUTH_URL;
  },

  async fetchData(): Promise<{ 
    products: Product[]; 
    categories: Category[]; 
    variants: Variant[]; 
    stocks: Stock[]; 
    stock_logs: StockLog[];
    sales: Sale[];
    sales_items: SaleItem[];
    payment_logs: PaymentLog[];
    production_batches: ProductionBatch[]; 
    production_items: ProductionItem[];
    product_costs: ProductCost[];
    batch_costs: BatchCost[];
    warehouses: Warehouse[];
    customers: Customer[];
    materials: Material[];
    material_stocks: MaterialStock[];
    material_stock_logs: MaterialStockLog[];
    bom_products: BOM[];
  }> {
    const url = this.getBusinessUrl();
    const defaultData = { 
      products: [], categories: [], variants: [], stocks: [], stock_logs: [],
      sales: [], sales_items: [], payment_logs: [], production_batches: [], 
      production_items: [], product_costs: [], batch_costs: [], warehouses: [], 
      customers: [], materials: [], material_stocks: [], material_stock_logs: [], 
      bom_products: []
    };

    if (!url) return defaultData;

    try {
      const response = await fetch(`${url}?action=getData`);
      if (!response.ok) throw new Error('Failed to fetch from business sheet');
      
      const data = await response.json();
      if (!data) return defaultData;

      const normalizedCategories = Array.isArray(data.categories) 
        ? data.categories.map((cat: any) => ({
            ...cat,
            subCategories: this.ensureArray(cat.subCategories),
            availableSizes: this.ensureArray(cat.availableSizes),
            availableColors: this.ensureArray(cat.availableColors),
            availableMaterials: this.ensureArray(cat.availableMaterials),
          }))
        : [];

      return {
        products: Array.isArray(data.products) ? data.products : [],
        categories: normalizedCategories,
        variants: Array.isArray(data.variants) ? data.variants : [],
        stocks: Array.isArray(data.stocks) ? data.stocks : [],
        stock_logs: Array.isArray(data.stock_logs) ? data.stock_logs : [],
        sales: Array.isArray(data.sales) ? data.sales : [],
        sales_items: Array.isArray(data.sales_items) ? data.sales_items : [],
        payment_logs: Array.isArray(data.payment_logs) ? data.payment_logs : [],
        production_batches: Array.isArray(data.production_batches) ? data.production_batches : [],
        production_items: Array.isArray(data.production_items) ? data.production_items : [],
        product_costs: Array.isArray(data.product_costs) ? data.product_costs : [],
        batch_costs: Array.isArray(data.batch_costs) ? data.batch_costs : [],
        warehouses: Array.isArray(data.warehouses) ? data.warehouses : [],
        customers: Array.isArray(data.customers) ? data.customers : [],
        materials: Array.isArray(data.materials) ? data.materials : [],
        material_stocks: Array.isArray(data.material_stock) ? data.material_stock : [],
        material_stock_logs: Array.isArray(data.material_stock_logs) ? data.material_stock_logs : [],
        bom_products: Array.isArray(data.bom_products) ? data.bom_products : []
      };
    } catch (error) {
      console.error('Business Spreadsheet Fetch Error:', error);
      return defaultData;
    }
  },

  async fetchUsers(): Promise<User[]> {
    const url = this.getAuthUrl();
    if (!url || url.includes('MASUKKAN_URL')) return [];
    try {
      const response = await fetch(`${url}?action=getUsers`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data.users) ? data.users : [];
    } catch (e) {
      console.error('Auth Fetch Error:', e);
      return [];
    }
  },

  async login(email: string, password_plain: string): Promise<{ success: boolean; user?: User; message?: string }> {
    const users = await this.fetchUsers();
    if (users.length === 0) return { success: false, message: 'Gagal memuat database user. Periksa URL Keamanan di kode.' };
    
    const user = users.find(u => u.email === email);
    if (!user) return { success: false, message: 'Email tidak ditemukan.' };
    if (user.status !== 'AKTIF') return { success: false, message: 'Akun belum aktif atau dinonaktifkan.' };
    
    if (user.password === password_plain) {
      const { password, ...safeUser } = user;
      return { success: true, user: safeUser as User };
    }
    
    return { success: false, message: 'Password salah.' };
  },

  async signUp(newUser: Omit<User, 'uid' | 'status'>): Promise<boolean> {
    const users = await this.fetchUsers();
    const uid = 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const userToSave: User = { ...newUser, uid, status: 'PENDING' };
    
    return this.postToAuth('saveUsers', [...users, userToSave]);
  },

  async syncUsers(users: User[]): Promise<boolean> {
    return this.postToAuth('saveUsers', users);
  },

  ensureArray(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(v => v !== null && v !== undefined).map(String);
    if (typeof val === 'string') {
      return val.split(',').map(s => s.trim()).filter(s => s !== '');
    }
    return [];
  },

  async syncProducts(products: Product[]): Promise<boolean> { return this.postToBusiness('saveProducts', products); },
  async syncCategories(categories: Category[]): Promise<boolean> {
    const flattenedCategories = categories.map(cat => ({
      ...cat,
      subCategories: Array.isArray(cat.subCategories) ? cat.subCategories.join(', ') : cat.subCategories,
      availableSizes: Array.isArray(cat.availableSizes) ? cat.availableSizes.join(', ') : cat.availableSizes,
      availableColors: Array.isArray(cat.availableColors) ? cat.availableColors.join(', ') : cat.availableColors,
      availableMaterials: Array.isArray(cat.availableMaterials) ? cat.availableMaterials.join(', ') : cat.availableMaterials,
    }));
    return this.postToBusiness('saveCategories', flattenedCategories);
  },
  async syncVariants(variants: Variant[]): Promise<boolean> { return this.postToBusiness('saveVariants', variants); },
  async syncStocks(stocks: Stock[]): Promise<boolean> { return this.postToBusiness('saveStocks', stocks); },
  async syncStockLogs(logs: StockLog[]): Promise<boolean> { return this.postToBusiness('saveStockLogs', logs); },
  async syncSales(sales: Sale[]): Promise<boolean> { return this.postToBusiness('saveSales', sales); },
  async syncSalesItems(items: SaleItem[]): Promise<boolean> { return this.postToBusiness('saveSalesItems', items); },
  async syncPaymentLogs(logs: PaymentLog[]): Promise<boolean> { return this.postToBusiness('savePaymentLogs', logs); },
  async syncProductionBatches(batches: ProductionBatch[]): Promise<boolean> { return this.postToBusiness('saveProductionBatches', batches); },
  async syncProductionItems(items: ProductionItem[]): Promise<boolean> { return this.postToBusiness('saveProductionItems', items); },
  async syncProductCosts(costs: ProductCost[]): Promise<boolean> { return this.postToBusiness('saveProductCosts', costs); },
  async syncBatchCosts(costs: BatchCost[]): Promise<boolean> { return this.postToBusiness('saveBatchCosts', costs); },
  async syncWarehouses(warehouses: Warehouse[]): Promise<boolean> { return this.postToBusiness('saveWarehouses', warehouses); },
  async syncCustomers(customers: Customer[]): Promise<boolean> { return this.postToBusiness('saveCustomers', customers); },
  async syncMaterials(materials: Material[]): Promise<boolean> { return this.postToBusiness('saveMaterials', materials); },
  async syncMaterialStocks(stocks: MaterialStock[]): Promise<boolean> { return this.postToBusiness('saveMaterialStock', stocks); },
  async syncMaterialStockLogs(logs: MaterialStockLog[]): Promise<boolean> { return this.postToBusiness('saveMaterialStockLogs', logs); },
  async syncBOM(bom: BOM[]): Promise<boolean> { return this.postToBusiness('saveBOM', bom); },

  async postToBusiness(action: string, data: any): Promise<boolean> {
    return this.rawPost(this.getBusinessUrl(), action, data);
  },

  async postToAuth(action: string, data: any): Promise<boolean> {
    return this.rawPost(this.getAuthUrl(), action, data);
  },

  async rawPost(url: string, action: string, data: any): Promise<boolean> {
    if (!url || url.includes('MASUKKAN_URL')) return false;
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action, data })
      });
      return true;
    } catch (error) {
      console.error(`POST Error (${action}):`, error);
      return false;
    }
  },

  async testConnection(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}?action=getData`);
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  async testAuthConnection(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}?action=getUsers`);
      return response.ok;
    } catch (e) {
      return false;
    }
  }
};
