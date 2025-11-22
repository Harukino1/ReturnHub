package com.example.appdev.returnhub.controller;

import java.net.URI;
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

import com.example.appdev.returnhub.entity.LostItem;
import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.entity.SubmittedReport;
import com.example.appdev.returnhub.repositor.LostItemRepository;
import com.example.appdev.returnhub.repositor.StaffRepository;
import com.example.appdev.returnhub.repositor.SubmittedReportRepository;

/**
 * REST controller for LostItem entities.
 *
 * Purpose:
 * - Expose endpoints that allow the frontend to create, read, update and delete
 *   records of lost items that are linked to submitted reports and staff members.
 *
 * Endpoints:
 * - GET  /api/lostitems        : list all lost items
 * - GET  /api/lostitems/{id}   : get a single lost item by id
 * - POST /api/lostitems        : create a lost item (accepts JSON body)
 * - PUT  /api/lostitems/{id}   : update an existing lost item
 * - DELETE /api/lostitems/{id} : delete a lost item
 *
 * Notes:
 * - The create/update endpoints accept IDs for relationships (postedByStaffId,
 *   submittedReportId). If the provided IDs are not found the relationship is set
 *   to null (for create) or ignored (for update).
 */
@RestController
@RequestMapping("/api/lostitems")
public class LostItemController {

	private final LostItemRepository lostRepo;
	private final StaffRepository staffRepo;
	private final SubmittedReportRepository reportRepo;

	public LostItemController(LostItemRepository lostRepo, StaffRepository staffRepo, SubmittedReportRepository reportRepo) {
		this.lostRepo = lostRepo;
		this.staffRepo = staffRepo;
		this.reportRepo = reportRepo;
	}

	/**
	 * Return all lost items.
	 */
	@GetMapping
	public List<LostItem> list() {
		return lostRepo.findAll();
	}

	/**
	 * Retrieve a lost item by id. Returns 404 if not found.
	 */
	@GetMapping("/{id}")
	public ResponseEntity<LostItem> get(@PathVariable int id) {
		return lostRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}

	/**
	 * Payload DTO for creating/updating lost items.
	 * Only includes IDs for relations to keep requests simple.
	 */
	public static class LostRequest {
		public Integer postedByStaffId;
		public Integer submittedReportId;
		public String status;
	}

	/**
	 * Create a new lost item. Sets `createdAt` automatically.
	 */
	@PostMapping
	public ResponseEntity<LostItem> create(@RequestBody LostRequest req) {
		Staff staff = null;
		SubmittedReport rep = null;
		if (req.postedByStaffId != null) staff = staffRepo.findById(req.postedByStaffId).orElse(null);
		if (req.submittedReportId != null) rep = reportRepo.findById(req.submittedReportId).orElse(null);

		LostItem item = new LostItem();
		item.setPostedByStaff(staff);
		item.setSubmittedReport(rep);
		item.setStatus(req.status == null ? "open" : req.status);
		item.setCreatedAt(LocalDateTime.now());

		LostItem saved = lostRepo.save(item);
		return ResponseEntity.created(URI.create("/api/lostitems/" + saved.getItemId())).body(saved);
	}

	/**
	 * Update an existing lost item. Only provided fields are changed.
	 */
	@PutMapping("/{id}")
	public ResponseEntity<LostItem> update(@PathVariable int id, @RequestBody LostRequest req) {
		Optional<LostItem> opt = lostRepo.findById(id);
		if (opt.isEmpty()) return ResponseEntity.notFound().build();
		LostItem item = opt.get();
		if (req.postedByStaffId != null) staffRepo.findById(req.postedByStaffId).ifPresent(item::setPostedByStaff);
		if (req.submittedReportId != null) reportRepo.findById(req.submittedReportId).ifPresent(item::setSubmittedReport);
		if (req.status != null) item.setStatus(req.status);
		LostItem saved = lostRepo.save(item);
		return ResponseEntity.ok(saved);
	}

	/**
	 * Delete a lost item by id.
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable int id) {
		if (!lostRepo.existsById(id)) return ResponseEntity.notFound().build();
		lostRepo.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
