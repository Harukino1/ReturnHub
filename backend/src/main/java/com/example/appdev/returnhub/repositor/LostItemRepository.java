package com.example.appdev.returnhub.repositor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.appdev.returnhub.entity.LostItem;

import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Integer> {
    List<LostItem> findByStatus(String active);

    @Query("SELECT l FROM LostItem l WHERE l.submittedReport.reportId = :reportId")
    LostItem findBySubmittedReport_ReportId(@Param("reportId") int reportId);
}
