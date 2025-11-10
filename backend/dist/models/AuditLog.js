"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
class AuditLog extends sequelize_1.Model {
}
AuditLog.init({
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
    businessId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    action: {
        type: sequelize_1.DataTypes.ENUM('data_access', 'permission_granted', 'permission_revoked', 'service_connected', 'service_disconnected', 'oauth_refresh', 'data_sync'),
        allowNull: false,
    },
    resource: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Resource that was accessed or modified',
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    userAgent: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional context about the action',
    },
}, {
    sequelize: database_1.default,
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
});
exports.default = AuditLog;
//# sourceMappingURL=AuditLog.js.map