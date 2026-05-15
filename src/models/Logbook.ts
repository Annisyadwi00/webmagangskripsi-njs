import { DataTypes, Model } from 'sequelize';
import sequelize from '@/lib/db';

export type LogbookStatus = 'Menunggu' | 'Disetujui' | 'Revisi';

class Logbook extends Model {
  declare id: number;
  declare user_id: number;
  declare pengajuan_id: number;
  declare tanggal: string;
  declare kegiatan: string;
  declare jam_mulai: string;
  declare jam_selesai: string;
  declare bukti_kegiatan: string | null;
  declare status: LogbookStatus;
  declare komentar_dosen: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Logbook.init(
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
    pengajuan_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    kegiatan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    jam_mulai: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    jam_selesai: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    bukti_kegiatan: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    status: {
      type: DataTypes.ENUM('Menunggu', 'Disetujui', 'Revisi'),
      allowNull: false,
      defaultValue: 'Menunggu',
    },
    komentar_dosen: {
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

export default Logbook;