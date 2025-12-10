package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.dto.ClaimRequestDTO;
import com.example.appdev.returnhub.dto.ClaimResponseDTO;
import com.example.appdev.returnhub.dto.ClaimStatusUpdateDTO;
import com.example.appdev.returnhub.service.ClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "http://localhost:5173")
public class ClaimController {
    @Autowired
    private ClaimService claimService;

    // ==================== USER ENDPOINTS ====================

//    POST /api/claims
//    User submits a claim for an item (lost or found)

    @PostMapping
    public ResponseEntity<?> submitClaim(@RequestBody ClaimRequestDTO requestDTO) {
        try{
            ClaimResponseDTO claim = claimService.submitClaim(requestDTO);
            return new ResponseEntity<>(claim, HttpStatus.CREATED);
        }catch(RuntimeException e){
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

//    GET /api/claims/user/{userId}
//    Get all claims submitted by a specific user

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getClaimsByUser(@PathVariable int userId) {
        try {
            List<ClaimResponseDTO> userClaims = claimService.getClaimsByUserId(userId);
            return new ResponseEntity<>(userClaims, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching user claims: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    GET /api/claims/{claimId}
//    Get specific claim details

    @GetMapping("/{claimId}")
    public ResponseEntity<?> getClaimById(@PathVariable int claimId) {
        try {
            ClaimResponseDTO claim = claimService.getClaimById(claimId);
            return new ResponseEntity<>(claim, HttpStatus.OK);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
    }

    // ==================== STAFF ENDPOINTS ====================

//    GET /api/claims/staff
//    Staff gets all claims with optional status filtering
//    Query params: status (pending, approved, rejected)

    @GetMapping("/staff")
    public ResponseEntity<?> getAllClaims(
            @RequestParam(required = false) String status) {
        try {
            List<ClaimResponseDTO> claims = claimService.getAllClaims(status);
            return new ResponseEntity<>(claims, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching claims: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // GET /api/claims/staff/pending
    // Get only pending claims (for staff dashboard)

    @GetMapping("/staff/pending")
    public ResponseEntity<?> getPendingClaims() {
        try {
            List<ClaimResponseDTO> claims = claimService.getAllClaims("pending");
            return new ResponseEntity<>(claims, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching pending claims: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    PUT /api/claims/{claimId}/approve
//    Staff approves a claim

    @PutMapping("/{claimId}/approve")
    public ResponseEntity<?> approveClaim(
            @PathVariable int claimId,
            @RequestBody ClaimStatusUpdateDTO statusUpdateDTO) {
        try {
            // Ensure status is "approved"
            statusUpdateDTO.setStatus("approved");

            ClaimResponseDTO updatedClaim = claimService.updateStatusClaim(claimId, statusUpdateDTO);
            return new ResponseEntity<>(updatedClaim, HttpStatus.OK);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

//    PUT /api/claims/{claimId}/reject
//    Staff rejects a claim

    @PutMapping("/{claimId}/reject")
    public ResponseEntity<?> rejectClaim(
            @PathVariable int claimId,
            @RequestBody ClaimStatusUpdateDTO statusUpdateDTO) {
        try {
            // Ensure status is "rejected"
            statusUpdateDTO.setStatus("rejected");

            ClaimResponseDTO updatedClaim = claimService.updateStatusClaim(claimId, statusUpdateDTO);
            return new ResponseEntity<>(updatedClaim, HttpStatus.OK);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

//    DELETE /api/claims/{claimId}
//    Delete a claim (staff/admin only)

    @DeleteMapping("/{claimId}")
    public ResponseEntity<?> deleteClaim(@PathVariable int claimId) {
        try {
            claimService.deleteClaim(claimId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Claim deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

//    GET /api/claims/staff/dashboard/stats
//    Get claim statistics for staff dashboard

    @GetMapping("/staff/dashboard/stats")
    public ResponseEntity<?> getClaimStats() {
        try {
            ClaimService.ClaimStatsDTO stats = claimService.getClaimStats();
            return new ResponseEntity<>(stats, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching claim statistics: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    GET /api/claims/staff/items/{itemId}
//    Get all claims for a specific item (lost or found)
//    Useful for staff to see all claims on an item

    @GetMapping("/staff/items/{itemId}")
    public ResponseEntity<?> getClaimsByItemId(@PathVariable int itemId) {
        try {
            List<ClaimResponseDTO> itemClaims = claimService.getClaimsByItemId(itemId);
            return new ResponseEntity<>(itemClaims, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching item claims: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}