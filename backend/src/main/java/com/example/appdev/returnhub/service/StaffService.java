package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.repositor.StaffRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffService(StaffRepository staffRepository, PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void initAdmin() {
        // Initialize default admin if not exists
        if (staffRepository.findByName("admin").isEmpty()) {
            Staff admin = new Staff();
            admin.setName("admin");
            admin.setEmail("admin@returnhub.com"); // Default email
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            staffRepository.save(admin);
            System.out.println("Default admin account created.");
        }
    }

    public Optional<Staff> getStaffByNameOrEmail(String username) {
        return staffRepository.findByEmail(username)
                .or(() -> staffRepository.findByName(username));
    }

    public Staff createStaff(Staff staff) {
        staff.setPassword(passwordEncoder.encode(staff.getPassword()));
        return staffRepository.save(staff);
    }

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    public Optional<Staff> getStaffById(int id) {
        return staffRepository.findById(id);
    }

    public Staff updateStaff(int id, Staff staffDetails) {
        Staff staff = staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Staff not found"));
        staff.setName(staffDetails.getName());
        staff.setEmail(staffDetails.getEmail());
        staff.setRole(staffDetails.getRole());
        return staffRepository.save(staff);
    }

    public void deleteStaff(int id) {
        staffRepository.deleteById(id);
    }

    public void resetPassword(int id, String newPassword) {
        Staff staff = staffRepository.findById(id).orElseThrow(() -> new RuntimeException("Staff not found"));
        staff.setPassword(passwordEncoder.encode(newPassword));
        staffRepository.save(staff);
    }
}
