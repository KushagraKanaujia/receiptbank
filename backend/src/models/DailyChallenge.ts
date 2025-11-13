import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';

interface DailyChallengeAttributes {
  id: string;
  userId: string;
  challengeType: string;
  title: string;
  description?: string;
  targetCount: number;
  currentProgress: number;
  rewardAmount: number;
  status: 'active' | 'completed' | 'expired';
  expiresAt: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DailyChallengeCreationAttributes extends Optional<DailyChallengeAttributes, 'id' | 'currentProgress' | 'status'> {}

class DailyChallenge extends Model<DailyChallengeAttributes, DailyChallengeCreationAttributes> implements DailyChallengeAttributes {
  public id!: string;
  public userId!: string;
  public challengeType!: string;
  public title!: string;
  public description?: string;
  public targetCount!: number;
  public currentProgress!: number;
  public rewardAmount!: number;
  public status!: 'active' | 'completed' | 'expired';
  public expiresAt!: Date;
  public completedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DailyChallenge.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    challengeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    targetCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currentProgress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rewardAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'expired'),
      defaultValue: 'active',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'daily_challenges',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['expiresAt'] },
    ],
  }
);

export default DailyChallenge;
