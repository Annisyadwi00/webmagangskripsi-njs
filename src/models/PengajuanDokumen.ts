import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type PengajuanDokumenStatus =
  | 'Menunggu'
  | 'Diproses'
  | 'Selesai'
  | 'Ditolak';

export type JenisDokumen =
  | 'Surat Permohonan Magang'
  | 'SK Dosen Pembimbing'
  | 'Surat Perpanjangan Magang'
  | 'Surat Keterangan Selesai Magang'
  | 'Implementation of Arrangement'
  | 'Laporan Pelaksanaan Kerja Sama'
  | 'Dokumen Nilai Akhir'
  | 'Lainnya';

export type PengajuanDokumenAttributes = {
  id: number;
  user_id: number;

  nama_mahasiswa: string;
  npm: string;
  program_studi: string;
  kelas: string;

  jenis_dokumen: JenisDokumen;
  keperluan: string;
  catatan_mahasiswa: string | null;

  status: PengajuanDokumenStatus;
  catatan_admin: string | null;
  link_dokumen: string | null;

  createdAt?: Date;
  updatedAt?: Date;
};

export type PengajuanDokumenCreationAttributes = Optional<
  PengajuanDokumenAttributes,
  'id' | 'status' | 'catatan_mahasiswa' | 'catatan_admin' | 'link_dokumen' | 'createdAt' | 'updatedAt'
>;

class PengajuanDokumen
  extends Model<
    PengajuanDokumenAttributes,
    PengajuanDokumenCreationAttributes
  >
  implements PengajuanDokumenAttributes
{
  declare id: number;
  declare user_id: number;

  declare nama_mahasiswa: string;
  declare npm: string;
  declare program_studi: string;
  declare kelas: string;

  declare jenis_dokumen: JenisDokumen;
  declare keperluan: string;
  declare catatan_mahasiswa: string | null;

  declare status: PengajuanDokumenStatus;
  declare catatan_admin: string | null;
  declare link_dokumen: string | null;

  declare createdAt: Date;
  declare updatedAt: Date;
}

PengajuanDokumen.init(
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

    nama_mahasiswa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    npm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    program_studi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kelas: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    jenis_dokumen: {
      type: DataTypes.ENUM(
        'Surat Permohonan Magang',
        'SK Dosen Pembimbing',
        'Surat Perpanjangan Magang',
        'Surat Keterangan Selesai Magang',
        'Implementation of Arrangement',
        'Laporan Pelaksanaan Kerja Sama',
        'Dokumen Nilai Akhir',
        'Lainnya'
      ),
      allowNull: false,
    },
    keperluan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    catatan_mahasiswa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('Menunggu', 'Diproses', 'Selesai', 'Ditolak'),
      allowNull: false,
      defaultValue: 'Menunggu',
    },
    catatan_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link_dokumen: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'pengajuan_dokumen',
    timestamps: true,
  }
);

export default PengajuanDokumen;