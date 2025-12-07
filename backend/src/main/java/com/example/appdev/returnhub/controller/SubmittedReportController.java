package com.example.appdev.returnhub.controller;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.entity.SubmittedReport;
import com.example.appdev.returnhub.entity.User;
import com.example.appdev.returnhub.repositor.StaffRepository;
import com.example.appdev.returnhub.repositor.SubmittedReportRepository;
import com.example.appdev.returnhub.repositor.UserRepository;

/**
 * REST controller for SubmittedReport entities.
 *
 * Purpose:
 * - Provide basic CRUD endpoints for report objects used by the frontend.
 * - The controller uses repository classes directly (no service layer) for simplicity.
 *
 * Endpoints:
 * - GET  /api/reports          : list all reports
 * - GET  /api/reports/{id}     : retrieve a single report by id
 * - POST /api/reports          : create a new report (accepts JSON body)
 * - PUT  /api/reports/{id}     : update an existing report (partial/whole)
 * - DELETE /api/reports/{id}   : delete a report
 *
 * Notes:
 * - The controller expects related entity IDs (submitterUserId, reviewerStaffId)
 *   in the request body when creating/updating relationships.
 * - On create the controller sets `dateSubmitted` and `dateReviewed` to now;
 *   if you want `dateReviewed` to be null until a staff reviews, make
 *   the field nullable in the entity and adjust the controller.
 */
@RestController
@RequestMapping("/api/reports")
public class SubmittedReportController {

	private final SubmittedReportRepository reportRepo;
	private final UserRepository userRepo;
	private final StaffRepository staffRepo;

	public SubmittedReportController(SubmittedReportRepository reportRepo, UserRepository userRepo, StaffRepository staffRepo) {
		this.reportRepo = reportRepo;
		this.userRepo = userRepo;
		this.staffRepo = staffRepo;
	}

	/**
	 * List all submitted reports.
	 */
	@GetMapping
	public List<SubmittedReport> list() {
		return reportRepo.findAll();
	}

	/**
	 * Retrieve a single report by id.
	 * Returns 200 with the report, or 404 when not found.
	 */
	@GetMapping("/{id}")
	public ResponseEntity<SubmittedReport> get(@PathVariable int id) {
		return reportRepo.findById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	/**
	 * DTO used to accept create/update payloads from the frontend.
	 * Only includes IDs for relationships to keep the JSON small.
	 */
	public static class ReportRequest {
		public Integer submitterUserId;
		public Integer reviewerStaffId;
		public String type;
		public String category;
		public String description;
		public LocalDate dateOfEvent;
		public String location;
		public String photoUrl;
		public String status;
	}

	/**
	 * Create a new SubmittedReport.
	 * The request body should be a JSON matching ReportRequest. Related
	 * entities (user, staff) are looked up by id; missing ids result in null relationship.
	 */
	@PostMapping
	public ResponseEntity<SubmittedReport> create(@RequestBody ReportRequest req) {
		User submitter = null;
		Staff reviewer = null;
		if (req.submitterUserId != null) submitter = userRepo.findById(req.submitterUserId).orElse(null);
		if (req.reviewerStaffId != null) reviewer = staffRepo.findById(req.reviewerStaffId).orElse(null);

		SubmittedReport r = new SubmittedReport();
		r.setSubmitterUser(submitter);
		r.setReviewerStaff(reviewer);
		r.setType(req.type == null ? "lost" : req.type);
		r.setCategory(req.category == null ? "general" : req.category);
		r.setDescription(req.description == null ? "" : req.description);
		r.setDateOfEvent(req.dateOfEvent == null ? LocalDate.now() : req.dateOfEvent);
		r.setLocation(req.location == null ? "" : req.location);
		r.setPhotoUrl(req.photoUrl == null ? "" : req.photoUrl);
		r.setStatus(req.status == null ? "submitted" : req.status);
		LocalDateTime now = LocalDateTime.now();
		r.setDateSubmitted(now);
		r.setDateReviewed(now);

		SubmittedReport saved = reportRepo.save(r);
		return ResponseEntity.created(URI.create("/api/reports/" + saved.getReportId())).body(saved);
	}

	/**
	 * Update an existing report. Only fields present in the request are changed.
	 * Returns 404 when the report does not exist.
	 */
	@PutMapping("/{id}")
	public ResponseEntity<SubmittedReport> update(@PathVariable int id, @RequestBody ReportRequest req) {
		Optional<SubmittedReport> opt = reportRepo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		SubmittedReport r = opt.get();
		if (req.submitterUserId != null) userRepo.findById(req.submitterUserId).ifPresent(r::setSubmitterUser);
		if (req.reviewerStaffId != null) staffRepo.findById(req.reviewerStaffId).ifPresent(r::setReviewerStaff);
		if (req.type != null) r.setType(req.type);
		if (req.category != null) r.setCategory(req.category);
		if (req.description != null) r.setDescription(req.description);
		if (req.dateOfEvent != null) r.setDateOfEvent(req.dateOfEvent);
		if (req.location != null) r.setLocation(req.location);
		if (req.photoUrl != null) r.setPhotoUrl(req.photoUrl);
		if (req.status != null) r.setStatus(req.status);
		r.setDateReviewed(LocalDateTime.now());
		SubmittedReport saved = reportRepo.save(r);
		return ResponseEntity.ok(saved);
	}

	/**
	 * Delete a report by id. Returns 204 on success or 404 if not found.
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable int id) {
		if (!reportRepo.existsById(id)) return ResponseEntity.notFound().build();
		reportRepo.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}