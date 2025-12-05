package com.example.appdev.returnhub.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.appdev.returnhub.entity.User;
import com.example.appdev.returnhub.repositor.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Register a new user.
     * Returns the created user if successful, or null if email already exists.
     */
    @Transactional
    public User register(String name, String email, String phone, String password) {
        // Check if email already exists
        Optional<User> existingUser = userRepository.findByEmailIgnoreCase(email);

        if (existingUser.isPresent()) {
            return null; // Email already exists
        }

        // Create new user
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(password); // In production, this should be hashed
        user.setVerified(false);
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Authenticate a user by email and password.
     * Returns the user if credentials are valid, null otherwise.
     */
    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);

        if (userOpt.isEmpty()) {
            return null; // User not found
        }

        User user = userOpt.get();
        // In production, use password hashing (BCrypt, etc.)
        if (user.getPassword().equals(password)) {
            return user;
        }

        return null; // Invalid password
    }

    /**
     * Update user profile.
     */
    public User updateUser(int userId, String name, String email, String phone, String profileImage) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        if (profileImage != null) {
            user.setProfileImage(profileImage);
        }

        return userRepository.save(user);
    }

    /**
     * Check if email exists in the database.
     */
    public boolean emailExists(String email) {
        return userRepository.findByEmailIgnoreCase(email).isPresent();
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    public Optional<User> getUserById(int id) {
        return userRepository.findById(id);
    }

    /**
     * Update user's password (plain text storage in current setup).
     * Returns true if updated, false if user not found.
     */
    @Transactional
    public boolean updatePassword(int userId, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return false;
        User u = userOpt.get();
        u.setPassword(newPassword);
        userRepository.save(u);
        return true;
    }
}
