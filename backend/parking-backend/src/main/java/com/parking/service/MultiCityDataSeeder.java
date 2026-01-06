package com.parking.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.parking.entity.ParkingSlot;
import com.parking.repository.ParkingSlotRepository;

@Component
public class MultiCityDataSeeder implements CommandLineRunner {
    
    @Autowired
    private ParkingSlotRepository slotRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        long count = slotRepository.count();
        System.out.println("=== MULTI-CITY SEEDER ===");
        System.out.println("Current slot count: " + count);
        
        if (count > 0) {
            System.out.println("✅ Parking slots already exist. Skipping multi-city seeding.");
            return;
        }
        
        System.out.println("🌍 Seeding multi-city parking data...");
        
        List<ParkingSlot> allSlots = new ArrayList<>();
        int slotNumber = 1;
        
        // ==================== MUMBAI ====================
        System.out.println("Adding Mumbai slots...");
        allSlots.addAll(createSlots(slotNumber, "Mumbai", "Maharashtra", 
            19.0596, 72.8295, "Bandra West Parking", "Near Bandra Station, Mumbai"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Mumbai", "Maharashtra",
            19.1136, 72.8697, "Andheri East Parking", "Near Metro Station, Andheri"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Mumbai", "Maharashtra",
            19.0178, 72.8478, "Dadar Central Parking", "Near Dadar Railway, Mumbai"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Mumbai", "Maharashtra",
            18.9322, 72.8264, "Churchgate Parking", "Near Churchgate Station"));
        slotNumber += 4;
        
        // ==================== DELHI ====================
        System.out.println("Adding Delhi slots...");
        allSlots.addAll(createSlots(slotNumber, "Delhi", "Delhi",
            28.6289, 77.2065, "Connaught Place Parking", "Central Delhi, CP Area"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Delhi", "Delhi",
            28.6328, 77.2197, "Rajiv Chowk Parking", "Near Metro Station, CP"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Delhi", "Delhi",
            28.6519, 77.1895, "Karol Bagh Parking", "Near Metro, Karol Bagh"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Delhi", "Delhi",
            28.5678, 77.2434, "Lajpat Nagar Parking", "Central Market Area"));
        slotNumber += 4;
        
        // ==================== BANGALORE ====================
        System.out.println("Adding Bangalore slots...");
        allSlots.addAll(createSlots(slotNumber, "Bangalore", "Karnataka",
            12.9759, 77.6074, "MG Road Parking", "Near MG Road Metro"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Bangalore", "Karnataka",
            12.9352, 77.6245, "Koramangala Parking", "Koramangala 5th Block"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Bangalore", "Karnataka",
            12.9784, 77.6408, "Indiranagar Parking", "100 Feet Road, Indiranagar"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Bangalore", "Karnataka",
            12.9698, 77.7499, "Whitefield Parking", "Near Forum Mall, Whitefield"));
        slotNumber += 4;
        
        // ==================== HYDERABAD ====================
        System.out.println("Adding Hyderabad slots...");
        allSlots.addAll(createSlots(slotNumber, "Hyderabad", "Telangana",
            17.4435, 78.3772, "Hitech City Parking", "Near Cyber Towers, Hitech City"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Hyderabad", "Telangana",
            17.4239, 78.4738, "Banjara Hills Parking", "Road No 12, Banjara Hills"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Hyderabad", "Telangana",
            17.4399, 78.4983, "Secunderabad Parking", "Near Railway Station"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Hyderabad", "Telangana",
            17.4401, 78.3489, "Gachibowli Parking", "DLF Cyber City Area"));
        slotNumber += 4;
        
        // ==================== CHENNAI ====================
        System.out.println("Adding Chennai slots...");
        allSlots.addAll(createSlots(slotNumber, "Chennai", "Tamil Nadu",
            13.0418, 80.2341, "T Nagar Parking", "Ranganathan Street Area"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Chennai", "Tamil Nadu",
            13.0850, 80.2101, "Anna Nagar Parking", "2nd Avenue, Anna Nagar"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Chennai", "Tamil Nadu",
            12.9750, 80.2210, "Velachery Parking", "Near Phoenix Mall"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Chennai", "Tamil Nadu",
            13.0339, 80.2619, "Mylapore Parking", "Luz Corner Area"));
        slotNumber += 4;
        
