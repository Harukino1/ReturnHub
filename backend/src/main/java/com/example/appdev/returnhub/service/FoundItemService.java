package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.entity.FoundItem;
import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.entity.SubmittedReport;
import com.example.appdev.returnhub.repositor.FoundItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FoundItemService {

    private final FoundItemRepository foundItemRepository;

    @Autowired
    public FoundItemService(FoundItemRepository foundItemRepository) {
        this.foundItemRepository = foundItemRepository;
    }

    public List<FoundItem> findAll() {
        return foundItemRepository.findAll();
    }

    public Optional<FoundItem> findById(int id) {
        return foundItemRepository.findById(id);
    }

    public FoundItem save(FoundItem foundItem) {
        return foundItemRepository.save(foundItem);
    }

    public void deleteById(int id) {
        foundItemRepository.deleteById(id);
    }

    // Method required by SubmittedReportService
    public FoundItem createFoundItemFromReport(SubmittedReport report, Staff staff) {
        FoundItem item = new FoundItem();
        item.setSubmittedReport(report);
        item.setPostedByStaff(staff);
        item.setStatus("active"); // Default status for new found items
        item.setCreatedAt(LocalDateTime.now());
        return foundItemRepository.save(item);
    }
}