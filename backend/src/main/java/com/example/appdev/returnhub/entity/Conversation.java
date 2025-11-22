package com.example.appdev.returnhub.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
public class Conversation{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "conversation_id")
    private int conversationId;

    // Relationships

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

    // Constructors

    public Conversation() {}
    public Conversation(User user, Staff staff) {
        this.user = user;
        this.staff = staff;
    }

    // Getters and Setters

    public int getConversationId() {
        return conversationId;
    }
    public void setConversationId(int conversationId) {
        this.conversationId = conversationId;
    }



    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }



    public Staff getStaff() {
        return staff;
    }
    public void setStaff(Staff staff) {
        this.staff = staff;
    }



    public List<Message> getMessages() {
        return messages;
    }
    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }

    //Helper Methods

    /*
    public void addMessage(Message message) {
        messages.add(message);
        message.setConversation(this);
    }
    public void removeMessage(Message message) {
        messages.remove(message);
        message.setConversation(null);
    }
    */
}