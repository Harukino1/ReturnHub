package com.example.appdev.returnhub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "email", length = 100, nullable = false)
    private String email;

    @Column(name = "phone", length = 15, nullable = false)
    private String phone;

    @Column(name = "password", length = 100, nullable = false)
    private String password;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Constructors

    public User() {}
    public User(String name, String email, String phone,
                String password, boolean isVerified, LocalDateTime createdAt) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
    }

    // Getters and Setters

    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }



    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }



    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }



    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }



    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }



    public boolean isVerified() {
        return isVerified;
    }
    public void setVerified(boolean isVerified) {
        this.isVerified = isVerified;
    }



    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}