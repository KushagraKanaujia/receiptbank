import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';

interface UserAttributes {
  id: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'business' | 'admin';
  isEmailVerified: boolean;
  totalEarnings: number;
  availableBalance: number;
  streakCount: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  receiptsUploaded: number;
  lastUploadDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'totalEarnings' | 'availableBalance' | 'isEmailVerified' | 'streakCount' | 'level' | 'receiptsUploaded'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password?: string;
  public firstName?: string;
  public lastName?: string;
  public role!: 'user' | 'business' | 'admin';
  public isEmailVerified!: boolean;
  public totalEarnings!: number;
  public availableBalance!: number;
  public streakCount!: number;
  public level!: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  public receiptsUploaded!: number;
  public lastUploadDate?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for OAuth-only users
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'business', 'admin'),
      defaultValue: 'user',
      allowNull: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    availableBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    streakCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.ENUM('Bronze', 'Silver', 'Gold', 'Platinum'),
      defaultValue: 'Bronze',
    },
    receiptsUploaded: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastUploadDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
