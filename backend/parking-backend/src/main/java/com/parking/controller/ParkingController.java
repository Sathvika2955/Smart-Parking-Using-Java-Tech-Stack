package com.parking.controller;

import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.parking.entity.ParkingSlot;
import com.parking.service.ParkingService;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "*")
public class ParkingController {
    
    @Autowired
    private ParkingService parkingService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Smart Parking System is running",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ NEW: Find nearby parking slots
    @GetMapping("/nearby")
    public ResponseEntity<Map<String, Object>> findNearbySlots(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radius) {
        
        System.out.println("=== NEARBY SLOTS REQUEST ===");
        System.out.println("User Location: " + latitude + ", " + longitude);
        System.out.println("Search Radius: " + radius + " km");
        
        Map<String, Object> response = parkingService.findNearbySlots(latitude, longitude, radius);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/park")
    public ResponseEntity<Map<String, Object>> parkVehicle(@RequestBody Map<String, Object> request) {
        System.out.println("=== PARK VEHICLE REQUEST ===");
        System.out.println("Request: " + request);
        
        String licensePlate = (String) request.get("licensePlate");
        String vehicleType = (String) request.get("vehicleType");
        String ownerName = (String) request.get("ownerName");
        String phoneNumber = (String) request.get("phoneNumber");
        Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
        Integer slotNumber = request.get("slotNumber") != null ? Integer.valueOf(request.get("slotNumber").toString()) : null;
        
        String startTimeStr = (String) request.get("startTime");
        String endTimeStr = (String) request.get("endTime");
        
        Map<String, Object> response = parkingService.parkVehicle(
            licensePlate, vehicleType, ownerName, phoneNumber, userId, slotNumber, startTimeStr, endTimeStr
        );
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/remove/{licensePlate}")
    public ResponseEntity<Map<String, Object>> removeVehicle(@PathVariable String licensePlate) {
        Map<String, Object> response = parkingService.removeVehicle(licensePlate);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/checkout/{bookingId}")
    public ResponseEntity<Map<String, Object>> checkoutBooking(@PathVariable Long bookingId) {
        Map<String, Object> response = parkingService.checkoutBooking(bookingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search/{licensePlate}")
    public ResponseEntity<Map<String, Object>> searchVehicle(@PathVariable String licensePlate) {
        Map<String, Object> response = parkingService.searchVehicle(licensePlate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/slots")
    public ResponseEntity<List<ParkingSlot>> getAllSlots() {
        List<ParkingSlot> slots = parkingService.getAllSlots();
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/slots/available")
    public ResponseEntity<Map<String, Long>> getAvailableSlots() {
        long available = parkingService.getAvailableSlots();
        return ResponseEntity.ok(Map.of("availableSlots", available, "total", 20L));
    }

    @GetMapping("/slots/occupied")
    public ResponseEntity<Map<String, Long>> getOccupiedSlots() {
        long occupied = parkingService.getOccupiedSlots();
        return ResponseEntity.ok(Map.of("occupiedSlots", occupied));
    }

    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> generateReport() {
        Map<String, Object> report = parkingService.generateReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/user/{userId}/bookings")
    public ResponseEntity<Map<String, Object>> getUserBookings(@PathVariable Long userId) {
        Map<String, Object> response = parkingService.getUserBookings(userId);
        return ResponseEntity.ok(response);
    }
}