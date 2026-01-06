package com.parking.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.parking.entity.Booking;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Vehicle;
import com.parking.repository.BookingRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;

import jakarta.transaction.Transactional;

@Service
public class ParkingService {

    @Autowired
    private ParkingSlotRepository slotRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    private static final int TOTAL_SLOTS = 20;



    @Transactional
    public Map<String, Object> parkVehicle(
            String licensePlate,
            String vehicleType,
            String ownerName,
            String phoneNumber,
            Long userId,
            Integer slotNumber,
            String startTimeStr,
            String endTimeStr) {

        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("=== PARKING SERVICE DEBUG ===");
            System.out.println("License Plate: " + licensePlate);
            System.out.println("Vehicle Type: " + vehicleType);
            System.out.println("User ID: " + userId);
            System.out.println("Slot Number: " + slotNumber);
            System.out.println("Start Time: " + startTimeStr);
            System.out.println("End Time: " + endTimeStr);
            
            final String normalizedLicensePlate = licensePlate.toUpperCase();
            final String normalizedVehicleType = vehicleType.toUpperCase();

            Vehicle vehicle = vehicleRepository
                    .findByLicensePlate(normalizedLicensePlate)
                    .orElseGet(() -> {
                        Vehicle v = new Vehicle(
                                normalizedLicensePlate,
                                normalizedVehicleType,
                                ownerName,
                                phoneNumber
                        );
                        if (userId != null) {
                            userRepository.findById(userId)
                                    .ifPresent(v::setUser);
                        }
                        return vehicleRepository.save(v);
                    });

            System.out.println("Vehicle ID: " + vehicle.getId());

            List<Booking> activeBookings = bookingRepository.findByVehicleId(vehicle.getId());
            boolean alreadyParked = activeBookings.stream()
                    .anyMatch(b -> "ACTIVE".equals(b.getStatus()));

            if (alreadyParked) {
                System.out.println("Vehicle already parked!");
                response.put("success", false);
                response.put("message", "Vehicle is already parked!");
                return response;
            }

            if (slotNumber == null) {
                response.put("success", false);
                response.put("message", "Please select a parking slot!");
                return response;
            }

            Optional<ParkingSlot> slotOpt = slotRepository.findBySlotNumber(slotNumber);

            if (slotOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Slot not found!");
                return response;
            }

            ParkingSlot slot = slotOpt.get();
            
            if (slot.getIsOccupied() || !slot.getIsAvailable()) {
                System.out.println("Slot already occupied - refreshing from DB");
                slot = slotRepository.findById(slot.getId()).orElse(slot);
                
                if (slot.getIsOccupied() || !slot.getIsAvailable()) {
                    response.put("success", false);
                    response.put("message", "Slot #" + slotNumber + " is already occupied! Please select another slot.");
                    return response;
                }
            }

            System.out.println("Using slot: " + slot.getSlotNumber());

            String bookingNumber = "BK" + System.currentTimeMillis();
            Booking booking = new Booking(vehicle, slot, bookingNumber);
            
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            if (startTimeStr != null && !startTimeStr.isEmpty()) {
                try {
                    booking.setStartTime(LocalDateTime.parse(startTimeStr, formatter));
                    System.out.println("Parsed start time: " + booking.getStartTime());
                } catch (Exception e) {
                    System.err.println("Error parsing start time: " + e.getMessage());
                }
            }
            if (endTimeStr != null && !endTimeStr.isEmpty()) {
                try {
                    booking.setEndTime(LocalDateTime.parse(endTimeStr, formatter));
                    System.out.println("Parsed end time: " + booking.getEndTime());
                } catch (Exception e) {
                    System.err.println("Error parsing end time: " + e.getMessage());
                }
            }
            
            if (booking.getStartTime() != null && booking.getEndTime() != null) {
                Double calculatedAmount = booking.calculateTotalAmount();
                booking.setTotalAmount(calculatedAmount);
                System.out.println("Calculated amount: " + calculatedAmount);
            }
            
            booking = bookingRepository.save(booking);
            System.out.println("Booking created: " + bookingNumber);

            slot.occupy();
            slot.setCurrentBooking(booking);
            slot = slotRepository.save(slot);
            slotRepository.flush();

            System.out.println("Slot occupied successfully");

            response.put("success", true);
            response.put("message", "Vehicle parked successfully!");
            response.put("bookingNumber", bookingNumber);
            response.put("slotNumber", slot.getSlotNumber());
            
            // ✅ ADD: Include location information in response
            if (slot.getLatitude() != null && slot.getLongitude() != null) {
                Map<String, Object> location = new HashMap<>();
                location.put("latitude", slot.getLatitude());
                location.put("longitude", slot.getLongitude());
                location.put("name", slot.getLocationName());
                location.put("address", slot.getAddress());
                response.put("location", location);
            }
            
            response.put("entryTime", booking.getEntryTime());
            response.put("startTime", booking.getStartTime());
            response.put("endTime", booking.getEndTime());
            response.put("hourlyRate", booking.getHourlyRate());
            response.put("totalAmount", booking.getTotalAmount());

        } catch (Exception e) {
            System.err.println("=== ERROR IN PARKING SERVICE ===");
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }

