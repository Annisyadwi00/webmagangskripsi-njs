require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'ADA' : 'KOSONG');
console.log('DB_SSL:', process.env.DB_SSL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'ADA' : 'KOSONG');