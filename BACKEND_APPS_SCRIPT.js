
/**
 * MasterProduk Backend Script
 */

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getData') {
    const data = {
      products: getSheetData(ss, 'products'),
      categories: getSheetData(ss, 'categories'),
      variants: getSheetData(ss, 'variants'),
      stocks: getSheetData(ss, 'stocks'),
      stock_logs: getSheetData(ss, 'stock_logs'),
      sales: getSheetData(ss, 'sales'),
      sales_items: getSheetData(ss, 'sales_items'),
      payment_logs: getSheetData(ss, 'payment_logs'),
      production_batches: getSheetData(ss, 'production_batches'),
      production_items: getSheetData(ss, 'production_items'),
      product_costs: getSheetData(ss, 'product_costs'),
      batch_costs: getSheetData(ss, 'batch_costs'),
      warehouses: getSheetData(ss, 'warehouses'),
      customers: getSheetData(ss, 'customers'),
      materials: getSheetData(ss, 'materials'),
      material_stock: getSheetData(ss, 'material_stock'),
      material_stock_logs: getSheetData(ss, 'material_stock_logs'),
      bom_products: getSheetData(ss, 'bom_products')
    };
    
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const postData = JSON.parse(e.postData.contents);
  const action = postData.action;
  const data = postData.data;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const actionsMap = {
    'saveProducts': 'products',
    'saveCategories': 'categories',
    'saveVariants': 'variants',
    'saveStocks': 'stocks',
    'saveStockLogs': 'stock_logs',
    'saveSales': 'sales',
    'saveSalesItems': 'sales_items',
    'savePaymentLogs': 'payment_logs',
    'saveProductionBatches': 'production_batches',
    'saveProductionItems': 'production_items',
    'saveProductCosts': 'product_costs',
    'saveBatchCosts': 'batch_costs',
    'saveWarehouses': 'warehouses',
    'saveCustomers': 'customers',
    'saveMaterials': 'materials',
    'saveMaterialStock': 'material_stock',
    'saveMaterialStockLogs': 'material_stock_logs',
    'saveBOM': 'bom_products'
  };
  
  const sheetName = actionsMap[action];
  if (sheetName) {
    saveToSheet(ss, sheetName, data);
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  }
  
  return ContentService.createTextOutput("Action Not Found").setMimeType(ContentService.MimeType.TEXT);
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => { obj[header] = row[i]; });
    return obj;
  });
}

function saveToSheet(ss, sheetName, data) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  sheet.clear();
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  sheet.appendRow(headers);
  const rows = data.map(item => headers.map(header => item[header]));
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = {
    'products': ['product_id', 'nama_produk', 'kategori', 'sub_kategori', 'ukuran', 'warna', 'jenis_bahan', 'harga_jual', 'biaya_produksi', 'status', 'deskripsi', 'catatan_internal'],
    'categories': ['id', 'name', 'subCategories', 'availableSizes', 'availableColors', 'availableMaterials'],
    'variants': ['sku', 'product_id', 'ukuran', 'warna', 'jenis_bahan', 'harga_jual', 'harga_reseller', 'harga_dropship', 'stok_min', 'status', 'deskripsi'],
    'stocks': ['sku', 'warehouse_id', 'stok', 'hpp_aktual'],
    'stock_logs': ['tanggal', 'sku', 'from_wh', 'to_wh', 'qty', 'jenis', 'referensi', 'user', 'alasan'],
    'sales': ['invoice', 'tanggal', 'customer_id', 'customer_name', 'tipe_harga', 'total', 'dp', 'sisa', 'status', 'metode', 'warehouse_id', 'user'],
    'sales_items': ['invoice', 'sku', 'qty', 'harga', 'diskon', 'subtotal'],
    'payment_logs': ['id', 'invoice', 'tanggal', 'jumlah', 'metode', 'user'],
    'production_batches': ['batch_id', 'tanggal_mulai', 'target_selesai', 'status', 'current_stage', 'catatan', 'dest_warehouse_id'],
    'production_items': ['batch_id', 'sku', 'qty_rencana', 'qty_hasil', 'qty_rusak'],
    'product_costs': ['sku', 'kategori', 'komponen', 'qty', 'satuan', 'biaya'],
    'batch_costs': ['batch_id', 'kategori', 'komponen', 'qty', 'satuan', 'biaya'],
    'warehouses': ['warehouse_id', 'nama_gudang', 'lokasi', 'aktif'],
    'customers': ['customer_id', 'nama', 'tipe', 'hp', 'email', 'alamat', 'catatan'],
    'materials': ['material_id', 'nama_bahan', 'kategori', 'satuan', 'harga_rata2', 'aktif'],
    'material_stock': ['material_id', 'stok'],
    'material_stock_logs': ['tanggal', 'material_id', 'qty', 'jenis', 'referensi', 'catatan'],
    'bom_products': ['sku', 'material_id', 'qty_per_pcs']
  };
  
  for (const name in sheets) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headers = sheets[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#f3f3f3");
  }
}
