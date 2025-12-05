package com.example.appdev.returnhub.controller;

import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.entity.User;
import com.example.appdev.returnhub.service.StaffService;
import com.example.appdev.returnhub.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

    private final StaffService staffService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(StaffService staffService, UserService userService, PasswordEncoder passwordEncoder) {
        this.staffService = staffService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username"); // Actually email/username
        String password = credentials.get("password");

        // Use repository to find staff instead of loading all
        Optional<Staff> staffOpt = staffService.getStaffByNameOrEmail(username);

        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            boolean ok = false;
            String stored = staff.getPassword();
            if (stored != null) {
                try {
                    ok = passwordEncoder.matches(password, stored);
                } catch (Exception e) {
                    ok = password.equals(stored);
                }
            }
            if (ok) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "role", staff.getRole(),
                        "name", staff.getName(),
                        "email", staff.getEmail(),
                        "staffId", staff.getStaffId(),
                        "profileImage", staff.getProfileImage()));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "Invalid credentials"));
    }

    // --- Staff Management ---

    @GetMapping("/staff")
    public List<Staff> getAllStaff() {
        return staffService.getAllStaff();
    }

    @GetMapping("/staff/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable int id) {
        Optional<Staff> staff = staffService.getStaffById(id);
        return staff.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Staff not found")));
    }

    @PostMapping("/staff")
    public Staff createStaff(@RequestBody Staff staff) {
        return staffService.createStaff(staff);
    }

    @PutMapping("/staff/{id}")
    public Staff updateStaff(@PathVariable int id, @RequestBody Staff staff) {
        return staffService.updateStaff(id, staff);
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable int id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/staff/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable int id, @RequestBody Map<String, String> payload) {
        String newPassword = payload.get("password");
        staffService.resetPassword(id, newPassword);
        return ResponseEntity.ok().build();
    }

    // --- User Management ---

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
