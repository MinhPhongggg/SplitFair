// src/api/stats.ts
import axios from '@/utils/axios.customize';
import { Balance, PaymentStat } from '@/types/stats.types';

export const getGroupPaymentStats = (
  groupId: string
): Promise<PaymentStat[]> => {
  return axios.get(`/api/expenses/group/${groupId}/stats`);
};

export const getGroupBalances = (groupId: string): Promise<Balance[]> => {
  return axios.get(`/api/debts/group/${groupId}/net-balances`);
};