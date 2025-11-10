"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const models_1 = require("../models");
const OAuthManager_1 = __importDefault(require("../auth/OAuthManager"));
const auth_1 = require("../middleware/auth");
const redis_1 = __importDefault(require("../utils/redis"));
const router = (0, express_1.Router)();
/**
 * GET /api/oauth/connect/:provider
 * Initiate OAuth flow for a service provider
 */
router.get('/connect/:provider', auth_1.authenticate, async (req, res) => {
    try {
        const { provider } = req.params;
        const userId = req.user.userId;
        // Generate state token for CSRF protection
        const state = crypto_1.default.randomBytes(32).toString('hex');
        // Store state in Redis with user ID (expires in 10 minutes)
        await redis_1.default.setex(`oauth_state:${state}`, 600, userId);
        // Get authorization URL
        const authUrl = OAuthManager_1.default.getAuthorizationUrl(provider, state);
        res.json({ authUrl });
    }
    catch (error) {
        console.error('OAuth connect error:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * GET /api/oauth/callback/:provider
 * Handle OAuth callback
 */
router.get('/callback/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        const { code, state } = req.query;
        if (!code || !state) {
            res.status(400).json({ error: 'Missing code or state parameter' });
            return;
        }
        // Verify state and get user ID
        const userId = await redis_1.default.get(`oauth_state:${state}`);
        if (!userId) {
            res.status(400).json({ error: 'Invalid or expired state token' });
            return;
        }
        // Delete used state token
        await redis_1.default.del(`oauth_state:${state}`);
        // Exchange code for tokens
        const tokens = await OAuthManager_1.default.exchangeCodeForTokens(provider, code);
        // Get user info from provider
        const userInfo = await OAuthManager_1.default.getUserInfo(provider, tokens.accessToken);
        // Encrypt tokens
        const encryptedTokens = OAuthManager_1.default.encryptTokens(tokens);
        // Calculate token expiration
        const tokenExpiresAt = tokens.expiresIn
            ? new Date(Date.now() + tokens.expiresIn * 1000)
            : null;
        // Check if service is already connected
        const existing = await models_1.ConnectedService.findOne({
            where: { userId, provider },
        });
        let service;
        if (existing) {
            // Update existing connection
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
        }
        else {
            // Create new connection
            service = await models_1.ConnectedService.create({
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
        await models_1.AuditLog.create({
            userId,
            action: 'service_connected',
            resource: `${provider}:${userInfo.id}`,
            metadata: { provider },
        });
        // Redirect to frontend success page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/dashboard?connected=${provider}`);
    }
    catch (error) {
        console.error('OAuth callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/dashboard?error=oauth_failed`);
    }
});
/**
 * GET /api/oauth/connected
 * Get all connected services for the current user
 */
router.get('/connected', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const services = await models_1.ConnectedService.findAll({
            where: { userId, isActive: true },
            attributes: {
                exclude: ['accessToken', 'refreshToken', 'iv', 'authTag'],
            },
        });
        res.json({ services });
    }
    catch (error) {
        console.error('Get connected services error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * DELETE /api/oauth/disconnect/:provider
 * Disconnect a service
 */
router.delete('/disconnect/:provider', auth_1.authenticate, async (req, res) => {
    try {
        const { provider } = req.params;
        const userId = req.user.userId;
        const service = await models_1.ConnectedService.findOne({
            where: { userId, provider },
        });
        if (!service) {
            res.status(404).json({ error: 'Service not connected' });
            return;
        }
        await service.update({ isActive: false });
        // Log the disconnection
        await models_1.AuditLog.create({
            userId,
            action: 'service_disconnected',
            resource: `${provider}:${service.providerUserId}`,
            metadata: { provider },
        });
        res.json({ message: 'Service disconnected successfully' });
    }
    catch (error) {
        console.error('Disconnect service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=oauth.js.map