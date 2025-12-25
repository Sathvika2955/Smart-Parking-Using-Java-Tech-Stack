package com.parking.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.parking.entity.User;
import com.parking.repository.UserRepository;

import jakarta.annotation.PostConstruct;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @PostConstruct
    public void initializeDemoUsers() {
        if (userRepository.count() == 0) {
            // Create Admin User
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@parking.com");
            admin.setPassword("admin123");
            admin.setFullName("Admin User");
            admin.setPhoneNumber("9999999999");
            admin.setUserType("ADMIN");
            userRepository.save(admin);
            
            // Create Regular User
            User user = new User();
            user.setUsername("user");
            user.setEmail("user@parking.com");
            user.setPassword("user123");
            user.setFullName("Regular User");
            user.setPhoneNumber("8888888888");
            user.setUserType("CUSTOMER");
            userRepository.save(user);
            
            System.out.println("✅ Demo users created:");
            System.out.println("   - admin / admin123 (ADMIN)");
            System.out.println("   - user / user123 (CUSTOMER)");
        }
    }
    
    public Map<String, Object> registerUser(User user) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (userRepository.existsByUsername(user.getUsername())) {
                response.put("success", false);
                response.put("message", "Username already exists!");
                return response;
            }
            
            if (userRepository.existsByEmail(user.getEmail())) {
                response.put("success", false);
                response.put("message", "Email already exists!");
                return response;
            }
            
            if (user.getUserType() == null || user.getUserType().isEmpty()) {
                user.setUserType("CUSTOMER");
            }
            
            User savedUser = userRepository.save(user);
            savedUser.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Registration successful!");
            response.put("user", savedUser);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
        }
        
        return response;
    }
    
    public Map<String, Object> loginUser(String username, String password) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Invalid username or password!");
                return response;
            }
            
            User user = userOpt.get();
            
            if (!user.getPassword().equals(password)) {
                response.put("success", false);
                response.put("message", "Invalid username or password!");
                return response;
            }
            
            user.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Login successful!");
            response.put("user", user);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
        }
        
        return response;
    }
    
    public Map<String, Object> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<User> users = userRepository.findAll();
            users.forEach(u -> u.setPassword(null));
            
            response.put("success", true);
            response.put("users", users);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch users: " + e.getMessage());
        }
        
        return response;
    }
    
    public Map<String, Object> getUserById(Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<User> userOpt = userRepository.findById(id);
            
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "User not found!");
                return response;
            }
            
            User user = userOpt.get();
            user.setPassword(null);
            
            response.put("success", true);
            response.put("user", user);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch user: " + e.getMessage());
        }
        
        return response;
    }
    
    public Map<String, Object> updateUser(Long id, User updatedUser) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<User> userOpt = userRepository.findById(id);
            
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "User not found!");
                return response;
            }
            
            User user = userOpt.get();
            
            if (updatedUser.getFullName() != null) {
                user.setFullName(updatedUser.getFullName());
            }
            if (updatedUser.getEmail() != null) {
                user.setEmail(updatedUser.getEmail());
            }
            if (updatedUser.getPhoneNumber() != null) {
                user.setPhoneNumber(updatedUser.getPhoneNumber());
            }
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(updatedUser.getPassword());
            }
            
            User savedUser = userRepository.save(user);
            savedUser.setPassword(null);
            
            response.put("success", true);
            response.put("message", "User updated successfully!");
            response.put("user", savedUser);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update user: " + e.getMessage());
        }
        
        return response;
    }
    
    public Map<String, Object> deleteUser(Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (!userRepository.existsById(id)) {
                response.put("success", false);
                response.put("message", "User not found!");
                return response;
            }
            
            userRepository.deleteById(id);
            
            response.put("success", true);
            response.put("message", "User deleted successfully!");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete user: " + e.getMessage());
        }
        
        return response;
    }
}