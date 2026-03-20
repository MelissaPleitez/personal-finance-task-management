import type { TransactionType } from "./transaction.types";

export interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
    type: TransactionType;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: { id: number } | null; 
}
