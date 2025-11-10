"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthManager = void 0;
const axios_1 = __importDefault(require("axios"));
const encryption_1 = require("../utils/encryption");
class OAuthManager {
    constructor() {
        this.configs = new Map();
        this.initializeConfigs();
    }
    initializeConfigs() {
        // Spotify OAuth Config
        this.configs.set('spotify', {
            clientId: process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
            redirectUri: process.env.SPOTIFY_REDIRECT_URI || '',
            authorizationUrl: 'https://accounts.spotify.com/authorize',
            tokenUrl: 'https://accounts.spotify.com/api/token',
            scope: ['user-read-email', 'user-read-private', 'user-top-read', 'user-read-recently-played'],
            userInfoUrl: 'https://api.spotify.com/v1/me',
        });
        // Fitbit OAuth Config
        this.configs.set('fitbit', {
            clientId: process.env.FITBIT_CLIENT_ID || '',
            clientSecret: process.env.FITBIT_CLIENT_SECRET || '',
            redirectUri: process.env.FITBIT_REDIRECT_URI || '',
            authorizationUrl: 'https://www.fitbit.com/oauth2/authorize',
            tokenUrl: 'https://api.fitbit.com/oauth2/token',
            scope: ['activity', 'heartrate', 'sleep', 'weight', 'profile'],
            userInfoUrl: 'https://api.fitbit.com/1/user/-/profile.json',
        });
        // Google OAuth Config
        this.configs.set('google', {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
            authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/calendar.readonly',
            ],
            userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        });
        // Plaid (uses Link, not traditional OAuth, but we'll structure similarly)
        this.configs.set('plaid', {
            clientId: process.env.PLAID_CLIENT_ID || '',
            clientSecret: process.env.PLAID_SECRET || '',
            redirectUri: process.env.PLAID_REDIRECT_URI || '',
            authorizationUrl: '', // Plaid uses Link UI
            tokenUrl: '', // Plaid has custom token exchange
            scope: ['transactions', 'auth', 'identity', 'balance'],
        });
        // Notion OAuth Config
        this.configs.set('notion', {
            clientId: process.env.NOTION_CLIENT_ID || '',
            clientSecret: process.env.NOTION_CLIENT_SECRET || '',
            redirectUri: process.env.NOTION_REDIRECT_URI || '',
            authorizationUrl: 'https://api.notion.com/v1/oauth/authorize',
            tokenUrl: 'https://api.notion.com/v1/oauth/token',
            scope: [],
            userInfoUrl: 'https://api.notion.com/v1/users/me',
        });
    }
    /**
     * Get authorization URL for a provider
     */
    getAuthorizationUrl(provider, state) {
        const config = this.configs.get(provider);
        if (!config) {
            throw new Error(`Provider ${provider} not configured`);
        }
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            state,
        });
        if (config.scope.length > 0) {
            params.append('scope', config.scope.join(' '));
        }
        // Provider-specific parameters
        if (provider === 'google') {
            params.append('access_type', 'offline');
            params.append('prompt', 'consent');
        }
        if (provider === 'fitbit') {
            params.append('response_type', 'code');
        }
        return `${config.authorizationUrl}?${params.toString()}`;
    }
    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(provider, code) {
        const config = this.configs.get(provider);
        if (!config) {
            throw new Error(`Provider ${provider} not configured`);
        }
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: config.redirectUri,
            client_id: config.clientId,
            client_secret: config.clientSecret,
        });
        try {
            const response = await axios_1.default.post(config.tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in,
                tokenType: response.data.token_type,
                scope: response.data.scope,
            };
        }
        catch (error) {
            console.error(`OAuth token exchange error for ${provider}:`, error.response?.data);
            throw new Error(`Failed to exchange code for tokens: ${error.message}`);
        }
    }
    /**
     * Refresh access token
     */
    async refreshAccessToken(provider, refreshToken) {
        const config = this.configs.get(provider);
        if (!config) {
            throw new Error(`Provider ${provider} not configured`);
        }
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: config.clientId,
            client_secret: config.clientSecret,
        });
        try {
            const response = await axios_1.default.post(config.tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token || refreshToken, // Some providers don't return new refresh token
                expiresIn: response.data.expires_in,
                tokenType: response.data.token_type,
            };
        }
        catch (error) {
            console.error(`Token refresh error for ${provider}:`, error.response?.data);
            throw new Error(`Failed to refresh token: ${error.message}`);
        }
    }
    /**
     * Get user info from provider
     */
    async getUserInfo(provider, accessToken) {
        const config = this.configs.get(provider);
        if (!config || !config.userInfoUrl) {
            throw new Error(`User info not available for ${provider}`);
        }
        try {
            const response = await axios_1.default.get(config.userInfoUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error(`Get user info error for ${provider}:`, error.response?.data);
            throw new Error(`Failed to get user info: ${error.message}`);
        }
    }
    /**
     * Encrypt tokens for storage
     */
    encryptTokens(tokens) {
        const encryptedAccess = (0, encryption_1.encrypt)(tokens.accessToken);
        const encryptedRefresh = tokens.refreshToken ? (0, encryption_1.encrypt)(tokens.refreshToken) : undefined;
        return {
            accessToken: encryptedAccess.encrypted,
            refreshToken: encryptedRefresh?.encrypted,
            iv: encryptedAccess.iv,
            authTag: encryptedAccess.authTag,
        };
    }
    /**
     * Decrypt tokens from storage
     */
    decryptTokens(encrypted) {
        const accessToken = (0, encryption_1.decrypt)({
            encrypted: encrypted.accessToken,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
        });
        let refreshToken;
        if (encrypted.refreshToken) {
            refreshToken = (0, encryption_1.decrypt)({
                encrypted: encrypted.refreshToken,
                iv: encrypted.iv,
                authTag: encrypted.authTag,
            });
        }
        return {
            accessToken,
            refreshToken,
        };
    }
}
exports.OAuthManager = OAuthManager;
exports.default = new OAuthManager();
//# sourceMappingURL=OAuthManager.js.map