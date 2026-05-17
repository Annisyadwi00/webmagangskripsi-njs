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

  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi ke database berhasil.');
    isConnected = true;
  } catch (error) {
    console.error('❌ Tidak dapat terhubung ke database:', error);
    throw error;
  }
};

export const syncDatabase = async () => {
  try {
    await import('@/models/User');
    await import('@/models/Pengajuan');
    await import('@/models/Logbook');
    await import('@/models/Job');
    await import('@/models/Feedback');
    await import('@/models/ActivityLog');

    await sequelize.sync({ alter: true });

    console.log('✅ Struktur tabel berhasil disinkronkan.');
  } catch (error) {
    console.error('❌ Gagal melakukan sinkronisasi database:', error);
    throw error;
  }
};

export default sequelize;