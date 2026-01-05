package com.parking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.parking.entity.ParkingSlot;

import jakarta.persistence.LockModeType;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    
    // ✅ Pessimistic lock to prevent race conditions
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ps FROM ParkingSlot ps WHERE ps.slotNumber = :slotNumber")
    Optional<ParkingSlot> findBySlotNumberWithLock(Integer slotNumber);
    
    Optional<ParkingSlot> findBySlotNumber(Integer slotNumber);
    
    List<ParkingSlot> findByFloorNumber(Integer floorNumber);
    
    List<ParkingSlot> findBySlotType(String slotType);
    
    long countByIsOccupied(Boolean isOccupied);
    
    List<ParkingSlot> findByIsOccupiedAndIsAvailable(Boolean isOccupied, Boolean isAvailable);
    
    // ✅ NEW: Find by city (for multi-city support)
    List<ParkingSlot> findByCity(String city);
    
    // ✅ NEW: Check if slot number exists
    boolean existsBySlotNumber(Integer slotNumber);
}