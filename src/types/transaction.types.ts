export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export interface Transaction {
    id: number,
    amount: number,
    type: TransactionType,
    description: string | null,
    date: Date,
    isRecurring: boolean;
    createdAt: Date;
    updatedAt: Date;
    account: { id: number; name: string }; 
    category: { id: number; name: string; icon: string; color: string } | null;
}

