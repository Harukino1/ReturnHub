package com.example.appdev.returnhub.config;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Component
public class SupabaseConfig {
    private final String supabaseUrl;
    private final String supabaseKey;

    public SupabaseConfig() {
        String url = System.getenv("SUPABASE_URL");
        String key = System.getenv("SUPABASE_KEY");

        if ((url == null || key == null)) {
            Map<String, String> envFile = readDotEnv();
            if (url == null) url = envFile.get("SUPABASE_URL");
            if (key == null) key = envFile.get("SUPABASE_KEY");
        }

        this.supabaseUrl = url != null ? url.trim() : "";
        this.supabaseKey = key != null ? key.trim() : "";
    }

    private Map<String, String> readDotEnv() {
        Map<String, String> map = new HashMap<>();
        try {
            Path path = Path.of(".env");
            if (!Files.exists(path)) {
                // try backend/.env when running from project root
                Path alt = Path.of("backend/.env");
                if (Files.exists(alt)) path = alt; else return map;
            }
            for (String line : Files.readAllLines(path)) {
                String l = line.trim();
                if (l.isEmpty() || l.startsWith("#")) continue;
                int eq = l.indexOf('=');
                if (eq > 0) {
                    String k = l.substring(0, eq).trim();
                    String v = l.substring(eq + 1).trim();
                    map.put(k, v);
                }
            }
        } catch (IOException ignored) { }
        return map;
    }

    public String getSupabaseUrl() { return supabaseUrl; }
    public String getSupabaseKey() { return supabaseKey; }
}

