import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';

export type AuditAction =
  | 'data_access'
  | 'permission_granted'
  | 'permission_revoked'
  | 'service_connected'
  | 'service_disconnected'
  | 'oauth_refresh'
  | 'data_sync';

interface AuditLogAttributes {
  id: string;
  userId: string;
  businessId?: string;
  action: AuditAction;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id'> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: string;
  public userId!: string;
  public businessId?: string;
  public action!: AuditAction;
  public resource!: string;
  public ipAddress?: string;
  public userAgent?: string;
  public metadata?: Record<string, any>;

  public readonly createdAt!: Date;
}

AuditLog.init(
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
    action: {
      type: DataTypes.ENUM(
        'data_access',
        'permission_granted',
        'permission_revoked',
        'service_connected',
        'service_disconnected',
        'oauth_refresh',
        'data_sync'
      ),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Resource that was accessed or modified',
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional context about the action',
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['businessId'],
      },
      {
        fields: ['action'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default AuditLog;
