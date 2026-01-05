package com.parking.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

import com.parking.entity.ParkingSlot;
import com.parking.repository.ParkingSlotRepository;
import com.parking.service.SlotManagementService;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "*")
public class SlotController {
    
    @Autowired
    private SlotManagementService slotService;
    
    @Autowired
    private ParkingSlotRepository slotRepository;

    // Get all slots
    @GetMapping
    public ResponseEntity<List<ParkingSlot>> getAllSlots() {
        List<ParkingSlot> slots = slotRepository.findAll();
        return ResponseEntity.ok(slots);
    }

    // Get slot by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSlotById(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<ParkingSlot> slotOpt = slotRepository.findById(id);
        if (slotOpt.isPresent()) {
            response.put("success", true);
            response.put("slot", slotOpt.get());
        } else {
            response.put("success", false);
            response.put("message", "Slot not found");
        }
        
        return ResponseEntity.ok(response);
    }

    // Add new slot
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addSlot(@RequestBody Map<String, Object> slotData) {
        Map<String, Object> response = slotService.addSlot(slotData);
        return ResponseEntity.ok(response);
    }

    // Update slot
    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> updateSlot(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> slotData) {
        Map<String, Object> response = slotService.updateSlot(id, slotData);
        return ResponseEntity.ok(response);
    }

    // Delete slot
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> deleteSlot(@PathVariable Long id) {
        Map<String, Object> response = slotService.deleteSlot(id);
        return ResponseEntity.ok(response);
    }

    // Toggle slot availability
    @PutMapping("/toggle-availability/{id}")
    public ResponseEntity<Map<String, Object>> toggleAvailability(@PathVariable Long id) {
        Map<String, Object> response = slotService.toggleAvailability(id);
        return ResponseEntity.ok(response);
    }

    // Get slot statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSlotStatistics() {
        Map<String, Object> response = slotService.getSlotStatistics();
        return ResponseEntity.ok(response);
    }

    // Get next available slot number
    @GetMapping("/next-slot-number")
    public ResponseEntity<Map<String, Object>> getNextSlotNumber() {
        Map<String, Object> response = new HashMap<>();
        
        List<ParkingSlot> allSlots = slotRepository.findAll();
        int maxSlotNumber = allSlots.stream()
            .mapToInt(ParkingSlot::getSlotNumber)
            .max()
            .orElse(0);
        
        response.put("success", true);
        response.put("nextSlotNumber", maxSlotNumber + 1);
        
        return ResponseEntity.ok(response);
    }
}