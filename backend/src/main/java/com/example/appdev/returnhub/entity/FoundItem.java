package com.example.appdev.returnhub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "founditems")
public class FoundItem{
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private int itemId;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Relationships

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by_staff_id", nullable = false)
    private Staff postedByStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_report_id", nullable = false)
    private SubmittedReport submittedReport;

    // Constructors

    public FoundItem() {}
    public FoundItem(Staff postedByStaff, SubmittedReport submittedReport,
                     String status, LocalDateTime createdAt) {
        this.postedByStaff = postedByStaff;
        this.submittedReport = submittedReport;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters

    public int getItemId() {
        return itemId;
    }
    public void setItemId(int itemId) {
        this.itemId = itemId;
    }



    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }



    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }



    public Staff getPostedByStaff() {
        return postedByStaff;
    }
    public void setPostedByStaff(Staff postedByStaff) {
        this.postedByStaff = postedByStaff;
    }



    public SubmittedReport getSubmittedReport() {
        return submittedReport;
    }

    public void setSubmittedReport(SubmittedReport submittedReport) {
        this.submittedReport = submittedReport;
    }
}