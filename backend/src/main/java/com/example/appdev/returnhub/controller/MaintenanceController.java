package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MaintenanceController {
    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping("/backfill-photos")
    public ResponseEntity<Map<String, Integer>> backfillPhotos() {
        Map<String, Integer> result = maintenanceService.backfillReportPhotos();
        return ResponseEntity.ok(result);
    }
}

