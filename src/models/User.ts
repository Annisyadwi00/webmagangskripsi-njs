import { DataTypes, Model } from 'sequelize';
import sequelize from '@/lib/db'; // sesuaikan path import kamu

class User extends Model {
  declare id: number;
  declare name: string;
  declare identifier: string;
  declare email: string;
  declare phone: string;
  declare password: string;
  declare role: 'Mahasiswa' | 'Dosen' | 'Admin';
  
  // TAMBAHKAN 3 BARIS INI UNTUK PROFIL MAHASISWA
  declare link_ktm: string | null;
  declare link_ktp: string | null;
  declare link_cv: string | null;
}

User.init(
  // ... (kode bagian init ini biarkan saja, tidak perlu diubah) ...
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Tidak boleh ada NIM/NIDN yang sama
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('Mahasiswa', 'Dosen', 'Admin'),
      allowNull: false,
      defaultValue: 'Mahasiswa',
    },
    link_ktm: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  link_ktp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  link_cv: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true, // Otomatis membuat createdAt dan updatedAt
  }
);

// Sinkronisasi model dengan database (Otomatis membuat tabel jika belum ada)
User.sync({ alter: true });

export default User;