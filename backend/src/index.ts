import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './utils/database';
import { syncDatabase } from './models';
import { generalLimiter } from './middleware/rateLimiter';
import { authenticate } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';
import dataRoutes from './routes/data';
import marketplaceRoutes from './routes/marketplace';
import syncRoutes from './routes/sync';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/data', authenticate, dataRoutes); // Protected data routes
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/sync', syncRoutes);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models
    // Set force: true to drop and recreate tables (WARNING: only for development)
    const forceSync = process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true';
    await syncDatabase(forceSync);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n✅ Ready to accept requests\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

startServer();

export default app;
