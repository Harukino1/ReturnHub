package com.example.appdev.returnhub.dto;

import java.time.LocalDateTime;

public class ClaimResponseDTO {
    private int claimId;
    private String status;
    private LocalDateTime dateSubmitted;
    private String proofDocumentUrl;
    private Integer lostItemId;
    private Integer foundItemId;
    private int claimantUserId;
    private Integer verifiedByStaffId;

    public ClaimResponseDTO() {}

    public int getClaimId() {
        return claimId;
    }

    public void setClaimId(int claimId) {
        this.claimId = claimId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDateSubmitted() {
        return dateSubmitted;
    }

    public void setDateSubmitted(LocalDateTime dateSubmitted) {
        this.dateSubmitted = dateSubmitted;
    }

    public String getProofDocumentUrl() {
        return proofDocumentUrl;
    }

    public void setProofDocumentUrl(String proofDocumentUrl) {
        this.proofDocumentUrl = proofDocumentUrl;
    }

    public Integer getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(Integer lostItemId) {
        this.lostItemId = lostItemId;
    }

    public Integer getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(Integer foundItemId) {
        this.foundItemId = foundItemId;
    }

    public int getClaimantUserId() {
        return claimantUserId;
    }

    public void setClaimantUserId(int claimantUserId) {
        this.claimantUserId = claimantUserId;
    }

    public Integer getVerifiedByStaffId() {
        return verifiedByStaffId;
    }

    public void setVerifiedByStaffId(Integer verifiedByStaffId) {
        this.verifiedByStaffId = verifiedByStaffId;
    }

    // Helper method to determine item type
    public String getItemType() {
        if (lostItemId != null) {
            return "LOST";
        } else if (foundItemId != null) {
            return "FOUND";
        }
        return null;
    }
}
