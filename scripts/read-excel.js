const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../List Kerja sama Fasilkom.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('--- SHEET NAMES ---');
console.log(workbook.SheetNames);

// Read from the second sheet (or third, etc.)
for (let i = 1; i < workbook.SheetNames.length; i++) {
  const sheetName = workbook.SheetNames[i];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('\n--- SHEET:', sheetName, '---');
  console.log('Headers:', data[0]);
  console.log('Row 1:', data[1]);
  console.log('Row 2:', data[2]);
}
