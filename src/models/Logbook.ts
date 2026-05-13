import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Logbook extends Model {
  declare id: number;
  declare user_id: number;
  declare pengajuan_id: number;
  declare tanggal: string;
  declare kegiatan: string;
  declare jam_mulai: string;
  declare jam_selesai: string;
  declare bukti_kegiatan: string | null;
  
  // --- DUA KOLOM BARU UNTUK FITUR REVISI ---
  declare status: string; 
  declare komentar_dosen: string | null;
}

Logbook.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    pengajuan_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    tanggal: { type: DataTypes.DATEONLY, allowNull: false },
    kegiatan: { type: DataTypes.TEXT, allowNull: false },
    jam_mulai: { type: DataTypes.TIME, allowNull: false },
    jam_selesai: { type: DataTypes.TIME, allowNull: false },
    bukti_kegiatan: { type: DataTypes.STRING, allowNull: true },
    
    // --- PENAMBAHAN KOLOM ---
    status: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      defaultValue: 'Menunggu' // Status: Menunggu, Disetujui, Revisi
    },
    komentar_dosen: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
  },
  { 
    sequelize, 
    tableName: 'logbook', 
    timestamps: true 
  }
);


export default Logbook;