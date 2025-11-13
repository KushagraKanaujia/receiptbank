import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';

interface CompanyAttributes {
  id: string;
  name: string;
  email: string;
  contactPerson?: string;
  pricingTier: 'basic' | 'professional' | 'enterprise';
  apiKey: string;
  apiSecret: string;
  monthlyReceiptLimit: number;
  receiptsUsedThisMonth: number;
  allowedCategories?: string[];
  isActive: boolean;
  billingStartDate: Date;
  lastBilledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id' | 'receiptsUsedThisMonth' | 'isActive'> {}

class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public contactPerson?: string;
  public pricingTier!: 'basic' | 'professional' | 'enterprise';
  public apiKey!: string;
  public apiSecret!: string;
  public monthlyReceiptLimit!: number;
  public receiptsUsedThisMonth!: number;
  public allowedCategories?: string[];
  public isActive!: boolean;
  public billingStartDate!: Date;
  public lastBilledAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pricingTier: {
      type: DataTypes.ENUM('basic', 'professional', 'enterprise'),
      allowNull: false,
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    apiSecret: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    monthlyReceiptLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiptsUsedThisMonth: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    allowedCategories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    billingStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastBilledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'companies',
    timestamps: true,
    indexes: [
      { fields: ['apiKey'] },
      { fields: ['isActive'] },
      { fields: ['pricingTier'] },
    ],
  }
);

export default Company;
