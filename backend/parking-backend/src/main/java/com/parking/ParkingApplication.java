package com.parking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ParkingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParkingApplication.class, args);

        System.out.println("\n" + "=".repeat(60));
        System.out.println("✅ SMART PARKING SYSTEM STARTED SUCCESSFULLY!");
        System.out.println("=".repeat(60));
        System.out.println("🌐 API Base URL: http://localhost:8080/api");
        System.out.println("🔐 Auth API: http://localhost:8080/api/auth");
        System.out.println("🅿️  Parking API: http://localhost:8080/api/parking");
        System.out.println("💾 H2 Console: http://localhost:8080/h2-console");
        System.out.println("\n📝 Demo Credentials:");
        System.out.println("   Admin: admin / admin123");
        System.out.println("   User: user / user123");
        System.out.println("=".repeat(60) + "\n");
    }
}