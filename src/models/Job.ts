import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Job extends Model {
  declare id: number;
  declare title: string;
  declare company: string;
  declare description: string;
  declare location: string; // Tempat Magang
  declare type: string; // Onsite / Hybrid / Remote
  declare isKonversi: boolean; // Konversi / Tidak
  declare isPaid: boolean; // Paid / Unpaid
  declare valid_until: Date | null; // Tersedia sampai kapan
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
  isKonversi: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  isPaid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  valid_until: { type: DataTypes.DATE, allowNull: true },
  kuota: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  link_pendaftaran: { type: DataTypes.STRING, allowNull: true },
  email_perusahaan: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Aktif' }
}, { sequelize, tableName: 'jobs', timestamps: true });

Job.sync({ alter: true });
export default Job;