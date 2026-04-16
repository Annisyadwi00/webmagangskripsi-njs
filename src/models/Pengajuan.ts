import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Pengajuan extends Model {
  declare id: number;
  declare mahasiswaId: number;
  declare nama_mahasiswa: string;
  declare perusahaan: string;
  declare posisi: string;
  declare jenis_magang: string;
  
  declare link_ktm: string;
  declare link_ktp: string;
  declare link_cv: string;
  
  declare link_laporan_akhir: string | null;
  declare evaluasi_dari_mahasiswa: string | null;
  declare nilai_dari_dosen: string | null;
  
  declare dosenId: number | null;
  declare nama_dosen: string | null;
  declare status_dosen: string;
  
  declare status: string;
}

Pengajuan.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, // Dikembalikan ke UNSIGNED
      autoIncrement: true,
      primaryKey: true,
    },
    mahasiswaId: {
      type: DataTypes.INTEGER.UNSIGNED, // Dikembalikan ke UNSIGNED agar cocok dengan id User
      allowNull: false,
    },
    nama_mahasiswa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    perusahaan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    posisi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jenis_magang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link_ktm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link_ktp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link_cv: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link_laporan_akhir: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    evaluasi_dari_mahasiswa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nilai_dari_dosen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dosenId: {
      type: DataTypes.INTEGER.UNSIGNED, // Dikembalikan ke UNSIGNED agar cocok dengan id Dosen (User)
      allowNull: true,
    },
    nama_dosen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_dosen: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Menunggu',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending',
    },
  },
  {
    sequelize,
    tableName: 'pengajuan',
    timestamps: true,
  }
);

Pengajuan.sync({ force: true });

export default Pengajuan;