package com.inventory.dto;

import lombok.Data;

@Data
public class UpdateSettingsRequest {
    private String themePreference;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
}

