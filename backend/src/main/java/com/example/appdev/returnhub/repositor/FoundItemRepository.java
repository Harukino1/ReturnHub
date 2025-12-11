package com.example.appdev.returnhub.repositor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.appdev.returnhub.entity.FoundItem;

import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Integer> {
    List<FoundItem> findByStatus(String active);

    @Query("SELECT f FROM FoundItem f WHERE f.submittedReport.reportId = :reportId")
    FoundItem findBySubmittedReport_ReportId(@Param("reportId") int reportId);
}
