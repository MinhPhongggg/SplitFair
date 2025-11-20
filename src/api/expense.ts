// src/api/expense.ts
import axios from '@/utils/axios.customize';
import { Expense, ExpenseShareSaveRequest, ExpenseShare } from '@/types/expense.types';

export const getExpensesByBill = (billId: string): Promise<Expense[]> => {
  return axios.get(`/api/expenses/bill/${billId}`);
};

export const getExpensesByGroup = (groupId: string): Promise<Expense[]> => {
  return axios.get(`/api/expenses/group/${groupId}`);
};

export const createExpense = (dto: Partial<Expense>): Promise<Expense> => {
  return axios.post('/api/expenses', dto);
};

export const saveExpenseShares = (
  request: ExpenseShareSaveRequest
): Promise<any> => {
  return axios.post('/api/expense-shares/save', request);
};

export const deleteExpense = (expenseId: string): Promise<void> => {
  return axios.delete(`/api/expenses/${expenseId}`);
};

export const getExpenseById = (expenseId: string): Promise<Expense> => {
  return axios.get(`/api/expenses/${expenseId}`);
};

export const getSharesByExpense = (expenseId: string): Promise<ExpenseShare[]> => {
  return axios.get(`/api/expense-shares/expense/${expenseId}`);
};

export const updateExpense = (expenseId: string, dto: Partial<Expense>): Promise<Expense> => {
  return axios.put(`/api/expenses/${expenseId}`, dto);
};

export const getSharesByUser = (userId: string): Promise<ExpenseShare[]> => {
  return axios.get(`/api/expense-shares/user/${userId}`);
};