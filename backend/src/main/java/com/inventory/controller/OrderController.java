package com.inventory.controller;

import com.inventory.dto.*;
import com.inventory.entity.Order;
import com.inventory.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {
    
    private final OrderService orderService;
    
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    // Customer endpoints
    @PostMapping("/customer/orders/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.checkout(request));
    }
    
    @GetMapping("/customer/orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderDto>> getCustomerOrders() {
        return ResponseEntity.ok(orderService.getCustomerOrders());
    }
    
    @GetMapping("/customer/orders/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> getCustomerOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }
    
    @PutMapping("/customer/orders/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> cancelCustomerOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
    
    // Staff endpoints
    @GetMapping("/staff/orders")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<OrderDto>> getStaffOrders() {
        return ResponseEntity.ok(orderService.getStaffOrders());
    }
    
    @GetMapping("/staff/orders/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<OrderDto> getStaffOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }
    
    @PutMapping("/staff/orders/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request));
    }
    
    // Admin endpoints
    @GetMapping("/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto>> getAllOrders(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(orderService.getAllOrders(userId, status, startDate, endDate, pageable));
    }
    
    @GetMapping("/admin/orders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getAdminOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }
    
    @PutMapping("/admin/orders/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> assignOrder(
            @PathVariable Long id,
            @Valid @RequestBody AssignOrderRequest request) {
        return ResponseEntity.ok(orderService.assignOrder(id, request));
    }
}

