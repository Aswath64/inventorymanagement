package com.inventory.service;

import com.inventory.dto.*;
import com.inventory.entity.User;
import com.inventory.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public ProfileResponse getProfile() {
        User user = getCurrentUser();
        return new ProfileResponse(
                toDto(user),
                toSettings(user)
        );
    }

    @Transactional
    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        user = userRepository.save(user);
        return new ProfileResponse(toDto(user), toSettings(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserSettingsDto updateSettings(UpdateSettingsRequest request) {
        User user = getCurrentUser();

        if (request.getThemePreference() != null) {
            user.setThemePreference(request.getThemePreference());
        }
        if (request.getEmailNotifications() != null) {
            user.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getPushNotifications() != null) {
            user.setPushNotifications(request.getPushNotifications());
        }

        userRepository.save(user);
        return toSettings(user);
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getEnabled(),
                user.getThemePreference(),
                user.getEmailNotifications(),
                user.getPushNotifications(),
                user.getCreatedAt()
        );
    }

    private UserSettingsDto toSettings(User user) {
        return new UserSettingsDto(
                user.getThemePreference(),
                user.getEmailNotifications(),
                user.getPushNotifications()
        );
    }
}

