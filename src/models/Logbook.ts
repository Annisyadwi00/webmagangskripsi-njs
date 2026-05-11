import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';
import tailwindConfig from '../../tailwind.config';

class Logbook extends Model {
  declare id: number;
  declare mahasiswaId: number;
  declare judul: string; // <-- KOLOM BARU
  declare tanggal: string;
  declare jam_kerja: number | null;
  declare kegiatan: string;
  declare link_dokumen: string | null;
  declare status: string;
  declare feedback: string | null;
}

Logbook.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    mahasiswaId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    judul: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Logbook Harian' },
    tanggal: { type: DataTypes.DATEONLY, allowNull: false },
    jam_kerja: { type: DataTypes.INTEGER, allowNull: true },
    kegiatan: { type: DataTypes.STRING, allowNull: false },
    link_dokumen: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('Pending', 'Disetujui', 'Ditolak', 'Revisi'), allowNull: false, defaultValue: 'Pending' },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    catatan_dosen: { type: DataTypes.TEXT, allowNull: true },
    nilai: { type: DataTypes.INTEGER, allowNull: true } // <--- Menggunakan huruf kecil "true"
  },
  {
    sequelize,
    tableName: 'logbook',
    timestamps: true
  }
);

export default Logbook;


