"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncWorker = void 0;
const bull_1 = __importDefault(require("bull"));
const models_1 = require("../models");
const AdapterFactory_1 = require("../adapters/AdapterFactory");
const OAuthManager_1 = __importDefault(require("../auth/OAuthManager"));
const redis_1 = __importDefault(require("../utils/redis"));
class SyncWorker {
    constructor() {
        // Initialize Bull queue with Redis connection
        this.syncQueue = new bull_1.default('data-sync', {
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
    setupProcessor() {
        this.syncQueue.process(async (job) => {
            const { userId, provider, serviceId } = job.data;
            console.log(`[Sync] Processing sync for ${provider} (user: ${userId})`);
            try {
                // Get service details
                const service = await models_1.ConnectedService.findByPk(serviceId);
                if (!service || !service.isActive) {
                    throw new Error('Service not found or inactive');
                }
                // Decrypt tokens
                const tokens = OAuthManager_1.default.decryptTokens({
                    accessToken: service.accessToken,
                    refreshToken: service.refreshToken,
                    iv: service.iv,
                    authTag: service.authTag,
                });
                // Check if token needs refresh
                const needsRefresh = service.tokenExpiresAt && new Date(service.tokenExpiresAt) < new Date();
                let accessToken = tokens.accessToken;
                if (needsRefresh && tokens.refreshToken) {
                    console.log(`[Sync] Refreshing token for ${provider}`);
                    const refreshedTokens = await OAuthManager_1.default.refreshAccessToken(provider, tokens.refreshToken);
                    // Update tokens in database
                    const encryptedTokens = OAuthManager_1.default.encryptTokens(refreshedTokens);
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
                    await models_1.AuditLog.create({
                        userId,
                        action: 'oauth_refresh',
                        resource: `${provider}:${service.providerUserId}`,
                        metadata: { provider },
                    });
                }
                // Fetch data using adapter
                const data = await AdapterFactory_1.AdapterFactory.getNormalizedData(provider, accessToken, {
                    days: 30,
                });
                // Update cache
                const cacheKey = `data:${userId}:${provider}:30`;
                await redis_1.default.setex(cacheKey, 3600, JSON.stringify(data));
                // Update last sync time
                await service.update({ lastSyncAt: new Date() });
                // Log successful sync
                await models_1.AuditLog.create({
                    userId,
                    action: 'data_sync',
                    resource: `${provider}:${service.providerUserId}`,
                    metadata: { provider, success: true },
                });
                console.log(`[Sync] ✓ Successfully synced ${provider} for user ${userId}`);
                return { success: true, provider, userId };
            }
            catch (error) {
                console.error(`[Sync] ✗ Failed to sync ${provider} for user ${userId}:`, error);
                // Log failed sync
                await models_1.AuditLog.create({
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
    setupEventHandlers() {
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
    async scheduleSync(userId, provider, serviceId) {
        await this.syncQueue.add({ userId, provider, serviceId }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });
        console.log(`[Sync] Scheduled sync for ${provider} (user: ${userId})`);
    }
    /**
     * Schedule recurring sync for a service
     */
    async scheduleRecurringSync(userId, provider, serviceId, intervalHours = 24) {
        const jobId = `sync:${userId}:${provider}`;
        await this.syncQueue.add({ userId, provider, serviceId }, {
            jobId,
            repeat: {
                every: intervalHours * 60 * 60 * 1000, // Convert hours to milliseconds
            },
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });
        console.log(`[Sync] Scheduled recurring sync for ${provider} every ${intervalHours} hours`);
    }
    /**
     * Sync all services for a user
     */
    async syncAllUserServices(userId) {
        const services = await models_1.ConnectedService.findAll({
            where: { userId, isActive: true },
        });
        for (const service of services) {
            await this.scheduleSync(userId, service.provider, service.id);
        }
    }
    /**
     * Get queue statistics
     */
    async getQueueStats() {
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
    async cleanQueue() {
        await this.syncQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24 hours
        await this.syncQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 7 days
        console.log('[Sync] Cleaned old jobs from queue');
    }
}
exports.SyncWorker = SyncWorker;
// Export singleton instance
exports.default = new SyncWorker();
//# sourceMappingURL=SyncWorker.js.map