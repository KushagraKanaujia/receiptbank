import { Model, Optional } from 'sequelize';
export type TransactionType = 'payment' | 'payout' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
interface TransactionAttributes {
    id: string;
    userId: string;
    businessId?: string;
    permissionId?: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    platformFee: number;
    netAmount: number;
    currency: string;
    stripePaymentId?: string;
    stripePayoutId?: string;
    description?: string;
    metadata?: Record<string, any>;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id'> {
}
declare class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
    id: string;
    userId: string;
    businessId?: string;
    permissionId?: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    platformFee: number;
    netAmount: number;
    currency: string;
    stripePaymentId?: string;
    stripePayoutId?: string;
    description?: string;
    metadata?: Record<string, any>;
    completedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Transaction;
//# sourceMappingURL=Transaction.d.ts.map