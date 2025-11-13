import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';

interface ReceiptAttributes {
  id: string;
  userId: string;
  merchant?: string;
  category?: string;
  amount?: number;
  earnings: number;
  imageUrl: string;
  imageHash?: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'duplicate';
  rejectionReason?: string;
  metadata?: object;
  ocrData?: object;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReceiptCreationAttributes extends Optional<ReceiptAttributes, 'id' | 'earnings' | 'status'> {}

class Receipt extends Model<ReceiptAttributes, ReceiptCreationAttributes> implements ReceiptAttributes {
  public id!: string;
  public userId!: string;
  public merchant?: string;
  public category?: string;
  public amount?: number;
  public earnings!: number;
  public imageUrl!: string;
  public imageHash?: string;
  public status!: 'pending' | 'processing' | 'approved' | 'rejected' | 'duplicate';
  public rejectionReason?: string;
  public metadata?: object;
  public ocrData?: object;
  public processedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Receipt.init(
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
    merchant: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    earnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageHash: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'approved', 'rejected', 'duplicate'),
      defaultValue: 'pending',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ocrData: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'receipts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['imageHash'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Receipt;
