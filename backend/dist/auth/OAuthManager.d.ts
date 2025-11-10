import { ServiceProvider } from '../models/ConnectedService';
export interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authorizationUrl: string;
    tokenUrl: string;
    scope: string[];
    userInfoUrl?: string;
}
export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    tokenType?: string;
    scope?: string;
}
export interface EncryptedTokens {
    accessToken: string;
    refreshToken?: string;
    iv: string;
    authTag: string;
}
export declare class OAuthManager {
    private configs;
    constructor();
    private initializeConfigs;
    /**
     * Get authorization URL for a provider
     */
    getAuthorizationUrl(provider: ServiceProvider, state: string): string;
    /**
     * Exchange authorization code for tokens
     */
    exchangeCodeForTokens(provider: ServiceProvider, code: string): Promise<OAuthTokens>;
    /**
     * Refresh access token
     */
    refreshAccessToken(provider: ServiceProvider, refreshToken: string): Promise<OAuthTokens>;
    /**
     * Get user info from provider
     */
    getUserInfo(provider: ServiceProvider, accessToken: string): Promise<any>;
    /**
     * Encrypt tokens for storage
     */
    encryptTokens(tokens: OAuthTokens): EncryptedTokens;
    /**
     * Decrypt tokens from storage
     */
    decryptTokens(encrypted: EncryptedTokens): OAuthTokens;
}
declare const _default: OAuthManager;
export default _default;
//# sourceMappingURL=OAuthManager.d.ts.map