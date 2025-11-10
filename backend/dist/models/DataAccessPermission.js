"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
class DataAccessPermission extends sequelize_1.Model {
}
DataAccessPermission.init({
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
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    providers: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: false,
        comment: 'Array of service providers (spotify, fitbit, etc.)',
    },
    dataFields: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: false,
        comment: 'Specific data fields requested',
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    accessFrequency: {
        type: sequelize_1.DataTypes.ENUM('realtime', 'hourly', 'daily', 'weekly', 'monthly'),
        allowNull: false,
        defaultValue: 'daily',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'revoked'),
        allowNull: false,
        defaultValue: 'pending',
    },
    pricingModel: {
        type: sequelize_1.DataTypes.ENUM('one_time', 'monthly', 'per_request'),
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(3),
        defaultValue: 'USD',
    },
    totalRequests: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    lastAccessedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    approvedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    revokedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
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
});
exports.default = DataAccessPermission;
//# sourceMappingURL=DataAccessPermission.js.map