        // ==================== PUNE ====================
        System.out.println("Adding Pune slots...");
        allSlots.addAll(createSlots(slotNumber, "Pune", "Maharashtra",
            18.5362, 73.8958, "Koregaon Park Parking", "Near Osho Ashram"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Pune", "Maharashtra",
            18.5912, 73.7389, "Hinjewadi Parking", "Rajiv Gandhi IT Park"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Pune", "Maharashtra",
            18.5074, 73.8077, "Kothrud Parking", "DP Road, Kothrud"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Pune", "Maharashtra",
            18.5679, 73.9143, "Viman Nagar Parking", "Near Airport Road"));
        slotNumber += 4;
        
        // ==================== KAKINADA ====================
        System.out.println("Adding Kakinada slots...");
        allSlots.addAll(createSlots(slotNumber, "Kakinada", "Andhra Pradesh",
            16.9891, 82.2475, "Beach Road Parking", "Near Beach Road, Kakinada"));
        slotNumber += 4;
        
        allSlots.addAll(createSlots(slotNumber, "Kakinada", "Andhra Pradesh",
            16.9850, 82.2450, "Railway Station Parking", "Near Kakinada Town Station"));
        
        // Save all slots
        slotRepository.saveAll(allSlots);
        
        System.out.println("✅ Successfully seeded " + allSlots.size() + " parking slots across 7 cities!");
        System.out.println("📍 Cities: Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kakinada");
    }
    
    private List<ParkingSlot> createSlots(int startNumber, String city, String region,
                                          double lat, double lng, String locationName, String address) {
        List<ParkingSlot> slots = new ArrayList<>();
        
        // 2 SMALL slots
        for (int i = 0; i < 2; i++) {
            ParkingSlot slot = new ParkingSlot();
            slot.setSlotNumber(startNumber++);
            slot.setFloorNumber(1);
            slot.setSlotType("SMALL");
            slot.setLatitude(lat + (Math.random() - 0.5) * 0.002);
            slot.setLongitude(lng + (Math.random() - 0.5) * 0.002);
            slot.setLocationName(locationName + " - Slot " + slot.getSlotNumber());
            slot.setAddress(address);
            slot.setCity(city);
            slot.setRegion(region);
            slot.setCountry("India");
            slot.setIsOccupied(false);
            slot.setIsAvailable(true);
            slot.setCreatedAt(LocalDateTime.now());
            slots.add(slot);
        }
        
        // 1 MEDIUM slot
        ParkingSlot mediumSlot = new ParkingSlot();
        mediumSlot.setSlotNumber(startNumber++);
        mediumSlot.setFloorNumber(1);
        mediumSlot.setSlotType("MEDIUM");
        mediumSlot.setLatitude(lat + (Math.random() - 0.5) * 0.002);
        mediumSlot.setLongitude(lng + (Math.random() - 0.5) * 0.002);
        mediumSlot.setLocationName(locationName + " - Slot " + mediumSlot.getSlotNumber());
        mediumSlot.setAddress(address);
        mediumSlot.setCity(city);
        mediumSlot.setRegion(region);
        mediumSlot.setCountry("India");
        mediumSlot.setIsOccupied(false);
        mediumSlot.setIsAvailable(true);
        mediumSlot.setCreatedAt(LocalDateTime.now());
        slots.add(mediumSlot);
        
        // 1 LARGE slot
        ParkingSlot largeSlot = new ParkingSlot();
        largeSlot.setSlotNumber(startNumber++);
        largeSlot.setFloorNumber(1);
        largeSlot.setSlotType("LARGE");
        largeSlot.setLatitude(lat + (Math.random() - 0.5) * 0.002);
        largeSlot.setLongitude(lng + (Math.random() - 0.5) * 0.002);
        largeSlot.setLocationName(locationName + " - Slot " + largeSlot.getSlotNumber());
        largeSlot.setAddress(address);
        largeSlot.setCity(city);
        largeSlot.setRegion(region);
        largeSlot.setCountry("India");
        largeSlot.setIsOccupied(false);
        largeSlot.setIsAvailable(true);
        largeSlot.setCreatedAt(LocalDateTime.now());
        slots.add(largeSlot);
        
        return slots;
    }
}