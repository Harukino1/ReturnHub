package com.example.appdev.returnhub.dto;

import java.time.LocalDateTime;

public class ConversationDTO {
    private int conversationId;
    private int userId;
    private String userName;
    private String userProfileImage;
    private int staffId;
    private String staffName;
    private String staffProfileImage;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private int unreadCount;
    private LocalDateTime createdAt;

    public ConversationDTO() {}

    public ConversationDTO(int conversationId, int userId, String userName, int staffId, String staffName) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.userName = userName;
        this.staffId = staffId;
        this.staffName = staffName;
    }

    public int getConversationId() {
        return conversationId;
    }

    public void setConversationId(int conversationId) {
        this.conversationId = conversationId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserProfileImage() {
        return userProfileImage;
    }

    public void setUserProfileImage(String userProfileImage) {
        this.userProfileImage = userProfileImage;
    }

    public int getStaffId() {
        return staffId;
    }

    public void setStaffId(int staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getStaffProfileImage() {
        return staffProfileImage;
    }

    public void setStaffProfileImage(String staffProfileImage) {
        this.staffProfileImage = staffProfileImage;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public int getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(int unreadCount) {
        this.unreadCount = unreadCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
