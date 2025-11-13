import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';

interface BadgeAttributes {
  id: string;
  userId: string;
  badgeType: string;
  name: string;
  description?: string;
  icon?: string;
  unlockedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BadgeCreationAttributes extends Optional<BadgeAttributes, 'id'> {}

class Badge extends Model<BadgeAttributes, BadgeCreationAttributes> implements BadgeAttributes {
  public id!: string;
  public userId!: string;
  public badgeType!: string;
  public name!: string;
  public description?: string;
  public icon?: string;
  public unlockedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Badge.init(
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
    badgeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unlockedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'badges',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['badgeType'] },
      { unique: true, fields: ['userId', 'badgeType'] },
    ],
  }
);

export default Badge;
