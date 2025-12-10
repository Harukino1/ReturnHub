package com.example.appdev.returnhub.dto;

public class ReportStatusUpdateDTO {
    private String status; // Approved, Pending, Rejected
    private int reviewerStaffId;
    private String reviewNotes; // Optional notes from staff

    // Constructors
    public ReportStatusUpdateDTO() {}

    public ReportStatusUpdateDTO(String status, int reviewerStaffId) {
        this.status = status;
        this.reviewerStaffId = reviewerStaffId;
    }

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getReviewerStaffId() { return reviewerStaffId; }
    public void setReviewerStaffId(int reviewerStaffId) { this.reviewerStaffId = reviewerStaffId; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
}