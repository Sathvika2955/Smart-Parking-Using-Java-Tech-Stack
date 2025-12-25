package com.parking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parking.entity.ParkingSlot;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    Optional<ParkingSlot> findBySlotNumber(Integer slotNumber);
    List<ParkingSlot> findByIsOccupied(Boolean isOccupied);
    List<ParkingSlot> findByIsAvailable(Boolean isAvailable);
    List<ParkingSlot> findBySlotType(String slotType);
    List<ParkingSlot> findByFloorNumber(Integer floorNumber);
    Optional<ParkingSlot> findFirstByIsOccupiedFalseAndIsAvailableTrueAndSlotType(String slotType);
    long countByIsOccupied(Boolean isOccupied);
    long countByIsAvailable(Boolean isAvailable);
}