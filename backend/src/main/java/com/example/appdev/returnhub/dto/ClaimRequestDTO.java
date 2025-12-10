package com.example.appdev.returnhub.dto;

public class ClaimRequestDTO {
    private Integer lostItemId;
    private Integer foundItemId;
    private int claimantUserId;
    private String proofDocumentUrl;

    public ClaimRequestDTO() {}

    public ClaimRequestDTO(Integer lostItemId, Integer foundItemId, int claimantUserId, String proofDocumentUrl) {
        this.lostItemId = lostItemId;
        this.foundItemId = foundItemId;
        this.claimantUserId = claimantUserId;
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

    public String getProofDocumentUrl() {
        return proofDocumentUrl;
    }

    public void setProofDocumentUrl(String proofDocumentUrl) {
        this.proofDocumentUrl = proofDocumentUrl;
    }

    // Helper method to validate the request
    public boolean isValid() {
        // Must have exactly ONE item ID (either lost OR found, not both or none)
        boolean hasLostItem = lostItemId != null;
        boolean hasFoundItem = foundItemId != null;

        return (hasLostItem && !hasFoundItem) || (!hasLostItem && hasFoundItem);
    }

    // Helper method to get item type
    public String getItemType() {
        if (lostItemId != null) {
            return "LOST";
        } else if (foundItemId != null) {
            return "FOUND";
        }
        return null;
    }

    // Helper method to get the item ID (whichever is not null)
    public int getItemId() {
        if (lostItemId != null) {
            return lostItemId;
        } else if (foundItemId != null) {
            return foundItemId;
        }
        throw new IllegalStateException("No item ID provided");
    }
}
