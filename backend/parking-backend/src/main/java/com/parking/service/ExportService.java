package com.parking.service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.parking.entity.Booking;
import com.parking.entity.ParkingSlot;
import com.parking.repository.BookingRepository;
import com.parking.repository.ParkingSlotRepository;

@Service
public class ExportService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ParkingSlotRepository slotRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * Export bookings to CSV
     */
    public byte[] exportBookingsToCSV(String startDate, String endDate, Integer slotId) {
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            
            // Fetch bookings
            List<Booking> allBookings = bookingRepository.findAll();
            List<Booking> bookings = allBookings.stream()
                .filter(b -> {
                    if (b.getEntryTime() == null) return false;
                    boolean inDateRange = !b.getEntryTime().isBefore(start) && 
                                         !b.getEntryTime().isAfter(end);
                    
                    if (slotId != null && b.getParkingSlot() != null) {
                        return inDateRange && b.getParkingSlot().getId().equals(slotId.longValue());
                    }
                    return inDateRange;
                })
                .collect(Collectors.toList());
            
            return generateBookingsCSV(bookings);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }
    
    /**
     * Generate CSV content for bookings
     */
    private byte[] generateBookingsCSV(List<Booking> bookings) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));
        
        // Write header
        writer.println("Booking Number,Vehicle Number,Vehicle Type,Owner Name,Phone Number," +
                      "Slot Number,Slot Type,Entry Time,Exit Time,Duration (Hours)," +
                      "Hourly Rate,Total Amount,Status,Payment Status");
        
        // Write data rows
        for (Booking booking : bookings) {
            writer.println(buildBookingCSVRow(booking));
        }
        
        writer.flush();
        writer.close();
        
        return baos.toByteArray();
    }
    
    /**
     * Build CSV row for a booking
     */
    private String buildBookingCSVRow(Booking booking) {
        StringBuilder row = new StringBuilder();
        
        // Booking Number
        row.append(escapeCSV(booking.getBookingNumber())).append(",");
        
        // Vehicle details
        if (booking.getVehicle() != null) {
            row.append(escapeCSV(booking.getVehicle().getLicensePlate())).append(",");
            row.append(escapeCSV(booking.getVehicle().getVehicleType())).append(",");
            row.append(escapeCSV(booking.getVehicle().getOwnerName())).append(",");
            row.append(escapeCSV(booking.getVehicle().getPhoneNumber())).append(",");
        } else {
            row.append("N/A,N/A,N/A,N/A,");
        }
        
        // Slot details
        if (booking.getParkingSlot() != null) {
            row.append(booking.getParkingSlot().getSlotNumber()).append(",");
            row.append(escapeCSV(booking.getParkingSlot().getSlotType())).append(",");
        } else {
            row.append("N/A,N/A,");
        }
        
        // Timing
        row.append(booking.getEntryTime() != null ? 
            booking.getEntryTime().format(DATE_FORMATTER) : "N/A").append(",");
        row.append(booking.getExitTime() != null ? 
            booking.getExitTime().format(DATE_FORMATTER) : "N/A").append(",");
        row.append(booking.getParkingDurationHours()).append(",");
        
        // Payment
        row.append(booking.getHourlyRate() != null ? booking.getHourlyRate() : "0").append(",");
        row.append(booking.getTotalAmount() != null ? booking.getTotalAmount() : "0").append(",");
        row.append(escapeCSV(booking.getStatus())).append(",");
        row.append(escapeCSV(booking.getPaymentStatus()));
        
        return row.toString();
    }
    
    /**
     * Export slots to CSV
     */
    public byte[] exportSlotsToCSV(String city, String slotType) {
        try {
            List<ParkingSlot> allSlots = slotRepository.findAll();
            
            // Apply filters
            List<ParkingSlot> slots = allSlots.stream()
                .filter(slot -> {
                    boolean matchCity = city == null || city.equals("ALL") || 
                                      (slot.getCity() != null && slot.getCity().equals(city));
                    boolean matchType = slotType == null || slotType.equals("ALL") || 
                                      slot.getSlotType().equals(slotType);
                    return matchCity && matchType;
                })
                .collect(Collectors.toList());
            
            return generateSlotsCSV(slots);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }
    
    /**
     * Generate CSV content for slots
     */
    private byte[] generateSlotsCSV(List<ParkingSlot> slots) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));
        
        // Write header
        writer.println("Slot Number,Slot Type,Floor Number,Location Name,Address," +
                      "City,Region,Country,Latitude,Longitude,Is Occupied,Is Available," +
                      "Is Under Maintenance,Maintenance Reason");
        
        // Write data rows
        for (ParkingSlot slot : slots) {
            writer.println(buildSlotCSVRow(slot));
        }
        
        writer.flush();
        writer.close();
        
        return baos.toByteArray();
    }
    
    /**
     * Build CSV row for a slot
     */
    private String buildSlotCSVRow(ParkingSlot slot) {
        StringBuilder row = new StringBuilder();
        
        row.append(slot.getSlotNumber()).append(",");
        row.append(escapeCSV(slot.getSlotType())).append(",");
        row.append(slot.getFloorNumber() != null ? slot.getFloorNumber() : "N/A").append(",");
        row.append(escapeCSV(slot.getLocationName())).append(",");
        row.append(escapeCSV(slot.getAddress())).append(",");
        row.append(escapeCSV(slot.getCity())).append(",");
        row.append(escapeCSV(slot.getRegion())).append(",");
        row.append(escapeCSV(slot.getCountry())).append(",");
        row.append(slot.getLatitude() != null ? slot.getLatitude() : "N/A").append(",");
        row.append(slot.getLongitude() != null ? slot.getLongitude() : "N/A").append(",");
        row.append(slot.getIsOccupied() ? "Yes" : "No").append(",");
        row.append(slot.getIsAvailable() ? "Yes" : "No").append(",");
        row.append(slot.getIsUnderMaintenance() ? "Yes" : "No").append(",");
        row.append(escapeCSV(slot.getMaintenanceReason()));
        
        return row.toString();
    }
    
    /**
     * Export monthly report summary to CSV
     */
    public byte[] exportReportSummaryToCSV(String startDate, String endDate) {
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            
            List<Booking> allBookings = bookingRepository.findAll();
            List<Booking> bookings = allBookings.stream()
                .filter(b -> b.getEntryTime() != null &&  !b.getEntryTime().isBefore(start) && 
                        !b.getEntryTime().isAfter(end))
            .collect(Collectors.toList());
        
        return generateReportSummaryCSV(bookings, startDate, endDate);
        
    } catch (Exception e) {
        e.printStackTrace();
        return new byte[0];
    }
}

