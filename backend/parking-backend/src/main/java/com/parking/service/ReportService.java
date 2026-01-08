package com.parking.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.parking.entity.Booking;
import com.parking.entity.ParkingSlot;
import com.parking.entity.User;
import com.parking.repository.BookingRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.UserRepository;

@Service
public class ReportService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ParkingSlotRepository slotRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Generate comprehensive monthly usage report
     */
    public Map<String, Object> generateMonthlyReport(String startDate, String endDate, String reportType) {
        Map<String, Object> report = new HashMap<>();
        
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            
            // Get all bookings in date range
            List<Booking> allBookings = bookingRepository.findAll();
            List<Booking> bookings = allBookings.stream()
                .filter(b -> {
                    LocalDateTime entryTime = b.getEntryTime();
                    return entryTime != null && 
                           !entryTime.isBefore(start) && 
                           !entryTime.isAfter(end);
                })
                .collect(Collectors.toList());
            
            // Basic Metrics
            report.put("reportPeriod", Map.of(
                "startDate", startDate,
                "endDate", endDate,
                "totalDays", ChronoUnit.DAYS.between(start, end) + 1
            ));
            
            report.put("summary", generateSummary(bookings));
            report.put("peakHours", analyzePeakHours(bookings));
            report.put("dailyTrend", analyzeDailyTrend(bookings, start, end));
            report.put("slotUtilization", analyzeSlotUtilization(bookings));
            report.put("revenueAnalysis", analyzeRevenue(bookings));
            report.put("vehicleTypeDistribution", analyzeVehicleTypes(bookings));
            report.put("averageMetrics", calculateAverageMetrics(bookings));
            
            // Segment by report type
            if ("admin".equalsIgnoreCase(reportType)) {
                report.put("userAnalysis", analyzeUserBehavior(bookings));
                report.put("slotPerformance", analyzeSlotPerformance(bookings));
            }
            
            report.put("success", true);
            
        } catch (Exception e) {
            report.put("success", false);
            report.put("message", "Error generating report: " + e.getMessage());
            e.printStackTrace();
        }
        
        return report;
    }
    
    /**
     * Generate summary statistics
     */
    private Map<String, Object> generateSummary(List<Booking> bookings) {
        Map<String, Object> summary = new HashMap<>();
        
        long totalBookings = bookings.size();
        long completedBookings = bookings.stream()
            .filter(b -> "COMPLETED".equals(b.getStatus()))
            .count();
        long activeBookings = bookings.stream()
            .filter(b -> "ACTIVE".equals(b.getStatus()))
            .count();
        
        summary.put("totalBookings", totalBookings);
        summary.put("completedBookings", completedBookings);
        summary.put("activeBookings", activeBookings);
        summary.put("completionRate", totalBookings > 0 ? 
            Math.round((completedBookings * 100.0 / totalBookings) * 100.0) / 100.0 : 0);
        
        return summary;
    }
    
    /**
     * Analyze peak hours (hourly distribution)
     */
    private Map<String, Object> analyzePeakHours(List<Booking> bookings) {
        Map<String, Object> peakHours = new HashMap<>();
        Map<Integer, Long> hourlyDistribution = new HashMap<>();
        
        // Initialize all hours
        for (int i = 0; i < 24; i++) {
            hourlyDistribution.put(i, 0L);
        }
        
        // Count bookings per hour
        for (Booking booking : bookings) {
            if (booking.getEntryTime() != null) {
                int hour = booking.getEntryTime().getHour();
                hourlyDistribution.put(hour, hourlyDistribution.get(hour) + 1);
            }
        }
        
        // Find peak hour
        int peakHour = hourlyDistribution.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(0);
        
        long peakHourCount = hourlyDistribution.get(peakHour);
        
        peakHours.put("peakHour", String.format("%02d:00 - %02d:00", peakHour, (peakHour + 1) % 24));
        peakHours.put("peakHourBookings", peakHourCount);
        peakHours.put("hourlyDistribution", hourlyDistribution);
        
        // Categorize into time periods
        long morning = hourlyDistribution.entrySet().stream()
            .filter(e -> e.getKey() >= 6 && e.getKey() < 12)
            .mapToLong(Map.Entry::getValue)
            .sum();
        long afternoon = hourlyDistribution.entrySet().stream()
            .filter(e -> e.getKey() >= 12 && e.getKey() < 18)
            .mapToLong(Map.Entry::getValue)
            .sum();
        long evening = hourlyDistribution.entrySet().stream()
            .filter(e -> e.getKey() >= 18 && e.getKey() < 24)
            .mapToLong(Map.Entry::getValue)
            .sum();
        long night = hourlyDistribution.entrySet().stream()
            .filter(e -> e.getKey() >= 0 && e.getKey() < 6)
            .mapToLong(Map.Entry::getValue)
            .sum();
        
        peakHours.put("timePeriods", Map.of(
            "morning", morning,
            "afternoon", afternoon,
            "evening", evening,
            "night", night
        ));
        
        return peakHours;
    }
    
    /**
     * Analyze daily trend
     */
    private List<Map<String, Object>> analyzeDailyTrend(List<Booking> bookings, 
                                                         LocalDateTime start, 
                                                         LocalDateTime end) {
        List<Map<String, Object>> dailyTrend = new ArrayList<>();
        
        LocalDate currentDate = start.toLocalDate();
        LocalDate endDate = end.toLocalDate();
        
        while (!currentDate.isAfter(endDate)) {
            final LocalDate date = currentDate;
            
            long dayBookings = bookings.stream()
                .filter(b -> b.getEntryTime() != null && 
                            b.getEntryTime().toLocalDate().equals(date))
                .count();
            
            double dayRevenue = bookings.stream()
                .filter(b -> b.getEntryTime() != null && 
                            b.getEntryTime().toLocalDate().equals(date))
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
                .sum();
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("dayOfWeek", date.getDayOfWeek().toString());
            dayData.put("bookings", dayBookings);
            dayData.put("revenue", Math.round(dayRevenue * 100.0) / 100.0);
            
            dailyTrend.add(dayData);
            currentDate = currentDate.plusDays(1);
        }
        
        return dailyTrend;
    }
    
    /**
     * Analyze slot utilization
     */
    private Map<String, Object> analyzeSlotUtilization(List<Booking> bookings) {
        Map<String, Object> utilization = new HashMap<>();
        
        // Count bookings per slot
        Map<Integer, Long> slotBookings = bookings.stream()
            .filter(b -> b.getParkingSlot() != null)
            .collect(Collectors.groupingBy(
                b -> b.getParkingSlot().getSlotNumber(),
                Collectors.counting()
            ));
        
        // Find most and least used slots
        if (!slotBookings.isEmpty()) {
            Integer mostUsedSlot = slotBookings.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
            
            Integer leastUsedSlot = slotBookings.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
            
            utilization.put("mostUsedSlot", Map.of(
                "slotNumber", mostUsedSlot,
                "bookings", slotBookings.get(mostUsedSlot)
            ));
            
            utilization.put("leastUsedSlot", Map.of(
                "slotNumber", leastUsedSlot,
                "bookings", slotBookings.get(leastUsedSlot)
            ));
        }
        
        utilization.put("slotBookings", slotBookings);
        
        // Average utilization
        List<ParkingSlot> allSlots = slotRepository.findAll();
        double avgUtilization = allSlots.isEmpty() ? 0 : 
            (bookings.size() * 100.0) / allSlots.size();
        
        utilization.put("averageUtilization", Math.round(avgUtilization * 100.0) / 100.0);
        
        return utilization;
    }
    
    /**
     * Analyze revenue
     */
    private Map<String, Object> analyzeRevenue(List<Booking> bookings) {
        Map<String, Object> revenue = new HashMap<>();
        
        double totalRevenue = bookings.stream()
            .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
            .sum();
        
        double avgRevenuePerBooking = bookings.isEmpty() ? 0 : totalRevenue / bookings.size();
        
        revenue.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        revenue.put("averageRevenuePerBooking", Math.round(avgRevenuePerBooking * 100.0) / 100.0);
        
        // Revenue by vehicle type
        Map<String, Double> revenueByType = bookings.stream()
            .filter(b -> b.getVehicle() != null && b.getTotalAmount() != null)
            .collect(Collectors.groupingBy(
                b -> b.getVehicle().getVehicleType(),
                Collectors.summingDouble(Booking::getTotalAmount)
            ));
        
        revenue.put("revenueByVehicleType", revenueByType);
        
        return revenue;
    }
    
    /**
     * Analyze vehicle types distribution
     */
    private Map<String, Object> analyzeVehicleTypes(List<Booking> bookings) {
        Map<String, Object> distribution = new HashMap<>();
        
        Map<String, Long> typeCount = bookings.stream()
            .filter(b -> b.getVehicle() != null)
            .collect(Collectors.groupingBy(
                b -> b.getVehicle().getVehicleType(),
                Collectors.counting()
            ));
        
        distribution.put("distribution", typeCount);
        
        // Find most popular vehicle type
        if (!typeCount.isEmpty()) {
            String mostPopular = typeCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
            
            distribution.put("mostPopularType", mostPopular);
            distribution.put("mostPopularCount", typeCount.get(mostPopular));
        }
        
        return distribution;
    }
    
    /**
     * Calculate average metrics
     */
    private Map<String, Object> calculateAverageMetrics(List<Booking> bookings) {
        Map<String, Object> metrics = new HashMap<>();
        
        // Average parking duration
        long totalMinutes = bookings.stream()
            .filter(b -> b.getEntryTime() != null && b.getExitTime() != null)
            .mapToLong(b -> ChronoUnit.MINUTES.between(b.getEntryTime(), b.getExitTime()))
            .sum();
        
        long completedBookings = bookings.stream()
            .filter(b -> b.getExitTime() != null)
            .count();
        
        double avgDurationHours = completedBookings > 0 ? 
            (totalMinutes / 60.0) / completedBookings : 0;
        
        metrics.put("averageDurationHours", Math.round(avgDurationHours * 100.0) / 100.0);
        metrics.put("totalParkingHours", Math.round((totalMinutes / 60.0) * 100.0) / 100.0);
        
        return metrics;
    }
    
    /**
     * Analyze user behavior (Admin only)
     */
    private Map<String, Object> analyzeUserBehavior(List<Booking> bookings) {
        Map<String, Object> userAnalysis = new HashMap<>();
        
        // Bookings per user
        Map<Long, Long> userBookings = bookings.stream()
            .filter(b -> b.getVehicle() != null && b.getVehicle().getUser() != null)
            .collect(Collectors.groupingBy(
                b -> b.getVehicle().getUser().getId(),
                Collectors.counting()
            ));
        
        userAnalysis.put("totalUsers", userBookings.size());
        userAnalysis.put("averageBookingsPerUser", 
            userBookings.isEmpty() ? 0 : 
            Math.round((bookings.size() * 1.0 / userBookings.size()) * 100.0) / 100.0
        );
        
        return userAnalysis;
    }
    
    /**
     * Analyze slot performance
     */
    private List<Map<String, Object>> analyzeSlotPerformance(List<Booking> bookings) {
        List<Map<String, Object>> performance = new ArrayList<>();
        
        Map<Integer, List<Booking>> slotBookings = bookings.stream()
            .filter(b -> b.getParkingSlot() != null)
            .collect(Collectors.groupingBy(b -> b.getParkingSlot().getSlotNumber()));
        
        slotBookings.forEach((slotNum, slotBookingList) -> {
            Map<String, Object> slotPerf = new HashMap<>();
            slotPerf.put("slotNumber", slotNum);
            slotPerf.put("totalBookings", slotBookingList.size());
            
            double revenue = slotBookingList.stream()
                .mapToDouble(b -> b.getTotalAmount() != null ? b.getTotalAmount() : 0)
                .sum();
            
            slotPerf.put("totalRevenue", Math.round(revenue * 100.0) / 100.0);
            performance.add(slotPerf);
        });
        
        return performance;
    }
}