const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../List Kerja sama Fasilkom.xlsx');
const workbook = XLSX.readFile(filePath);

const statuses = new Set();
const sheetsToCheck = ['MOU', 'MOA PKS', 'IA'];

for (const sheetName of sheetsToCheck) {
  if (workbook.SheetNames.includes(sheetName)) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Find status column index from headers
    const headerRow = data[1] || [];
    let statusIdx = headerRow.findIndex(h => typeof h === 'string' && h.toLowerCase() === 'status');
    
    if (statusIdx !== -1) {
      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (row && row[statusIdx]) {
          statuses.add(String(row[statusIdx]).trim());
        }
      }
    }
  }
}

console.log('Unique statuses found:', Array.from(statuses));
