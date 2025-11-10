import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';
import { ServiceProvider } from './ConnectedService';

export type PermissionStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
export type AccessFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
export type PricingModel = 'one_time' | 'monthly' | 'per_request';

interface DataAccessPermissionAttributes {
  id: string;
  userId: string;
  businessId: string;
  providers: ServiceProvider[];
  dataFields: string[];
  startDate?: Date;
  endDate?: Date;
  accessFrequency: AccessFrequency;
  status: PermissionStatus;
  pricingModel: PricingModel;
  price: number;
  currency: string;
  totalRequests: number;
  lastAccessedAt?: Date;
  approvedAt?: Date;
  revokedAt?: Date;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DataAccessPermissionCreationAttributes
  extends Optional<DataAccessPermissionAttributes, 'id' | 'totalRequests' | 'currency'> {}

class DataAccessPermission
  extends Model<DataAccessPermissionAttributes, DataAccessPermissionCreationAttributes>
  implements DataAccessPermissionAttributes
{
  public id!: string;
  public userId!: string;
  public businessId!: string;
  public providers!: ServiceProvider[];
  public dataFields!: string[];
  public startDate?: Date;
  public endDate?: Date;
  public accessFrequency!: AccessFrequency;
  public status!: PermissionStatus;
  public pricingModel!: PricingModel;
  public price!: number;
  public currency!: string;
  public totalRequests!: number;
  public lastAccessedAt?: Date;
  public approvedAt?: Date;
  public revokedAt?: Date;
  public metadata?: Record<string, any>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DataAccessPermission.init(
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
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    providers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      comment: 'Array of service providers (spotify, fitbit, etc.)',
    },
    dataFields: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      comment: 'Specific data fields requested',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accessFrequency: {
      type: DataTypes.ENUM('realtime', 'hourly', 'daily', 'weekly', 'monthly'),
      allowNull: false,
      defaultValue: 'daily',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'revoked'),
      allowNull: false,
      defaultValue: 'pending',
    },
    pricingModel: {
      type: DataTypes.ENUM('one_time', 'monthly', 'per_request'),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    totalRequests: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'data_access_permissions',
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
    ],
  }
);

export default DataAccessPermission;
