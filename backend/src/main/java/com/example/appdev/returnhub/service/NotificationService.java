package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.dto.WebSocketNotificationDTO;
import com.example.appdev.returnhub.entity.Notification;
import com.example.appdev.returnhub.entity.User;
import com.example.appdev.returnhub.repositor.NotificationRepository;
import com.example.appdev.returnhub.repositor.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ==================== NOTIFICATION CREATION METHODS ====================

//    Create notification for REPORT status change (approved/rejected)

    @Transactional
    public void createReportStatusNotification(int userId, String reportType, String status, int reportId, String staffName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        String message = String.format("Your %s report has been %s by staff %s",
                reportType.toLowerCase(), status.toLowerCase(), staffName);

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);

        // s WebSocket notification
        sendWebSocketNotification(userId, saved, "REPORT", reportId, reportType.toLowerCase());
    }

//    Create notification for CLAIM status change (approved/rejected)

    @Transactional
    public void createClaimStatusNotification(int userId, String itemType, String status, int claimId, String staffName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        String message = String.format("Your claim for %s item has been %s by staff %s",
                itemType.toLowerCase(), status.toLowerCase(), staffName);

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);

        // Sends WebSocket notification
        sendWebSocketNotification(userId, saved, "CLAIM", claimId, itemType.toLowerCase());
    }

//    Create notification for NEW MESSAGE from staff

    @Transactional
    public void createNewMessageNotification(int userId, int conversationId, String staffName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        String message = String.format("New message from staff %s", staffName);

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);

        // Sends WebSocket notification
        sendWebSocketNotification(userId, saved, "MESSAGE", conversationId, "conversation");
    }

    // ==================== NOTIFICATION RETRIEVAL METHODS ====================


//    Get all notifications for a user (for sidebar)

    public List<Notification> getUserNotifications(int userId) {
        return notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }

//    Get unread notifications count (for bell icon badge)

    public long getUnreadCount(int userId) {
        return notificationRepository.countByUser_UserIdAndIsReadFalse(userId);
    }


//    Get recent notifications (last 20, for initial sidebar load)

    public List<Notification> getRecentNotifications(int userId, int limit) {
        return notificationRepository.findTopNByUser_UserIdOrderByCreatedAtDesc(userId, limit);
    }

    // ==================== NOTIFICATION ACTION METHODS ====================


//    Mark notification as read (when user clicks on it)

    @Transactional
    public void markAsRead(int notificationId, int userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        if (notification.getUser().getUserId() != userId) {
            throw new RuntimeException("Unauthorized: Cannot mark another user's notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }


//    Mark all notifications as read for a user

    @Transactional
    public void markAllAsRead(int userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUser_UserIdAndIsReadFalse(userId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

//    Delete a notification

    @Transactional
    public void deleteNotification(int notificationId, int userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        if (notification.getUser().getUserId() != userId) {
            throw new RuntimeException("Unauthorized: Cannot delete another user's notification");
        }

        notificationRepository.delete(notification);
    }

//    Clear all notifications for a user

    @Transactional
    public void clearAllNotifications(int userId) {
        List<Notification> userNotifications = notificationRepository.findByUser_UserId(userId);
        notificationRepository.deleteAll(userNotifications);
    }

    // ==================== WEB SOCKET METHODS ====================


//    Convert Notification entity to WebSocket DTO

    private WebSocketNotificationDTO convertToWebSocketDTO(Notification notification, String type, int relatedId, String relatedType) {
        WebSocketNotificationDTO dto = new WebSocketNotificationDTO();
        dto.setNotificationId(notification.getNotificationId());
        dto.setMessage(notification.getMessage());
        dto.setType(type);
        dto.setRelatedId(relatedId);
        dto.setRelatedType(relatedType);
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRead(notification.isRead());
        return dto;
    }


//    Send notification via WebSocket to specific user

    private void sendWebSocketNotification(int userId, Notification notification, String type, int relatedId, String relatedType) {
        WebSocketNotificationDTO dto = convertToWebSocketDTO(notification, type, relatedId, relatedType);

        messagingTemplate.convertAndSendToUser(
                String.valueOf(userId),
                "/queue/notifications",
                dto
        );
    }


//    Send test notification (for development)

    public void sendTestNotification(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return;

        Notification notification = new Notification();
        notification.setUser(userOpt.get());
        notification.setMessage("Test notification from system");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);

        WebSocketNotificationDTO dto = convertToWebSocketDTO(saved, "SYSTEM", 0, "test");
        messagingTemplate.convertAndSendToUser(
                String.valueOf(userId),
                "/queue/notifications",
                dto
        );
    }
}