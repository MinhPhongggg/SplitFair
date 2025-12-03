// src/api/debt.ts
import { Debt } from '@/types/debt.types';
import axios from '@/utils/axios.customize';

export const getReadableBalances = (): Promise<string[]> => {
  return axios.get('/api/debts/balances/readable');
};
export const getAllDebtsByUser = (userId: string): Promise<Debt[]> => {
  return axios.get(`/api/debts/user/${userId}`);
};

// 👇 THÊM MỚI: Đánh dấu đã trả nợ (Settle)
export const markDebtAsSettled = (debtId: string): Promise<Debt> => {
  return axios.patch(`/api/debts/${debtId}/settle`);
};