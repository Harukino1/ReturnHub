package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.dto.FoundItemResponseDTO;
import com.example.appdev.returnhub.service.FoundItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/found-items")
public class FoundItemController {

    @Autowired
    private FoundItemService foundItemService;

    @GetMapping("/public")
    public List<FoundItemResponseDTO> getPublicFoundItems() {
        return foundItemService.getAllActiveFoundItems();
    }
}