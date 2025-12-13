package com.example.appdev.returnhub.repositor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.appdev.returnhub.entity.Message;

import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    // Find messages by conversation ID, ordered by creation time
    List<Message> findByConversation_ConversationIdOrderByCreatedAtAsc(int conversationId);

    // Find recent messages with limit (Pageable)
    List<Message> findByConversation_ConversationIdOrderByCreatedAtDesc(int conversationId, Pageable pageable);

    // Find last message in conversation
    @Query("SELECT m FROM Message m WHERE m.conversation.conversationId = :conversationId ORDER BY m.createdAt DESC")
    List<Message> findTop1ByConversation_ConversationIdOrderByCreatedAtDesc(@Param("conversationId") int conversationId);

    // Count unread messages for a user in a conversation
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.conversationId = :conversationId " +
            "AND ((:isUser = true AND m.senderStaff IS NOT NULL AND m.isRead = false) OR " +
            "(:isUser = false AND m.senderUser IS NOT NULL AND m.isRead = false))")
    long countUnreadMessages(@Param("conversationId") int conversationId, @Param("isUser") boolean isUser);

    // Marks messages as read
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.conversationId = :conversationId " +
            "AND ((:isUser = true AND m.senderStaff IS NOT NULL) OR " +
            "(:isUser = false AND m.senderUser IS NOT NULL))")
    void markMessagesAsRead(@Param("conversationId") int conversationId, @Param("isUser") boolean isUser);
}
