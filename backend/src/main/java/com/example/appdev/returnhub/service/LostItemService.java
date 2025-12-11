package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.dto.LostItemResponseDTO;
import com.example.appdev.returnhub.entity.LostItem;
import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.entity.SubmittedReport;
import com.example.appdev.returnhub.repositor.LostItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LostItemService {

    @Autowired
    private LostItemRepository lostItemRepository;

    @Transactional
    public LostItem createLostItemFromReport(SubmittedReport report, Staff staff) {
        LostItem lostItem = new LostItem();
        lostItem.setStatus("active");
        lostItem.setCreatedAt(LocalDateTime.now());
        lostItem.setPostedByStaff(staff);
        lostItem.setSubmittedReport(report);
        return lostItemRepository.save(lostItem);
    }

    public List<LostItemResponseDTO> getAllActiveLostItems() {
        List<LostItem> items = lostItemRepository.findByStatus("active");
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public LostItemResponseDTO updateLostItemStatus(int itemId, String status) {
        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Lost item not found with id: " + itemId));
        item.setStatus(status);
        LostItem updatedItem = lostItemRepository.save(item);
        return convertToDTO(updatedItem);
    }

    private LostItemResponseDTO convertToDTO(LostItem item) {
        LostItemResponseDTO dto = new LostItemResponseDTO();
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
            
            // This was previously missing
            dto.setCategory(report.getCategory());
            
            // FIX: Map the item name from the report to the DTO
            dto.setItemName(report.getItemName()); 
            
            dto.setDescription(report.getDescription());
            dto.setLocation(report.getLocation());
            
            String primary = report.getPhotoUrl1() != null ? report.getPhotoUrl1()
                    : (report.getPhotoUrl2() != null ? report.getPhotoUrl2() : report.getPhotoUrl3());
            
            // Fallback to the main photoUrl if the numbered ones are empty
            if (primary == null) {
                primary = report.getPhotoUrl1();
                primary = report.getPhotoUrl2();
                primary = report.getPhotoUrl3();
            }
            
            dto.setPhotoUrl(primary);
            dto.setDateOfEvent(report.getDateOfEvent());
        }
        return dto;
    }
}