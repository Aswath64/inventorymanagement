package com.inventory.controller;

import com.inventory.dto.ChangePasswordRequest;
import com.inventory.dto.ProfileResponse;
import com.inventory.dto.UpdateProfileRequest;
import com.inventory.dto.UpdateSettingsRequest;
import com.inventory.dto.UserSettingsDto;
import com.inventory.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
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
}

