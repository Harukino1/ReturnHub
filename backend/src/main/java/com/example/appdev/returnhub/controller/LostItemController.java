package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.dto.LostItemResponseDTO;
import com.example.appdev.returnhub.service.LostItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lost-items")
public class LostItemController {

    @Autowired
    private LostItemService lostItemService;

    @GetMapping("/public")
    public List<LostItemResponseDTO> getPublicLostItems() {
        return lostItemService.getAllActiveLostItems();
    }
}