package com.inventory.controller;

import com.inventory.dto.ChangePasswordRequest;
import com.inventory.dto.CustomerDashboardDto;
import com.inventory.dto.ProfileResponse;
import com.inventory.dto.UpdateProfileRequest;
import com.inventory.service.CustomerService;
import com.inventory.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {
    
    private final CustomerService customerService;
    private final ProfileService profileService;
    
    public CustomerController(CustomerService customerService, ProfileService profileService) {
        this.customerService = customerService;
        this.profileService = profileService;
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<CustomerDashboardDto> getDashboard() {
        return ResponseEntity.ok(customerService.getDashboard());
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }
    
    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }
    
    @PutMapping("/profile/password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.ok("Password changed successfully");
    }
}

