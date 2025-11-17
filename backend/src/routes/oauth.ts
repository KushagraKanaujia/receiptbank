import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { ConnectedService, AuditLog, User } from '../models';
import { ServiceProvider } from '../models/ConnectedService';
import OAuthManager from '../auth/OAuthManager';
import { authenticate, AuthRequest } from '../middleware/auth';
import redisClient from '../utils/redis';

const router = Router();

/**
 * GET /api/oauth/connect/:provider
 * Initiate OAuth flow for a service provider
 */
router.get(
  '/connect/:provider',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { provider } = req.params as { provider: ServiceProvider };
      const userId = req.user!.userId;

      // state token for CSRF protection
      const state = crypto.randomBytes(32).toString('hex');

      // Store state in Redis with user ID (expires in 10 minutes)
      await redisClient.setex(`oauth_state:${state}`, 600, userId);

      // authorization URL
      const authUrl = OAuthManager.getAuthorizationUrl(provider, state);

      res.json({ authUrl });
    } catch (error: any) {
      console.error('OAuth connect error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/oauth/callback/:provider
 * Handle OAuth callback
 */
router.get('/callback/:provider', async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider } = req.params as { provider: ServiceProvider };
    const { code, state } = req.query;

    if (!code || !state) {
      res.status(400).json({ error: 'Missing code or state parameter' });
      return;
    }

    // Verify state and get user ID
    const userId = await redisClient.get(`oauth_state:${state}`);
    if (!userId) {
      res.status(400).json({ error: 'Invalid or expired state token' });
      return;
    }

    // Delete used state token
    await redisClient.del(`oauth_state:${state}`);

    // Exchange code for tokens
    const tokens = await OAuthManager.exchangeCodeForTokens(provider, code as string);

    // user info from provider
    const userInfo = await OAuthManager.getUserInfo(provider, tokens.accessToken);

    // Encrypt tokens
    const encryptedTokens = OAuthManager.encryptTokens(tokens);

    // token expiration
    const tokenExpiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000)
      : null;

    // service is already connected
    const existing = await ConnectedService.findOne({
      where: { userId, provider },
    });

    let service: ConnectedService;

    if (existing) {
      // existing connection
      service = await existing.update({
        providerUserId: userInfo.id,
        accessToken: encryptedTokens.accessToken,
        refreshToken: encryptedTokens.refreshToken,
        tokenExpiresAt,
        iv: encryptedTokens.iv,
        authTag: encryptedTokens.authTag,
        scope: tokens.scope,
        isActive: true,
        metadata: userInfo,
      });
    } else {
      // new connection
      service = await ConnectedService.create({
        userId,
        provider,
        providerUserId: userInfo.id,
        accessToken: encryptedTokens.accessToken,
        refreshToken: encryptedTokens.refreshToken,
        tokenExpiresAt,
        iv: encryptedTokens.iv,
        authTag: encryptedTokens.authTag,
        scope: tokens.scope,
        isActive: true,
        metadata: userInfo,
      });
    }

    // Log the connection
    await AuditLog.create({
      userId,
      action: 'service_connected',
      resource: `${provider}:${userInfo.id}`,
      metadata: { provider },
    });

    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?connected=${provider}`);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?error=oauth_failed`);
  }
});

/**
 * GET /api/oauth/connected
 * Get all connected services for the current user
 */
router.get('/connected', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const services = await ConnectedService.findAll({
      where: { userId, isActive: true },
      attributes: {
        exclude: ['accessToken', 'refreshToken', 'iv', 'authTag'],
      },
    });

    res.json({ services });
  } catch (error: any) {
    console.error('Get connected services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/oauth/disconnect/:provider
 * Disconnect a service
 */
router.delete(
  '/disconnect/:provider',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { provider } = req.params as { provider: ServiceProvider };
      const userId = req.user!.userId;

      const service = await ConnectedService.findOne({
        where: { userId, provider },
      });

      if (!service) {
        res.status(404).json({ error: 'Service not connected' });
        return;
      }

      await service.update({ isActive: false });

      // Log the disconnection
      await AuditLog.create({
        userId,
        action: 'service_disconnected',
        resource: `${provider}:${service.providerUserId}`,
        metadata: { provider },
      });

      res.json({ message: 'Service disconnected successfully' });
    } catch (error: any) {
      console.error('Disconnect service error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
