import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type UserRole = 'Admin' | 'Super Admin' | 'Mahasiswa' | 'Dosen';

export type UserAttributes = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  nim_nidn: string;

  prodi: string | null;
  semester: string | null;
  angkatan: string | null;
  kelas: string | null;

  kategori_dosen: string | null;
  kuota_bimbingan: number | null;

  phone: string | null;
  photo: string | null;

  createdAt?: Date;
  updatedAt?: Date;
};

export type UserCreationAttributes = Optional<
  UserAttributes,
  | 'id'
  | 'prodi'
  | 'semester'
  | 'angkatan'
  | 'kelas'
  | 'kategori_dosen'
  | 'kuota_bimbingan'
  | 'phone'
  | 'photo'
  | 'createdAt'
  | 'updatedAt'
>;

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: UserRole;
  declare nim_nidn: string;

  declare prodi: string | null;
  declare semester: string | null;
  declare angkatan: string | null;
  declare kelas: string | null;

  declare kategori_dosen: string | null;
  declare kuota_bimbingan: number | null;

  declare phone: string | null;
  declare photo: string | null;

  declare createdAt: Date;
  declare updatedAt: Date;
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
      defaultValue: null,
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    angkatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kelas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kategori_dosen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kuota_bimbingan: {
      type: DataTypes.INTEGER,
      allowNull: true,
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