        return response;
    }

    @Transactional
    public Map<String, Object> removeVehicle(String licensePlate) {
        Map<String, Object> response = new HashMap<>();

        try {
            licensePlate = licensePlate.toUpperCase();
            Vehicle vehicle = vehicleRepository.findByLicensePlate(licensePlate).orElse(null);

            if (vehicle == null) {
                response.put("success", false);
                response.put("message", "Vehicle not found!");
                return response;
            }

            Booking activeBooking = bookingRepository.findByVehicleId(vehicle.getId())
                    .stream()
                    .filter(b -> "ACTIVE".equals(b.getStatus()))
                    .findFirst()
                    .orElse(null);

            if (activeBooking == null) {
                response.put("success", false);
                response.put("message", "No active parking found!");
                return response;
            }

            activeBooking.completeBooking();
            bookingRepository.save(activeBooking);

            ParkingSlot slot = activeBooking.getParkingSlot();
            slot.vacate();
            slotRepository.save(slot);

            response.put("success", true);
            response.put("message", "Vehicle removed successfully!");
            response.put("bookingNumber", activeBooking.getBookingNumber());
            response.put("slotNumber", slot.getSlotNumber());
            response.put("entryTime", activeBooking.getEntryTime());
            response.put("exitTime", activeBooking.getExitTime());
            response.put("duration", activeBooking.getParkingDurationHours() + " hours");
            response.put("totalAmount", activeBooking.getTotalAmount());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    @Transactional
    public Map<String, Object> checkoutBooking(Long bookingId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            
            if (bookingOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Booking not found!");
                return response;
            }

            Booking booking = bookingOpt.get();

            if (!"ACTIVE".equals(booking.getStatus())) {
                response.put("success", false);
                response.put("message", "Booking is not active!");
                return response;
            }

            booking.completeBooking();
            bookingRepository.save(booking);

            ParkingSlot slot = booking.getParkingSlot();
            slot.vacate();
            slotRepository.save(slot);

            response.put("success", true);
            response.put("message", "Booking completed successfully!");
            response.put("bookingNumber", booking.getBookingNumber());
            response.put("totalAmount", booking.getTotalAmount());
            response.put("exitTime", booking.getExitTime());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    public Map<String, Object> searchVehicle(String licensePlate) {
        Map<String, Object> response = new HashMap<>();

        try {
            licensePlate = licensePlate.toUpperCase();
            Vehicle vehicle = vehicleRepository.findByLicensePlate(licensePlate).orElse(null);

            if (vehicle == null) {
                response.put("success", false);
                response.put("message", "Vehicle not found!");
                return response;
            }

            Booking activeBooking = bookingRepository.findByVehicleId(vehicle.getId())
                    .stream()
                    .filter(b -> "ACTIVE".equals(b.getStatus()))
                    .findFirst()
                    .orElse(null);

            response.put("success", true);
            response.put("vehicle", vehicle);
            response.put("isParked", activeBooking != null);

            if (activeBooking != null) {
                response.put("booking", activeBooking);
                response.put("slotNumber", activeBooking.getParkingSlot().getSlotNumber());
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }

        return response;
    }

    public List<ParkingSlot> getAllSlots() {
        return slotRepository.findAll();
    }

    public long getAvailableSlots() {
        return slotRepository.countByIsOccupied(false);
    }

    public long getOccupiedSlots() {
        return slotRepository.countByIsOccupied(true);
    }

    public Map<String, Object> generateReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalSlots", TOTAL_SLOTS);
        report.put("availableSlots", getAvailableSlots());
        report.put("occupiedSlots", getOccupiedSlots());

        List<Booking> activeBookings = bookingRepository.findByStatus("ACTIVE");
        List<Booking> completedBookings = bookingRepository.findByStatus("COMPLETED");
        
        report.put("activeBookings", activeBookings);
        report.put("completedBookings", completedBookings);
        report.put("totalActiveBookings", activeBookings.size());

        double totalRevenue = completedBookings.stream()
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
                .sum();
        report.put("totalRevenue", totalRevenue);

        return report;
    }

    public Map<String, Object> getUserBookings(Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Booking> userBookings = bookingRepository.findAll()
                    .stream()
                    .filter(b -> b.getVehicle().getUser() != null &&
                                b.getVehicle().getUser().getId().equals(userId))
                    .toList();

            response.put("success", true);
            response.put("bookings", userBookings);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }

        return response;
    }

    // ✅ NEW: Find nearby parking slots
    public Map<String, Object> findNearbySlots(Double userLat, Double userLon, Double radiusKm) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<ParkingSlot> allSlots = slotRepository.findAll();
            List<Map<String, Object>> nearbySlots = new ArrayList<>();
            
            for (ParkingSlot slot : allSlots) {
                if (slot.getLatitude() != null && slot.getLongitude() != null) {
                    double distance = calculateDistance(
                        userLat, userLon, 
                        slot.getLatitude(), slot.getLongitude()
                    );
                    
                    if (distance <= radiusKm) {
                        Map<String, Object> slotData = new HashMap<>();
                        slotData.put("slot", slot);
                        slotData.put("distance", Math.round(distance * 100.0) / 100.0);
                        nearbySlots.add(slotData);
                    }
                }
            }
            
            // Sort by distance
            nearbySlots.sort((a, b) -> 
                Double.compare((Double) a.get("distance"), (Double) b.get("distance"))
            );
            
            response.put("success", true);
            response.put("userLocation", Map.of("latitude", userLat, "longitude", userLon));
            response.put("nearbySlots", nearbySlots);
            response.put("totalFound", nearbySlots.size());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error finding nearby slots: " + e.getMessage());
            e.printStackTrace();
        }
        
        return response;
    }
    
    // ✅ NEW: Calculate distance between two GPS coordinates (Haversine formula)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
}