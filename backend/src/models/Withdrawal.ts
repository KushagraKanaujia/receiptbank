import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';

interface WithdrawalAttributes {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: 'paypal' | 'venmo' | 'bank_transfer';
  paymentEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paypalBatchId?: string;
  paypalPayoutItemId?: string;
  transactionId?: string;
  failureReason?: string;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WithdrawalCreationAttributes extends Optional<WithdrawalAttributes, 'id' | 'status'> {}

class Withdrawal extends Model<WithdrawalAttributes, WithdrawalCreationAttributes> implements WithdrawalAttributes {
  public id!: string;
  public userId!: string;
  public amount!: number;
  public paymentMethod!: 'paypal' | 'venmo' | 'bank_transfer';
  public paymentEmail!: string;
  public status!: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  public paypalBatchId?: string;
  public paypalPayoutItemId?: string;
  public transactionId?: string;
  public failureReason?: string;
  public processedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Withdrawal.init(
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 10.00, // $10 minimum
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM('paypal', 'venmo', 'bank_transfer'),
      allowNull: false,
      defaultValue: 'paypal',
    },
    paymentEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    paypalBatchId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paypalPayoutItemId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'withdrawals',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Withdrawal;
