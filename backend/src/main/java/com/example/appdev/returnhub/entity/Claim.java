    package com.example.appdev.returnhub.entity;
    
    import jakarta.persistence.*;
    import java.time.LocalDateTime;
    
    @Entity
    @Table(name = "claims")
    public class Claim {
        
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "claim_id")
        private int claimId;
    
        @Column(name = "proof_document_url", length = 200, nullable = false)
        private String proofDocumentUrl;
    
        @Column(name = "status", length = 20, nullable = false)
        private String status;
    
        @Column(name = "date_submitted", nullable = false)
        private LocalDateTime dateSubmitted;

        // Relationships
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "lost_item_id")
        private LostItem lostItem;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "found_item_id")
        private FoundItem foundItem;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "claimant_user_id", nullable = false)
        private User claimantUser;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "verified_by_staff_id")
        private Staff verifiedByStaff;
    
        // Constrctors
    
        public Claim() {}
        public Claim(LostItem lostItem, FoundItem foundItem, User claimantUser, Staff verifiedByStaff,
                     String proofDocumentUrl, String status, LocalDateTime dateSubmitted) {
            this.lostItem = lostItem;
            this.foundItem = foundItem;
            this.claimantUser = claimantUser;
            this.verifiedByStaff = verifiedByStaff;
            this.proofDocumentUrl = proofDocumentUrl;
            this.status = status;
            this.dateSubmitted = dateSubmitted;
        }
    
        // Getters and Setters
    
        public int getClaimId() {
            return claimId;
        }
        public void setClaimId(int claimId) {
            this.claimId = claimId;
        }
    
    
        public LostItem getLostItem() {
            return lostItem;
        }
        public void setLostItem(LostItem lostItem) {
            this.lostItem = lostItem;
        }
    
    
    
        public FoundItem getFoundItem() {
            return foundItem;
        }
        public void setFoundItem(FoundItem foundItem) {
            this.foundItem = foundItem;
        }
    
    
    
        public User getClaimantUser() {
            return claimantUser;
        }
        public void setClaimantUser(User claimantUser) {
            this.claimantUser = claimantUser;
        }
    
    
    
        public Staff getVerifiedByStaff() {
            return verifiedByStaff;
        }
        public void setVerifiedByStaff(Staff verifiedByStaff) {
            this.verifiedByStaff = verifiedByStaff;
        }
    
    
    
        public String getProofDocumentUrl() {
            return proofDocumentUrl;
        }
        public void setProofDocumentUrl(String proofDocumentUrl) {
            this.proofDocumentUrl = proofDocumentUrl;
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
    }