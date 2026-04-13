import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';

class Job extends Model {
  declare id: number;
  declare title: string;
  declare company: string;
  declare description: string;
  declare location: string;
  declare type: string; // Onsite, Remote, Hybrid
  declare isKonversi: boolean;
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
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Hybrid',
    },
    isKonversi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'jobs',
    timestamps: true,
  }
);

Job.sync({ alter: true });

export default Job;


