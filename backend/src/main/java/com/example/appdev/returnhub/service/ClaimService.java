package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.dto.ClaimRequestDTO;
import com.example.appdev.returnhub.dto.ClaimResponseDTO;
import com.example.appdev.returnhub.dto.ClaimStatusUpdateDTO;
import com.example.appdev.returnhub.entity.*;
import com.example.appdev.returnhub.repositor.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService{
    @Autowired
    private ClaimRepository claimRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private LostItemRepository lostItemRepository;
    @Autowired
    private FoundItemRepository foundItemRepository;
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ClaimResponseDTO submitClaim(ClaimRequestDTO requestDTO){
        if(!requestDTO.isValid()){
            throw new RuntimeException("Error: Invalid Request. Must provide valid ID");
        }
        User claimant = userRepository.findById(requestDTO.getClaimantUserId()).orElseThrow(()->new RuntimeException("Error: User ID: " + requestDTO.getClaimantUserId() + "not found"));

        Claim claim = new Claim();
        claim.setClaimantUser(claimant);
        claim.setProofDocumentUrl(requestDTO.getProofDocumentUrl());
        claim.setStatus("pending");
        claim.setDateSubmitted(LocalDateTime.now());
        claim.setVerifiedByStaff(null);

        if(requestDTO.getLostItemId() != null){
            LostItem lostItem = lostItemRepository.findById(requestDTO.getLostItemId()).orElseThrow(() -> new RuntimeException("Error: LostItem ID: " + requestDTO.getLostItemId() + "not found"));
            claim.setLostItem(lostItem);
            claim.setFoundItem(null);
        }else{
            FoundItem foundItem = foundItemRepository.findById(requestDTO.getFoundItemId()).orElseThrow(() -> new RuntimeException("Error: FoundItem ID: " + requestDTO.getFoundItemId() + "not found"));
            claim.setFoundItem(foundItem);
            claim.setLostItem(null);
        }

        Claim savedClaim = claimRepository.save(claim);

        return convertToDTO(savedClaim);
    }

    @Transactional
    public ClaimResponseDTO updateStatusClaim(int claimId, ClaimStatusUpdateDTO statusUpdateDTO){
        // Find claims by ID
        Claim claim = claimRepository.findById(claimId).orElseThrow(() -> new RuntimeException("Error: Claim ID: " + claimId + "not found"));

        // Find reviewing staff by ID
        Staff reviewer = staffRepository.findById(statusUpdateDTO.getReviewerStaffId())
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + statusUpdateDTO.getReviewerStaffId()));

        // Validates the status
        String newStatus = statusUpdateDTO.getStatus();
        if (!"approved".equalsIgnoreCase(newStatus) && !"rejected".equalsIgnoreCase(newStatus)) {
            throw new RuntimeException("Status must be 'approved' or 'rejected'");
        }

        // Update claim
        claim.setStatus(newStatus.toLowerCase());
        claim.setVerifiedByStaff(reviewer);

        Claim updatedClaim = claimRepository.save(claim);

        notificationService.createClaimStatusNotification(
                claim.getClaimantUser().getUserId(),
                claim.getLostItem() != null ? "LOST" : "FOUND",
                newStatus,
                claimId,
                reviewer.getName()
        );

        // If approved, updates the status
        if ("approved".equalsIgnoreCase(newStatus)) {
            updateItemStatusToClaimed(claim);
        }

        return convertToDTO(updatedClaim);
    }

    private void updateItemStatusToClaimed(Claim claim) {
        if (claim.getLostItem() != null) {
            LostItem lostItem = claim.getLostItem();
            lostItem.setStatus("claimed");
            lostItemRepository.save(lostItem);
        } else if (claim.getFoundItem() != null) {
            FoundItem foundItem = claim.getFoundItem();
            foundItem.setStatus("claimed");
            foundItemRepository.save(foundItem);
        }
    }

    // Gets all claim
    public List<ClaimResponseDTO> getAllClaims(String statusFilter){
        List<Claim> claims;
        if (statusFilter != null && !statusFilter.isEmpty()) {
            claims = claimRepository.findByStatus(statusFilter);
        } else {
            claims = claimRepository.findAll();
        }

        return claims.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Gets claim by the userId
    public List<ClaimResponseDTO> getClaimsByUserId(int userId) {
        List<Claim> claims = claimRepository.findByClaimantUser_UserId(userId);
        return claims.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get claim by itemId
    public List<ClaimResponseDTO> getClaimsByItemId(int itemId) {
        List<Claim> lostItemClaims = claimRepository.findByLostItem_ItemId(itemId);
        List<Claim> foundItemClaims = claimRepository.findByFoundItem_ItemId(itemId);

        List<Claim> allClaims = new java.util.ArrayList<>();
        allClaims.addAll(lostItemClaims);
        allClaims.addAll(foundItemClaims);

        return allClaims.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get claims by ID
    public ClaimResponseDTO getClaimById(int claimId) {
        Claim claim = claimRepository.findById(claimId).orElseThrow(() -> new RuntimeException("Claim not found with id: " + claimId));
        return convertToDTO(claim);
    }

    // Deletes a claim
    @Transactional
    public void deleteClaim(int claimId) {
        if (!claimRepository.existsById(claimId)) {
            throw new RuntimeException("Claim not found with id: " + claimId);
        }
        claimRepository.deleteById(claimId);
    }

    public ClaimStatsDTO getClaimStats() {
        List<Claim> pending = claimRepository.findByStatus("pending");
        List<Claim> approved = claimRepository.findByStatus("approved");
        List<Claim> rejected = claimRepository.findByStatus("rejected");

        ClaimStatsDTO stats = new ClaimStatsDTO();
        stats.setPendingCount(pending.size());
        stats.setApprovedCount(approved.size());
        stats.setRejectedCount(rejected.size());
        stats.setTotalClaims(pending.size() + approved.size() + rejected.size());

        return stats;
    }

    public static class ClaimStatsDTO {
        private int pendingCount;
        private int approvedCount;
        private int rejectedCount;
        private int totalClaims;

        public int getPendingCount() { return pendingCount; }
        public void setPendingCount(int pendingCount) { this.pendingCount = pendingCount; }
        public int getApprovedCount() { return approvedCount; }
        public void setApprovedCount(int approvedCount) { this.approvedCount = approvedCount; }
        public int getRejectedCount() { return rejectedCount; }
        public void setRejectedCount(int rejectedCount) { this.rejectedCount = rejectedCount; }
        public int getTotalClaims() { return totalClaims; }
        public void setTotalClaims(int totalClaims) { this.totalClaims = totalClaims; }
    }

    // Converts Entity to Response DTO
    private ClaimResponseDTO convertToDTO(Claim claim) {
        ClaimResponseDTO dto = new ClaimResponseDTO();

        dto.setClaimId(claim.getClaimId());
        dto.setStatus(claim.getStatus());
        dto.setDateSubmitted(claim.getDateSubmitted());
        dto.setProofDocumentUrl(claim.getProofDocumentUrl());

        if (claim.getLostItem() != null) {
            dto.setLostItemId(claim.getLostItem().getItemId());
            dto.setFoundItemId(null);
        } else if (claim.getFoundItem() != null) {
            dto.setFoundItemId(claim.getFoundItem().getItemId());
            dto.setLostItemId(null);
        }

        dto.setClaimantUserId(claim.getClaimantUser().getUserId());

        if (claim.getVerifiedByStaff() != null) {
            dto.setVerifiedByStaffId(claim.getVerifiedByStaff().getStaffId());
        } else {
            dto.setVerifiedByStaffId(null);
        }

        return dto;
    }
}