package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.entity.Notification;
import com.example.appdev.returnhub.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // ==================== GET ENDPOINTS ====================

    /**
     * GET /api/notifications/user/{userId}
     * Get all notifications for user (sidebar)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable int userId) {
        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return createErrorResponse("Error fetching notifications: " + e.getMessage());
        }
    }

    /**
     * GET /api/notifications/user/{userId}/recent
     * Get recent notifications (for initial sidebar load)
     * Query param: limit (default 20)
     */
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<?> getRecentNotifications(
            @PathVariable int userId,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            List<Notification> notifications = notificationService.getRecentNotifications(userId, limit);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return createErrorResponse("Error fetching recent notifications: " + e.getMessage());
        }
    }

    /**
     * GET /api/notifications/user/{userId}/unread-count
     * Get unread notifications count (for bell badge)
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable int userId) {
        try {
            long count = notificationService.getUnreadCount(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("userId", userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse("Error fetching unread count: " + e.getMessage());
        }
    }

    // ==================== POST/PUT ENDPOINTS ====================

    /**
     * PUT /api/notifications/{notificationId}/read
     * Mark a notification as read (when user clicks on it)
     * Query param: userId (for authorization)
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable int notificationId,
            @RequestParam int userId) {
        try {
            notificationService.markAsRead(notificationId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification marked as read");
            response.put("notificationId", notificationId);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage());
        } catch (Exception e) {
            return createErrorResponse("Error marking notification as read: " + e.getMessage());
        }
    }

    /**
     * PUT /api/notifications/user/{userId}/read-all
     * Mark all notifications as read for user
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable int userId) {
        try {
            notificationService.markAllAsRead(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All notifications marked as read");
            response.put("userId", userId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse("Error marking all as read: " + e.getMessage());
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /api/notifications/{notificationId}
     * Delete a specific notification
     * Query param: userId (for authorization)
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable int notificationId,
            @RequestParam int userId) {
        try {
            notificationService.deleteNotification(notificationId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification deleted");
            response.put("notificationId", notificationId);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage());
        } catch (Exception e) {
            return createErrorResponse("Error deleting notification: " + e.getMessage());
        }
    }

    /**
     * DELETE /api/notifications/user/{userId}/clear
     * Clear all notifications for user
     */
    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<?> clearAllNotifications(@PathVariable int userId) {
        try {
            notificationService.clearAllNotifications(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All notifications cleared");
            response.put("userId", userId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse("Error clearing notifications: " + e.getMessage());
        }
    }

    // ==================== TEST ENDPOINTS (for development) ====================

    /**
     * POST /api/notifications/test/{userId}
     * Send a test notification (development only)
     */
    @PostMapping("/test/{userId}")
    public ResponseEntity<?> sendTestNotification(@PathVariable int userId) {
        try {
            notificationService.sendTestNotification(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test notification sent");
            response.put("userId", userId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse("Error sending test notification: " + e.getMessage());
        }
    }

    // ==================== HELPER METHOD ====================

    private ResponseEntity<?> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}