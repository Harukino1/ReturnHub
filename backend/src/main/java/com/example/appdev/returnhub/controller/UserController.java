package com.example.appdev.returnhub.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.appdev.returnhub.entity.User;
import com.example.appdev.returnhub.service.UserService;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for User authentication and registration.
 *
 * Endpoints:
 * - POST /api/users/register : Register a new user
 * - POST /api/users/login    : Authenticate a user
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend to access
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Request DTO for user registration.
     */
    public static class RegisterRequest {
        public String name;
        public String email;
        public String phone;
        public String password;
    }

    /**
     * Request DTO for user login.
     */
    public static class LoginRequest {
        public String email;
        public String password;
    }

    /**
     * Response DTO for authentication responses.
     * Does not include password or other sensitive information.
     */
    public static class AuthResponse {
        public boolean success;
        public String message;
        public Integer userId;
        public String name;
        public String email;
        public String phone;
        public boolean isVerified;

        public AuthResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public AuthResponse(boolean success, String message, User user) {
            this.success = success;
            this.message = message;
            if (user != null) {
                this.userId = user.getUserId();
                this.name = user.getName();
                this.email = user.getEmail();
                this.phone = user.getPhone();
                this.isVerified = user.isVerified();
            }
        }
    }

    /**
     * Register a new user.
     * POST /api/users/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            // Validation
            if (request.name == null || request.name.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Name is required"));
            }
            if (request.email == null || request.email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Email is required"));
            }
            if (request.phone == null || request.phone.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Phone number is required"));
            }
            if (request.password == null || request.password.length() < 6) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Password must be at least 6 characters"));
            }

            // Validate email format
            if (!request.email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Invalid email format"));
            }

            // Check if email already exists
            if (userService.emailExists(request.email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(false, "Email already registered"));
            }

            // Register user
            User user = userService.register(
                request.name.trim(),
                request.email.trim().toLowerCase(),
                request.phone.trim(),
                request.password
            );

            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, "Registration failed. Email may already exist."));
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(true, "Registration successful", user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponse(false, "Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Authenticate a user.
     * POST /api/users/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            // Validation
            if (request.email == null || request.email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Email is required"));
            }
            if (request.password == null || request.password.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Password is required"));
            }

            // Authenticate user
            User user = userService.login(request.email.trim().toLowerCase(), request.password);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Invalid email or password"));
            }

            return ResponseEntity.ok(new AuthResponse(true, "Login successful", user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponse(false, "Login failed: " + e.getMessage()));
        }
    }
}

