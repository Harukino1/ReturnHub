package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.entity.LostItem;
import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.entity.SubmittedReport;
import com.example.appdev.returnhub.repositor.LostItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LostItemService {

    private final LostItemRepository lostItemRepository;

    @Autowired
    public LostItemService(LostItemRepository lostItemRepository) {
        this.lostItemRepository = lostItemRepository;
    }

    public List<LostItem> findAll() {
        return lostItemRepository.findAll();
    }

    public Optional<LostItem> findById(int id) {
        return lostItemRepository.findById(id);
    }

    public LostItem save(LostItem lostItem) {
        return lostItemRepository.save(lostItem);
    }

    public void deleteById(int id) {
        lostItemRepository.deleteById(id);
    }

    // Method required by SubmittedReportService
    public LostItem createLostItemFromReport(SubmittedReport report, Staff staff) {
        LostItem item = new LostItem();
        item.setSubmittedReport(report);
        item.setPostedByStaff(staff);
        item.setStatus("active"); // Default status for new lost items
        item.setCreatedAt(LocalDateTime.now());
        return lostItemRepository.save(item);
    }
}