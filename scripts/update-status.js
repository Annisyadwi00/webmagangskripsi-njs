require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');
const XLSX = require('xlsx');
const path = require('path');

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found');
    return;
  }
  const connection = await mysql.createConnection({
    uri: databaseUrl,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
  
  const filePath = path.join(__dirname, '../List Kerja sama Fasilkom.xlsx');
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  
  const mitraStatus = new Map(); // nama -> boolean (true if active)

  function parseDate(val) {
    if (!val) return null;
    if (val instanceof Date) return val;
    // Try to parse string
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
    return null;
  }

  function isActiveDate(val) {
    if (!val) return true; // If no end date specified, assume active unless status says otherwise
    const d = parseDate(val);
    if (!d) return true;
    return d.getTime() > Date.now();
  }

  function isActiveStatusStr(val) {
    if (!val) return null; // unknown
    const s = String(val).toLowerCase();
    if (s.includes('kadaluarsa') || s.includes('berakhir') || s.includes('batal')) return false;
    if (s.includes('berjalan') || s.includes('selesai')) return true; // 'selesai' context might mean the agreement is done, but maybe active?
    return null;
  }

  function processRow(nama, endDate, statusStr) {
    if (!nama) return;
    let n = String(nama).replace(/\(batal\)/gi, '').trim();
    if (!n) return;

    let isActive = false;
    
    // Explicit string status check
    const explicitStatus = isActiveStatusStr(statusStr);
    if (explicitStatus === false) {
      isActive = false;
    } else {
      // Date check
      isActive = isActiveDate(endDate);
    }

    // If it's already active, don't downgrade to inactive (because another MoA might be active)
    if (!mitraStatus.has(n)) {
      mitraStatus.set(n, isActive);
    } else {
      if (isActive) mitraStatus.set(n, true);
    }
  }

  // Parse MOA PKS
  if (workbook.SheetNames.includes('MOA PKS')) {
    const sheet = workbook.Sheets['MOA PKS'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[6]) continue;
      processRow(row[6], row[14], row[11]); // nama, tanggal berakhir, status
    }
  }

  // Parse IA
  if (workbook.SheetNames.includes('IA')) {
    const sheet = workbook.Sheets['IA'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[7]) continue;
      processRow(row[7], row[13], row[9]); 
    }
  }

  // Parse MOU
  if (workbook.SheetNames.includes('MOU')) {
    const sheet = workbook.Sheets['MOU'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[5]) continue;
      processRow(row[5], row[10], row[7]); 
    }
  }

  // Parse Progress Genap
  if (workbook.SheetNames.includes('Progress Genap 2526')) {
    const sheet = workbook.Sheets['Progress Genap 2526'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;
      // Kolom status ada di idx 2 "Status Kerjasama"
      processRow(row[0], null, row[2]); 
    }
  }

  // For CalonMitra, if they don't exist in the map yet, they are implicitly inactive (because no active agreement)
  if (workbook.SheetNames.includes('CalonMitra')) {
    const sheet = workbook.Sheets['CalonMitra'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;
      let n = String(row[0]).replace(/\(batal\)/gi, '').trim();
      if (n && !mitraStatus.has(n)) {
        mitraStatus.set(n, false); // Calon is not active until signed
      }
    }
  }

  console.log(`Found ${mitraStatus.size} companies to update status.`);
  
  let updatedAktif = 0;
  let updatedNonaktif = 0;

  for (const [nama, isActive] of mitraStatus.entries()) {
    const statusVal = isActive ? 'Aktif' : 'Nonaktif';
    const [result] = await connection.execute(
      'UPDATE mitra SET status = ? WHERE nama_mitra = ?',
      [statusVal, nama]
    );
    if (result.affectedRows > 0) {
      if (isActive) updatedAktif++;
      else updatedNonaktif++;
    }
  }

  // If there are companies in DB that are not in Excel, set them to Nonaktif? No, leave them alone.

  console.log(`Updated: ${updatedAktif} Aktif, ${updatedNonaktif} Nonaktif.`);
  await connection.end();
}

run().catch(console.error);
