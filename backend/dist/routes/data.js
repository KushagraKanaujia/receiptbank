"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const AdapterFactory_1 = require("../adapters/AdapterFactory");
const OAuthManager_1 = __importDefault(require("../auth/OAuthManager"));
const redis_1 = __importDefault(require("../utils/redis"));
const router = (0, express_1.Router)();
/**
 * GET /api/data/:provider
 * Get data from a specific provider
 */
router.get('/:provider', auth_1.authenticate, async (req, res) => {
    try {
        const { provider } = req.params;
        const userId = req.user.userId;
        const days = parseInt(req.query.days) || 30;
        // Check if service is connected
        const service = await models_1.ConnectedService.findOne({
            where: { userId, provider, isActive: true },
        });
        if (!service) {
            res.status(404).json({ error: 'Service not connected' });
            return;
        }
        // Check Redis cache first
        const cacheKey = `data:${userId}:${provider}:${days}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached) {
            res.json({ data: JSON.parse(cached), cached: true });
            return;
        }
        // Decrypt access token
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
            try {
                const refreshedTokens = await OAuthManager_1.default.refreshAccessToken(provider, tokens.refreshToken);
                // Encrypt and update tokens
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
            }
            catch (error) {
                console.error('Token refresh failed:', error);
                res.status(401).json({ error: 'Failed to refresh token. Please reconnect.' });
                return;
            }
        }
        // Fetch data using adapter
        const data = await AdapterFactory_1.AdapterFactory.getNormalizedData(provider, accessToken, { days });
        // Update last sync time
        await service.update({ lastSyncAt: new Date() });
        // Cache the data for 1 hour
        await redis_1.default.setex(cacheKey, 3600, JSON.stringify(data));
        res.json({ data, cached: false });
    }
    catch (error) {
        console.error('Get data error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch data' });
    }
});
/**
 * GET /api/data
 * Get unified data from all connected services
 */
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const days = parseInt(req.query.days) || 30;
        // Get all connected services
        const services = await models_1.ConnectedService.findAll({
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
                const cached = await redis_1.default.get(cacheKey);
                if (cached) {
                    return { provider: service.provider, data: JSON.parse(cached), cached: true };
                }
                // Decrypt tokens
                const tokens = OAuthManager_1.default.decryptTokens({
                    accessToken: service.accessToken,
                    refreshToken: service.refreshToken,
                    iv: service.iv,
                    authTag: service.authTag,
                });
                // Fetch data
                const data = await AdapterFactory_1.AdapterFactory.getNormalizedData(service.provider, tokens.accessToken, { days });
                // Update last sync time
                await service.update({ lastSyncAt: new Date() });
                // Cache the data
                await redis_1.default.setex(cacheKey, 3600, JSON.stringify(data));
                return { provider: service.provider, data, cached: false };
            }
            catch (error) {
                console.error(`Error fetching ${service.provider} data:`, error);
                return { provider: service.provider, error: error.message };
            }
        });
        const results = await Promise.all(dataPromises);
        // Transform array to object keyed by provider
        const unifiedData = results.reduce((acc, result) => {
            acc[result.provider] = result.data || { error: result.error };
            return acc;
        }, {});
        res.json({ data: unifiedData });
    }
    catch (error) {
        console.error('Get unified data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=data.js.map