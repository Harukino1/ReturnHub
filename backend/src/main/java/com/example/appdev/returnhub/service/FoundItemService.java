package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.dto.FoundItemResponseDTO;
import com.example.appdev.returnhub.entity.FoundItem;
import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.entity.SubmittedReport;
import com.example.appdev.returnhub.repositor.FoundItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FoundItemService {

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Transactional
    public FoundItem createFoundItemFromReport(SubmittedReport report, Staff staff) {
        FoundItem foundItem = new FoundItem();
        foundItem.setStatus("active");
        foundItem.setCreatedAt(LocalDateTime.now());
        foundItem.setPostedByStaff(staff);
        foundItem.setSubmittedReport(report);
        return foundItemRepository.save(foundItem);
    }

    public List<FoundItemResponseDTO> getAllActiveFoundItems() {
        List<FoundItem> items = foundItemRepository.findByStatus("active");
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public FoundItemResponseDTO updateFoundItemStatus(int itemId, String status) {
        FoundItem item = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Found item not found with id: " + itemId));
        item.setStatus(status);
        FoundItem updatedItem = foundItemRepository.save(item);
        return convertToDTO(updatedItem);
    }

    private FoundItemResponseDTO convertToDTO(FoundItem item) {
        FoundItemResponseDTO dto = new FoundItemResponseDTO();
        dto.setItemId(item.getItemId());
        dto.setStatus(item.getStatus());
        dto.setCreatedAt(item.getCreatedAt());
        
        if (item.getPostedByStaff() != null) {
            dto.setPostedByStaffId(item.getPostedByStaff().getStaffId());
            dto.setPostedByStaffName(item.getPostedByStaff().getName());
        }
        
        if (item.getSubmittedReport() != null) {
            SubmittedReport report = item.getSubmittedReport();
            dto.setReportId(report.getReportId());
            dto.setType(report.getType());
            dto.setCategory(report.getCategory());
            
            // FIX: Map the item name from the report to the DTO
            dto.setItemName(report.getItemName());
            
            dto.setDescription(report.getDescription());
            dto.setLocation(report.getLocation());
            dto.setPhotoUrl1(report.getPhotoUrl1());
            dto.setPhotoUrl2(report.getPhotoUrl2());
            dto.setPhotoUrl3(report.getPhotoUrl3());
            dto.setDateOfEvent(report.getDateOfEvent());
        }
        return dto;
    }
}