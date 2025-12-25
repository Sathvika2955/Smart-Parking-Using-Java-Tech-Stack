package com.parking.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "parking_slots")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ParkingSlot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "slot_number", nullable = false, unique = true)
    private Integer slotNumber;
    
    @Column(name = "floor_number")
    private Integer floorNumber;
    
    @Column(name = "slot_type", nullable = false)
    private String slotType; // SMALL (Bike), MEDIUM (Car), LARGE (Truck/SUV)
    
    @Column(name = "is_occupied", nullable = false)
    private Boolean isOccupied;
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;
    
    @OneToOne
    @JoinColumn(name = "current_booking_id")
    @JsonIgnoreProperties({"parkingSlot"})
    private Booking currentBooking;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public ParkingSlot() {
        this.isOccupied = false;
        this.isAvailable = true;
        this.createdAt = LocalDateTime.now();
    }
    
    public ParkingSlot(Integer slotNumber, Integer floorNumber, String slotType) {
        this.slotNumber = slotNumber;
        this.floorNumber = floorNumber;
        this.slotType = slotType;
        this.isOccupied = false;
        this.isAvailable = true;
        this.createdAt = LocalDateTime.now();
    }
    
    // Business Methods
    public void occupy() {
        this.isOccupied = true;
    }
    
    public void vacate() {
        this.isOccupied = false;
        this.currentBooking = null;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getSlotNumber() { return slotNumber; }
    public void setSlotNumber(Integer slotNumber) { this.slotNumber = slotNumber; }
    
    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }
    
    public String getSlotType() { return slotType; }
    public void setSlotType(String slotType) { this.slotType = slotType; }
    
    public Boolean getIsOccupied() { return isOccupied; }
    public void setIsOccupied(Boolean isOccupied) { this.isOccupied = isOccupied; }
    
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    
    public Booking getCurrentBooking() { return currentBooking; }
    public void setCurrentBooking(Booking currentBooking) { 
        this.currentBooking = currentBooking; 
    }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}