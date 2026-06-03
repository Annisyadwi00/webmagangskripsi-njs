import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type ActivityLogAction =
  | 'CREATE_PENGAJUAN'
  | 'BATAL_PENGAJUAN'
  | 'SETUJUI_PENGAJUAN'
  | 'TOLAK_PENGAJUAN'
  | 'PILIH_DOSEN'
  | 'TERIMA_BIMBINGAN'
  | 'TOLAK_BIMBINGAN'
  | 'CREATE_LOGBOOK'
  | 'UPDATE_LOGBOOK'
  | 'EVALUASI_LOGBOOK'
  | 'UPLOAD_LAPORAN_AKHIR'
  | 'BERI_NILAI'
  | 'UPDATE_PROFILE'
  | 'UPDATE_PASSWORD'
  | 'CREATE_PENGAJUAN_MITRA'
  | 'VERIFIKASI_PENGAJUAN_MITRA';

type ActivityLogAttributes = {
  id: number;
  user_id: number | null;
  name: string | null;
  role: string | null;
  action: ActivityLogAction;
  description: string;
  target_id: number | null;
  target_type: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type ActivityLogCreationAttributes = Optional<
  ActivityLogAttributes,
  'id' | 'user_id' | 'name' | 'role' | 'target_id' | 'target_type'
>;

class ActivityLog
  extends Model<ActivityLogAttributes, ActivityLogCreationAttributes>
  implements ActivityLogAttributes
{
  public id!: number;
  public user_id!: number | null;
  public name!: string | null;
  public role!: string | null;
  public action!: ActivityLogAction;
  public description!: string;
  public target_id!: number | null;
  public target_type!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    target_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    timestamps: true,
  }
);

export default ActivityLog;