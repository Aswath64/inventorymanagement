package com.inventory.service;

import com.inventory.dto.CreateUserRequest;
import com.inventory.dto.PageResponse;
import com.inventory.dto.UpdateUserRequest;
import com.inventory.dto.UserDto;
import com.inventory.entity.User;
import com.inventory.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public PageResponse<UserDto> getUsers(User.Role role, String keyword, Pageable pageable) {
        Page<User> page = userRepository.searchUsers(role, keyword, pageable);
        return new PageResponse<>(
                page.getContent().stream().map(this::toDto).collect(Collectors.toList()),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setThemePreference(request.getThemePreference());
        user.setEmailNotifications(request.getEmailNotifications());
        user.setPushNotifications(request.getPushNotifications());
        user.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);
        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setThemePreference(request.getThemePreference());
        user.setEmailNotifications(request.getEmailNotifications());
        user.setPushNotifications(request.getPushNotifications());
        user.setEnabled(request.getEnabled());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    public List<UserDto> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("User not found"));
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
}

