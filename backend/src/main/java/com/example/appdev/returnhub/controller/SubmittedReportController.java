package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.dto.SubmittedReportRequestDTO;
import com.example.appdev.returnhub.dto.SubmittedReportResponseDTO;
import com.example.appdev.returnhub.dto.ReportStatusUpdateDTO;
import com.example.appdev.returnhub.service.SubmittedReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class SubmittedReportController {

    @Autowired
    private SubmittedReportService submittedReportService;

    // Create a new report
    @PostMapping
    public ResponseEntity<SubmittedReportResponseDTO> createReport(@RequestBody SubmittedReportRequestDTO requestDTO) {
        SubmittedReportResponseDTO createdReport = submittedReportService.createReport(requestDTO);
        return new ResponseEntity<>(createdReport, HttpStatus.CREATED);
    }

    // Get all reports
    @GetMapping
    public ResponseEntity<List<SubmittedReportResponseDTO>> getAllReports() {
        List<SubmittedReportResponseDTO> reports = submittedReportService.getAllReports();
        return new ResponseEntity<>(reports, HttpStatus.OK);
    }

    // Get report by ID
    @GetMapping("/{id}")
    public ResponseEntity<SubmittedReportResponseDTO> getReportById(@PathVariable int id) {
        SubmittedReportResponseDTO report = submittedReportService.getReportById(id);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }

    // Get reports by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubmittedReportResponseDTO>> getReportsByUserId(@PathVariable int userId) {
        List<SubmittedReportResponseDTO> reports = submittedReportService.getReportsByUserId(userId);
        return new ResponseEntity<>(reports, HttpStatus.OK);
    }

    // Get reports by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SubmittedReportResponseDTO>> getReportsByStatus(@PathVariable String status) {
        List<SubmittedReportResponseDTO> reports = submittedReportService.getReportsByStatus(status);
        return new ResponseEntity<>(reports, HttpStatus.OK);
    }

    // Get pending reports (for staff)
    @GetMapping("/pending")
    public ResponseEntity<List<SubmittedReportResponseDTO>> getPendingReports() {
        List<SubmittedReportResponseDTO> reports = submittedReportService.getPendingReports();
        return new ResponseEntity<>(reports, HttpStatus.OK);
    }

    // Update report status (approve/reject)
    @PutMapping("/{id}/status")
    public ResponseEntity<SubmittedReportResponseDTO> updateReportStatus(
            @PathVariable int id,
            @RequestBody ReportStatusUpdateDTO statusUpdateDTO) {
        SubmittedReportResponseDTO updatedReport = submittedReportService.updateReportStatus(id, statusUpdateDTO);
        return new ResponseEntity<>(updatedReport, HttpStatus.OK);
    }

    // Delete report
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable int id) {
        try {
            submittedReportService.deleteReport(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Report deleted successfully");

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== ENHANCED USER REPORTS (MY REPORTS PAGE) ====================

//    GET /api/reports/user/{userId}/filter
//    Enhanced version with type filtering for "My Reports" page

    @GetMapping("/user/{userId}/filter")
    public ResponseEntity<?> getReportsByUserIdWithFilter(
            @PathVariable int userId,
            @RequestParam(required = false) String type) {

        try {
            List<SubmittedReportResponseDTO> reports;

            if (type != null && !type.isEmpty()) {
                reports = submittedReportService.getReportsByUserIdAndType(userId, type);
            } else {
                reports = submittedReportService.getReportsByUserId(userId);
            }

            return new ResponseEntity<>(reports, HttpStatus.OK);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching user reports: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


//    DELETE /api/reports/{reportId}/cancel
//    Cancel a pending report (user action)

    @DeleteMapping("/{reportId}/cancel")
    public ResponseEntity<?> cancelPendingReport(
            @PathVariable int reportId,
            @RequestParam int userId) {

        try {
            SubmittedReportResponseDTO cancelledReport =
                    submittedReportService.cancelPendingReport(reportId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Report cancelled successfully");
            response.put("report", cancelledReport);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

//    DELETE /api/reports/{reportId}/user
//    Delete user's own report (with authorization)
//    Request param: userId (for authorization)
//    Frontend: "Delete" button for approved/rejected reports

    @DeleteMapping("/{reportId}/user")
    public ResponseEntity<?> deleteUserReport(
            @PathVariable int reportId,
            @RequestParam int userId) {

        try {
            submittedReportService.deleteUserReport(reportId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Report deleted successfully");

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }
}