export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory = string;

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
}

export interface AccountingSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthly: MonthlySummary[];
  recentTransactions: Transaction[];
}
