import { DataTypes, Model } from 'sequelize';
import sequelize from '@/lib/db';

export type FeedbackStatus = 'Unread' | 'Read';

class Feedback extends Model {
  declare id: number;
  declare nama: string;
  declare email: string;
  declare pesan: string;
  declare status: FeedbackStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Feedback.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Unread', 'Read'),
      allowNull: false,
      defaultValue: 'Unread',
    },
  },
  {
    sequelize,
    tableName: 'feedbacks',
    timestamps: true,
  }
);

export default Feedback;