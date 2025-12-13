package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.dto.ConversationDTO;
import com.example.appdev.returnhub.dto.MessageDTO;
import com.example.appdev.returnhub.service.ConversationService;
import com.example.appdev.returnhub.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ==================== REST ENDPOINTS ====================

    // GET /api/conversations/user/{userId}
    // Get all conversations for a user

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserConversations(@PathVariable int userId) {
        try {
            List<ConversationDTO> conversations = conversationService.getUserConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return createErrorResponse("Error fetching user conversations: " + e.getMessage());
        }
    }

    // GET /api/conversations/staff/{staffId}
    // Get all conversations for a staff member

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<?> getStaffConversations(@PathVariable int staffId) {
        try {
            List<ConversationDTO> conversations = conversationService.getStaffConversations(staffId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return createErrorResponse("Error fetching staff conversations: " + e.getMessage());
        }
    }

    // GET /api/conversations/{conversationId}
    // Get specific conversation by ID

    @GetMapping("/{conversationId}")
    public ResponseEntity<?> getConversation(@PathVariable int conversationId) {
        try {
            ConversationDTO conversation = conversationService.getConversation(conversationId);
            return ResponseEntity.ok(conversation);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return createErrorResponse("Error fetching conversation: " + e.getMessage());
        }
    }

    // POST /api/conversations
    // Create or get existing conversation between user and staff

    @PostMapping
    public ResponseEntity<?> createOrGetConversation(@RequestBody Map<String, Integer> request) {
        try {
            Integer userId = request.get("userId");
            Integer staffId = request.get("staffId");

            if (userId == null) {
                return createErrorResponse("userId is required", HttpStatus.BAD_REQUEST);
            }

            ConversationDTO conversation = (staffId == null)
                    ? conversationService.getOrCreateConversationAuto(userId)
                    : conversationService.getOrCreateConversation(userId, staffId);
            return ResponseEntity.ok(conversation);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return createErrorResponse("Error creating conversation: " + e.getMessage());
        }
    }

    // GET /api/conversations/{conversationId}/messages
    // Get all messages in a conversation

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<?> getConversationMessages(@PathVariable int conversationId) {
        try {
            List<MessageDTO> messages = conversationService.getConversationMessages(conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return createErrorResponse("Error fetching messages: " + e.getMessage());
        }
    }

    // GET /api/conversations/{conversationId}/recent
    // Get recent messages with pagination

    @GetMapping("/{conversationId}/recent")
    public ResponseEntity<?> getRecentMessages(
            @PathVariable int conversationId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<MessageDTO> messages = conversationService.getRecentMessages(conversationId, limit);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return createErrorResponse("Error fetching recent messages: " + e.getMessage());
        }
    }

    // POST /api/conversations/{conversationId}/messages
    // Send a message in a conversation (REST endpoint as fallback)

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable int conversationId,
            @RequestBody Map<String, Object> request) {
        try {
            Integer senderId = (Integer) request.get("senderId");
            String senderType = (String) request.get("senderType");
            String content = (String) request.get("content");

            if (senderId == null || senderType == null || content == null || content.trim().isEmpty()) {
                return createErrorResponse("senderId, senderType, and content are required", HttpStatus.BAD_REQUEST);
            }

            MessageDTO message = conversationService.sendMessage(conversationId, senderId, senderType, content);

            // Broadcast to conversation topic for real-time updates
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, message);

            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return createErrorResponse("Error sending message: " + e.getMessage());
        }
    }

    // PUT /api/conversations/{conversationId}/read
    // Mark messages as read in a conversation

    @PutMapping("/{conversationId}/read")
    public ResponseEntity<?> markMessagesAsRead(
            @PathVariable int conversationId,
            @RequestParam boolean isUser) {
        try {
            conversationService.markMessagesAsRead(conversationId, isUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Messages marked as read");
            response.put("conversationId", conversationId);
            response.put("isUser", isUser);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse("Error marking messages as read: " + e.getMessage());
        }
    }

    // GET /api/conversations/{conversationId}/unread-count
    // Get unread message count for a user in conversation

    @GetMapping("/{conversationId}/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @PathVariable int conversationId,
            @RequestParam boolean isUser) {
        try {
            long unreadCount = conversationService.getUnreadCount(conversationId, isUser);

            Map<String, Object> response = new HashMap<>();
            response.put("conversationId", conversationId);
            response.put("isUser", isUser);
            response.put("unreadCount", unreadCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse("Error getting unread count: " + e.getMessage());
        }
    }

    // ==================== WEB SOCKET ENDPOINTS ====================

    // WebSocket endpoint for sending messages
    // MessageMapping: /app/chat.sendMessage

    @MessageMapping("/chat.sendMessage")
    public MessageDTO sendMessageViaWebSocket(@Payload Map<String, Object> payload) {
        try {
            Integer conversationId = (Integer) payload.get("conversationId");
            Integer senderId = (Integer) payload.get("senderId");
            String senderType = (String) payload.get("senderType");
            String content = (String) payload.get("content");

            if (conversationId == null || senderId == null || senderType == null || content == null) {
                throw new RuntimeException("Missing required fields");
            }

            MessageDTO message = conversationService.sendMessage(conversationId, senderId, senderType, content);

            // Broadcast to conversation topic for all participants
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, message);

            String destination = "/user/" +
                    ("USER".equals(senderType) ? conversationService.getConversation(conversationId).getStaffId()
                            : conversationService.getConversation(conversationId).getUserId())
                    +
                    "/queue/messages";

            messagingTemplate.convertAndSend(destination, message);

            return message;
        } catch (Exception e) {
            MessageDTO errorMessage = new MessageDTO();
            errorMessage.setContent("Error: " + e.getMessage());
            errorMessage.setCreatedAt(LocalDateTime.now());
            return errorMessage;
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
