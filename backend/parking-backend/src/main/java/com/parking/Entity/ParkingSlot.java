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
    private String slotType;
    
    @Column(name = "is_occupied", nullable = false)
    private Boolean isOccupied;
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;

    @Column(name = "is_under_maintenance", nullable = false)
    private Boolean isUnderMaintenance;
    
    @Column(name = "maintenance_reason")
    private String maintenanceReason;
    
    @Column(name = "maintenance_start_time")
    private LocalDateTime maintenanceStartTime;
    
    @Column(name = "maintenance_end_time")
    private LocalDateTime maintenanceEndTime;
    
    // GPS Coordinates
    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;
    
    @Column(name = "location_name")
    private String locationName;
    
    @Column(name = "address")
    private String address;
    
    // City and Region for multi-city support
    @Column(name = "city")
    private String city;
    
    @Column(name = "region")
    private String region;

    @Column(name = "country")
private String country;
    
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
        this.isUnderMaintenance = false;
        this.createdAt = LocalDateTime.now();
    }
    
    public ParkingSlot(Integer slotNumber, Integer floorNumber, String slotType) {
        this.slotNumber = slotNumber;
        this.floorNumber = floorNumber;
        this.slotType = slotType;
        this.isOccupied = false;
        this.isAvailable = true;
        this.isUnderMaintenance = false;
        this.createdAt = LocalDateTime.now();
    }
    
    // Constructor with location
    public ParkingSlot(Integer slotNumber, Integer floorNumber, String slotType, 
                      Double latitude, Double longitude, String locationName, String address) {
        this(slotNumber, floorNumber, slotType);
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationName = locationName;
        this.address = address;
    }
    
    // Business Methods
    public void occupy() {
        this.isOccupied = true;
    }
    
    public void vacate() {
        this.isOccupied = false;
        this.currentBooking = null;
    }

    public void startMaintenance(String reason) {
        this.isUnderMaintenance = true;
        this.maintenanceReason = reason;
        this.maintenanceStartTime = LocalDateTime.now();
        this.isAvailable = false;
    }
    
    public void endMaintenance() {
        this.isUnderMaintenance = false;
        this.maintenanceReason = null;
        this.maintenanceStartTime = null;
        this.maintenanceEndTime = LocalDateTime.now();
        this.isAvailable = true;
    }
    
    public boolean isBookable() {
        return isAvailable && !isOccupied && !isUnderMaintenance;
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


    //  Maintenance Getters/Setters
    public Boolean getIsUnderMaintenance() { return isUnderMaintenance; }
    public void setIsUnderMaintenance(Boolean isUnderMaintenance) { 
        this.isUnderMaintenance = isUnderMaintenance; 
    }
    
    public String getMaintenanceReason() { return maintenanceReason; }
    public void setMaintenanceReason(String maintenanceReason) { 
        this.maintenanceReason = maintenanceReason; 
    }
    
    public LocalDateTime getMaintenanceStartTime() { return maintenanceStartTime; }
    public void setMaintenanceStartTime(LocalDateTime maintenanceStartTime) { 
        this.maintenanceStartTime = maintenanceStartTime; 
    }
    
    public LocalDateTime getMaintenanceEndTime() { return maintenanceEndTime; }
    public void setMaintenanceEndTime(LocalDateTime maintenanceEndTime) { 
        this.maintenanceEndTime = maintenanceEndTime; 
    }
    
    // Location Getters/Setters
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    //City and Region Getters/Setters
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getCountry() { return country; }
public void setCountry(String country) { this.country = country; }
    
    public Booking getCurrentBooking() { return currentBooking; }
    public void setCurrentBooking(Booking currentBooking) { 
        this.currentBooking = currentBooking; 
    }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}