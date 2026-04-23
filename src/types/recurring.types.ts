import type { Account } from "./account.types";
import type { Category } from "./category.types";
import type { TransactionType } from "./transaction.types";

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface RecurringTransaction {
    id: number;
    description: string;
    type: TransactionType;
    amount: number;
    frequency: RecurrenceFrequency;
    startDate: Date;
    endDate: Date | null;
    nextDueDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category: Category | null,
    account: Account | null,
}