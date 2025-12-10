package com.example.appdev.returnhub.repositor;

import com.example.appdev.returnhub.entity.SubmittedReport;
import com.example.appdev.returnhub.entity.User;
import com.example.appdev.returnhub.entity.Staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmittedReportRepository extends JpaRepository<SubmittedReport, Integer> {
    // Find reports by submitter user
    List<SubmittedReport> findBySubmitterUser(User submitterUser);

    // Find reports by reviewer staff
    List<SubmittedReport> findByReviewerStaff(Staff reviewerStaff);

    // Find reports by status
    List<SubmittedReport> findByStatus(String status);

    // Find reports by type (lost/found)
    List<SubmittedReport> findByType(String type);

    // Find reports by status and type
    List<SubmittedReport> findByStatusAndType(String status, String type);

    // Find pending reports (not reviewed yet)
    @Query("SELECT r FROM SubmittedReport r WHERE r.status = 'pending' OR r.status = 'submitted'")
    List<SubmittedReport> findPendingReports();

    // Find reports by user ID
    @Query("SELECT r FROM SubmittedReport r WHERE r.submitterUser.userId = :userId")
    List<SubmittedReport> findByUserId(@Param("userId") int userId);

    // Find reports by staff ID
    @Query("SELECT r FROM SubmittedReport r WHERE r.reviewerStaff.staffId = :staffId")
    List<SubmittedReport> findByStaffId(@Param("staffId") int staffId);

    @Query("SELECT r FROM SubmittedReport r WHERE r.submitterUser.userId = :userId AND LOWER(r.type) = LOWER(:type)")
    List<SubmittedReport> findBySubmitterUser_UserIdAndType(@Param("userId") int userId, @Param("type") String type);

    // Maintenance: Backfill legacy photo fields
    @Modifying
    @Transactional
    @Query(value = "UPDATE submittedreport SET photo_url1 = photo_url WHERE (photo_url1 IS NULL OR photo_url1 = '') AND photo_url IS NOT NULL AND photo_url <> ''", nativeQuery = true)
    int backfillPhotoUrl1FromPhotoUrl();

    @Modifying
    @Transactional
    @Query(value = "UPDATE submittedreport SET photo_url = COALESCE(NULLIF(photo_url1,''), NULLIF(photo_url2,''), NULLIF(photo_url3,''), '') WHERE photo_url IS NULL OR photo_url = ''", nativeQuery = true)
    int ensurePrimaryPhotoUrlFromOthers();
}
