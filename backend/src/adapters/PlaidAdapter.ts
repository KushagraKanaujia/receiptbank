import { Configuration, PlaidApi, PlaidEnvironments, Products } from 'plaid';

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

export class PlaidAdapter {
  private client: PlaidApi;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;

    const configuration = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV as 'sandbox' | 'development' | 'production'] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    this.client = new PlaidApi(configuration);
  }

  /**
   * Get accounts
   */
  async getAccounts(): Promise<PlaidAccount[]> {
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
  async getTransactions(startDate: string, endDate: string): Promise<PlaidTransaction[]> {
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
  private calculateCategorizedSpending(transactions: PlaidTransaction[]): Record<string, number> {
    const spending: Record<string, number> = {};

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
  async getNormalizedData(days: number = 30): Promise<PlaidData> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const [accounts, transactions] = await Promise.all([
      this.getAccounts(),
      this.getTransactions(startDate, endDate),
    ]);

    // summary statistics
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balances.current, 0);

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.amount < 0) {
        totalIncome += Math.abs(transaction.amount);
      } else {
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
