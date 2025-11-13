import sequelize from './utils/database';
import './models'; // Import all models

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database schema...');

    // Force sync (drops and recreates tables)
    await sequelize.sync({ alter: true });

    console.log('✅ Database schema synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase();
