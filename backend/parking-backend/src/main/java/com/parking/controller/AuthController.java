package com.parking.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parking.entity.User;
import com.parking.repository.UserRepository;
import com.parking.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Register new user
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Map<String, Object> response = authService.registerUser(user);
        return ResponseEntity.ok(response);
    }
    
    // Login user
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        Map<String, Object> response = authService.loginUser(username, password);
        return ResponseEntity.ok(response);
    }
    
    // UPDATED: Get all users (returns List<User> directly for frontend)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        // Return list directly instead of wrapped in Map
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
    
    // Get user by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        Map<String, Object> response = authService.getUserById(id);
        return ResponseEntity.ok(response);
    }
    
    // Update user
    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id, 
            @RequestBody User user) {
        Map<String, Object> response = authService.updateUser(id, user);
        return ResponseEntity.ok(response);
    }
    
    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        Map<String, Object> response = authService.deleteUser(id);
        return ResponseEntity.ok(response);
    }
}