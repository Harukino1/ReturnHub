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
import com.example.appdev.returnhub.entity.LostItem;
import com.example.appdev.returnhub.entity.FoundItem;
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
    @Autowired
    private com.example.appdev.returnhub.repositor.FoundItemRepository foundItemRepository;
    @Autowired
    private com.example.appdev.returnhub.repositor.LostItemRepository lostItemRepository;
    @Autowired
    private NotificationService notificationService;

    public SubmittedReportResponseDTO createReport(SubmittedReportRequestDTO requestDTO) {
        if (requestDTO == null || requestDTO.getSubmitterUserId() == 0) {
            throw new RuntimeException("Invalid request: submitterUserId is required");
        }

        // Find the submitter user
        User submitterUser = userRepository.findById(requestDTO.getSubmitterUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + requestDTO.getSubmitterUserId()));

        // For new reports, we might not have a reviewer yet
        Staff defaultStaff = staffRepository.findById(1).orElse(null);

        // Create new report entity
        SubmittedReport report = new SubmittedReport();
        report.setType(requestDTO.getType());
        report.setCategory(requestDTO.getCategory());
        report.setItemName(requestDTO.getItemName());
        report.setDescription(requestDTO.getDescription());
        report.setDateOfEvent(requestDTO.getDateOfEvent());
        report.setLocation(requestDTO.getLocation());
        report.setPhotoUrl1(requestDTO.getPhotoUrl1());
        report.setPhotoUrl2(requestDTO.getPhotoUrl2());
        report.setPhotoUrl3(requestDTO.getPhotoUrl3());

        // Handle primary photo logic for backward compatibility
        String primary = requestDTO.getPhotoUrl1() != null ? requestDTO.getPhotoUrl1()
                : (requestDTO.getPhotoUrl2() != null ? requestDTO.getPhotoUrl2() : requestDTO.getPhotoUrl3());
        
        if (primary == null) primary = "";

        // FIXED: Removed conflict markers and kept setPhotoUrl to satisfy the nullable=false constraint in your Entity
        report.setPhotoUrl1(primary);
        report.setPhotoUrl2(primary);
        report.setPhotoUrl3(primary);

        report.setStatus("pending");
        report.setDateSubmitted(LocalDateTime.now());
        report.setDateReviewed(LocalDateTime.now());
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

    // Update report status (approve/reject)
    @Transactional
    public SubmittedReportResponseDTO updateReportStatus(int reportId, ReportStatusUpdateDTO statusUpdateDTO) {
        SubmittedReport report = submittedReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));

        Staff reviewerStaff = staffRepository.findById(statusUpdateDTO.getReviewerStaffId())
                .orElseThrow(
                        () -> new RuntimeException("Staff not found with id: " + statusUpdateDTO.getReviewerStaffId()));

        // Update report
        report.setStatus(statusUpdateDTO.getStatus());
        report.setReviewerStaff(reviewerStaff);
        report.setDateReviewed(LocalDateTime.now());

        if (statusUpdateDTO.getReviewNotes() != null && !statusUpdateDTO.getReviewNotes().isEmpty()) {
            report.setDescription(report.getDescription() + "\n\nStaff Notes: " + statusUpdateDTO.getReviewNotes());
        }

        SubmittedReport updatedReport = submittedReportRepository.save(report);

        // Send notification for key status changes
        if ("approved".equalsIgnoreCase(statusUpdateDTO.getStatus()) ||
                "rejected".equalsIgnoreCase(statusUpdateDTO.getStatus()) ||
                "published".equalsIgnoreCase(statusUpdateDTO.getStatus())) {
            notificationService.createReportStatusNotification(
                    report.getSubmitterUser().getUserId(),
                    report.getType(),
                    statusUpdateDTO.getStatus(),
                    reportId,
                    reviewerStaff.getName());
        }

        // Handle item linkage based on status
        if ("approved".equalsIgnoreCase(statusUpdateDTO.getStatus())) {
            // Approved = reviewed but not publicly visible
            if ("lost".equalsIgnoreCase(updatedReport.getType())) {
                LostItem li = lostItemRepository.findBySubmittedReport_ReportId(reportId);
                if (li != null) {
                    li.setStatus("archived");
                    lostItemRepository.save(li);
                }
            } else if ("found".equalsIgnoreCase(updatedReport.getType())) {
                FoundItem fi = foundItemRepository.findBySubmittedReport_ReportId(reportId);
                if (fi != null) {
                    fi.setStatus("archived");
                    foundItemRepository.save(fi);
                }
            }
        } else if ("published".equalsIgnoreCase(statusUpdateDTO.getStatus())) {
            // Published = visible in public listings
            if ("lost".equalsIgnoreCase(updatedReport.getType())) {
                LostItem li = lostItemRepository.findBySubmittedReport_ReportId(reportId);
                if (li != null) {
                    li.setStatus("active");
                    lostItemRepository.save(li);
                } else {
                    lostItemService.createLostItemFromReport(report, reviewerStaff);
                }
            } else if ("found".equalsIgnoreCase(updatedReport.getType())) {
                FoundItem fi = foundItemRepository.findBySubmittedReport_ReportId(reportId);
                if (fi != null) {
                    fi.setStatus("active");
                    foundItemRepository.save(fi);
                } else {
                    foundItemService.createFoundItemFromReport(report, reviewerStaff);
                }
            }
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
        dto.setItemName(report.getItemName());
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