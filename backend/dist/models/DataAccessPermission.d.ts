import { Model, Optional } from 'sequelize';
import { ServiceProvider } from './ConnectedService';
export type PermissionStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
export type AccessFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
export type PricingModel = 'one_time' | 'monthly' | 'per_request';
interface DataAccessPermissionAttributes {
    id: string;
    userId: string;
    businessId: string;
    providers: ServiceProvider[];
    dataFields: string[];
    startDate?: Date;
    endDate?: Date;
    accessFrequency: AccessFrequency;
    status: PermissionStatus;
    pricingModel: PricingModel;
    price: number;
    currency: string;
    totalRequests: number;
    lastAccessedAt?: Date;
    approvedAt?: Date;
    revokedAt?: Date;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
interface DataAccessPermissionCreationAttributes extends Optional<DataAccessPermissionAttributes, 'id' | 'totalRequests' | 'currency'> {
}
declare class DataAccessPermission extends Model<DataAccessPermissionAttributes, DataAccessPermissionCreationAttributes> implements DataAccessPermissionAttributes {
    id: string;
    userId: string;
    businessId: string;
    providers: ServiceProvider[];
    dataFields: string[];
    startDate?: Date;
    endDate?: Date;
    accessFrequency: AccessFrequency;
    status: PermissionStatus;
    pricingModel: PricingModel;
    price: number;
    currency: string;
    totalRequests: number;
    lastAccessedAt?: Date;
    approvedAt?: Date;
    revokedAt?: Date;
    metadata?: Record<string, any>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default DataAccessPermission;
//# sourceMappingURL=DataAccessPermission.d.ts.map