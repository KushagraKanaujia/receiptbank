"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // Allow null for OAuth-only users
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('user', 'business'),
        defaultValue: 'user',
        allowNull: false,
    },
    isEmailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    totalEarnings: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
}, {
    sequelize: database_1.default,
    tableName: 'users',
    timestamps: true,
});
exports.default = User;
//# sourceMappingURL=User.js.map