import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Feedback extends Model {
  declare id: number;
  declare nama: string;
  declare email: string;
  declare pesan: string;
  declare status: string;
}

Feedback.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  nama: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  pesan: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Unread' },
}, { sequelize, tableName: 'feedbacks', timestamps: true });

Feedback.sync({ alter: true });
export default Feedback;