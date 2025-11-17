import { Router, Response } from 'express';
import { ConnectedService } from '../models';
import { ServiceProvider } from '../models/ConnectedService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AdapterFactory } from '../adapters/AdapterFactory';
import OAuthManager from '../auth/OAuthManager';
import redisClient from '../utils/redis';

const router = Router();

/**
 * GET /api/data/:provider
 * Get data from a specific provider
 */
router.get(
  '/:provider',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { provider } = req.params as { provider: ServiceProvider };
      const userId = req.user!.userId;
      const days = parseInt(req.query.days as string) || 30;

      // service is connected
      const service = await ConnectedService.findOne({
        where: { userId, provider, isActive: true },
      });

      if (!service) {
        res.status(404).json({ error: 'Service not connected' });
        return;
      }

      // Check Redis cache first
      const cacheKey = `data:${userId}:${provider}:${days}`;
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        res.json({ data: JSON.parse(cached), cached: true });
        return;
      }

      // Decrypt access token
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
        try {
          const refreshedTokens = await OAuthManager.refreshAccessToken(
            provider,
            tokens.refreshToken
          );

          // Encrypt and update tokens
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
        } catch (error) {
          console.error('Token refresh failed:', error);
          res.status(401).json({ error: 'Failed to refresh token. Please reconnect.' });
          return;
        }
      }

      // Fetch data using adapter
      const data = await AdapterFactory.getNormalizedData(provider, accessToken, { days });

      // last sync time
      await service.update({ lastSyncAt: new Date() });

      // Cache the data for 1 hour
      await redisClient.setex(cacheKey, 3600, JSON.stringify(data));

      res.json({ data, cached: false });
    } catch (error: any) {
      console.error('Get data error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch data' });
    }
  }
);

/**
 * GET /api/data
 * Get unified data from all connected services
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const days = parseInt(req.query.days as string) || 30;

    // all connected services
    const services = await ConnectedService.findAll({
      where: { userId, isActive: true },
    });

    if (services.length === 0) {
      res.json({ data: {}, message: 'No services connected' });
      return;
    }

    // Fetch data from all services in parallel
    const dataPromises = services.map(async (service) => {
      try {
        // Check Redis cache
        const cacheKey = `data:${userId}:${service.provider}:${days}`;
        const cached = await redisClient.get(cacheKey);

        if (cached) {
          return { provider: service.provider, data: JSON.parse(cached), cached: true };
        }

        // Decrypt tokens
        const tokens = OAuthManager.decryptTokens({
          accessToken: service.accessToken,
          refreshToken: service.refreshToken,
          iv: service.iv,
          authTag: service.authTag,
        });

        // Fetch data
        const data = await AdapterFactory.getNormalizedData(
          service.provider,
          tokens.accessToken,
          { days }
        );

        // last sync time
        await service.update({ lastSyncAt: new Date() });

        // Cache the data
        await redisClient.setex(cacheKey, 3600, JSON.stringify(data));

        return { provider: service.provider, data, cached: false };
      } catch (error: any) {
        console.error(`Error fetching ${service.provider} data:`, error);
        return { provider: service.provider, error: error.message };
      }
    });

    const results = await Promise.all(dataPromises);

    // Transform array to object keyed by provider
    const unifiedData = results.reduce((acc: any, result) => {
      acc[result.provider] = result.data || { error: result.error };
      return acc;
    }, {});

    res.json({ data: unifiedData });
  } catch (error: any) {
    console.error('Get unified data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
