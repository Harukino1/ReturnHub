package com.example.appdev.returnhub.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class FoundItemResponseDTO {
    private int itemId;
    private String status;
    private LocalDateTime createdAt;
    private int postedByStaffId;
    private String postedByStaffName;
    private int reportId;
    private String type;
    private String category;
    private String description;
    private String location;
    private String photoUrl1;
    private String photoUrl2;
    private String photoUrl3;
    private LocalDate dateOfEvent;

    // Constructors
    public FoundItemResponseDTO() {}

    // Getters and Setters
    public int getItemId() { return itemId; }
    public void setItemId(int itemId) { this.itemId = itemId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getPostedByStaffId() { return postedByStaffId; }
    public void setPostedByStaffId(int postedByStaffId) { this.postedByStaffId = postedByStaffId; }

    public String getPostedByStaffName() { return postedByStaffName; }
    public void setPostedByStaffName(String postedByStaffName) { this.postedByStaffName = postedByStaffName; }

    public int getReportId() { return reportId; }
    public void setReportId(int reportId) { this.reportId = reportId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPhotoUrl1() { return photoUrl1; }
    public void setPhotoUrl1(String photoUrl1) { this.photoUrl1 = photoUrl1; }

    public String getPhotoUrl2() { return photoUrl2; }
    public void setPhotoUrl2(String photoUrl2) { this.photoUrl2 = photoUrl2; }

    public String getPhotoUrl3() { return photoUrl3; }
    public void setPhotoUrl3(String photoUrl3) { this.photoUrl3 = photoUrl3; }

    public LocalDate getDateOfEvent() { return dateOfEvent; }
    public void setDateOfEvent(LocalDate dateOfEvent) { this.dateOfEvent = dateOfEvent; }
}