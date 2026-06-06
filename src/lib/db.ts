import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL belum dikonfigurasi di file .env.');
}

const useSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  dialectModule: mysql2,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: useSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  await sequelize.authenticate();
  console.log('✅ Koneksi ke database berhasil.');
  isConnected = true;
};

export const syncDatabase = async () => {
  await import('@/models/User');
  await import('@/models/Job');
  await import('@/models/Pengajuan');
  await import('@/models/PengajuanMitra');
  await import('@/models/PengajuanLowongan');
  await import('@/models/ActivityLog');

  await sequelize.sync({ alter: true });

  console.log('✅ Struktur tabel berhasil disinkronkan.');
};

export default sequelize;