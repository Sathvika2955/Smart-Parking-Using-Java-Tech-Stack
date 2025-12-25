package com.parking.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "vehicles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "license_plate", nullable = false, unique = true)
    private String licensePlate;
    
    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType; // BIKE, CAR, SUV, TRUCK
    
    @Column(name = "owner_name", nullable = false)
    private String ownerName;
    
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public Vehicle() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Vehicle(String licensePlate, String vehicleType, String ownerName, String phoneNumber) {
        this.licensePlate = licensePlate.toUpperCase();
        this.vehicleType = vehicleType.toUpperCase();
        this.ownerName = ownerName;
        this.phoneNumber = phoneNumber;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { 
        this.licensePlate = licensePlate.toUpperCase(); 
    }
    
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { 
        this.vehicleType = vehicleType.toUpperCase(); 
    }
    
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}