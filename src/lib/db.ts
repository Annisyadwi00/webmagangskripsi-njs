import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2'; 

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("⚠️ ERROR: DATABASE_URL di file .env tidak terbaca!");
}

const sequelize = new Sequelize(databaseUrl || 'mysql://root:@localhost:3306/db_magang', {
  dialect: 'mysql',
  dialectModule: mysql2, 
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi ke database Aiven BERHASIL!');
    isConnected = true;
  } catch (error) {
    console.error('❌ Tidak dapat terhubung ke database:', error);
    throw error;
  }
};

// FUNGSI BARU UNTUK SINKRONISASI DATABASE (DIPANGGIL HANYA JIKA PERLU)
export const syncDatabase = async () => {
  try {
    // Import semua model di sini agar Sequelize mengenali tabelnya
    await import('../models/User');
    await import('../models/Pengajuan');
    await import('../models/Logbook');
    await import('../models/Job');
    await import('../models/Feedback');

    await sequelize.sync({ alter: true });
    console.log('✅ Semua struktur tabel berhasil diperbarui (di-sync)!');
  } catch (error) {
    console.error('❌ Gagal melakukan sinkronisasi database:', error);
  }
};

export default sequelize;