package com.anygroup.splitfair.controller;

import com.anygroup.splitfair.dto.NotificationDTO;
import com.anygroup.splitfair.model.User;
import com.anygroup.splitfair.repository.UserRepository;
import com.anygroup.splitfair.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(Authentication authentication) {
        String email = authentication.getName();
        System.out.println("Fetching notifications for email: " + email); // LOG
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<NotificationDTO> notifications = notificationService.getMyNotifications(user.getId());
        System.out.println("Found " + notifications.size() + " notifications for user " + user.getId()); // LOG
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(notificationService.countUnread(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/remind")
    public ResponseEntity<Void> sendDebtReminder(
            @RequestParam("fromUserId") UUID fromUserId,
            @RequestParam("toUserId") UUID toUserId,
            @RequestParam("amount") java.math.BigDecimal amount,
            @RequestParam(value = "groupId", required = false) UUID groupId
    ) {
        notificationService.sendDebtReminder(fromUserId, toUserId, amount, groupId);
        return ResponseEntity.ok().build();
    }
}
