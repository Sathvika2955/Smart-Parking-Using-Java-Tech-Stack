package com.parking.controller;

import com.parking.entity.ParkingSlot;
import com.parking.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "*")
public class ParkingController {
    
    @Autowired
    private ParkingService parkingService;
    
    // Health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Smart Parking System is running",
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
    
    // Park vehicle
    @PostMapping("/park")
    public ResponseEntity<Map<String, Object>> parkVehicle(@RequestBody Map<String, Object> request) {
        String licensePlate = (String) request.get("licensePlate");
        String vehicleType = (String) request.get("vehicleType");
        String ownerName = (String) request.get("ownerName");
        String phoneNumber = (String) request.get("phoneNumber");
        Long userId = request.get("userId") != null ? 
            Long.valueOf(request.get("userId").toString()) : null;
        
        Map<String, Object> response = parkingService.parkVehicle(
            licensePlate, vehicleType, ownerName, phoneNumber, userId
        );
        return ResponseEntity.ok(response);
    }
    
    // Remove vehicle
    @DeleteMapping("/remove/{licensePlate}")
    public ResponseEntity<Map<String, Object>> removeVehicle(@PathVariable String licensePlate) {
        Map<String, Object> response = parkingService.removeVehicle(licensePlate);
        return ResponseEntity.ok(response);
    }
    
    // Search vehicle
    @GetMapping("/search/{licensePlate}")
    public ResponseEntity<Map<String, Object>> searchVehicle(@PathVariable String licensePlate) {
        Map<String, Object> response = parkingService.searchVehicle(licensePlate);
        return ResponseEntity.ok(response);
    }
    
    // Get all slots
    @GetMapping("/slots")
    public ResponseEntity<List<ParkingSlot>> getAllSlots() {
        List<ParkingSlot> slots = parkingService.getAllSlots();
        return ResponseEntity.ok(slots);
    }
    
    // Get available slots count
    @GetMapping("/slots/available")
    public ResponseEntity<Map<String, Long>> getAvailableSlots() {
        long available = parkingService.getAvailableSlots();
        return ResponseEntity.ok(Map.of(
            "availableSlots", available,
            "total", 20L
        ));
    }
    
    // Get occupied slots count
    @GetMapping("/slots/occupied")
    public ResponseEntity<Map<String, Long>> getOccupiedSlots() {
        long occupied = parkingService.getOccupiedSlots();
        return ResponseEntity.ok(Map.of("occupiedSlots", occupied));
    }
    
    // Generate report
    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> generateReport() {
        Map<String, Object> report = parkingService.generateReport();
        return ResponseEntity.ok(report);
    }
    
    // Get user's bookings
    @GetMapping("/user/{userId}/bookings")
    public ResponseEntity<Map<String, Object>> getUserBookings(@PathVariable Long userId) {
        Map<String, Object> response = parkingService.getUserBookings(userId);
        return ResponseEntity.ok(response);
    }
}