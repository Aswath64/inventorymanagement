package com.inventory.dto;

import com.inventory.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private User.Role role;
    private Long id;
}

