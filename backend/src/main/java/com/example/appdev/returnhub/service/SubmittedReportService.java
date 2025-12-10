package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.dto.SubmittedReportRequestDTO;
import com.example.appdev.returnhub.dto.SubmittedReportResponseDTO;
import com.example.appdev.returnhub.dto.ReportStatusUpdateDTO;
import com.example.appdev.returnhub.entity.SubmittedReport;
import com.example.appdev.returnhub.entity.User;
import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.repositor.SubmittedReportRepository;
import com.example.appdev.returnhub.repositor.UserRepository;
import com.example.appdev.returnhub.repositor.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmittedReportService {

    @Autowired
    private SubmittedReportRepository submittedReportRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private FoundItemService foundItemService;
    @Autowired
    private LostItemService lostItemService;

    // @Autowired
    // private NotificationService notificationService;

    public SubmittedReportResponseDTO createReport(SubmittedReportRequestDTO requestDTO) {
        if (requestDTO == null || requestDTO.getSubmitterUserId() == 0) {
            throw new RuntimeException("Invalid request: submitterUserId is required");
        }

        // Find the submitter user
        User submitterUser = userRepository.findById(requestDTO.getSubmitterUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + requestDTO.getSubmitterUserId()));

        // Handles default staff to find
        Staff defaultStaff = staffRepository.findAll().stream()
                .filter(s -> "STAFF".equalsIgnoreCase(s.getRole()) || "ADMIN".equalsIgnoreCase(s.getRole()))
                .findFirst()
                .orElse(null);

        // Create new report entity
        SubmittedReport report = new SubmittedReport();
        report.setType(requestDTO.getType());
        report.setCategory(requestDTO.getCategory());
        report.setDescription(requestDTO.getDescription());
        report.setDateOfEvent(requestDTO.getDateOfEvent());
        report.setLocation(requestDTO.getLocation());
        report.setPhotoUrl1(requestDTO.getPhotoUrl1());
        report.setPhotoUrl2(requestDTO.getPhotoUrl2());
        report.setPhotoUrl3(requestDTO.getPhotoUrl3());
        report.setStatus("pending"); // Initial status
        report.setDateSubmitted(LocalDateTime.now());
        report.setDateReviewed(null); // Not reviewed yet
        report.setSubmitterUser(submitterUser);
        report.setReviewerStaff(defaultStaff);

        // Save the report
        SubmittedReport savedReport = submittedReportRepository.save(report);

        // Convert to response DTO
        return convertToResponseDTO(savedReport);
    }

    // Get all reports
    public List<SubmittedReportResponseDTO> getAllReports() {
        List<SubmittedReport> reports = submittedReportRepository.findAll();
        return reports.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Get report by ID
    public SubmittedReportResponseDTO getReportById(int reportId) {
        SubmittedReport report = submittedReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));
        return convertToResponseDTO(report);
    }

    // Get reports by user ID
    public List<SubmittedReportResponseDTO> getReportsByUserId(int userId) {
        List<SubmittedReport> reports = submittedReportRepository.findByUserId(userId);
        return reports.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Get reports by status
    public List<SubmittedReportResponseDTO> getReportsByStatus(String status) {
        List<SubmittedReport> reports = submittedReportRepository.findByStatus(status);
        return reports.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Get pending reports (for staff dashboard)
    public List<SubmittedReportResponseDTO> getPendingReports() {
        List<SubmittedReport> reports = submittedReportRepository.findPendingReports();
        return reports.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<SubmittedReportResponseDTO> getReportsByUserIdAndType(int userId, String type) {
        List<SubmittedReport> reports;

        if (type == null || type.isEmpty() || "all".equalsIgnoreCase(type)) {
            reports = submittedReportRepository.findByUserId(userId);
        } else if ("lost".equalsIgnoreCase(type)) {
            reports = submittedReportRepository.findBySubmitterUser_UserIdAndType(userId, "lost");
        } else if ("found".equalsIgnoreCase(type)) {
            reports = submittedReportRepository.findBySubmitterUser_UserIdAndType(userId, "found");
        } else {
            reports = submittedReportRepository.findByUserId(userId);
        }

        return reports.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubmittedReportResponseDTO cancelPendingReport(int reportId, int userId) {
        SubmittedReport report = submittedReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));

        // Authorization check
        if (report.getSubmitterUser().getUserId() != userId) {
            throw new RuntimeException("Unauthorized: You can only cancel your own reports");
        }

        // Only allow cancellation if report is pending
        if (!"pending".equalsIgnoreCase(report.getStatus())) {
            throw new RuntimeException("Cannot cancel report. Status is: " + report.getStatus());
        }

        // Delete the report
        submittedReportRepository.delete(report);

        // Return response
        SubmittedReportResponseDTO response = convertToResponseDTO(report);
        response.setStatus("cancelled");
        return response;
    }


    // Update report status (approve/reject)
    @Transactional
    public SubmittedReportResponseDTO updateReportStatus(int reportId, ReportStatusUpdateDTO statusUpdateDTO) {
        SubmittedReport report = submittedReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));

        Staff reviewerStaff = staffRepository.findById(statusUpdateDTO.getReviewerStaffId())
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + statusUpdateDTO.getReviewerStaffId()));

        // Update report
        report.setStatus(statusUpdateDTO.getStatus());
        report.setReviewerStaff(reviewerStaff);
        report.setDateReviewed(LocalDateTime.now());

        // If description update is provided in review notes
        if (statusUpdateDTO.getReviewNotes() != null && !statusUpdateDTO.getReviewNotes().isEmpty()) {
            report.setDescription(report.getDescription() + "\n\nStaff Notes: " + statusUpdateDTO.getReviewNotes());
        }

        SubmittedReport updatedReport = submittedReportRepository.save(report);

        if ("approved".equalsIgnoreCase(statusUpdateDTO.getStatus())) {
            createItemFromReport(updatedReport, reviewerStaff);
        }

        return convertToResponseDTO(updatedReport);
    }

    // Delete report
    @Transactional
    public void deleteReport(int reportId) {
        if (!submittedReportRepository.existsById(reportId)) {
            throw new RuntimeException("Report not found with id: " + reportId);
        }
        submittedReportRepository.deleteById(reportId);
    }

    // Delete report for user deletion
    @Transactional
    public void deleteUserReport(int reportId, int userId) {
        SubmittedReport report = submittedReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));

        if (report.getSubmitterUser().getUserId() != userId) {
            throw new RuntimeException("Unauthorized: You can only delete your own reports");
        }

        submittedReportRepository.delete(report);
    }

    // Helper method to create LostItem or FoundItem when report is approved
    private void createItemFromReport(SubmittedReport report, Staff staff) {
         if (report.getType().equalsIgnoreCase("lost")) {
             lostItemService.createLostItemFromReport(report, staff);
         } else if (report.getType().equalsIgnoreCase("found")) {
             foundItemService.createFoundItemFromReport(report, staff);
         }
    }

    // Convert entity to response DTO
    private SubmittedReportResponseDTO convertToResponseDTO(SubmittedReport report) {
        SubmittedReportResponseDTO dto = new SubmittedReportResponseDTO();
        dto.setReportId(report.getReportId());
        dto.setType(report.getType());
        dto.setCategory(report.getCategory());
        dto.setDescription(report.getDescription());
        dto.setDateOfEvent(report.getDateOfEvent());
        dto.setLocation(report.getLocation());
        dto.setPhotoUrl1(report.getPhotoUrl1());
        dto.setPhotoUrl2(report.getPhotoUrl2());
        dto.setPhotoUrl3(report.getPhotoUrl3());
        dto.setStatus(report.getStatus());
        dto.setDateSubmitted(report.getDateSubmitted());
        dto.setDateReviewed(report.getDateReviewed());

        if (report.getSubmitterUser() != null) {
            dto.setSubmitterUserId(report.getSubmitterUser().getUserId());
            dto.setSubmitterUserName(report.getSubmitterUser().getName());
        }

        if (report.getReviewerStaff() != null) {
            dto.setReviewerStaffId(report.getReviewerStaff().getStaffId());
            dto.setReviewerStaffName(report.getReviewerStaff().getName());
        }

        return dto;
    }
}