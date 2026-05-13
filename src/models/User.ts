import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: string;
  declare nim_nidn: string;
  declare prodi: string;
  declare semester: string | null;
  declare kategori_dosen: string | null; 
  declare kuota_bimbingan: number; // DITAMBAHKAN
}

User.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Mahasiswa' },
  nim_nidn: { type: DataTypes.STRING, allowNull: false },
  semester: { type: DataTypes.STRING, allowNull: true },
  kategori_dosen: { type: DataTypes.STRING, allowNull: true },
  kuota_bimbingan: {  type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  prodi: { type: DataTypes.STRING, allowNull: true, defaultValue: 'S1 Informatika' } 
}, { sequelize, tableName: 'users', timestamps: true });

// PANGGILAN .sync() DIHAPUS DARI SINI
export default User;