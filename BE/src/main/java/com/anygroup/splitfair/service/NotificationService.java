package com.anygroup.splitfair.service;

import com.anygroup.splitfair.dto.NotificationDTO;
import com.anygroup.splitfair.enums.NotificationType;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<NotificationDTO> getMyNotifications(UUID userId);
    long countUnread(UUID userId);
    void markAsRead(UUID notificationId);
    void markAllAsRead(UUID userId);
    void createNotification(UUID userId, String title, String message, NotificationType type, String referenceId);
    void sendDebtReminder(UUID fromUserId, UUID toUserId, java.math.BigDecimal amount, UUID groupId);
}
