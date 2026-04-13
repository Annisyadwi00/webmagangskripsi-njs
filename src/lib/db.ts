import { Sequelize } from 'sequelize';

// Sesuaikan nama database, username, dan password MySQL kamu (XAMPP/Laragon)
const sequelize = new Sequelize('db_magang', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Ubah ke console.log jika ingin melihat query SQL yang berjalan
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Koneksi ke database MySQL berhasil!');
  } catch (error) {
    console.error('Tidak dapat terhubung ke database:', error);
  }
};

export default sequelize;