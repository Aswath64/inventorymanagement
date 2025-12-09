package com.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
    
    private String phoneNumber;
    
    private String specialInstructions;
    
    private String preferredDeliveryDate;
}

