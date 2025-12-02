package com.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignOrderRequest {
    @NotNull(message = "Staff ID is required")
    private Long staffId;
}

