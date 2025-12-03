export type NotificationType = 'GROUP_INVITE' | 'EXPENSE_ADDED' | 'DEBT_SETTLED' | 'DEBT_REMINDER' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string;
  isRead: boolean;
  createdTime: string;
}
