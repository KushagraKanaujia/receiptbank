import User from './User';
import ConnectedService from './ConnectedService';
import DataAccessPermission from './DataAccessPermission';
import AuditLog from './AuditLog';
import Transaction from './Transaction';
import Receipt from './Receipt';
import Badge from './Badge';
import DailyChallenge from './DailyChallenge';
import Company from './Company';

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

// Receipt associations
User.hasMany(Receipt, {
  foreignKey: 'userId',
  as: 'receipts',
});

Receipt.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Badge associations
User.hasMany(Badge, {
  foreignKey: 'userId',
  as: 'badges',
});

Badge.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Daily Challenge associations
User.hasMany(DailyChallenge, {
  foreignKey: 'userId',
  as: 'dailyChallenges',
});

DailyChallenge.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export { User, ConnectedService, DataAccessPermission, AuditLog, Transaction, Receipt, Badge, DailyChallenge, Company };

export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await User.sync({ force });
    await ConnectedService.sync({ force });
    await DataAccessPermission.sync({ force });
    await AuditLog.sync({ force });
    await Transaction.sync({ force });
    await Company.sync({ force });
    await Receipt.sync({ force });
    await Badge.sync({ force });
    await DailyChallenge.sync({ force });
    console.log('✓ Database models synchronized');
  } catch (error) {
    console.error('✗ Error synchronizing database:', error);
    throw error;
  }
};
