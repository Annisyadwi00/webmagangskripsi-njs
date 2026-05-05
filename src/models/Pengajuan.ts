import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Pengajuan extends Model {
  declare id: number;
  declare user_id: number; 
  declare nama_mahasiswa: string;
  declare perusahaan: string;
  declare posisi: string;
  declare link_loa: string | null; 
  declare tipeKonversi: string | null;
  declare matkulKonversi: string | null; 
  declare link_laporan_akhir: string | null;
  declare nilai_dari_dosen: string | null;
  declare dosenId: number | null;
  declare nama_dosen: string | null;
  declare status: string; 
  declare status_dosen: string | null; // Kolom yang kelupaan dimasukkan
}

Pengajuan.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, 
    nama_mahasiswa: { type: DataTypes.STRING, allowNull: false },
    perusahaan: { type: DataTypes.STRING, allowNull: false },
    posisi: { type: DataTypes.STRING, allowNull: false },
    link_loa: { type: DataTypes.STRING, allowNull: true },
    tipeKonversi: { type: DataTypes.STRING, allowNull: true },
    matkulKonversi: { type: DataTypes.TEXT, allowNull: true },
    link_laporan_akhir: { type: DataTypes.STRING, allowNull: true },
    nilai_dari_dosen: { type: DataTypes.STRING, allowNull: true },
    dosenId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    nama_dosen: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Menunggu_Verifikasi' },
    status_dosen: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Menunggu' }, // Ditambahkan di sini
  },
  { sequelize, tableName: 'pengajuan', timestamps: true }
);

// Kita nyalakan sementara supaya MySQL kamu otomatis memasukkan status_dosen
Pengajuan.sync({ alter: true }).catch((err) => console.log("Pesan Sync:", err.message));

export default Pengajuan;