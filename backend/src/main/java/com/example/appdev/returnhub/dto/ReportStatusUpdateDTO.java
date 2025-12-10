package com.example.appdev.returnhub.dto;

public class ReportStatusUpdateDTO {
    private String status;
    private Integer reviewerStaffId;
    private String reviewNotes;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getReviewerStaffId() {
        return reviewerStaffId;
    }

    public void setReviewerStaffId(Integer reviewerStaffId) {
        this.reviewerStaffId = reviewerStaffId;
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }
}