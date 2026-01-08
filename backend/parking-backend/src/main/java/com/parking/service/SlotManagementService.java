package com.parking.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parking.entity.Booking;
import com.parking.entity.ParkingSlot;
import com.parking.repository.BookingRepository;
import com.parking.repository.ParkingSlotRepository;

@Service
public class SlotManagementService {
    
    @Autowired
    private ParkingSlotRepository slotRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    public Map<String, Object> addSlot(Map<String, Object> slotData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract data
            Integer slotNumber = Integer.valueOf(slotData.get("slotNumber").toString());
            Integer floorNumber = slotData.containsKey("floorNumber") 
                ? Integer.valueOf(slotData.get("floorNumber").toString()) : 1;
            String slotType = slotData.get("slotType").toString().toUpperCase();
            Double latitude = slotData.containsKey("latitude") 
                ? Double.valueOf(slotData.get("latitude").toString()) : null;
            Double longitude = slotData.containsKey("longitude") 
                ? Double.valueOf(slotData.get("longitude").toString()) : null;
            String locationName = slotData.containsKey("locationName") 
                ? slotData.get("locationName").toString() : null;
            String address = slotData.containsKey("address") 
                ? slotData.get("address").toString() : null;
            String city = slotData.containsKey("city") 
                ? slotData.get("city").toString() : null;
            String region = slotData.containsKey("region") 
                ? slotData.get("region").toString() : null;
            String country = slotData.containsKey("country") 
    ? slotData.get("country").toString() : "India";

            // Check if slot number already exists
            Optional<ParkingSlot> existingSlot = slotRepository.findBySlotNumber(slotNumber);
            if (existingSlot.isPresent()) {
                response.put("success", false);
                response.put("message", "Slot number already exists!");
                return response;
            }

            // Create new slot
            ParkingSlot newSlot = new ParkingSlot();
            newSlot.setSlotNumber(slotNumber);
            newSlot.setFloorNumber(floorNumber);
            newSlot.setSlotType(slotType);
            newSlot.setLatitude(latitude);
            newSlot.setLongitude(longitude);
            newSlot.setLocationName(locationName);
           newSlot.setAddress(address);
newSlot.setCity(city);
newSlot.setRegion(region);
newSlot.setCountry(country);
newSlot.setIsOccupied(false);
            newSlot.setIsAvailable(true);
            newSlot.setCreatedAt(LocalDateTime.now());

            ParkingSlot savedSlot = slotRepository.save(newSlot);

            response.put("success", true);
            response.put("message", "Slot added successfully!");
            response.put("slot", savedSlot);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to add slot: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    @Transactional
    public Map<String, Object> updateSlot(Long id, Map<String, Object> slotData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<ParkingSlot> slotOpt = slotRepository.findById(id);
            
            if (slotOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Slot not found!");
                return response;
            }

            ParkingSlot slot = slotOpt.get();

            // Check if slot is currently occupied
            if (slot.getIsOccupied()) {
                response.put("success", false);
                response.put("message", "Cannot update occupied slot!");
                return response;
            }

            // Update fields
            if (slotData.containsKey("slotType")) {
                slot.setSlotType(slotData.get("slotType").toString().toUpperCase());
            }
            if (slotData.containsKey("floorNumber")) {
                slot.setFloorNumber(Integer.valueOf(slotData.get("floorNumber").toString()));
            }
            if (slotData.containsKey("latitude")) {
                slot.setLatitude(Double.valueOf(slotData.get("latitude").toString()));
            }
            if (slotData.containsKey("longitude")) {
                slot.setLongitude(Double.valueOf(slotData.get("longitude").toString()));
            }
            if (slotData.containsKey("locationName")) {
                slot.setLocationName(slotData.get("locationName").toString());
            }
            if (slotData.containsKey("address")) {
                slot.setAddress(slotData.get("address").toString());
            }
            if (slotData.containsKey("isAvailable")) {
                slot.setIsAvailable(Boolean.valueOf(slotData.get("isAvailable").toString()));
            }

            ParkingSlot updatedSlot = slotRepository.save(slot);

            response.put("success", true);
            response.put("message", "Slot updated successfully!");
            response.put("slot", updatedSlot);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update slot: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    @Transactional
    public Map<String, Object> deleteSlot(Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<ParkingSlot> slotOpt = slotRepository.findById(id);
            
            if (slotOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Slot not found!");
                return response;
            }

            ParkingSlot slot = slotOpt.get();

            // Check if slot is currently occupied
            if (slot.getIsOccupied()) {
                response.put("success", false);
                response.put("message", "Cannot delete occupied slot!");
                return response;
            }

            // Check if slot has any bookings
            List<Booking> bookings = bookingRepository.findByParkingSlotId(slot.getId());
            if (!bookings.isEmpty()) {
                response.put("success", false);
                response.put("message", "Cannot delete slot with booking history! Consider disabling it instead.");
                return response;
            }

            slotRepository.deleteById(id);

            response.put("success", true);
            response.put("message", "Slot deleted successfully!");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete slot: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    @Transactional
    public Map<String, Object> toggleAvailability(Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<ParkingSlot> slotOpt = slotRepository.findById(id);
            
            if (slotOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Slot not found!");
                return response;
            }

            ParkingSlot slot = slotOpt.get();

            // Cannot disable if occupied
            if (slot.getIsOccupied() && slot.getIsAvailable()) {
                response.put("success", false);
                response.put("message", "Cannot disable occupied slot!");
                return response;
            }

            slot.setIsAvailable(!slot.getIsAvailable());
            ParkingSlot updatedSlot = slotRepository.save(slot);

            response.put("success", true);
            response.put("message", slot.getIsAvailable() ? "Slot enabled!" : "Slot disabled!");
            response.put("slot", updatedSlot);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to toggle availability: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    public Map<String, Object> getSlotStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<ParkingSlot> allSlots = slotRepository.findAll();
            
            long totalSlots = allSlots.size();
            long availableSlots = allSlots.stream().filter(s -> !s.getIsOccupied() && s.getIsAvailable()).count();
            long occupiedSlots = allSlots.stream().filter(ParkingSlot::getIsOccupied).count();
            long disabledSlots = allSlots.stream().filter(s -> !s.getIsAvailable()).count();
            
            // By type
            Map<String, Long> byType = new HashMap<>();
            byType.put("SMALL", allSlots.stream().filter(s -> "SMALL".equals(s.getSlotType())).count());
            byType.put("MEDIUM", allSlots.stream().filter(s -> "MEDIUM".equals(s.getSlotType())).count());
            byType.put("LARGE", allSlots.stream().filter(s -> "LARGE".equals(s.getSlotType())).count());

            response.put("success", true);
            response.put("totalSlots", totalSlots);
            response.put("availableSlots", availableSlots);
            response.put("occupiedSlots", occupiedSlots);
            response.put("disabledSlots", disabledSlots);
            response.put("byType", byType);
            response.put("occupancyRate", totalSlots > 0 ? (occupiedSlots * 100.0 / totalSlots) : 0);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get statistics: " + e.getMessage());
        }

        return response;
    }
    //Toggle maintenance mode
@Transactional
public Map<String, Object> toggleMaintenance(Long id, Map<String, String> data) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        Optional<ParkingSlot> slotOpt = slotRepository.findById(id);
        
        if (slotOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Slot not found!");
            return response;
        }

        ParkingSlot slot = slotOpt.get();

        // Cannot put occupied slot under maintenance
        if (slot.getIsOccupied() && !slot.getIsUnderMaintenance()) {
            response.put("success", false);
            response.put("message", "Cannot put occupied slot under maintenance!");
            return response;
        }

        if (slot.getIsUnderMaintenance()) {
            // End maintenance
            slot.endMaintenance();
            response.put("message", "Maintenance ended! Slot is now available.");
        } else {
            // Start maintenance
            String reason = data != null ? data.get("reason") : "Routine maintenance";
            slot.startMaintenance(reason);
            response.put("message", "Slot marked as under maintenance!");
        }

        ParkingSlot updatedSlot = slotRepository.save(slot);

        response.put("success", true);
        response.put("slot", updatedSlot);

    } catch (Exception e) {
        response.put("success", false);
        response.put("message", "Failed to toggle maintenance: " + e.getMessage());
        e.printStackTrace();
    }

    return response;
}
}