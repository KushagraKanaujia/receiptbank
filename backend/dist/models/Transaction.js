"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
class Transaction extends sequelize_1.Model {
}
Transaction.init({
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
    permissionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'data_access_permissions',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('payment', 'payout', 'refund'),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total transaction amount',
    },
    platformFee: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Platform fee (10-30%)',
    },
    netAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Amount after platform fee',
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(3),
        defaultValue: 'USD',
    },
    stripePaymentId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    stripePayoutId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    completedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
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
});
exports.default = Transaction;
//# sourceMappingURL=Transaction.js.map