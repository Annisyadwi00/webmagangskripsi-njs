import { google } from 'googleapis';
import * as readline from 'readline';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const redirectUri = 'http://localhost:3000/api/auth/callback/google'; // Bisa juga diset ke 'urn:ietf:wg:oauth:2.0:oob' jika tipe aplikasinya Desktop

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

console.log('--- CARA MENDAPATKAN REFRESH TOKEN BARU ---');
console.log('1. Buka URL berikut di browser Anda:');
console.log('\n', authUrl, '\n');
console.log('2. Login dan berikan izin ke aplikasi Anda.');
console.log('3. Anda akan diarahkan ke sebuah halaman (mungkin Error / Not Found di localhost), abaikan errornya.');
console.log('4. Perhatikan URL di address bar browser Anda. Akan ada parameter "?code=......."');
console.log('5. Copy kode tersebut (semua karakter SETELAH "code=" dan SEBELUM tanda "&" jika ada).');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nTempelkan (Paste) kode yang Anda dapatkan di sini: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\nBerhasil! Ini adalah REFRESH TOKEN baru Anda:');
    console.log('\n========================================');
    console.log(tokens.refresh_token);
    console.log('========================================\n');
    console.log('Silakan copy refresh token di atas dan simpan di file .env dan .env.local Anda pada variabel GOOGLE_DRIVE_REFRESH_TOKEN.');
    console.log('\nCATATAN PENTING:');
    console.log('Jika aplikasi Google Cloud Anda masih berstatus "Testing", refresh token ini akan kembali kadaluarsa dalam 7 hari.');
    console.log('Untuk mencegahnya kadaluarsa lagi, buka Google Cloud Console -> APIs & Services -> OAuth consent screen -> Klik tombol "PUBLISH APP" untuk mengubah statusnya menjadi "In production".');
  } catch (error) {
    console.error('\nGagal mendapatkan token:', error);
  }
  rl.close();
});
