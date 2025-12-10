package com.example.appdev.returnhub.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class SubmittedReportResponseDTO {
    private int reportId;
    private String type;
    private String category;
    private String description;
    private LocalDate dateOfEvent;
    private String location;
    private String photoUrl1;
    private String photoUrl2;
    private String photoUrl3;
    private String status;
    private LocalDateTime dateSubmitted;
    private LocalDateTime dateReviewed;
    private int submitterUserId;
    private String submitterUserName;
    private int reviewerStaffId;
    private String reviewerStaffName;

    // Constructors
    public SubmittedReportResponseDTO() {}

    // Getters and Setters
    public int getReportId() { return reportId; }
    public void setReportId(int reportId) { this.reportId = reportId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDateOfEvent() { return dateOfEvent; }
    public void setDateOfEvent(LocalDate dateOfEvent) { this.dateOfEvent = dateOfEvent; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getDateSubmitted() { return dateSubmitted; }
    public void setDateSubmitted(LocalDateTime dateSubmitted) { this.dateSubmitted = dateSubmitted; }

    public LocalDateTime getDateReviewed() { return dateReviewed; }
    public void setDateReviewed(LocalDateTime dateReviewed) { this.dateReviewed = dateReviewed; }

    public int getSubmitterUserId() { return submitterUserId; }
    public void setSubmitterUserId(int submitterUserId) { this.submitterUserId = submitterUserId; }

    public String getSubmitterUserName() { return submitterUserName; }
    public void setSubmitterUserName(String submitterUserName) { this.submitterUserName = submitterUserName; }

    public int getReviewerStaffId() { return reviewerStaffId; }
    public void setReviewerStaffId(int reviewerStaffId) { this.reviewerStaffId = reviewerStaffId; }

    public String getReviewerStaffName() { return reviewerStaffName; }
    public void setReviewerStaffName(String reviewerStaffName) { this.reviewerStaffName = reviewerStaffName; }
}
