package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.dto.MessageDTO;
import com.example.appdev.returnhub.service.MessageService;
import com.example.appdev.returnhub.service.WebSocketMessagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private WebSocketMessagingService webSocketMessagingService;

    // ==================== REST ENDPOINTS ====================

//    GET /api/messages/conversation/{conversationId}
//    Get all messages in a conversation

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<?> getMessagesByConversation(@PathVariable int conversationId) {
        try {
            List<MessageDTO> messages = messageService.getMessagesByConversationId(conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return createErrorResponse("Error fetching messages: " + e.getMessage());
        }
    }

//    GET /api/messages/{messageId}
//    Get specific message by ID

    @GetMapping("/{messageId}")
    public ResponseEntity<?> getMessageById(@PathVariable int messageId) {
        try {
            MessageDTO message = messageService.getMessageById(messageId);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse("Error fetching message: " + e.getMessage());
        }
    }


//    POST /api/messages
//    Send a new message

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request) {
        try {
            Integer conversationId = (Integer) request.get("conversationId");
            Integer senderUserId = (Integer) request.get("senderUserId");
            Integer senderStaffId = (Integer) request.get("senderStaffId");
            String content = (String) request.get("content");

            if (conversationId == null || content == null || content.trim().isEmpty()) {
                return createErrorResponse("conversationId and content are required", HttpStatus.BAD_REQUEST);
            }

            if (senderUserId == null && senderStaffId == null) {
                return createErrorResponse("Either senderUserId or senderStaffId is required", HttpStatus.BAD_REQUEST);
            }

            MessageDTO message = messageService.sendMessage(
                    conversationId,
                    senderUserId,
                    senderStaffId,
                    content
            );

            // Send via WebSocket for real-time updates
            webSocketMessagingService.sendMessageViaWebSocket(conversationId, message);

            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return createErrorResponse("Error sending message: " + e.getMessage());
        }
    }

//    PUT /api/messages/{messageId}/read
//    Mark a message as read

    @PutMapping("/{messageId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable int messageId) {
        try {
            messageService.markAsRead(messageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message marked as read");
            response.put("messageId", messageId);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse("Error marking message as read: " + e.getMessage());
        }
    }

//    PUT /api/messages/conversation/{conversationId}/read-all
//    Mark all messages in a conversation as read for a specific user/staff

    @PutMapping("/conversation/{conversationId}/read-all")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable int conversationId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer staffId) {
        try {
            if (userId == null && staffId == null) {
                return createErrorResponse("Either userId or staffId is required", HttpStatus.BAD_REQUEST);
            }

            messageService.markAllAsRead(conversationId, userId, staffId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All messages marked as read");
            response.put("conversationId", conversationId);
            if (userId != null) response.put("userId", userId);
            if (staffId != null) response.put("staffId", staffId);

            // Send read receipt via WebSocket
            webSocketMessagingService.sendReadReceipt(
                    conversationId,
                    userId != null ? userId : staffId,
                    userId != null ? "USER" : "STAFF"
            );

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return createErrorResponse("Error marking all messages as read: " + e.getMessage());
        }
    }


//    DELETE /api/messages/{messageId}
//    Delete a message (soft delete or permanent)

    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable int messageId) {
        try {
            messageService.deleteMessage(messageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message deleted");
            response.put("messageId", messageId);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse("Error deleting message: " + e.getMessage());
        }
    }


//    GET /api/messages/conversation/{conversationId}/unread
//    Get unread messages count for a conversation

    @GetMapping("/conversation/{conversationId}/unread")
    public ResponseEntity<?> getUnreadCount(
            @PathVariable int conversationId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer staffId) {
        try {
            if (userId == null && staffId == null) {
                return createErrorResponse("Either userId or staffId is required", HttpStatus.BAD_REQUEST);
            }

            long unreadCount = messageService.getUnreadCount(conversationId, userId, staffId);

            Map<String, Object> response = new HashMap<>();
            response.put("conversationId", conversationId);
            response.put("unreadCount", unreadCount);
            if (userId != null) response.put("userId", userId);
            if (staffId != null) response.put("staffId", staffId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse("Error getting unread count: " + e.getMessage());
        }
    }

    // ==================== WEB SOCKET ENDPOINTS ====================


//    WebSocket endpoint to subscribe to conversation messages

    @SubscribeMapping("/topic/conversation/{conversationId}")
    public String handleSubscription(@DestinationVariable int conversationId, SimpMessageHeaderAccessor headerAccessor) {
        return "Subscribed to conversation " + conversationId;
    }


//    WebSocket endpoint for sending messages

    @MessageMapping("/chat.send")
    public void handleChatMessage(@Payload Map<String, Object> messagePayload) {
        try {
            Integer conversationId = (Integer) messagePayload.get("conversationId");
            Integer senderId = (Integer) messagePayload.get("senderId");
            String senderType = (String) messagePayload.get("senderType");
            String content = (String) messagePayload.get("content");

            if (conversationId == null || senderId == null || senderType == null || content == null) {
                throw new RuntimeException("Missing required fields");
            }

            Integer senderUserId = "USER".equals(senderType) ? senderId : null;
            Integer senderStaffId = "STAFF".equals(senderType) ? senderId : null;

            MessageDTO message = messageService.sendMessage(conversationId, senderUserId, senderStaffId, content);

            webSocketMessagingService.sendMessageViaWebSocket(conversationId, message);
        } catch (Exception e) {
            System.err.println("Error handling chat message: " + e.getMessage());
        }
    }

//    WebSocket endpoint for typing indicators

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, Object> typingData) {
        try {
            Integer conversationId = (Integer) typingData.get("conversationId");
            Integer userId = (Integer) typingData.get("userId");
            String userType = (String) typingData.get("userType");
            String userName = (String) typingData.get("userName");
            Boolean isTyping = (Boolean) typingData.get("isTyping");

            if (conversationId != null && userId != null && userType != null && userName != null && isTyping != null) {
                webSocketMessagingService.sendTypingIndicator(
                        conversationId, userId, userType, userName, isTyping
                );
            }
        } catch (Exception e) {
            System.err.println("Error handling typing indicator: " + e.getMessage());
        }
    }

//    WebSocket endpoint for read receipts

    @MessageMapping("/chat.read")
    public void handleReadReceipt(@Payload Map<String, Object> readData) {
        try {
            Integer conversationId = (Integer) readData.get("conversationId");
            Integer readerId = (Integer) readData.get("readerId");
            String readerType = (String) readData.get("readerType");

            if (conversationId != null && readerId != null && readerType != null) {
                webSocketMessagingService.sendReadReceipt(conversationId, readerId, readerType);
            }
        } catch (Exception e) {
            System.err.println("Error handling read receipt: " + e.getMessage());
        }
    }

    // ==================== HELPER METHOD ====================

    private ResponseEntity<?> createErrorResponse(String message) {
        return createErrorResponse(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<?> createErrorResponse(String message, HttpStatus status) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }
}