package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.dto.ClaimResponseDTO;
import com.example.appdev.returnhub.dto.SubmittedReportResponseDTO;
import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:5173")
public class StaffController{
    @Autowired
    private SubmittedReportService submittedReportService;
    @Autowired
    private ClaimService claimService;
    @Autowired
    private FoundItemService foundItemService;
    @Autowired
    private LostItemService lostItemService;
    @Autowired
    private StaffService staffService;

    // ==================== DASHBOARD ENDPOINTS ====================

//    GET /api/staff/dashboard/stats
//    Get dashboard statistics for staff (counts of pending items, reports, etc.)

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Gets the pending reports count
            List<SubmittedReportResponseDTO> pendingReports = submittedReportService.getPendingReports();
            stats.put("pendingReports", pendingReports.size());

            // Gets the pending claims count
            List<ClaimResponseDTO> pendingClaims = claimService.getAllClaims("pending");
            stats.put("pendingClaims", pendingClaims.size());

            // Get active lost items count (from LostItemService - need to add method)
            // For now, we'll get all and filter
            List<SubmittedReportResponseDTO> allReports = submittedReportService.getAllReports();
            long activeLostItems = allReports.stream()
                    .filter(r -> "lost".equalsIgnoreCase(r.getType()) && "approved".equalsIgnoreCase(r.getStatus()))
                    .count();
            stats.put("activeLostItems", activeLostItems);

            // Gets the active found items count
            long activeFoundItems = allReports.stream()
                    .filter(r -> "found".equalsIgnoreCase(r.getType()) && "approved".equalsIgnoreCase(r.getStatus()))
                    .count();
            stats.put("activeFoundItems", activeFoundItems);

            // Total resolved cases
            long resolvedCases = allReports.stream()
                    .filter(r -> "approved".equalsIgnoreCase(r.getStatus()) || "rejected".equalsIgnoreCase(r.getStatus()))
                    .count();
            stats.put("resolvedCases", resolvedCases);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching dashboard stats: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    GET /api/staff/dashboard/pending-tasks
//    Get all pending tasks for staff dashboard (reports + claims)

