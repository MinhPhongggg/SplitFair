// src/types/stats.types.ts
export interface PaymentStat {
  userName: string;
  totalAmount: number; // BigDecimal -> number
}

export interface Balance {
  userId: string;
  userName: string;
  netAmount: string; // Âm là nợ, dương là được trả
}