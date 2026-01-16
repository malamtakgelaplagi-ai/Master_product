
import { Product, Category, Variant, Stock, StockLog, ProductionBatch, ProductionItem, Sale, SaleItem, ProductCost, BatchCost, PaymentLog, Warehouse, Customer, Material, MaterialStock, MaterialStockLog, BOM } from '../types';

export const spreadsheetService = {
  getApiUrl(): string {
    return localStorage.getItem('BACKEND_URL') || '';
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
    const url = this.getApiUrl();
    const defaultData = { 
      products: [], 
      categories: [], 
      variants: [], 
      stocks: [], 
      stock_logs: [],
      sales: [],
      sales_items: [],
      payment_logs: [],
      production_batches: [], 
      production_items: [],
      product_costs: [],
      batch_costs: [],
      warehouses: [],
      customers: [],
      materials: [],
      material_stocks: [],
      material_stock_logs: [],
      bom_products: []
    };

    if (!url) return defaultData;

    try {
      const response = await fetch(`${url}?action=getData`);
      if (!response.ok) throw new Error('Failed to fetch from sheet');
      
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
      console.error('Spreadsheet Fetch Error:', error);
      return defaultData;
    }
  },

  ensureArray(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(v => v !== null && v !== undefined).map(String);
    if (typeof val === 'string') {
      return val.split(',').map(s => s.trim()).filter(s => s !== '');
    }
    return [];
  },

  async syncProducts(products: Product[]): Promise<boolean> { return this.post('saveProducts', products); },
  async syncCategories(categories: Category[]): Promise<boolean> {
    const flattenedCategories = categories.map(cat => ({
      ...cat,
      subCategories: Array.isArray(cat.subCategories) ? cat.subCategories.join(', ') : cat.subCategories,
      availableSizes: Array.isArray(cat.availableSizes) ? cat.availableSizes.join(', ') : cat.availableSizes,
      availableColors: Array.isArray(cat.availableColors) ? cat.availableColors.join(', ') : cat.availableColors,
      availableMaterials: Array.isArray(cat.availableMaterials) ? cat.availableMaterials.join(', ') : cat.availableMaterials,
    }));
    return this.post('saveCategories', flattenedCategories);
  },
  async syncVariants(variants: Variant[]): Promise<boolean> { return this.post('saveVariants', variants); },
  async syncStocks(stocks: Stock[]): Promise<boolean> { return this.post('saveStocks', stocks); },
  async syncStockLogs(logs: StockLog[]): Promise<boolean> { return this.post('saveStockLogs', logs); },
  async syncSales(sales: Sale[]): Promise<boolean> { return this.post('saveSales', sales); },
  async syncSalesItems(items: SaleItem[]): Promise<boolean> { return this.post('saveSalesItems', items); },
  async syncPaymentLogs(logs: PaymentLog[]): Promise<boolean> { return this.post('savePaymentLogs', logs); },
  async syncProductionBatches(batches: ProductionBatch[]): Promise<boolean> { return this.post('saveProductionBatches', batches); },
  async syncProductionItems(items: ProductionItem[]): Promise<boolean> { return this.post('saveProductionItems', items); },
  async syncProductCosts(costs: ProductCost[]): Promise<boolean> { return this.post('saveProductCosts', costs); },
  async syncBatchCosts(costs: BatchCost[]): Promise<boolean> { return this.post('saveBatchCosts', costs); },
  async syncWarehouses(warehouses: Warehouse[]): Promise<boolean> { return this.post('saveWarehouses', warehouses); },
  async syncCustomers(customers: Customer[]): Promise<boolean> { return this.post('saveCustomers', customers); },
  
  // New Material Actions
  async syncMaterials(materials: Material[]): Promise<boolean> { return this.post('saveMaterials', materials); },
  async syncMaterialStocks(stocks: MaterialStock[]): Promise<boolean> { return this.post('saveMaterialStock', stocks); },
  async syncMaterialStockLogs(logs: MaterialStockLog[]): Promise<boolean> { return this.post('saveMaterialStockLogs', logs); },
  async syncBOM(bom: BOM[]): Promise<boolean> { return this.post('saveBOM', bom); },

  async post(action: string, data: any): Promise<boolean> {
    const url = this.getApiUrl();
    if (!url) return false;
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
  }
};
