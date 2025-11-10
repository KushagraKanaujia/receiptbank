import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';

export type TransactionType = 'payment' | 'payout' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

interface TransactionAttributes {
  id: string;
  userId: string;
  businessId?: string;
  permissionId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  stripePaymentId?: string;
  stripePayoutId?: string;
  description?: string;
  metadata?: Record<string, any>;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id'> {}

class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  public id!: string;
  public userId!: string;
  public businessId?: string;
  public permissionId?: string;
  public type!: TransactionType;
  public status!: TransactionStatus;
  public amount!: number;
  public platformFee!: number;
  public netAmount!: number;
  public currency!: string;
  public stripePaymentId?: string;
  public stripePayoutId?: string;
  public description?: string;
  public metadata?: Record<string, any>;
  public completedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
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
    businessId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'data_access_permissions',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    type: {
      type: DataTypes.ENUM('payment', 'payout', 'refund'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Total transaction amount',
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Platform fee (10-30%)',
    },
    netAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Amount after platform fee',
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    stripePaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripePayoutId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['businessId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['type'],
      },
    ],
  }
);

export default Transaction;
