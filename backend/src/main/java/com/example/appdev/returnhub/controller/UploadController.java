package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.service.SupabaseStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "http://localhost:5173")
public class UploadController {

    private final SupabaseStorageService storageService;

    public UploadController(SupabaseStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/report-photo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadReportPhoto(
            @RequestParam("userId") int userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "index", required = false) Integer index
    ) {
        try {
            if (userId <= 0 || file == null || file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Invalid input"));
            }

            String ext = ".jpg";
            String ct = file.getContentType();
            if (ct != null && ct.contains("png")) ext = ".png";
            else if (ct != null && ct.contains("gif")) ext = ".gif";
            String uuid = java.util.UUID.randomUUID().toString();
            String name = uuid + (index != null ? ("-" + index) : "") + ext;
            String path = "item-photos/" + userId + "/" + name;

            // Try item-photos first, fallback to profiles (based on prior successful uploads)
            SupabaseStorageService.UploadResult result = storageService.uploadWithFallback(
                    file, "item-photos", "profiles", path);

            if (result.statusCode() >= 200 && result.statusCode() < 300) {
                // Prefer signed URL for privacy if publicUrl is null or bucket is private
                String url = result.publicUrl();
                if (url == null) {
                    url = storageService.createSignedUrl(result.bucket(), result.path(), 3600);
                }
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(Map.of(
                                "success", true,
                                "bucket", result.bucket(),
                                "path", result.path(),
                                "url", url
                        ));
            }

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", result.message()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Upload failed"));
        }
    }
}
