package com.anygroup.splitfair.service.impl;

import com.anygroup.splitfair.dto.NotificationDTO;
import com.anygroup.splitfair.enums.NotificationType;
import com.anygroup.splitfair.model.Notification;
import com.anygroup.splitfair.model.User;
import com.anygroup.splitfair.repository.NotificationRepository;
import com.anygroup.splitfair.repository.UserRepository;
import com.anygroup.splitfair.repository.GroupRepository; // Add import
import com.anygroup.splitfair.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository; // Inject GroupRepository

    @Override
    public List<NotificationDTO> getMyNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedTimeDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countUnread(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedTimeDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    @Transactional
    public void createNotification(UUID userId, String title, String message, NotificationType type, String referenceId) {
        System.out.println("Creating notification for user: " + userId); // LOG
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        System.out.println("Notification saved with ID: " + saved.getId()); // LOG
    }

    // @Transactional
    // public void sendDebtReminder(UUID fromUserId, UUID toUserId, java.math.BigDecimal amount) {
    //     User fromUser = userRepository.findById(fromUserId)
    //             .orElseThrow(() -> new RuntimeException("Sender not found"));
        
    //     // Tạo thông báo cho người nợ (toUserId)
    //     createNotification(
    //             toUserId,
    //             "Nhắc nợ",
    //             fromUser.getUserName() + " nhắc bạn trả khoản nợ " + amount + "đ",
    //             NotificationType.DEBT_REMINDER,
    //             fromUserId.toString() // Reference ID có thể là ID người gửi để chat/xem profile
    //     );
    // }

    @Override
    @Transactional
    public void sendDebtReminder(UUID fromUserId, UUID toUserId, java.math.BigDecimal amount, UUID groupId) {
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        String groupName = "";
        if (groupId != null) {
             groupName = groupRepository.findById(groupId)
                 .map(g -> " trong " + g.getGroupName().toUpperCase())
                 .orElse("");
        }

        // Tạo thông báo cho người nợ (toUserId)
        createNotification(
                toUserId, 
                "Nhắc nợ",
                fromUser.getUserName() + " đã nhắc bạn thanh toán " + amount + "đ" + groupName,
                NotificationType.DEBT_REMINDER,
                groupId != null ? groupId.toString() : fromUserId.toString()
        );
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdTime(notification.getCreatedTime())
                .build();
    }
}
