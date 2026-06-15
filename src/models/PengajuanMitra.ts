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
  email_perusahaan: string | null;

  lokasi: string | null;
  sistem_kerja: string | null;
  kuota: number | null;
  link_pendaftaran: string | null;
  deskripsi_lowongan: string | null;
  persyaratan: string | null;

  link_akta_pendirian: string | null;
  link_akta_direksi: string | null;
  link_ktp_penandatangan: string | null;
  link_npwp: string | null;
  link_izin_usaha: string | null;

  nama_mahasiswa_pengusul: string;
  npm_mahasiswa_pengusul: string;
  program_studi_mahasiswa: string;
  angkatan_mahasiswa: string;
  kontak_mahasiswa: string;
  kelas: string;

  latitude: number | null;
  longitude: number | null;

  status: PengajuanMitraStatus;
  catatan_admin: string | null;

  createdAt?: Date;
  updatedAt?: Date;
};

export type PengajuanMitraCreationAttributes = Optional<
  PengajuanMitraAttributes,
  | 'id'
  | 'url_mitra'
  | 'email_perusahaan'
  | 'lokasi'
  | 'sistem_kerja'
  | 'kuota'
  | 'link_pendaftaran'
  | 'deskripsi_lowongan'
  | 'persyaratan'
  | 'link_akta_pendirian'
  | 'link_akta_direksi'
  | 'link_ktp_penandatangan'
  | 'link_npwp'
  | 'link_izin_usaha'
  | 'latitude'
  | 'longitude'
  | 'status'
  | 'catatan_admin'
  | 'createdAt'
  | 'updatedAt'
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
  declare email_perusahaan: string | null;

  declare lokasi: string | null;
  declare sistem_kerja: string | null;
  declare kuota: number | null;
  declare link_pendaftaran: string | null;
  declare deskripsi_lowongan: string | null;
  declare persyaratan: string | null;

  declare link_akta_pendirian: string | null;
  declare link_akta_direksi: string | null;
  declare link_ktp_penandatangan: string | null;
  declare link_npwp: string | null;
  declare link_izin_usaha: string | null;

  declare nama_mahasiswa_pengusul: string;
  declare npm_mahasiswa_pengusul: string;
  declare program_studi_mahasiswa: string;
  declare angkatan_mahasiswa: string;
  declare kontak_mahasiswa: string;
  declare kelas: string;

  declare latitude: number | null;
  declare longitude: number | null;

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
    email_perusahaan: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    lokasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sistem_kerja: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kuota: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    link_pendaftaran: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deskripsi_lowongan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    persyaratan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    link_akta_pendirian: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link_akta_direksi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link_ktp_penandatangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link_npwp: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link_izin_usaha: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
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