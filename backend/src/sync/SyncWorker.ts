import Bull, { Queue, Job } from 'bull';
import { ConnectedService, AuditLog } from '../models';
import { AdapterFactory } from '../adapters/AdapterFactory';
import OAuthManager from '../auth/OAuthManager';
import redisClient from '../utils/redis';
import { ServiceProvider } from '../models/ConnectedService';

interface SyncJobData {
  userId: string;
  provider: ServiceProvider;
  serviceId: string;
}

export class SyncWorker {
  private syncQueue: Queue<SyncJobData>;

  constructor() {
    // Initialize Bull queue with Redis connection
    this.syncQueue = new Bull<SyncJobData>('data-sync', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.setupProcessor();
    this.setupEventHandlers();
  }

  /**
   * Set up job processor
   */
  private setupProcessor(): void {
    this.syncQueue.process(async (job: Job<SyncJobData>) => {
      const { userId, provider, serviceId } = job.data;

      console.log(`[Sync] Processing sync for ${provider} (user: ${userId})`);

      try {
        // service details
        const service = await ConnectedService.findByPk(serviceId);

        if (!service || !service.isActive) {
          throw new Error('Service not found or inactive');
        }

        // Decrypt tokens
        const tokens = OAuthManager.decryptTokens({
          accessToken: service.accessToken,
          refreshToken: service.refreshToken,
          iv: service.iv,
          authTag: service.authTag,
        });

        // token needs refresh
        const needsRefresh =
          service.tokenExpiresAt && new Date(service.tokenExpiresAt) < new Date();

        let accessToken = tokens.accessToken;

        if (needsRefresh && tokens.refreshToken) {
          console.log(`[Sync] Refreshing token for ${provider}`);
          const refreshedTokens = await OAuthManager.refreshAccessToken(
            provider,
            tokens.refreshToken
          );

          // tokens in database
          const encryptedTokens = OAuthManager.encryptTokens(refreshedTokens);
          await service.update({
            accessToken: encryptedTokens.accessToken,
            refreshToken: encryptedTokens.refreshToken,
            tokenExpiresAt: refreshedTokens.expiresIn
              ? new Date(Date.now() + refreshedTokens.expiresIn * 1000)
              : null,
            iv: encryptedTokens.iv,
            authTag: encryptedTokens.authTag,
          });

          accessToken = refreshedTokens.accessToken;

          // Log token refresh
          await AuditLog.create({
            userId,
            action: 'oauth_refresh',
            resource: `${provider}:${service.providerUserId}`,
            metadata: { provider },
          });
        }

        // Fetch data using adapter
        const data = await AdapterFactory.getNormalizedData(provider, accessToken, {
          days: 30,
        });

        // cache
        const cacheKey = `data:${userId}:${provider}:30`;
        await redisClient.setex(cacheKey, 3600, JSON.stringify(data));

        // last sync time
        await service.update({ lastSyncAt: new Date() });

        // Log successful sync
        await AuditLog.create({
          userId,
          action: 'data_sync',
          resource: `${provider}:${service.providerUserId}`,
          metadata: { provider, success: true },
        });

        console.log(`[Sync] ✓ Successfully synced ${provider} for user ${userId}`);

        return { success: true, provider, userId };
      } catch (error: any) {
        console.error(`[Sync] ✗ Failed to sync ${provider} for user ${userId}:`, error);

        // Log failed sync
        await AuditLog.create({
          userId,
          action: 'data_sync',
          resource: `${provider}`,
          metadata: { provider, success: false, error: error.message },
        });

        throw error;
      }
    });
  }

  /**
   * Set up event handlers for queue
   */
  private setupEventHandlers(): void {
    this.syncQueue.on('completed', (job, result) => {
      console.log(`[Sync] Job ${job.id} completed:`, result);
    });

    this.syncQueue.on('failed', (job, err) => {
      console.error(`[Sync] Job ${job?.id} failed:`, err);
    });

    this.syncQueue.on('error', (error) => {
      console.error('[Sync] Queue error:', error);
    });
  }

  /**
   * Schedule sync for a specific service
   */
  async scheduleSync(userId: string, provider: ServiceProvider, serviceId: string): Promise<void> {
    await this.syncQueue.add(
      { userId, provider, serviceId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );

    console.log(`[Sync] Scheduled sync for ${provider} (user: ${userId})`);
  }

  /**
   * Schedule recurring sync for a service
   */
  async scheduleRecurringSync(
    userId: string,
    provider: ServiceProvider,
    serviceId: string,
    intervalHours: number = 24
  ): Promise<void> {
    const jobId = `sync:${userId}:${provider}`;

    await this.syncQueue.add(
      { userId, provider, serviceId },
      {
        jobId,
        repeat: {
          every: intervalHours * 60 * 60 * 1000, // Convert hours to milliseconds
        },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );

    console.log(
      `[Sync] Scheduled recurring sync for ${provider} every ${intervalHours} hours`
    );
  }

  /**
   * Sync all services for a user
   */
  async syncAllUserServices(userId: string): Promise<void> {
    const services = await ConnectedService.findAll({
      where: { userId, isActive: true },
    });

    for (const service of services) {
      await this.scheduleSync(userId, service.provider, service.id);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.syncQueue.getWaitingCount(),
      this.syncQueue.getActiveCount(),
      this.syncQueue.getCompletedCount(),
      this.syncQueue.getFailedCount(),
      this.syncQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Clean old jobs from queue
   */
  async cleanQueue(): Promise<void> {
    await this.syncQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24 hours
    await this.syncQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 7 days
    console.log('[Sync] Cleaned old jobs from queue');
  }
}

// Export singleton instance
export default new SyncWorker();
