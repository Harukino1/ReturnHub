package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.dto.SubmittedReportRequestDTO;
import com.example.appdev.returnhub.dto.SubmittedReportResponseDTO;
import com.example.appdev.returnhub.dto.ReportStatusUpdateDTO;
import com.example.appdev.returnhub.service.SubmittedReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class SubmittedReportController {

    @Autowired
    private SubmittedReportService submittedReportService;

    // Create a new report
    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody SubmittedReportRequestDTO requestDTO) {
        try {
            SubmittedReportResponseDTO createdReport = submittedReportService.createReport(requestDTO);
            return new ResponseEntity<>(createdReport, HttpStatus.CREATED);
        } catch (RuntimeException ex) {
            String msg = ex.getMessage() != null ? ex.getMessage() : "Invalid request";
            HttpStatus status;
            if (msg.toLowerCase().contains("user not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (msg.toLowerCase().contains("invalid request")) {
                status = HttpStatus.BAD_REQUEST;
            } else {
                status = HttpStatus.BAD_REQUEST;
            }
            return ResponseEntity.status(status).body(java.util.Map.of("success", false, "message", msg));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("success", false, "message", "Failed to create report"));
        }
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
    public ResponseEntity<Void> deleteReport(@PathVariable int id) {
        submittedReportService.deleteReport(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
