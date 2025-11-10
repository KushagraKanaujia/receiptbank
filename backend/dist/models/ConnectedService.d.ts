import { Model, Optional } from 'sequelize';
export type ServiceProvider = 'spotify' | 'fitbit' | 'google' | 'plaid' | 'notion';
interface ConnectedServiceAttributes {
    id: string;
    userId: string;
    provider: ServiceProvider;
    providerUserId: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    iv: string;
    authTag: string;
    scope?: string;
    isActive: boolean;
    lastSyncAt?: Date;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ConnectedServiceCreationAttributes extends Optional<ConnectedServiceAttributes, 'id' | 'isActive'> {
}
declare class ConnectedService extends Model<ConnectedServiceAttributes, ConnectedServiceCreationAttributes> implements ConnectedServiceAttributes {
    id: string;
    userId: string;
    provider: ServiceProvider;
    providerUserId: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    iv: string;
    authTag: string;
    scope?: string;
    isActive: boolean;
    lastSyncAt?: Date;
    metadata?: Record<string, any>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default ConnectedService;
//# sourceMappingURL=ConnectedService.d.ts.map