export enum AccountType{
  CASH = 'cash',
  BANK = 'bank',
  CREDIT = 'credit',
  SAVINGS = 'savings',
}

export interface Account {
  id: number,
  name: string,
  accountType: AccountType,
  createdAt: Date,
  updatedAt: Date,
  user: { id: number };
}