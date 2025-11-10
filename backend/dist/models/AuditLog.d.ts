import { Model, Optional } from 'sequelize';
export type AuditAction = 'data_access' | 'permission_granted' | 'permission_revoked' | 'service_connected' | 'service_disconnected' | 'oauth_refresh' | 'data_sync';
interface AuditLogAttributes {
    id: string;
    userId: string;
    businessId?: string;
    action: AuditAction;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
}
interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id'> {
}
declare class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
    id: string;
    userId: string;
    businessId?: string;
    action: AuditAction;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    readonly createdAt: Date;
}
export default AuditLog;
//# sourceMappingURL=AuditLog.d.ts.map