import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type IndikatorTipe = 'dospem' | 'penguji' | 'mitra';

export type IndikatorPenilaianAttributes = {
  id: number;
  tipe: IndikatorTipe | string;
  kode: string;
  label: string;
  bobot: number;
  urutan: number;
  aktif: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IndikatorPenilaianCreationAttributes = Optional<
  IndikatorPenilaianAttributes,
  'id' | 'bobot' | 'urutan' | 'aktif' | 'createdAt' | 'updatedAt'
>;

class IndikatorPenilaian
  extends Model<IndikatorPenilaianAttributes, IndikatorPenilaianCreationAttributes>
  implements IndikatorPenilaianAttributes
{
  declare id: number;
  declare tipe: IndikatorTipe | string;
  declare kode: string;
  declare label: string;
  declare bobot: number;
  declare urutan: number;
  declare aktif: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

IndikatorPenilaian.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    tipe: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'dospem',
    },
    kode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bobot: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    urutan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    aktif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'indikator_penilaian',
    timestamps: true,
    indexes: [
      { fields: ['tipe'] },
      { fields: ['kode'] },
    ],
  }
);

export default IndikatorPenilaian;
