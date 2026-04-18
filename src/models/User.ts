import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: string;
  declare nim_nidn: string;
  declare prodi: string; // <--- INI YANG BARU
}

User.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Mahasiswa' },
  nim_nidn: { type: DataTypes.STRING, allowNull: false },
  prodi: { type: DataTypes.STRING, allowNull: true, defaultValue: 'S1 Informatika' } // Default
}, { sequelize, tableName: 'users', timestamps: true });

User.sync({ alter: true }); // Ini yang bakal otomatis nambahin kolom di MySQL kamu
export default User;