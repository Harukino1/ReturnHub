package com.example.appdev.returnhub.dto;

import java.time.LocalDateTime;

public class MessageDTO {
    private int messageId;
    private int conversationId;
    private String content;
    private LocalDateTime createdAt;
    private String formattedTime;

    private Integer senderUserId;
    private String senderUserName;
    private String senderUserProfileImage;

    private Integer senderStaffId;
    private String senderStaffName;
    private String senderStaffProfileImage;

    private String senderType;
    private boolean isRead;

    public MessageDTO() {}

    public MessageDTO(int messageId, String content, LocalDateTime createdAt) {
        this.messageId = messageId;
        this.content = content;
        this.createdAt = createdAt;
    }

    public int getMessageId() {
        return messageId;
    }

    public void setMessageId(int messageId) {
        this.messageId = messageId;
    }

    public int getConversationId() {
        return conversationId;
    }

    public void setConversationId(int conversationId) {
        this.conversationId = conversationId;
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

    public String getFormattedTime() {
        return formattedTime;
    }

    public void setFormattedTime(String formattedTime) {
        this.formattedTime = formattedTime;
    }

    public Integer getSenderUserId() {
        return senderUserId;
    }

    public void setSenderUserId(Integer senderUserId) {
        this.senderUserId = senderUserId;
    }

    public String getSenderUserName() {
        return senderUserName;
    }

    public void setSenderUserName(String senderUserName) {
        this.senderUserName = senderUserName;
    }

    public String getSenderUserProfileImage() {
        return senderUserProfileImage;
    }

    public void setSenderUserProfileImage(String senderUserProfileImage) {
        this.senderUserProfileImage = senderUserProfileImage;
    }

    public Integer getSenderStaffId() {
        return senderStaffId;
    }

    public void setSenderStaffId(Integer senderStaffId) {
        this.senderStaffId = senderStaffId;
    }

    public String getSenderStaffName() {
        return senderStaffName;
    }

    public void setSenderStaffName(String senderStaffName) {
        this.senderStaffName = senderStaffName;
    }

    public String getSenderStaffProfileImage() {
        return senderStaffProfileImage;
    }

    public void setSenderStaffProfileImage(String senderStaffProfileImage) {
        this.senderStaffProfileImage = senderStaffProfileImage;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
}
