package com.example.appdev.returnhub.dto;

public class ClaimStatusUpdateDTO {
    private String status;
    private int reviewerStaffId;

    public ClaimStatusUpdateDTO() {}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getReviewerStaffId() {
        return reviewerStaffId;
    }

    public void setReviewerStaffId(int reviewerStaffId) {
        this.reviewerStaffId = reviewerStaffId;
    }
}
