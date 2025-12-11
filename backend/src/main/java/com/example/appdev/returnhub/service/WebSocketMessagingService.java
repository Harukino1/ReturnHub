package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.dto.MessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketMessagingService {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ConversationService conversationService;

//    Send message via WebSocket

    public void sendMessageViaWebSocket(int conversationId, MessageDTO messageDTO) {
        // Send to conversation topic
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId,
                messageDTO
        );

        // Also send to user's private queue for notifications
        if ("STAFF".equals(messageDTO.getSenderType())) {
            // Message from staff, notify user
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(messageDTO.getSenderStaffId()),
                    "/queue/messages",
                    messageDTO
            );
        } else if ("USER".equals(messageDTO.getSenderType())) {
            // Message from user, notify staff
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(messageDTO.getSenderUserId()),
                    "/queue/messages",
                    messageDTO
            );
        }
    }

//    Send typing indicator

    public void sendTypingIndicator(int conversationId, int userId, String userType, String userName, boolean isTyping) {
        Map<String, Object> typingMessage = new HashMap<>();
        typingMessage.put("type", "TYPING");
        typingMessage.put("conversationId", conversationId);
        typingMessage.put("userId", userId);
        typingMessage.put("userType", userType);
        typingMessage.put("userName", userName);
        typingMessage.put("isTyping", isTyping);
        typingMessage.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/typing",
                typingMessage
        );
    }

//    Send message read receipt

    public void sendReadReceipt(int conversationId, int readerId, String readerType) {
        Map<String, Object> receipt = new HashMap<>();
        receipt.put("type", "READ_RECEIPT");
        receipt.put("conversationId", conversationId);
        receipt.put("readerId", readerId);
        receipt.put("readerType", readerType);
        receipt.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/read",
                receipt
        );
    }
}
