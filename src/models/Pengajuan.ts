import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Pengajuan extends Model {
  declare id: number;
  declare mahasiswaId: number;
  declare nama_mahasiswa: string;
  declare perusahaan: string;
  declare posisi: string;
  
  // DOKUMEN WAJIB BARU
  declare link_loa: string; 
  
  // HASIL VERIFIKASI ADMIN (Awalnya kosong)
  declare tipeKonversi: string | null;
  declare matkulKonversi: string | null; // Disimpan dalam bentuk JSON string (misal: "['Web', 'UI/UX']")
  
  declare link_laporan_akhir: string | null;
  declare nilai_dari_dosen: string | null;
  
  declare dosenId: number | null;
  declare nama_dosen: string | null;
  
  // 'Belum_Upload', 'Menunggu_Verifikasi', 'Pilih_Dosen', 'Aktif', 'Selesai'
  declare status: string; 
}

Pengajuan.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    mahasiswaId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    nama_mahasiswa: { type: DataTypes.STRING, allowNull: false },
    perusahaan: { type: DataTypes.STRING, allowNull: false },
    posisi: { type: DataTypes.STRING, allowNull: false },
    
    link_loa: { type: DataTypes.STRING, allowNull: false }, // Wajib diisi saat submit LOA
    
    tipeKonversi: { type: DataTypes.STRING, allowNull: true },
    matkulKonversi: { type: DataTypes.TEXT, allowNull: true },
    
    link_laporan_akhir: { type: DataTypes.STRING, allowNull: true },
    nilai_dari_dosen: { type: DataTypes.STRING, allowNull: true },
    
    dosenId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    nama_dosen: { type: DataTypes.STRING, allowNull: true },
    
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Menunggu_Verifikasi' },
  },
  { sequelize, tableName: 'pengajuan', timestamps: true }
);

Pengajuan.sync({ alter: true }); // Ubah jadi alter agar data lama tidak terhapus total
export default Pengajuan;