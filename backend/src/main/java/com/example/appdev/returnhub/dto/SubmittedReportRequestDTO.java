package com.example.appdev.returnhub.dto;

import java.time.LocalDate;

public class SubmittedReportRequestDTO {
    private String type; // Lost & Found
    private String category;
    private String itemName;
    private String description;
    private LocalDate dateOfEvent;
    private String location;
    private String photoUrl1;
    private String photoUrl2;
    private String photoUrl3;
    private int submitterUserId;

    // Constructors
    public SubmittedReportRequestDTO() {
    }

    public SubmittedReportRequestDTO(String type, String category, String itemName, String description,
            LocalDate dateOfEvent, String location,
            String photoUrl1, String photoUrl2, String photoUrl3,
            int submitterUserId) {
        this.type = type;
        this.category = category;
        this.itemName = itemName;
        this.description = description;
        this.dateOfEvent = dateOfEvent;
        this.location = location;
        this.photoUrl1 = photoUrl1;
        this.photoUrl2 = photoUrl2;
        this.photoUrl3 = photoUrl3;
        this.submitterUserId = submitterUserId;
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDateOfEvent() {
        return dateOfEvent;
    }

    public void setDateOfEvent(LocalDate dateOfEvent) {
        this.dateOfEvent = dateOfEvent;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPhotoUrl1() {
        return photoUrl1;
    }

    public void setPhotoUrl1(String photoUrl1) {
        this.photoUrl1 = photoUrl1;
    }

    public String getPhotoUrl2() {
        return photoUrl2;
    }

    public void setPhotoUrl2(String photoUrl2) {
        this.photoUrl2 = photoUrl2;
    }

    public String getPhotoUrl3() {
        return photoUrl3;
    }

    public void setPhotoUrl3(String photoUrl3) {
        this.photoUrl3 = photoUrl3;
    }

    public int getSubmitterUserId() {
        return submitterUserId;
    }

    public void setSubmitterUserId(int submitterUserId) {
        this.submitterUserId = submitterUserId;
    }
}
