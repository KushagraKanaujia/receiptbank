"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
class ConnectedService extends sequelize_1.Model {
}
ConnectedService.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    provider: {
        type: sequelize_1.DataTypes.ENUM('spotify', 'fitbit', 'google', 'plaid', 'notion'),
        allowNull: false,
    },
    providerUserId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    accessToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: 'Encrypted access token',
    },
    refreshToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Encrypted refresh token',
    },
    tokenExpiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    iv: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Initialization vector for encryption',
    },
    authTag: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Authentication tag for encryption',
    },
    scope: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'OAuth scopes granted',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    lastSyncAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional provider-specific metadata',
    },
}, {
    sequelize: database_1.default,
    tableName: 'connected_services',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'provider'],
        },
    ],
});
exports.default = ConnectedService;
//# sourceMappingURL=ConnectedService.js.map