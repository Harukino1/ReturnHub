package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.dto.MessageDTO;
import com.example.appdev.returnhub.entity.Conversation;
import com.example.appdev.returnhub.entity.Message;
import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.entity.User;
import com.example.appdev.returnhub.repositor.ConversationRepository;
import com.example.appdev.returnhub.repositor.MessageRepository;
import com.example.appdev.returnhub.repositor.StaffRepository;
import com.example.appdev.returnhub.repositor.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private NotificationService notificationService;

    // ==================== MESSAGE MANAGEMENT ====================

    // Send a new message in a conversation

    @Transactional
    public MessageDTO sendMessage(int conversationId, Integer senderUserId, Integer senderStaffId, String content) {
        // Validate conversation exists
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found with id: " + conversationId));

        // Validate content
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        // Create new message
        Message message = new Message();
        message.setConversation(conversation);
        message.setContent(content.trim());
        message.setCreatedAt(LocalDateTime.now());
        message.setRead(false);

        // Set sender (either user or staff, not both)
        if (senderUserId != null && senderStaffId != null) {
            throw new RuntimeException("Only one sender (user OR staff) can be specified");
        }

        if (senderUserId != null) {
            // Message from user
            User user = userRepository.findById(senderUserId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + senderUserId));
            message.setSenderUser(user);

            // Send notification to staff
            notificationService.createNewMessageNotification(
                    conversation.getStaff().getStaffId(),
                    conversationId,
                    user.getName());

        } else if (senderStaffId != null) {
            // Message from staff
            Staff staff = staffRepository.findById(senderStaffId)
                    .orElseThrow(() -> new RuntimeException("Staff not found with id: " + senderStaffId));
            message.setSenderStaff(staff);

            // Send notification to user
            notificationService.createNewMessageNotification(
                    conversation.getUser().getUserId(),
                    conversationId,
                    staff.getName());

        } else {
            throw new RuntimeException("Either senderUserId or senderStaffId must be provided");
        }

        // Save message
        Message savedMessage = messageRepository.save(message);

        // Return as DTO
        return convertToDTO(savedMessage);
    }

    // Get all messages in a conversation

    public List<MessageDTO> getMessagesByConversationId(int conversationId) {
        List<Message> messages = messageRepository.findByConversation_ConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get specific message by ID

    public MessageDTO getMessageById(int messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + messageId));
        return convertToDTO(message);
    }

    // Mark a message as read

    @Transactional
    public void markAsRead(int messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + messageId));

        message.setRead(true);
        messageRepository.save(message);
    }

    // Mark all messages in a conversation as read for a specific user/staff

    @Transactional
    public void markAllAsRead(int conversationId, Integer userId, Integer staffId) {
        if (userId != null && staffId != null) {
            throw new RuntimeException("Only one of userId or staffId should be provided");
        }

        if (userId != null) {
            // User is reading, so mark messages from staff as read
            messageRepository.markMessagesAsRead(conversationId, true);
        } else if (staffId != null) {
            // Staff is reading, so mark messages from user as read
            messageRepository.markMessagesAsRead(conversationId, false);
        } else {
            throw new RuntimeException("Either userId or staffId must be provided");
        }
    }

    // Get unread message count for a conversation

    public long getUnreadCount(int conversationId, Integer userId, Integer staffId) {
        if (userId != null && staffId != null) {
            throw new RuntimeException("Only one of userId or staffId should be provided");
        }

        if (userId != null) {
            return messageRepository.countUnreadMessages(conversationId, true);
        } else if (staffId != null) {
            return messageRepository.countUnreadMessages(conversationId, false);
        } else {
            throw new RuntimeException("Either userId or staffId must be provided");
        }
    }

    // Delete a message (soft delete - just sets content to "[Deleted]")

    @Transactional
    public void deleteMessage(int messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + messageId));

        // Soft delete by changing content
        message.setContent("[Message deleted]");
        messageRepository.save(message);
    }

    // Get recent messages with limit

    public List<MessageDTO> getRecentMessages(int conversationId, int limit) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0,
                Math.max(1, limit));
        List<Message> messages = messageRepository.findByConversation_ConversationIdOrderByCreatedAtDesc(conversationId,
                pageable);
        return messages.stream()
                .map(this::convertToDTO)
                .sorted((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================

    // Convert Message entity to MessageDTO

    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setMessageId(message.getMessageId());
        dto.setConversationId(message.getConversation().getConversationId());
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setFormattedTime(formatTime(message.getCreatedAt()));
        dto.setRead(message.isRead());

        // Set sender information
        if (message.getSenderUser() != null) {
            dto.setSenderUserId(message.getSenderUser().getUserId());
            dto.setSenderUserName(message.getSenderUser().getName());
            dto.setSenderUserProfileImage(message.getSenderUser().getProfileImage());
            dto.setSenderType("USER");
        } else if (message.getSenderStaff() != null) {
            dto.setSenderStaffId(message.getSenderStaff().getStaffId());
            dto.setSenderStaffName(message.getSenderStaff().getName());
            dto.setSenderStaffProfileImage(message.getSenderStaff().getProfileImage());
            dto.setSenderType("STAFF");
        }

        return dto;
    }

    // Format time for display

    private String formatTime(LocalDateTime time) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        return time.format(formatter);
    }

    // Check if user can access message

    public boolean canAccessMessage(int messageId, int userId, String userType) {
        try {
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new RuntimeException("Message not found"));

            Conversation conversation = message.getConversation();

            if ("USER".equalsIgnoreCase(userType)) {
                return conversation.getUser().getUserId() == userId;
            } else if ("STAFF".equalsIgnoreCase(userType)) {
                return conversation.getStaff().getStaffId() == userId;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
