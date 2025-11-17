import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import sequelize, { testConnection } from './utils/database';
import { syncDatabase } from './models';
import { generalLimiter } from './middleware/rateLimiter';
import { authenticate } from './middleware/auth';
import redis from './utils/redis';

// Import routes
import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';
import dataRoutes from './routes/data';
import marketplaceRoutes from './routes/marketplace';
import syncRoutes from './routes/sync';
import receiptsRoutes from './routes/receipts';
import withdrawalsRoutes from './routes/withdrawals';
import adminRoutes from './routes/admin';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:3001'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api', generalLimiter);
app.get('/health', async (_req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      redis: 'unknown'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  };

  try {
    await sequelize.authenticate();
    healthCheck.services.database = 'connected';
  } catch (error) {
    healthCheck.services.database = 'disconnected';
    healthCheck.status = 'degraded';
  }

  try {
    const redisPing = await redis.ping();
    healthCheck.services.redis = redisPing === 'PONG' ? 'connected' : 'disconnected';
  } catch (error) {
    healthCheck.services.redis = 'disconnected';
    healthCheck.status = 'degraded';
  }

  const statusCode = healthCheck.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/data', authenticate as any, dataRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/withdrawals', withdrawalsRoutes);
app.use('/api/admin', adminRoutes);

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error occurred:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    error: err.name || 'ServerError',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

const startServer = async () => {
  try {
    await testConnection();

    const forceSync = process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true';
    await syncDatabase(forceSync);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

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
