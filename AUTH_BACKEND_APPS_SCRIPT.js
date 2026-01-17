
/**
 * MasterProduk AUTH Backend Script (Spreadsheet B)
 * Salin skrip ini ke Apps Script yang terhubung dengan Spreadsheet B.
 */

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getUsers') {
    const data = {
      users: getSheetData(ss, 'users')
    };
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Test connection
  if (action === 'test') {
    return ContentService.createTextOutput("Auth Backend OK").setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  const postData = JSON.parse(e.postData.contents);
  const action = postData.action;
  const data = postData.data;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'saveUsers') {
    saveToSheet(ss, 'users', data);
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

function setupAuthDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = {
    'users': ['uid', 'nama', 'email', 'password', 'role', 'status', 'last_login']
  };
  
  for (const name in sheets) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headers = sheets[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#f3f3f3");
  }
  
  // Inisialisasi Super Admin Default jika kosong
  let userSheet = ss.getSheetByName('users');
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow(['USR-ROOT', 'Owner', 'admin@master.com', 'admin123', 'SUPER_ADMIN', 'AKTIF', '']);
  }
}
