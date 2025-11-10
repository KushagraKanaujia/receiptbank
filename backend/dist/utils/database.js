"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL || '', {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully');
    }
    catch (error) {
        console.error('✗ Unable to connect to the database:', error);
        throw error;
    }
};
exports.testConnection = testConnection;
exports.default = sequelize;
//# sourceMappingURL=database.js.map