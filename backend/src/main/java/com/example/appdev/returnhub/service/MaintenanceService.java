package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.repositor.SubmittedReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class MaintenanceService {
    private final SubmittedReportRepository submittedReportRepository;

    public MaintenanceService(SubmittedReportRepository submittedReportRepository) {
        this.submittedReportRepository = submittedReportRepository;
    }

    @Transactional
    public Map<String, Integer> backfillReportPhotos() {
        int filled = submittedReportRepository.backfillPhotoUrl1FromPhotoUrl();
        int primaries = submittedReportRepository.ensurePrimaryPhotoUrlFromOthers();
        return Map.of("photoUrl1Filled", filled, "primaryPhotoUrlSet", primaries);
    }
}

