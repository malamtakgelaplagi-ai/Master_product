
export enum ProductStatus {
  AKTIF = 'aktif',
  NONAKTIF = 'nonaktif'
}

export enum ProductionStatus {
  DIR = 'DIR', // Direncanakan
  POL = 'POL', // Pola
  CUT = 'CUT', // Cutting
  JHT = 'JHT', // Jahit
  PRO = 'PRO', // Proses
  PAC = 'PAC', // Packing
  FIN = 'FIN'  // Selesai
}

export enum ProductionStage {
  CUTTING = 'CUTTING',
  JAHIT = 'JAHIT',
  FINISHING = 'FINISHING',
  COMPLETED = 'COMPLETED'
}

// RAW MATERIALS
export interface Material {
  material_id: string;
  nama_bahan: string;
  kategori: string;
  satuan: string;
  harga_rata2: number;
  aktif: boolean;
}

export interface MaterialStock {
  material_id: string;
  stok: number;
}

export interface MaterialStockLog {
  tanggal: string;
  material_id: string;
  qty: number; // + or -
  jenis: 'PEMBELIAN' | 'PRODUKSI' | 'ADJUSTMENT';
  referensi: string;
  catatan: string;
}

export interface BOM {
  sku: string;
  material_id: string;
  qty_per_pcs: number;
}

export interface Category {
  id: string;
  name: string;
  subCategories: string[];
  availableSizes: string[];
  availableColors: string[];
  availableMaterials: string[];
}

export interface Product {
  product_id: string;
  nama_produk: string;
  kategori: string;
  sub_kategori: string;
  ukuran: string;
  warna: string;
  jenis_bahan: string;
  harga_jual: number;
  biaya_produksi: number;
  status: ProductStatus;
  deskripsi?: string;
  catatan_internal?: string;
}

export interface ProductCost {
  sku: string;
  kategori: 'Bahan Utama' | 'Aksesoris' | 'Produksi' | 'Branding' | 'Lainnya';
  komponen: string;
  qty: number;
  satuan: string;
  biaya: number;
}

export interface BatchCost {
  batch_id: string;
  kategori: 'Bahan Utama' | 'Aksesoris' | 'Produksi' | 'Lainnya';
  komponen: string;
  qty: number;
  satuan: string;
  biaya: number;
}

export interface Variant {
  sku: string;
  product_id: string;
  ukuran: string;
  warna: string;
  jenis_bahan: string;
  harga_jual: number;
  harga_reseller: number;
  harga_dropship: number;
  stok_min: number;
  status: ProductStatus;
  deskripsi?: string;
}

export interface Warehouse {
  warehouse_id: string;
  nama_gudang: string;
  lokasi: string;
  aktif: boolean;
}

export interface Customer {
  customer_id: string;
  nama: string;
  tipe: 'RETAIL' | 'RESELLER' | 'DROPSHIPPER';
  hp: string;
  email: string;
  alamat: string;
  catatan: string;
}

export interface Stock {
  sku: string;
  warehouse_id: string;
  stok: number;
  hpp_aktual?: number; 
}

export interface StockLog {
  tanggal: string;
  sku: string;
  from_wh: string;
  to_wh: string;
  qty: number;
  jenis: 'PRODUKSI' | 'PENJUALAN' | 'TRANSFER' | 'ADJUSTMENT' | 'AWAL';
  referensi: string;
  user: string;
  alasan?: string;
}

export interface Sale {
  invoice: string;
  tanggal: string;
  customer_id: string;
  customer_name: string;
  tipe_harga: 'RETAIL' | 'RESELLER' | 'DROPSHIP';
  total: number;
  dp: number;
  sisa: number;
  status: 'DP' | 'PAID';
  metode: 'CASH' | 'TRANSFER' | 'QRIS';
  warehouse_id: string;
  user: string;
}

export interface SaleItem {
  invoice: string;
  sku: string;
  qty: number;
  harga: number;
  diskon: number;
  subtotal: number;
}

export interface PaymentLog {
  id: string;
  invoice: string;
  tanggal: string;
  jumlah: number;
  metode: string;
  user: string;
}

export interface ProductionBatch {
  batch_id: string;
  tanggal_mulai: string;
  target_selesai: string;
  status: ProductionStatus;
  current_stage?: ProductionStage;
  catatan: string;
  dest_warehouse_id?: string;
}

export interface ProductionItem {
  batch_id: string;
  sku: string;
  qty_rencana: number;
  qty_hasil: number;
  qty_rusak: number;
}

export interface ProductFormData {
  nama_produk: string;
  kategori: string;
  sub_kategori: string;
  ukuran: string;
  warna: string;
  jenis_bahan: string;
  harga_jual: string;
  biaya_produksi: string;
  deskripsi: string;
  catatan_internal: string;
}
