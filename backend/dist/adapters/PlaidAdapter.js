"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaidAdapter = void 0;
const plaid_1 = require("plaid");
class PlaidAdapter {
    constructor(accessToken) {
        this.accessToken = accessToken;
        const configuration = new plaid_1.Configuration({
            basePath: plaid_1.PlaidEnvironments[process.env.PLAID_ENV] || plaid_1.PlaidEnvironments.sandbox,
            baseOptions: {
                headers: {
                    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
                    'PLAID-SECRET': process.env.PLAID_SECRET,
                },
            },
        });
        this.client = new plaid_1.PlaidApi(configuration);
    }
    /**
     * Get accounts
     */
    async getAccounts() {
        const response = await this.client.accountsGet({
            access_token: this.accessToken,
        });
        return response.data.accounts.map((account) => ({
            id: account.account_id,
            name: account.name,
            type: account.type,
            subtype: account.subtype || '',
            balances: {
                current: account.balances.current || 0,
                available: account.balances.available,
                limit: account.balances.limit,
            },
        }));
    }
    /**
     * Get transactions
     */
    async getTransactions(startDate, endDate) {
        const response = await this.client.transactionsGet({
            access_token: this.accessToken,
            start_date: startDate,
            end_date: endDate,
        });
        return response.data.transactions.map((transaction) => ({
            id: transaction.transaction_id,
            accountId: transaction.account_id,
            amount: transaction.amount,
            date: transaction.date,
            name: transaction.name,
            category: transaction.category || [],
            pending: transaction.pending,
        }));
    }
    /**
     * Calculate spending by category
     */
    calculateCategorizedSpending(transactions) {
        const spending = {};
        transactions.forEach((transaction) => {
            if (transaction.amount > 0) {
                // Positive amounts are expenses
                const category = transaction.category[0] || 'Other';
                spending[category] = (spending[category] || 0) + transaction.amount;
            }
        });
        return spending;
    }
    /**
     * Get normalized data for the platform
     */
    async getNormalizedData(days = 30) {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
        const [accounts, transactions] = await Promise.all([
            this.getAccounts(),
            this.getTransactions(startDate, endDate),
        ]);
        // Calculate summary statistics
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);
        let totalIncome = 0;
        let totalExpenses = 0;
        transactions.forEach((transaction) => {
            if (transaction.amount < 0) {
                totalIncome += Math.abs(transaction.amount);
            }
            else {
                totalExpenses += transaction.amount;
            }
        });
        const categorizedSpending = this.calculateCategorizedSpending(transactions);
        return {
            accounts,
            transactions,
            summary: {
                totalBalance,
                totalIncome,
                totalExpenses,
                categorizedSpending,
            },
        };
    }
}
exports.PlaidAdapter = PlaidAdapter;
//# sourceMappingURL=PlaidAdapter.js.map