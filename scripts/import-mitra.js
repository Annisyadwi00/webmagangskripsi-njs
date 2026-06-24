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
  const workbook = XLSX.readFile(filePath);
  
  const mitraMap = new Map(); // name -> data
  
  function cleanPhone(phone) {
    if (!phone) return null;
    let p = String(phone).replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.substring(1);
    if (!p.startsWith('62')) p = '62' + p;
    // ensure valid length
    if (p.length < 9 || p.length > 15) return null;
    return p;
  }
  
  function cleanEmail(email) {
    if (!email) return null;
    const e = String(email).trim().split(/[\s,;]/)[0];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e) ? e : null;
  }

  function addOrMerge(nama, kontak, email) {
    if (!nama) return;
    // Bersihkan nama PT (misalnya hapus "(batal)", dll jika perlu)
    let n = nama.replace(/\(batal\)/gi, '').trim();
    if (!n) return;

    if (!mitraMap.has(n)) {
      mitraMap.set(n, { nama: n, kontak, email });
    } else {
      const existing = mitraMap.get(n);
      if (!existing.kontak && kontak) existing.kontak = kontak;
      if (!existing.email && email) existing.email = email;
    }
  }

  // Parse CalonMitra
  if (workbook.SheetNames.includes('CalonMitra')) {
    const sheet = workbook.Sheets['CalonMitra'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;
      addOrMerge(String(row[0]), cleanPhone(row[2]), cleanEmail(row[3]));
    }
  }

  // Parse MOA PKS
  if (workbook.SheetNames.includes('MOA PKS')) {
    const sheet = workbook.Sheets['MOA PKS'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[6]) continue;
      addOrMerge(String(row[6]), cleanPhone(row[8]), cleanEmail(row[9]));
    }
  }

  // Parse IA
  if (workbook.SheetNames.includes('IA')) {
    const sheet = workbook.Sheets['IA'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[7]) continue;
      // Kolom kontak dan email di IA mungkin tidak ada, atau ada di index berbeda. Kita ambil namanya saja.
      addOrMerge(String(row[7]), null, null);
    }
  }

  // Progress Genap 2526
  if (workbook.SheetNames.includes('Progress Genap 2526')) {
    const sheet = workbook.Sheets['Progress Genap 2526'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;
      addOrMerge(String(row[0]), cleanPhone(row[26]), null);
    }
  }

  console.log(`Found ${mitraMap.size} unique companies. Inserting...`);
  let inserted = 0;
  for (const mitra of mitraMap.values()) {
    // check if exists
    const [rows] = await connection.execute('SELECT id FROM mitra WHERE nama_mitra = ?', [mitra.nama]);
    if (rows.length === 0) {
      await connection.execute(
        'INSERT INTO mitra (nama_mitra, kontak_wa, email, alamat, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [mitra.nama, mitra.kontak || null, mitra.email || null, '-', 'Aktif']
      );
      inserted++;
    }
  }
  
  console.log(`Inserted ${inserted} new companies.`);
  await connection.end();
}

run().catch(console.error);
