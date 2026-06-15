import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

// Atribut lengkap untuk Upload
export type UploadAttributes = {
  id: number;
  user_id: number; // integer, sesuai user.id (asumsi integer)
  nama_file: string;
  path_file: string;
  tipe_file: string;
  ukuran_file: number | null;
  terkait_dengan: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

// Atribut yang opsional saat membuat
export type UploadCreationAttributes = Optional<
  UploadAttributes,
  'id' | 'ukuran_file' | 'terkait_dengan' | 'createdAt' | 'updatedAt'
>;

class Upload extends Model<UploadAttributes, UploadCreationAttributes> implements UploadAttributes {
  declare id: number;
  declare user_id: number;
  declare nama_file: string;
  declare path_file: string;
  declare tipe_file: string;
  declare ukuran_file: number | null;
  declare terkait_dengan: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Upload.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      // referensi ke tabel users (jika ada)
      // references: { model: 'users', key: 'id' },
      // onDelete: 'CASCADE',
    },
    nama_file: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    path_file: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    tipe_file: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'application/pdf',
    },
    ukuran_file: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    terkait_dengan: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'uploads',
    timestamps: true,       // otomatis createdAt & updatedAt (camelCase)
    // underscored: false, sudah default
    indexes: [
      { fields: ['user_id'] },
    ],
  }
);

export default Upload;