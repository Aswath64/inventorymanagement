package com.inventory.controller;

import com.inventory.dto.ChangePasswordRequest;
import com.inventory.dto.ProfileResponse;
import com.inventory.dto.UpdateProfileRequest;
import com.inventory.dto.UpdateSettingsRequest;
import com.inventory.dto.UserSettingsDto;
import com.inventory.service.FileStorageService;
import com.inventory.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final ProfileService profileService;
    private final FileStorageService fileStorageService;

    public ProfileController(ProfileService profileService, FileStorageService fileStorageService) {
        this.profileService = profileService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/settings")
    public ResponseEntity<UserSettingsDto> updateSettings(@RequestBody UpdateSettingsRequest request) {
        return ResponseEntity.ok(profileService.updateSettings(request));
    }
    
    /**
     * Upload profile avatar image
     * Similar to product image upload - saves file and returns URL
     */
    @PutMapping("/avatar")
    public ResponseEntity<ProfileResponse> uploadAvatar(@RequestParam("avatar") MultipartFile file) {
        try {
            ProfileResponse response = profileService.uploadAvatar(file, fileStorageService);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload avatar: " + e.getMessage(), e);
        }
    }
}