/**
 * Generate report summary CSV
 */
private byte[] generateReportSummaryCSV(List<Booking> bookings, 
                                        String startDate, 
                                        String endDate) throws Exception {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));
    
    // Report header
    writer.println("PARKING SYSTEM - MONTHLY USAGE REPORT");
    writer.println("Report Period," + startDate + " to " + endDate);
    writer.println("");
    
    // Summary statistics
    writer.println("SUMMARY STATISTICS");
    writer.println("Metric,Value");
    
    long totalBookings = bookings.size();
    long completed = bookings.stream().filter(b -> "COMPLETED".equals(b.getStatus())).count();
    long active = bookings.stream().filter(b -> "ACTIVE".equals(b.getStatus())).count();
    double totalRevenue = bookings.stream()
        .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
        .sum();
    
    writer.println("Total Bookings," + totalBookings);
    writer.println("Completed Bookings," + completed);
    writer.println("Active Bookings," + active);
    writer.println("Total Revenue (₹)," + String.format("%.2f", totalRevenue));
    writer.println("Average Revenue per Booking (₹)," + 
        String.format("%.2f", totalBookings > 0 ? totalRevenue / totalBookings : 0));
    writer.println("");
    
    // Vehicle type distribution
    writer.println("VEHICLE TYPE DISTRIBUTION");
    writer.println("Vehicle Type,Count,Revenue (₹)");
    
    bookings.stream()
        .filter(b -> b.getVehicle() != null)
        .collect(Collectors.groupingBy(b -> b.getVehicle().getVehicleType()))
        .forEach((type, typeBookings) -> {
            long count = typeBookings.size();
            double revenue = typeBookings.stream()
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
                .sum();
            writer.println(type + "," + count + "," + String.format("%.2f", revenue));
        });
    
    writer.flush();
    writer.close();
    
    return baos.toByteArray();
}

/**
 * Escape special characters in CSV
 */
private String escapeCSV(String value) {
    if (value == null) {
        return "N/A";
    }
    
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
    
    return value;
}
}