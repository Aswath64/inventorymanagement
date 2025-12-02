package com.inventory.dto;

import com.inventory.entity.User;
import com.inventory.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private User.Role role;
    private Boolean enabled;
    private String themePreference;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private LocalDateTime createdAt;
}

