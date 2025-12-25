package com.parking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parking.entity.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingNumber(String bookingNumber);
    List<Booking> findByVehicleId(Long vehicleId);
    List<Booking> findByParkingSlotId(Long slotId);
    List<Booking> findByStatus(String status);
    Optional<Booking> findByParkingSlotIdAndStatus(Long slotId, String status);
    long countByStatus(String status);
}