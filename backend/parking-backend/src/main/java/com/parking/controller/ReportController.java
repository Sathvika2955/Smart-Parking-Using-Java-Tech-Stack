package com.parking.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.parking.service.ExportService;
import com.parking.service.ReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private ExportService exportService;
    
    /**
     * Generate monthly usage report
     * GET /api/reports/monthly?startDate=2024-01-01&endDate=2024-12-31&reportType=admin
     */
    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> generateMonthlyReport(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "admin") String reportType) {
        
        Map<String, Object> report = reportService.generateMonthlyReport(
            startDate, endDate, reportType
        );
        
        return ResponseEntity.ok(report);
    }
    
    /**
     * Export bookings to CSV
     * GET /api/reports/export/bookings?startDate=2024-01-01&endDate=2024-12-31&slotId=1
     */
    @GetMapping("/export/bookings")
    public ResponseEntity<ByteArrayResource> exportBookings(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) Integer slotId) {
        
        byte[] csvData = exportService.exportBookingsToCSV(startDate, endDate, slotId);
        
        ByteArrayResource resource = new ByteArrayResource(csvData);
        
        String filename = "bookings_" + startDate + "_to_" + endDate + ".csv";
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .contentLength(csvData.length)
            .body(resource);
    }
    
    /**
     * Export slots to CSV
     * GET /api/reports/export/slots?city=Mumbai&slotType=MEDIUM
     */
    @GetMapping("/export/slots")
    public ResponseEntity<ByteArrayResource> exportSlots(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String slotType) {
        
        byte[] csvData = exportService.exportSlotsToCSV(city, slotType);
        
        ByteArrayResource resource = new ByteArrayResource(csvData);
        
        String filename = "parking_slots_" + System.currentTimeMillis() + ".csv";
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .contentLength(csvData.length)
            .body(resource);
    }
    
    /**
     * Export report summary to CSV
     * GET /api/reports/export/summary?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/export/summary")
    public ResponseEntity<ByteArrayResource> exportReportSummary(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        byte[] csvData = exportService.exportReportSummaryToCSV(startDate, endDate);
        
        ByteArrayResource resource = new ByteArrayResource(csvData);
        
        String filename = "report_summary_" + startDate + "_to_" + endDate + ".csv";
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .contentLength(csvData.length)
            .body(resource);
    }
}