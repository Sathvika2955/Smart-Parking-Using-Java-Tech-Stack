package com.parking.entity;

import java.time.Duration;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "bookings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "slot_id", nullable = false)
    @JsonIgnoreProperties({"currentBooking"})
    private ParkingSlot parkingSlot;
    
    @Column(name = "booking_number", unique = true, nullable = false)
    private String bookingNumber;
    
    @Column(name = "entry_time", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Kolkata")
    private LocalDateTime entryTime;
    
    @Column(name = "exit_time")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Kolkata")
    private LocalDateTime exitTime;
    
    // User-selected start and end times
    @Column(name = "start_time")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Kolkata")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Kolkata")
    private LocalDateTime endTime;
    
    @Column(name = "status", nullable = false)
    private String status; // ACTIVE, COMPLETED, CANCELLED
    
    @Column(name = "hourly_rate", nullable = false)
    private Double hourlyRate;
    
    @Column(name = "total_amount")
    private Double totalAmount;
    
    @Column(name = "payment_status")
    private String paymentStatus; // PENDING, PAID
    
    // Constructors
    public Booking() {
        this.status = "ACTIVE";
        this.paymentStatus = "PENDING";
        this.entryTime = LocalDateTime.now();
    }
    
    public Booking(Vehicle vehicle, ParkingSlot parkingSlot, String bookingNumber) {
        this.vehicle = vehicle;
        this.parkingSlot = parkingSlot;
        this.bookingNumber = bookingNumber;
        this.entryTime = LocalDateTime.now();
        this.status = "ACTIVE";
        this.paymentStatus = "PENDING";
        this.hourlyRate = calculateHourlyRate(vehicle.getVehicleType());
    }
    
    // Ensure entryTime is set before persisting
    @PrePersist
    protected void onCreate() {
        if (entryTime == null) {
            entryTime = LocalDateTime.now();
        }
        if (status == null) {
            status = "ACTIVE";
        }
        if (paymentStatus == null) {
            paymentStatus = "PENDING";
        }
    }
    
    // Business Logic
    private Double calculateHourlyRate(String vehicleType) {
        return switch (vehicleType.toUpperCase()) {
            case "BIKE" -> 10.0;
            case "CAR" -> 20.0;
            case "SUV" -> 30.0;
            case "TRUCK" -> 50.0;
            default -> 20.0;
        };
    }
    
    public long getParkingDurationHours() {
        LocalDateTime end = (exitTime != null) ? exitTime : LocalDateTime.now();
        Duration duration = Duration.between(entryTime, end);
        long hours = duration.toHours();
        return hours < 1 ? 1 : hours; // Minimum 1 hour charge
    }
    
    //  Calculate duration from start/end time
    public long getScheduledDurationHours() {
        if (startTime != null && endTime != null) {
            Duration duration = Duration.between(startTime, endTime);
            long minutes = duration.toMinutes();
            return (long) Math.ceil(minutes / 60.0); // Round up
        }
        return getParkingDurationHours();
    }
    
    public Double calculateTotalAmount() {
        // Use scheduled duration if available
        if (startTime != null && endTime != null) {
            long hours = getScheduledDurationHours();
            double baseFee = hours * hourlyRate;
            double tax = baseFee * 0.18;
            return baseFee + tax;
        }
        return getParkingDurationHours() * hourlyRate;
    }
    
    public void completeBooking() {
        this.exitTime = LocalDateTime.now();
        this.totalAmount = calculateTotalAmount();
        this.status = "COMPLETED";
    }
    
    // Getters and Setters
    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }
    
    public Vehicle getVehicle() { 
        return vehicle; 
    }
    
    public void setVehicle(Vehicle vehicle) { 
        this.vehicle = vehicle; 
    }
    
    public ParkingSlot getParkingSlot() { 
        return parkingSlot; 
    }
    
    public void setParkingSlot(ParkingSlot parkingSlot) { 
        this.parkingSlot = parkingSlot; 
    }
    
    public String getBookingNumber() { 
        return bookingNumber; 
    }
    
    public void setBookingNumber(String bookingNumber) { 
        this.bookingNumber = bookingNumber; 
    }
    
    public LocalDateTime getEntryTime() { 
        return entryTime; 
    }
    
    public void setEntryTime(LocalDateTime entryTime) { 
        this.entryTime = entryTime; 
    }
    
    public LocalDateTime getExitTime() { 
        return exitTime; 
    }
    
    public void setExitTime(LocalDateTime exitTime) { 
        this.exitTime = exitTime; 
    }
    
    // Getters and Setters for start/end time
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public String getStatus() { 
        return status; 
    }
    
    public void setStatus(String status) { 
        this.status = status; 
    }
    
    public Double getHourlyRate() { 
        return hourlyRate; 
    }
    
    public void setHourlyRate(Double hourlyRate) { 
        this.hourlyRate = hourlyRate; 
    }
    
    public Double getTotalAmount() { 
        return totalAmount; 
    }
    
    public void setTotalAmount(Double totalAmount) { 
        this.totalAmount = totalAmount; 
    }
    
    public String getPaymentStatus() { 
        return paymentStatus; 
    }
    
    public void setPaymentStatus(String paymentStatus) { 
        this.paymentStatus = paymentStatus; 
    }
}