// src/types/expense.types.ts
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface Expense {
  id: string;
  billId: string;
  groupId: string;
  paidBy: string; // UUID người trả
  amount: number;
  description: string;
  createdTime: string;
  createdBy: string;
  status: ExpenseStatus;
  userId: string;
}

export interface ShareInput {
  userId: string;
  portion?: number;
  percentage: number;
  shareAmount: number;
}

export interface ExpenseShareSaveRequest {
  expenseId: string;
  totalAmount: number;
  currency: string;
  paidBy: string;
  shares: ShareInput[];
}

export interface ExpenseShare {
  id: string;
  expenseId: string;
  userId: string; // UUID người dùng
  percentage: number;
  status: 'PAID' | 'UNPAID';
  shareAmount: number;
}