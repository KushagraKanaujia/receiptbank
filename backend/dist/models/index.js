"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabase = exports.Transaction = exports.AuditLog = exports.DataAccessPermission = exports.ConnectedService = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const ConnectedService_1 = __importDefault(require("./ConnectedService"));
exports.ConnectedService = ConnectedService_1.default;
const DataAccessPermission_1 = __importDefault(require("./DataAccessPermission"));
exports.DataAccessPermission = DataAccessPermission_1.default;
const AuditLog_1 = __importDefault(require("./AuditLog"));
exports.AuditLog = AuditLog_1.default;
const Transaction_1 = __importDefault(require("./Transaction"));
exports.Transaction = Transaction_1.default;
// Set up associations
User_1.default.hasMany(ConnectedService_1.default, {
    foreignKey: 'userId',
    as: 'connectedServices',
});
ConnectedService_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user',
});
User_1.default.hasMany(DataAccessPermission_1.default, {
    foreignKey: 'userId',
    as: 'dataPermissionsGranted',
});
User_1.default.hasMany(DataAccessPermission_1.default, {
    foreignKey: 'businessId',
    as: 'dataPermissionsReceived',
});
DataAccessPermission_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user',
});
DataAccessPermission_1.default.belongsTo(User_1.default, {
    foreignKey: 'businessId',
    as: 'business',
});
User_1.default.hasMany(AuditLog_1.default, {
    foreignKey: 'userId',
    as: 'auditLogs',
});
AuditLog_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user',
});
User_1.default.hasMany(Transaction_1.default, {
    foreignKey: 'userId',
    as: 'transactions',
});
Transaction_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user',
});
Transaction_1.default.belongsTo(DataAccessPermission_1.default, {
    foreignKey: 'permissionId',
    as: 'permission',
});
const syncDatabase = async (force = false) => {
    try {
        await User_1.default.sync({ force });
        await ConnectedService_1.default.sync({ force });
        await DataAccessPermission_1.default.sync({ force });
        await AuditLog_1.default.sync({ force });
        await Transaction_1.default.sync({ force });
        console.log('✓ Database models synchronized');
    }
    catch (error) {
        console.error('✗ Error synchronizing database:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
//# sourceMappingURL=index.js.map