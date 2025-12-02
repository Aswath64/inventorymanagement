package com.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsDto {
    private String themePreference;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
}

