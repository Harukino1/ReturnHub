package com.example.appdev.returnhub.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "submittedreport")
public class SubmittedReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private int reportId;

    @Column(name = "type", length = 20, nullable = false)
    private String type;

    @Column(name = "category", length = 50, nullable = false)
    private String category;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "date_of_event", nullable = false)
    private LocalDate dateOfEvent;

    @Column(name = "location", length = 200, nullable = false)
    private String location;

    @Column(name = "photo_url", length = 200, nullable = false)
    private String photoUrl;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "date_submitted", nullable = false)
    private LocalDateTime dateSubmitted;

    @Column(name = "date_reviewed", nullable = false)
    private LocalDateTime dateReviewed;

    // Relationships

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitter_user_id", nullable = false)
    private User submitterUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_staff_id", nullable = false)
    private Staff reviewerStaff;

    // Constructors
    public SubmittedReport() {}
    public SubmittedReport(User submitterUser, Staff reviewerStaff,
                           String type, String category, String description,
                           LocalDate dateOfEvent, String location, String photoUrl,
                           String status, LocalDateTime dateSubmitted, LocalDateTime dateReviewed) {
        this.submitterUser = submitterUser;
        this.reviewerStaff = reviewerStaff;
        this.type = type;
        this.category = category;
        this.description = description;
        this.dateOfEvent = dateOfEvent;
        this.location = location;
        this.photoUrl = photoUrl;
        this.status = status;
        this.dateSubmitted = dateSubmitted;
        this.dateReviewed = dateReviewed;
    }

    // Getters and Setters

    public int getReportId() {
        return reportId;
    }
    public void setReportId(int reportId) {
        this.reportId = reportId;
    }



    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }



    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }



    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }



    public LocalDate getDateOfEvent() {
        return dateOfEvent;
    }
    public void setDateOfEvent(LocalDate dateOfEvent) {
        this.dateOfEvent = dateOfEvent;
    }



    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }



    public String getPhotoUrl() {
        return photoUrl;
    }
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
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



    public LocalDateTime getDateReviewed() {
        return dateReviewed;
    }
    public void setDateReviewed(LocalDateTime dateReviewed) {
        this.dateReviewed = dateReviewed;
    }



    public User getSubmitterUser() {
        return submitterUser;
    }
    public void setSubmitterUser(User submitterUser) {
        this.submitterUser = submitterUser;
    }



    public Staff getReviewerStaff() {
        return reviewerStaff;
    }
    public void setReviewerStaff(Staff reviewerStaff) {
        this.reviewerStaff = reviewerStaff;
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
}