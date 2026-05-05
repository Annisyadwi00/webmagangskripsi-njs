import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('db_magang', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
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