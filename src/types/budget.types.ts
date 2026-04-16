import type { Account } from "./account.types";
import type { Category } from "./category.types";
import type { User } from "./user.types";

export enum BudgetPeriod {
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export interface Budget {
    id: number,
    name: string,
    limitAmount: number,
    spentAmount?: number,
    period: BudgetPeriod,
    startDate: Date,
    endDate: Date,
    alertEnabled: boolean,
    alertThreshPct: number,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    user: User,
    category: Category | null,
    account: Account | null,
}
