import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Pengajuan extends Model {
  declare id: number;
  declare mahasiswaId: number; // Relasi ke tabel User
  declare nama_mahasiswa: string;
  declare perusahaan: string;
  declare posisi: string;
  declare jenis_magang: 'Konversi' | 'Non-Konversi';
  declare link_dokumen: string;
  declare dosenPembimbingId: number | null; // Relasi ke tabel User (Dosen), bisa null di awal
  declare status: 'Pending' | 'Disetujui' | 'Ditolak';
}

Pengajuan.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    mahasiswaId: {
      type: DataTypes.INTEGER.UNSIGNED,
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
      type: DataTypes.ENUM('Konversi', 'Non-Konversi'),
      allowNull: false,
    },
    link_dokumen: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dosenPembimbingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true, // Kosong saat baru daftar, nanti diisi oleh Admin/Dosen
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Disetujui', 'Ditolak'),
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

Pengajuan.sync({ alter: true });

export default Pengajuan;