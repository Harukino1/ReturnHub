package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.config.SupabaseConfig;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

@Service
public class SupabaseStorageService {
    private final SupabaseConfig config;
    private final HttpClient http;

    public SupabaseStorageService(SupabaseConfig config) {
        this.config = config;
        this.http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    public UploadResult uploadWithFallback(MultipartFile file, String bucketPreferred, String bucketFallback, String path) throws Exception {
        UploadResult primary = upload(bucketPreferred, path, file);
        if (primary.statusCode >= 200 && primary.statusCode < 300) return primary;
        UploadResult fallback = upload(bucketFallback, path, file);
        return fallback;
    }

    public UploadResult upload(String bucket, String path, MultipartFile file) throws Exception {
        String url = config.getSupabaseUrl();
        String key = config.getSupabaseKey();
        if (url == null || url.isBlank() || key == null || key.isBlank()) {
            return new UploadResult(bucket, path, null, HttpStatus.BAD_REQUEST.value(), "Missing Supabase configuration");
        }

        URI uri = URI.create(url + "/storage/v1/object/" + bucket + "/" + path);
        HttpRequest req = HttpRequest.newBuilder(uri)
                .header("Authorization", "Bearer " + key)
                .header("Content-Type", file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .timeout(Duration.ofSeconds(20))
                .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();

        HttpResponse<byte[]> resp = http.send(req, HttpResponse.BodyHandlers.ofByteArray());
        String msg = new String(resp.body(), StandardCharsets.UTF_8);
        String publicUrl = null;
        if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
            publicUrl = url + "/storage/v1/object/public/" + bucket + "/" + path;
        }
        return new UploadResult(bucket, path, publicUrl, resp.statusCode(), msg);
    }

    public String createSignedUrl(String bucket, String path, int expiresInSeconds) throws Exception {
        String url = config.getSupabaseUrl();
        String key = config.getSupabaseKey();

        URI uri = URI.create(url + "/storage/v1/object/sign/" + bucket + "/" + path);
        String body = "{\"expiresIn\":" + expiresInSeconds + "}";
        HttpRequest req = HttpRequest.newBuilder(uri)
                .header("Authorization", "Bearer " + key)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
            // Response: { "signedURL": "/..." }
            String s = resp.body();
            int i = s.indexOf("http");
            if (i >= 0) {
                return s.substring(i).replace("\"", "").replace("}\n", "").trim();
            }
        }
        return null;
    }

    public record UploadResult(String bucket, String path, String publicUrl, int statusCode, String message) {}
}

