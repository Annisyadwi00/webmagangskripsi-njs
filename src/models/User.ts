import { DataTypes, Model } from 'sequelize';
import sequelize from '@/lib/db';

export type UserRole = 'Admin' | 'Mahasiswa' | 'Dosen';

class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: UserRole;
  declare nim_nidn: string;
  declare prodi: string | null;
  declare semester: string | null;
  declare kategori_dosen: string | null;
  declare kuota_bimbingan: number;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare phone: string | null;
  declare photo: string | null;
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
  type: DataTypes.ENUM('Admin', 'Super Admin', 'Mahasiswa', 'Dosen'),
  allowNull: false,
  defaultValue: 'Mahasiswa',
},
    nim_nidn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prodi: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'S1 Informatika',
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kategori_dosen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kuota_bimbingan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 0,
      },
    },
    phone: {
  type: DataTypes.STRING,
  allowNull: true,
},
photo: {
  type: DataTypes.TEXT('long'),
  allowNull: true,
},
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;