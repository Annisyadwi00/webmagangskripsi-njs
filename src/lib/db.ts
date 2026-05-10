import { Sequelize } from 'sequelize';

// Membaca URL dari .env
const databaseUrl = process.env.DATABASE_URL;

// Jika .env tidak terbaca, aplikasi akan langsung memberi tahu
if (!databaseUrl) {
  console.error("⚠️ ERROR: DATABASE_URL di file .env tidak terbaca!");
}

const sequelize = new Sequelize(databaseUrl || 'mysql://root:@localhost:3306/db_magang', {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    // Memaksa penggunaan SSL untuk Aiven
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

export default sequelize;