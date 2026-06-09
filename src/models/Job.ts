import { DataTypes, Model } from 'sequelize';
import sequelize from '@/lib/db';

export type JobType = 'Onsite' | 'Hybrid' | 'Remote';

export type JobTipeKonversi =
  | 'Konversi 20 SKS'
  | 'Tidak Konversi'
  | 'Magang 2 SKS Khusus SI';

export type JobStatus = 'Aktif' | 'Nonaktif';

class Job extends Model {
  declare id: number;
  declare title: string;
  declare company: string;
  declare description: string;
  declare location: string;
  declare type: JobType;
  declare tipeKonversi: JobTipeKonversi;
  declare kategori: string;
  declare isPaid: boolean;
  declare valid_until: Date | null;
  declare kuota: number;
  declare link_pendaftaran: string | null;
  declare email_perusahaan: string | null;
  declare status: JobStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Menyesuaikan',
    },
    type: {
      type: DataTypes.ENUM('Onsite', 'Hybrid', 'Remote'),
      allowNull: false,
      defaultValue: 'Onsite',
    },
   tipeKonversi: {
  type: DataTypes.ENUM(
    'Konversi 20 SKS',
    'Tidak Konversi',
    'Magang 2 SKS Khusus SI'
  ),
  allowNull: false,
},
    kategori: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Umum',
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    kuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    link_pendaftaran: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    email_perusahaan: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM('Aktif', 'Nonaktif'),
      allowNull: false,
      defaultValue: 'Aktif',
    },
  },
  {
    sequelize,
    tableName: 'jobs',
    timestamps: true,
  }
);

export default Job;