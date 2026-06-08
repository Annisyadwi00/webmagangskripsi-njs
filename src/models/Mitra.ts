import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type MitraStatus = 'Aktif' | 'Nonaktif';

export type MitraAttributes = {
  id: number;
  nama_mitra: string;
  logo: string | null;
  alamat: string | null;
  kontak_wa: string | null;
  email: string | null;
  website: string | null;
  deskripsi: string | null;
  status: MitraStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MitraCreationAttributes = Optional<
  MitraAttributes,
  | 'id'
  | 'logo'
  | 'alamat'
  | 'kontak_wa'
  | 'email'
  | 'website'
  | 'deskripsi'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
>;

class Mitra
  extends Model<MitraAttributes, MitraCreationAttributes>
  implements MitraAttributes
{
  declare id: number;
  declare nama_mitra: string;
  declare logo: string | null;
  declare alamat: string | null;
  declare kontak_wa: string | null;
  declare email: string | null;
  declare website: string | null;
  declare deskripsi: string | null;
  declare status: MitraStatus;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Mitra.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_mitra: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kontak_wa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Aktif', 'Nonaktif'),
      allowNull: false,
      defaultValue: 'Aktif',
    },
  },
  {
    sequelize,
    tableName: 'mitra',
    timestamps: true,
  }
);

export default Mitra;