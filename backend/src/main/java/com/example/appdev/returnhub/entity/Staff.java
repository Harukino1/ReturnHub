package com.example.appdev.returnhub.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "staffs")
public class Staff{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id")
    private int staffId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "email", length = 100, nullable = false)
    private String email;

    @Column(name = "password", length = 100, nullable = false)
    private String password;

    @Column(name = "role", length = 20, nullable = false)
    private String role;

    @Column(name = "profile_image", columnDefinition = "TEXT")
    private String profileImage;

    // Relationships

    @OneToMany(mappedBy = "postedByStaff")
    private List<FoundItem> foundItems;

    @OneToMany(mappedBy = "postedByStaff")
    private List<LostItem> lostItems;

    @OneToMany(mappedBy = "reviewerStaff")
    private List<SubmittedReport> reviewedReports;

    @OneToMany(mappedBy = "verifiedByStaff")
    private List<Claim> verifiedClaims;

    @OneToMany(mappedBy = "staff")
    private List<Conversation> conversations;

    @OneToMany(mappedBy = "senderStaff")
    private List<Message> messages;

    // Constructor

    public Staff() {}
    public Staff(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters

    public int getStaffId() {
        return staffId;
    }
    public void setStaffId(int staffId) {
        this.staffId = staffId;
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



    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }



    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }

    public String getProfileImage() {
        return profileImage;
    }
    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}
