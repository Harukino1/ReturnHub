package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.dto.ConversationDTO;
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
public class ConversationService {
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private NotificationService notificationService;

    // ==================== CONVERSATION MANAGEMENT ====================

    // Create or get existing conversation between user and staff

    @Transactional
    public ConversationDTO getOrCreateConversation(int userId, int staffId) {
        // Check if conversation already exists
        List<Conversation> existing = conversationRepository.findByUser_UserIdAndStaff_StaffId(userId, staffId);

        if (!existing.isEmpty()) {
            return convertToDTO(existing.get(0));
        }

        // Create new conversation
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + staffId));

        Conversation conversation = new Conversation();
        conversation.setUser(user);
        conversation.setStaff(staff);

        Conversation savedConversation = conversationRepository.save(conversation);
        return convertToDTO(savedConversation);
    }

    // Auto-pick a staff and create/get conversation
    @Transactional
    public ConversationDTO getOrCreateConversationAuto(int userId) {
        List<Staff> staffList = staffRepository.findAll();
        if (staffList.isEmpty()) {
            throw new RuntimeException("No staff available to assign for conversation");
        }
        Staff selected = staffList.stream()
                .filter(s -> "STAFF".equalsIgnoreCase(s.getRole()))
                .findFirst()
                .orElse(staffList.get(0));
        return getOrCreateConversation(userId, selected.getStaffId());
    }

    // Get all conversations for a user

    public List<ConversationDTO> getUserConversations(int userId) {
        List<Conversation> conversations = conversationRepository.findByUser_UserIdOrderByConversationIdDesc(userId);
        return conversations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get all conversations for a staff member

    public List<ConversationDTO> getStaffConversations(int staffId) {
        List<Conversation> conversations = conversationRepository.findByStaff_StaffIdOrderByConversationIdDesc(staffId);
        return conversations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get specific conversation by ID

    public ConversationDTO getConversation(int conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found with id: " + conversationId));
        return convertToDTO(conversation);
    }

    // ==================== MESSAGE MANAGEMENT ====================

    // Send message in a conversation

    @Transactional
    public MessageDTO sendMessage(int conversationId, int senderId, String senderType, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found with id: " + conversationId));

        Message message = new Message();
        message.setConversation(conversation);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        message.setRead(false);

        if ("USER".equalsIgnoreCase(senderType)) {
            User user = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + senderId));
            message.setSenderUser(user);

            // Send notification to staff
            notificationService.createNewMessageNotification(
                    conversation.getStaff().getStaffId(),
                    conversationId,
                    user.getName());

        } else if ("STAFF".equalsIgnoreCase(senderType)) {
            Staff staff = staffRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("Staff not found with id: " + senderId));
            message.setSenderStaff(staff);

            // Send notification to user
            notificationService.createNewMessageNotification(
                    conversation.getUser().getUserId(),
                    conversationId,
                    staff.getName());
        } else {
            throw new RuntimeException("Invalid sender type. Must be USER or STAFF");
        }

        Message savedMessage = messageRepository.save(message);
        return convertToMessageDTO(savedMessage);
    }

    // Get all messages in a conversation

    public List<MessageDTO> getConversationMessages(int conversationId) {
        List<Message> messages = messageRepository.findByConversation_ConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }

    // Get recent messages with pagination

    public List<MessageDTO> getRecentMessages(int conversationId, int limit) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0,
                Math.max(1, limit));
        List<Message> messages = messageRepository.findByConversation_ConversationIdOrderByCreatedAtDesc(conversationId,
                pageable);
        return messages.stream()
                .map(this::convertToMessageDTO)
                .sorted((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // Mark messages as read in a conversation

    @Transactional
    public void markMessagesAsRead(int conversationId, boolean isUser) {
        messageRepository.markMessagesAsRead(conversationId, isUser);
    }

    // Get unread message count for a user in conversation

    public long getUnreadCount(int conversationId, boolean isUser) {
        return messageRepository.countUnreadMessages(conversationId, isUser);
    }

    // ==================== HELPER METHODS ====================

    // Convert Conversation entity to DTO

    private ConversationDTO convertToDTO(Conversation conversation) {
        ConversationDTO dto = new ConversationDTO();
        dto.setConversationId(conversation.getConversationId());
        dto.setUserId(conversation.getUser().getUserId());
        dto.setUserName(conversation.getUser().getName());
        dto.setUserProfileImage(conversation.getUser().getProfileImage());
        dto.setStaffId(conversation.getStaff().getStaffId());
        dto.setStaffName(conversation.getStaff().getName());
        dto.setStaffProfileImage(conversation.getStaff().getProfileImage());

        // Get last message
        List<Message> lastMessages = messageRepository.findTop1ByConversation_ConversationIdOrderByCreatedAtDesc(
                conversation.getConversationId());

        if (!lastMessages.isEmpty()) {
            Message lastMessage = lastMessages.get(0);
            dto.setLastMessage(lastMessage.getContent());
            dto.setLastMessageTime(lastMessage.getCreatedAt());
        }

        // Get unread count for user (messages from staff that are unread)
        long unreadCount = messageRepository.countUnreadMessages(conversation.getConversationId(), true);
        dto.setUnreadCount((int) unreadCount);

        return dto;
    }

    // Convert Message entity to DTO

    private MessageDTO convertToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setMessageId(message.getMessageId());
        dto.setConversationId(message.getConversation().getConversationId());
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setFormattedTime(formatTime(message.getCreatedAt()));
        dto.setRead(message.isRead());

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

    // Check if user can access conversation

    public boolean canAccessConversation(int conversationId, int userId, String userType) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));

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
