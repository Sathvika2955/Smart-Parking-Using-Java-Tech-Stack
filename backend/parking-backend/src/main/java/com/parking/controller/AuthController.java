package com.parking.controller;

import com.parking.entity.User;
import com.parking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
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
    
    // Get all users (Admin)
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        Map<String, Object> response = authService.getAllUsers();
        return ResponseEntity.ok(response);
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