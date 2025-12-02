package com.inventory.controller;

import com.inventory.entity.User;
import com.inventory.repository.UserRepository;
import com.inventory.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import com.lowagie.text.DocumentException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReportController {
    
    private final ReportService reportService;
    private final UserRepository userRepository;
    
    public ReportController(ReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }
    
    // Admin Reports
    @GetMapping("/admin/reports/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> generateSalesReport(
            @RequestParam(defaultValue = "pdf") String format) throws IOException, DocumentException {
        byte[] report;
        String contentType;
        String filename;
        
        if ("excel".equalsIgnoreCase(format)) {
            report = reportService.generateSalesReportExcel();
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            filename = "sales_report.xlsx";
        } else {
            report = reportService.generateSalesReportPDF();
            contentType = "application/pdf";
            filename = "sales_report.pdf";
        }
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(report);
    }
    
    @GetMapping("/admin/reports/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> generateProductStockReport(
            @RequestParam(defaultValue = "pdf") String format) throws IOException, DocumentException {
        byte[] report;
        String contentType;
        String filename;
        
        if ("excel".equalsIgnoreCase(format)) {
            report = reportService.generateProductStockReportExcel();
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            filename = "product_stock_report.xlsx";
        } else {
            report = reportService.generateProductStockReportPDF();
            contentType = "application/pdf";
            filename = "product_stock_report.pdf";
        }
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(report);
    }
    
    @GetMapping("/admin/reports/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> generateOrderReport(
            @RequestParam(defaultValue = "excel") String format) throws IOException {
        byte[] report = reportService.generateSalesReportExcel();
        String contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        String filename = "order_report.xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(report);
    }
    
    @GetMapping("/admin/reports/staff-activity/{staffId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> generateStaffActivityReport(@PathVariable Long staffId) throws IOException {
        byte[] report = reportService.generateStaffActivityReportExcel(staffId);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=staff_activity_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(report);
    }
    
    // Staff Reports
    @GetMapping("/staff/reports/orders")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<byte[]> generateStaffOrderReport() throws IOException {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User staff = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        byte[] report = reportService.generateStaffActivityReportExcel(staff.getId());
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=my_orders_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(report);
    }
    
    // Customer Reports
    @GetMapping("/customer/reports/order-history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<byte[]> generateOrderHistory(
            @RequestParam(defaultValue = "pdf") String format) throws IOException, DocumentException {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        byte[] report;
        String contentType;
        String filename;
        
        if ("excel".equalsIgnoreCase(format)) {
            report = reportService.generateOrderHistoryExcel(user.getId());
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            filename = "order_history.xlsx";
        } else {
            report = reportService.generateOrderHistoryPDF(user.getId());
            contentType = "application/pdf";
            filename = "order_history.pdf";
        }
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(report);
    }
}

