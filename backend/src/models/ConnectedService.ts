import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../utils/database';
import { EncryptedData } from '../utils/encryption';

export type ServiceProvider = 'spotify' | 'fitbit' | 'google' | 'plaid' | 'notion';

interface ConnectedServiceAttributes {
  id: string;
  userId: string;
  provider: ServiceProvider;
  providerUserId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  iv: string;
  authTag: string;
  scope?: string;
  isActive: boolean;
  lastSyncAt?: Date;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConnectedServiceCreationAttributes
  extends Optional<ConnectedServiceAttributes, 'id' | 'isActive'> {}

class ConnectedService
  extends Model<ConnectedServiceAttributes, ConnectedServiceCreationAttributes>
  implements ConnectedServiceAttributes
{
  public id!: string;
  public userId!: string;
  public provider!: ServiceProvider;
  public providerUserId!: string;
  public accessToken!: string;
  public refreshToken?: string;
  public tokenExpiresAt?: Date;
  public iv!: string;
  public authTag!: string;
  public scope?: string;
  public isActive!: boolean;
  public lastSyncAt?: Date;
  public metadata?: Record<string, any>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConnectedService.init(
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
    provider: {
      type: DataTypes.ENUM('spotify', 'fitbit', 'google', 'plaid', 'notion'),
      allowNull: false,
    },
    providerUserId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Encrypted access token',
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Encrypted refresh token',
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    iv: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Initialization vector for encryption',
    },
    authTag: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Authentication tag for encryption',
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'OAuth scopes granted',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional provider-specific metadata',
    },
  },
  {
    sequelize,
    tableName: 'connected_services',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'provider'],
      },
    ],
  }
);

export default ConnectedService;
