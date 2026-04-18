import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Job extends Model {
  declare id: number;
  declare title: string;
  declare company: string;
  declare description: string;
  declare location: string;
  declare type: string; // Onsite / Hybrid / Remote
  declare tipeKonversi: string; // BARU: Full / Parsial / Tidak
  declare kategori: string; // BARU: Frontend, Backend, dll
  declare isPaid: boolean;
  declare valid_until: Date | null;
  declare kuota: number;
  declare link_pendaftaran: string | null;
  declare email_perusahaan: string | null;
  declare status: string;
}

Job.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Menyesuaikan' },
  type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Onsite' },
  tipeKonversi: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Full' },
  kategori: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Umum' },
  isPaid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  valid_until: { type: DataTypes.DATE, allowNull: true },
  kuota: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  link_pendaftaran: { type: DataTypes.STRING, allowNull: true },
  email_perusahaan: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Aktif' }
}, { sequelize, tableName: 'jobs', timestamps: true });

// alter: true akan otomatis mengubah tabel yang sudah ada tanpa menghapus data
Job.sync({ alter: true });
export default Job;