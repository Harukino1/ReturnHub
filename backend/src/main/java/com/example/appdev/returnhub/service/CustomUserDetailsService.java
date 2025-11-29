package com.example.appdev.returnhub.service;

import com.example.appdev.returnhub.entity.Staff;
import com.example.appdev.returnhub.repositor.StaffRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final StaffRepository staffRepository;

    public CustomUserDetailsService(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try finding by email first, then by name
        Staff staff = staffRepository.findByEmail(username)
                .or(() -> staffRepository.findByName(username))
                .orElseThrow(() -> new UsernameNotFoundException("Staff not found with username/email: " + username));

        return User.builder()
                .username(username) // Keep the input username as principal so Basic Auth matches
                .password(staff.getPassword())
                .roles(staff.getRole()) // "ADMIN" or "STAFF"
                .build();
    }
}
