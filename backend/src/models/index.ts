import User from './User';
import ConnectedService from './ConnectedService';
import DataAccessPermission from './DataAccessPermission';
import AuditLog from './AuditLog';
import Transaction from './Transaction';

// Set up associations
User.hasMany(ConnectedService, {
  foreignKey: 'userId',
  as: 'connectedServices',
});

ConnectedService.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(DataAccessPermission, {
  foreignKey: 'userId',
  as: 'dataPermissionsGranted',
});

User.hasMany(DataAccessPermission, {
  foreignKey: 'businessId',
  as: 'dataPermissionsReceived',
});

DataAccessPermission.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

DataAccessPermission.belongsTo(User, {
  foreignKey: 'businessId',
  as: 'business',
});

User.hasMany(AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs',
});

AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions',
});

Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Transaction.belongsTo(DataAccessPermission, {
  foreignKey: 'permissionId',
  as: 'permission',
});

export { User, ConnectedService, DataAccessPermission, AuditLog, Transaction };

export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await User.sync({ force });
    await ConnectedService.sync({ force });
    await DataAccessPermission.sync({ force });
    await AuditLog.sync({ force });
    await Transaction.sync({ force });
    console.log('✓ Database models synchronized');
  } catch (error) {
    console.error('✗ Error synchronizing database:', error);
    throw error;
  }
};
