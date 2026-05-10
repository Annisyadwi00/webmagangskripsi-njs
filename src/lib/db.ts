import { Sequelize } from 'sequelize';

// Mengambil URL database dari environment variable (.env / Vercel settings)
// Format URL Aiven: mysql://user:password@host:port/defaultdb
const databaseUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/db_magang';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    // Aiven mewajibkan koneksi menggunakan SSL
    // Cek apakah ini berjalan di production/Aiven dengan melihat keberadaan DATABASE_URL
    ...(process.env.DATABASE_URL && {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    })
  }
});

let isConnected = false; // ← flag supaya hanya connect sekali

export const connectDB = async () => {
  if (isConnected) return; // ← kalau sudah konek, skip
  
  try {
    await sequelize.authenticate();
    console.log('Koneksi ke database MySQL berhasil!');
    isConnected = true;
  } catch (error) {
    console.error('Tidak dapat terhubung ke database:', error);
    throw error;
  }
};

export default sequelize;