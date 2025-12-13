package com.example.appdev.returnhub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private int messageId;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    // Relationships

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", nullable = true)
    private User senderUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_staff_id", nullable = true)
    private Staff senderStaff;

    // Constructors

    public Message() {}
    public Message(Conversation conversation, User senderUser, Staff senderStaff,
                   String content, LocalDateTime createdAt, boolean isRead) {
        this.conversation = conversation;
        this.senderUser = senderUser;
        this.senderStaff = senderStaff;
        this.content = content;
        this.createdAt = createdAt;
        this.isRead = isRead;
    }

    // Getters and Setters

    public int getMessageId() {
        return messageId;
    }
    public void setMessageId(int messageId) {
        this.messageId = messageId;
    }



    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }



    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }



    public Conversation getConversation() {
        return conversation;
    }
    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }



    public User getSenderUser() {
        return senderUser;
    }
    public void setSenderUser(User senderUser) {
        this.senderUser = senderUser;
    }



    public Staff getSenderStaff() {
        return senderStaff;
    }
    public void setSenderStaff(Staff senderStaff) {
        this.senderStaff = senderStaff;
    }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}
