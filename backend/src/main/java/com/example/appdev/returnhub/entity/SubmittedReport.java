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

    @Column(name = "item_name", length = 200, nullable = false)
    private String itemName;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "date_of_event", nullable = false)
    private LocalDate dateOfEvent;

    @Column(name = "location", length = 200, nullable = false)
    private String location;

    @Column(name = "photo_url1", length = 200)
    private String photoUrl1;

    @Column(name = "photo_url2", length = 200)
    private String photoUrl2;

    @Column(name = "photo_url3", length = 200)
    private String photoUrl3;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "date_submitted", nullable = false)
    private LocalDateTime dateSubmitted;

    @Column(name = "date_reviewed")
    private LocalDateTime dateReviewed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitter_user_id", nullable = false)
    private User submitterUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_staff_id")
    private Staff reviewerStaff;

    public SubmittedReport() {}

    public SubmittedReport(int reportId, String type, String category, String itemName,
                           String description, LocalDate dateOfEvent, String location, String photoUrl1,
                           String photoUrl2, String photoUrl3, String status, LocalDateTime dateSubmitted,
                           LocalDateTime dateReviewed, User submitterUser, Staff reviewerStaff) {
        this.reportId = reportId;
        this.type = type;
        this.category = category;
        this.itemName = itemName;
        this.description = description;
        this.dateOfEvent = dateOfEvent;
        this.location = location;
        this.photoUrl1 = photoUrl1;
        this.photoUrl2 = photoUrl2;
        this.photoUrl3 = photoUrl3;
        this.status = status;
        this.dateSubmitted = dateSubmitted;
        this.dateReviewed = dateReviewed;
        this.submitterUser = submitterUser;
        this.reviewerStaff = reviewerStaff;
    }

    public int getReportId() { return reportId; }
    public void setReportId(int reportId) { this.reportId = reportId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDateOfEvent() { return dateOfEvent; }
    public void setDateOfEvent(LocalDate dateOfEvent) { this.dateOfEvent = dateOfEvent; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPhotoUrl1() { return photoUrl1; }
    public void setPhotoUrl1(String photoUrl1) { this.photoUrl1 = photoUrl1; }

    public String getPhotoUrl2() { return photoUrl2; }
    public void setPhotoUrl2(String photoUrl2) { this.photoUrl2 = photoUrl2; }

    public String getPhotoUrl3() { return photoUrl3; }
    public void setPhotoUrl3(String photoUrl3) { this.photoUrl3 = photoUrl3; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getDateSubmitted() { return dateSubmitted; }
    public void setDateSubmitted(LocalDateTime dateSubmitted) { this.dateSubmitted = dateSubmitted; }

    public LocalDateTime getDateReviewed() { return dateReviewed; }
    public void setDateReviewed(LocalDateTime dateReviewed) { this.dateReviewed = dateReviewed; }

    public User getSubmitterUser() { return submitterUser; }
    public void setSubmitterUser(User submitterUser) { this.submitterUser = submitterUser; }

    public Staff getReviewerStaff() { return reviewerStaff; }
    public void setReviewerStaff(Staff reviewerStaff) { this.reviewerStaff = reviewerStaff; }
}
