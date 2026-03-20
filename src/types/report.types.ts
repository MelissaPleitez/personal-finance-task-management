import type { User } from "./user.types";

export enum ReportType {
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
    CUSTOM = 'custom',
}

export interface Report {
    id: number,
    type: ReportType,
    title: string,
    startDate: Date,
    endDate: Date,
    data: {
        totalIncome: number;
        totalExpenses: number;
        netBalance: number;
        savingsRate: number;
        byCategory: { categoryId: number; name: string; total: number }[];
        byAccount: { accountId: number; name: string; total: number }[];
        topExpenses: { description: string; amount: number; date: Date }[];
    },
    createdAt: Date,
    user: User
}