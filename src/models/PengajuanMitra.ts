import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type PengajuanMitraStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type PengajuanMitraAttributes = {
  id: number;
  user_id: number;

  nama_mitra: string;
  alamat_kantor_mitra: string;
  url_mitra: string | null;
  nama_narahubung_mitra: string;
  kontak_narahubung_mitra: string;

  nama_mahasiswa_pengusul: string;
  npm_mahasiswa_pengusul: string;
  program_studi_mahasiswa: string;
  angkatan_mahasiswa: string;
  kontak_mahasiswa: string;
  kelas: string;

  status: PengajuanMitraStatus;
  catatan_admin: string | null;

  createdAt?: Date;
  updatedAt?: Date;
};

export type PengajuanMitraCreationAttributes = Optional<
  PengajuanMitraAttributes,
  'id' | 'url_mitra' | 'status' | 'catatan_admin' | 'createdAt' | 'updatedAt'
>;

class PengajuanMitra
  extends Model<PengajuanMitraAttributes, PengajuanMitraCreationAttributes>
  implements PengajuanMitraAttributes
{
  declare id: number;
  declare user_id: number;

  declare nama_mitra: string;
  declare alamat_kantor_mitra: string;
  declare url_mitra: string | null;
  declare nama_narahubung_mitra: string;
  declare kontak_narahubung_mitra: string;

  declare nama_mahasiswa_pengusul: string;
  declare npm_mahasiswa_pengusul: string;
  declare program_studi_mahasiswa: string;
  declare angkatan_mahasiswa: string;
  declare kontak_mahasiswa: string;
  declare kelas: string;

  declare status: PengajuanMitraStatus;
  declare catatan_admin: string | null;

  declare createdAt: Date;
  declare updatedAt: Date;
}

PengajuanMitra.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    nama_mitra: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alamat_kantor_mitra: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url_mitra: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nama_narahubung_mitra: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kontak_narahubung_mitra: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    nama_mahasiswa_pengusul: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    npm_mahasiswa_pengusul: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    program_studi_mahasiswa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    angkatan_mahasiswa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kontak_mahasiswa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kelas: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('Menunggu', 'Disetujui', 'Ditolak'),
      allowNull: false,
      defaultValue: 'Menunggu',
    },
    catatan_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'pengajuan_mitra',
    timestamps: true,
  }
);

export default PengajuanMitra;