export interface PlaidAccount {
    id: string;
    name: string;
    type: string;
    subtype: string;
    balances: {
        current: number;
        available: number | null;
        limit: number | null;
    };
}
export interface PlaidTransaction {
    id: string;
    accountId: string;
    amount: number;
    date: string;
    name: string;
    category: string[];
    pending: boolean;
}
export interface PlaidData {
    accounts: PlaidAccount[];
    transactions: PlaidTransaction[];
    summary: {
        totalBalance: number;
        totalIncome: number;
        totalExpenses: number;
        categorizedSpending: Record<string, number>;
    };
}
export declare class PlaidAdapter {
    private client;
    private accessToken;
    constructor(accessToken: string);
    /**
     * Get accounts
     */
    getAccounts(): Promise<PlaidAccount[]>;
    /**
     * Get transactions
     */
    getTransactions(startDate: string, endDate: string): Promise<PlaidTransaction[]>;
    /**
     * Calculate spending by category
     */
    private calculateCategorizedSpending;
    /**
     * Get normalized data for the platform
     */
    getNormalizedData(days?: number): Promise<PlaidData>;
}
//# sourceMappingURL=PlaidAdapter.d.ts.map