    @GetMapping("/dashboard/pending-tasks")
    public ResponseEntity<?> getPendingTasks() {
        try {
            Map<String, Object> tasks = new HashMap<>();

            // Gets the pending reports
            List<SubmittedReportResponseDTO> pendingReports = submittedReportService.getPendingReports();
            tasks.put("pendingReports", pendingReports);

            // Gets the pending claims
            List<ClaimResponseDTO> pendingClaims = claimService.getAllClaims("pending");
            tasks.put("pendingClaims", pendingClaims);

            return ResponseEntity.ok(tasks);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching pending tasks: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== INVENTORY MANAGEMENT ====================

//  GET /api/staff/inventory/lost-items
//  Get all lost items (for staff inventory management)

    @GetMapping("/inventory/lost-items")
    public ResponseEntity<?> getAllLostItems() {
        try {
            return ResponseEntity.ok(lostItemService.getAllActiveLostItems());

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching lost items: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


//    GET /api/staff/inventory/found-items
//    Get all found items (for staff inventory management)

    @GetMapping("/inventory/found-items")
    public ResponseEntity<?> getAllFoundItems() {
        try {
            return ResponseEntity.ok(foundItemService.getAllActiveFoundItems());

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching found items: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


//    PUT /api/staff/inventory/items/{itemId}/status
//    Update status of an item (lost or found)
//    Request body: {"status": "claimed", "itemType": "lost"} or {"status": "claimed", "itemType": "found"}

    @PutMapping("/inventory/items/{itemId}/status")
    public ResponseEntity<?> updateItemStatus(
            @PathVariable int itemId,
            @RequestBody Map<String, String> request) {

        try {
            String status = request.get("status");
            String itemType = request.get("itemType");

            if (status == null || itemType == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Both 'status' and 'itemType' are required");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }

            // Validate status
            if (!isValidStatus(status)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid status. Allowed: active, claimed, archived");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }

            Object updatedItem;

            if ("lost".equalsIgnoreCase(itemType)) {
                // Update lost item
                updatedItem = lostItemService.updateLostItemStatus(itemId, status);
            } else if ("found".equalsIgnoreCase(itemType)) {
                // Update found item
                updatedItem = foundItemService.updateFoundItemStatus(itemId, status);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid itemType. Must be 'lost' or 'found'");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item status updated successfully");
            response.put("data", updatedItem);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error updating item status: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== REPORT MANAGEMENT ====================

//     GET /api/staff/reports
//     Get all reports with optional filtering (alias for /api/reports)

    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports(
            @RequestParam(required = false) String status) {

        try {
            if (status != null && !status.isEmpty()) {
                return ResponseEntity.ok(submittedReportService.getReportsByStatus(status));
            } else {
                return ResponseEntity.ok(submittedReportService.getAllReports());
            }

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching reports: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    GET /api/staff/reports/pending
//    Get pending reports (alias for /api/reports/pending)

    @GetMapping("/reports/pending")
    public ResponseEntity<?> getPendingReports() {
        try {
            return ResponseEntity.ok(submittedReportService.getPendingReports());
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching pending reports: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== CLAIM MANAGEMENT ====================

//    GET /api/staff/claims
//    Get all claims with optional status filtering (alias for /api/claims/staff)

    @GetMapping("/claims")
    public ResponseEntity<?> getAllClaims(
            @RequestParam(required = false) String status) {

        try {
            return ResponseEntity.ok(claimService.getAllClaims(status));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching claims: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    GET /api/staff/claims/pending
//    Get pending claims (alias for /api/claims/staff/pending)

    @GetMapping("/claims/pending")
    public ResponseEntity<?> getPendingClaims() {
        try {
            return ResponseEntity.ok(claimService.getAllClaims("pending"));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching pending claims: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== PROFILE MANAGEMENT ====================

//    GET /api/staff/profile/{staffId}
//    Get staff profile information

    @GetMapping("/profile/{staffId}")
    public ResponseEntity<?> getStaffProfile(@PathVariable int staffId) {
        try {
            Optional<Staff> staffOpt = staffService.getStaffById(staffId);

            if (staffOpt.isPresent()) {
                Staff staff = staffOpt.get();

                // Create response without password
                Map<String, Object> profile = new HashMap<>();
                profile.put("staffId", staff.getStaffId());
                profile.put("name", staff.getName());
                profile.put("email", staff.getEmail());
                profile.put("role", staff.getRole());
                profile.put("profileImage", staff.getProfileImage());

                return ResponseEntity.ok(profile);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Staff not found with id: " + staffId);
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
            }

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching staff profile: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    PUT /api/staff/profile/{staffId}
//    Update staff profile information

    @PutMapping("/profile/{staffId}")
    public ResponseEntity<?> updateStaffProfile(
            @PathVariable int staffId,
            @RequestBody Map<String, String> request) {

        try {
            Optional<Staff> staffOpt = staffService.getStaffById(staffId);

            if (staffOpt.isPresent()) {
                Staff staff = staffOpt.get();

                // Update fields if provided
                if (request.containsKey("name")) {
                    staff.setName(request.get("name"));
                }
                if (request.containsKey("email")) {
                    staff.setEmail(request.get("email"));
                }
                if (request.containsKey("profileImage")) {
                    staff.setProfileImage(request.get("profileImage"));
                }

                Staff updatedStaff = staffService.updateStaff(staffId, staff);

                // Return response without password
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Profile updated successfully");
                response.put("staffId", updatedStaff.getStaffId());
                response.put("name", updatedStaff.getName());
                response.put("email", updatedStaff.getEmail());
                response.put("role", updatedStaff.getRole());
                response.put("profileImage", updatedStaff.getProfileImage());

                return ResponseEntity.ok(response);

            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Staff not found with id: " + staffId);
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
            }

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error updating staff profile: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== SIMPLE MESSAGING (PLACEHOLDER) ====================

//    GET /api/staff/conversations
//    Get conversations for staff (placeholder - needs ConversationService)

    @GetMapping("/conversations")
    public ResponseEntity<?> getStaffConversations(@RequestParam int staffId) {
        try {
            // Placeholder response - implement with ConversationService
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Conversation feature pending implementation");
            response.put("staffId", staffId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching conversations: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//     * POST /api/staff/messages
//     * Send message from staff (placeholder - needs MessageService)

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request) {
        try {
            // Placeholder response - implement with MessageService
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message sent (feature pending full implementation)");
            response.put("data", request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error sending message: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ==================== HELPER METHODS ====================

    private boolean isValidStatus(String status) {
        return status != null &&
                (status.equalsIgnoreCase("active") ||
                        status.equalsIgnoreCase("active") ||
                        status.equalsIgnoreCase("claimed") ||
                        status.equalsIgnoreCase("archived"));
    }
}