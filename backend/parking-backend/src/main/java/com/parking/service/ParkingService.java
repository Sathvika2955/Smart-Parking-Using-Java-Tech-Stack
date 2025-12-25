package com.parking.service;

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

import jakarta.annotation.PostConstruct;
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

    // ---------------- INITIALIZATION ----------------

    @PostConstruct
    public void initializeSlots() {
        if (slotRepository.count() == 0) {

            for (int i = 1; i <= 10; i++) {
                slotRepository.save(new ParkingSlot(i, 1, "SMALL"));
            }

            for (int i = 11; i <= 17; i++) {
                slotRepository.save(new ParkingSlot(i, 1, "MEDIUM"));
            }

            for (int i = 18; i <= 20; i++) {
                slotRepository.save(new ParkingSlot(i, 1, "LARGE"));
            }

            System.out.println("Initialized " + TOTAL_SLOTS + " parking slots");
        }
    }

    // ---------------- PARK VEHICLE ----------------

    @Transactional
    public Map<String, Object> parkVehicle(
            String licensePlate,
            String vehicleType,
            String ownerName,
            String phoneNumber,
            Long userId) {

        Map<String, Object> response = new HashMap<>();

        try {
            // ✅ FIX: create final variables for lambda usage
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

            List<Booking> activeBookings =
                    bookingRepository.findByVehicleId(vehicle.getId());

            boolean alreadyParked = activeBookings.stream()
                    .anyMatch(b -> "ACTIVE".equals(b.getStatus()));

            if (alreadyParked) {
                response.put("success", false);
                response.put("message", "Vehicle is already parked!");
                return response;
            }

            String slotType = getSlotTypeForVehicle(normalizedVehicleType);

            Optional<ParkingSlot> availableSlot =
                    slotRepository.findFirstByIsOccupiedFalseAndIsAvailableTrueAndSlotType(slotType);

            if (availableSlot.isEmpty() && !slotType.equals("LARGE")) {
                availableSlot = slotRepository
                        .findFirstByIsOccupiedFalseAndIsAvailableTrueAndSlotType("LARGE");
            }

            if (availableSlot.isEmpty()) {
                response.put("success", false);
                response.put("message", "No available parking slots!");
                return response;
            }

            ParkingSlot slot = availableSlot.get();

            String bookingNumber = "BK" + System.currentTimeMillis();
            Booking booking = bookingRepository.save(
                    new Booking(vehicle, slot, bookingNumber)
            );

            slot.occupy();
            slot.setCurrentBooking(booking);
            slotRepository.save(slot);

            response.put("success", true);
            response.put("message", "Vehicle parked successfully!");
            response.put("bookingNumber", bookingNumber);
            response.put("slotNumber", slot.getSlotNumber());
            response.put("entryTime", booking.getEntryTime());
            response.put("hourlyRate", booking.getHourlyRate());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    // ---------------- REMOVE VEHICLE ----------------

    @Transactional
    public Map<String, Object> removeVehicle(String licensePlate) {

        Map<String, Object> response = new HashMap<>();

        try {
            licensePlate = licensePlate.toUpperCase();

            Vehicle vehicle = vehicleRepository
                    .findByLicensePlate(licensePlate)
                    .orElse(null);

            if (vehicle == null) {
                response.put("success", false);
                response.put("message", "Vehicle not found!");
                return response;
            }

            Booking activeBooking = bookingRepository
                    .findByVehicleId(vehicle.getId())
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

    // ---------------- SEARCH VEHICLE ----------------

    public Map<String, Object> searchVehicle(String licensePlate) {

        Map<String, Object> response = new HashMap<>();

        try {
            licensePlate = licensePlate.toUpperCase();

            Vehicle vehicle = vehicleRepository
                    .findByLicensePlate(licensePlate)
                    .orElse(null);

            if (vehicle == null) {
                response.put("success", false);
                response.put("message", "Vehicle not found!");
                return response;
            }

            Booking activeBooking = bookingRepository
                    .findByVehicleId(vehicle.getId())
                    .stream()
                    .filter(b -> "ACTIVE".equals(b.getStatus()))
                    .findFirst()
                    .orElse(null);

            response.put("success", true);
            response.put("vehicle", vehicle);
            response.put("isParked", activeBooking != null);

            if (activeBooking != null) {
                response.put("booking", activeBooking);
                response.put("slotNumber",
                        activeBooking.getParkingSlot().getSlotNumber());
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }

        return response;
    }

    // ---------------- DASHBOARD DATA ----------------

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
        report.put("activeBookings", activeBookings);
        report.put("totalActiveBookings", activeBookings.size());

        double totalRevenue = bookingRepository.findByStatus("COMPLETED")
                .stream()
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
                .sum();

        report.put("totalRevenue", totalRevenue);

        return report;
    }

    // ---------------- USER BOOKINGS ----------------

    public Map<String, Object> getUserBookings(Long userId) {

        Map<String, Object> response = new HashMap<>();

        try {
            List<Booking> userBookings = bookingRepository.findAll()
                    .stream()
                    .filter(b ->
                            b.getVehicle().getUser() != null &&
                            b.getVehicle().getUser().getId().equals(userId)
                    )
                    .toList();

            response.put("success", true);
            response.put("bookings", userBookings);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }

        return response;
    }

    // ---------------- SLOT TYPE LOGIC ----------------

    private String getSlotTypeForVehicle(String vehicleType) {
        return switch (vehicleType) {
            case "BIKE" -> "SMALL";
            case "CAR" -> "MEDIUM";
            case "SUV", "TRUCK" -> "LARGE";
            default -> "MEDIUM";
        };
    }
}
