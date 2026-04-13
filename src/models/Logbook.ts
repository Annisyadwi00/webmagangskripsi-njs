import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Logbook extends Model {
  declare id: number;
  declare mahasiswaId: number;
  declare tanggal: Date;
  declare jam_kerja: number;
  declare kegiatan: string;
  declare link_dokumen: string;
  declare status: 'Pending' | 'Disetujui' | 'Ditolak';
  declare feedback: string | null; // Komentar dari dosen
}

Logbook.init(
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
    tanggal: {
      type: DataTypes.DATEONLY, // Hanya tanggal (YYYY-MM-DD)
      allowNull: false,
    },
    jam_kerja: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kegiatan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link_dokumen: {
      type: DataTypes.STRING,
      allowNull: false, // Sesuai desain form kamu, mahasiswa wajib isi link PDF
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Disetujui', 'Ditolak'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'logbook',
    timestamps: true,
  }
);

Logbook.sync({ alter: true });

export default Logbook;